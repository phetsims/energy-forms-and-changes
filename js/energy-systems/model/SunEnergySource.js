// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type representing a model of the sun as an energy source - includes the clouds that can block the sun's rays
 *
 * @author  John Blanco (original Java)
 * @author  Andrew Adare (js port)
 */
define( function( require ) {
  'use strict';

  // modules
  var Cloud = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Cloud' );
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var RADIUS = 0.02; // In meters, apparent size, not (obviously) actual size.
  var OFFSET_TO_CENTER_OF_SUN = new Vector2( -0.0555, 0.1255 );
  var ENERGY_CHUNK_EMISSION_PERIOD = 0.11; // In seconds.
  var MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN = 0.5; // In meters.

  // Constants that control the nature of the emission sectors.  These are used to make emission look random yet still
  // have a fairly steady rate within each sector.  One sector is intended to point at the solar panel.
  var NUM_EMISSION_SECTORS = 10;
  var EMISSION_SECTOR_SPAN = 2 * Math.PI / NUM_EMISSION_SECTORS;

  // used to tweak sector positions to make sure solar panel gets consistent flow of E's
  var EMISSION_SECTOR_OFFSET = EMISSION_SECTOR_SPAN * 0.71;

  var SUN_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/sun_icon.png' );

  /**
   * @param {SolarPanel} solarPanel
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function SunEnergySource( solarPanel, energyChunksVisibleProperty ) {

    var self = this;

    EnergySource.call( this, new Image( SUN_ICON ) );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.sun.value;

    // @public (read-only) {SolarPanel}
    this.solarPanel = solarPanel;

    // @public (read-only) {number}
    this.radius = RADIUS;

    // @public {Cloud[]} - clouds that can potentially block the sun's rays.  The positions are set so that they appear
    // between the sun and the solar panel, and must not overlap with one another.
    this.clouds = [
      new Cloud( new Vector2( -0.0045, 0.0745 ), this.positionProperty ),
      new Cloud( new Vector2( 0.0225, 0.082 ), this.positionProperty ),
      new Cloud( new Vector2( 0.0255, 0.0995 ), this.positionProperty )
    ];

    // @public {NumberProperty} - a factor between zero and one that indicates how cloudy it is
    this.cloudinessProperty = new NumberProperty( 0 );

    // @private - internal variables used in methods
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkEmissionCountdownTimer = ENERGY_CHUNK_EMISSION_PERIOD;
    this.sectorList = _.shuffle( _.range( NUM_EMISSION_SECTORS ) );
    this.currentSectorIndex = 0;
    this.sunPosition = OFFSET_TO_CENTER_OF_SUN;

    // @private - list of energy chunks that should be allowed to pass through the clouds without bouncing (i.e. being
    // reflected)
    this.energyChunksPassingThroughClouds = [];

    // set up a listener to add/remove clouds based on the value of the cloudiness property
    this.cloudinessProperty.link( function( cloudiness ) {
      var nClouds = self.clouds.length;
      for ( var i = 0; i < nClouds; i++ ) {

        // stagger the existence strength of the clouds
        var value = Util.clamp( cloudiness * ( nClouds - i ), 0, 1 );
        self.clouds[ i ].existenceStrengthProperty.set( value );
      }
    } );

    // update the position of the sun as the position of this system changes
    this.positionProperty.link( function( position ) {
      self.sunPosition = position.plus( OFFSET_TO_CENTER_OF_SUN );
    } );
  }

  energyFormsAndChanges.register( 'SunEnergySource', SunEnergySource );

  return inherit( EnergySource, SunEnergySource, {

    /**
     * step in time
     * @param dt - time step, in seconds
     * @return {Energy}
     */
    step: function( dt ) {
      var energyProduced = 0;
      if ( this.activeProperty.value === true ) {

        // see if it is time to emit a new energy chunk
        this.energyChunkEmissionCountdownTimer -= dt;
        if ( this.energyChunkEmissionCountdownTimer <= 0 ) {

          // create a new chunk and start it on its way
          this.emitEnergyChunk();
          this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
        }

        // move the energy chunks
        this.updateEnergyChunkPositions( dt );

        // calculate the amount of energy produced
        energyProduced = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * ( 1 - this.cloudinessProperty.value ) * dt;
      }

      // produce the energy
      return new Energy( EnergyType.LIGHT, energyProduced, 0 );
    },

    /**
     * @param {number} dt - time step, in seconds
     * @private
     */
    updateEnergyChunkPositions: function( dt ) {

      var self = this;

      // check for bouncing and absorption of the energy chunks
      this.energyChunkList.forEach( function( chunk ) {

        var distanceFromSun = chunk.positionProperty.value.distance( self.sunPosition.plus( OFFSET_TO_CENTER_OF_SUN ) );

        // this energy chunk was absorbed by the solar panel, so put it on the list of outgoing chunks
        if ( self.solarPanel.activeProperty.value && self.solarPanel.getAbsorptionShape().containsPoint( chunk.positionProperty.value ) ) {
          self.outgoingEnergyChunks.push( chunk );
        }

        // this energy chunk is out of visible range, so remove it
        else if ( distanceFromSun > MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN ) {
          self.energyChunkList.remove( chunk );
          _.pull( self.energyChunksPassingThroughClouds, chunk );
        }

        // chunks encountering clouds
        else {
          self.clouds.forEach( function( cloud ) {

            var inClouds = cloud.getCloudAbsorptionReflectionShape().containsPoint( chunk.positionProperty.value );
            var inList = _.includes( self.energyChunksPassingThroughClouds, chunk );
            var deltaPhi = chunk.velocity.angle() - chunk.positionProperty.value.minus( self.sunPosition ).angle();

            if ( inClouds && !inList && Math.abs( deltaPhi ) < Math.PI / 10 ) {

              // decide whether this energy chunk should pass through the clouds or be reflected
              if ( phet.joist.random.nextDouble() < cloud.existenceStrengthProperty.get() ) {

                // Reflect the energy chunk.  It looks a little weird if they go back to the sun, so the code below
                // tries to avoid that.
                var angleTowardsSun = chunk.velocity.angle() + Math.PI;
                var reflectionAngle = chunk.positionProperty.value.minus( cloud.getCenterPosition() ).angle();

                if ( reflectionAngle < angleTowardsSun ) {
                  chunk.setVelocity( chunk.velocity.rotated(
                    0.7 * Math.PI + phet.joist.random.nextDouble() * Math.PI / 8 )
                  );
                } else {
                  chunk.setVelocity(
                    chunk.velocity.rotated( -0.7 * Math.PI - phet.joist.random.nextDouble() * Math.PI / 8 )
                  );
                }

              } else {

                // let the energy chunk pass through the cloud
                self.energyChunksPassingThroughClouds.push( chunk );
              }
            }
          } );
        }
      } );

      // move the energy chunks
      this.energyChunkList.forEach( function( chunk ) {
        chunk.translateBasedOnVelocity( dt );
      } );
    },

    /**
     * @private
     */
    emitEnergyChunk: function() {
      var emissionAngle = this.chooseNextEmissionAngle();
      var velocity = new Vector2( EFACConstants.ENERGY_CHUNK_VELOCITY, 0 ).rotated( emissionAngle );
      var startPoint = this.sunPosition.plus( new Vector2( RADIUS / 2, 0 ).rotated( emissionAngle ) );
      var chunk = new EnergyChunk( EnergyType.LIGHT, startPoint, velocity, this.energyChunksVisibleProperty );

      this.energyChunkList.add( chunk );
    },

    /**
     * @public
     * @override
     */
    preLoadEnergyChunks: function() {
      this.clearEnergyChunks();
      var preLoadTime = 6; // in simulated seconds, empirically determined
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      this.energyChunkEmissionCountdownTimer = 0;

      // simulate energy chunks moving through the system
      while ( preLoadTime > 0 ) {
        this.energyChunkEmissionCountdownTimer -= dt;
        if ( this.energyChunkEmissionCountdownTimer <= 0 ) {
          this.emitEnergyChunk();
          this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
        }
        this.updateEnergyChunkPositions( dt );
        preLoadTime -= dt;
      }

      // remove any chunks that actually made it to the solar panel
      this.outgoingEnergyChunks.clear();
    },

    /**
     * return a structure containing type, rate, and direction of emitted energy
     * @returns {Energy}
     */
    getEnergyOutputRate: function() {
      return new Energy(
        EnergyType.LIGHT,
        EFACConstants.MAX_ENERGY_PRODUCTION_RATE * ( 1 - this.cloudinessProperty.value )
      );
    },

    /**
     * @returns {number} emission angle
     * @private
     */
    chooseNextEmissionAngle: function() {
      var sector = this.sectorList[ this.currentSectorIndex ];
      this.currentSectorIndex++;

      if ( this.currentSectorIndex >= NUM_EMISSION_SECTORS ) {
        this.currentSectorIndex = 0;
      }

      // angle is a function of the selected sector and a random offset within the sector
      return sector * EMISSION_SECTOR_SPAN +
             ( phet.joist.random.nextDouble() * EMISSION_SECTOR_SPAN ) +
             EMISSION_SECTOR_OFFSET;
    },

    /**
     * Pre-populate the space around the sun with energy chunks. The number of iterations is chosen carefully such that
     * there are chunks that are close, but not quite reaching, the solar panel.
     * @public
     * @override
     */
    activate: function() {
      EnergySource.prototype.activate.call( this );

      for ( var i = 0; i < 100; i++ ) {
        this.step( EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      }
    },

    /**
     * deactivate the sun
     * @public
     * @override
     */
    deactivate: function() {
      EnergySource.prototype.deactivate.call( this );
      this.cloudinessProperty.reset();
      this.energyChunksPassingThroughClouds = [];
    }

  }, {

    // statics
    OFFSET_TO_CENTER_OF_SUN: OFFSET_TO_CENTER_OF_SUN
  } );
} );

