// Copyright 2016, University of Colorado Boulder

/**
 * Module representing the sun (as an energy source) in the model.  This
 * includes the clouds that can block the sun's rays.
 *
 * @author  John Blanco (original Java)
 * @author  Andrew Adare (js port)
 */
define( function( require ) {
  'use strict';

  // Modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var Cloud = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Cloud' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Vector2 = require( 'DOT/Vector2' );
  var Random = require( 'DOT/Random' );
  var Util = require( 'DOT/Util' );

  // Constants
  var RADIUS = 0.02; // In meters, apparent size, not (obviously) actual size.
  var OFFSET_TO_CENTER_OF_SUN = new Vector2( -0.05, 0.12 );
  var ENERGY_CHUNK_EMISSION_PERIOD = 0.11; // In seconds.
  var RAND = new Random();
  var MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN = 0.5; // In meters.

  // Constants that control the nature of the emission sectors.  These are
  // used to make emission look random yet still have a fairly steady rate
  // within each sector.  One sector is intended to point at the solar panel.
  var NUM_EMISSION_SECTORS = 10;
  var EMISSION_SECTOR_SPAN = 2 * Math.PI / NUM_EMISSION_SECTORS;

  // Used to tweak sector positions to make sure solar panel gets consistent flow of E's.
  var EMISSION_SECTOR_OFFSET = EMISSION_SECTOR_SPAN * 0.71;

  var SUN_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/sun_icon.png' );

  /**
   * Sun object as an energy source
   *
   * @param {[type]} solarPanel          [description]
   * @param {[type]} energyChunksVisible [description]
   * @constructor
   */
  function SunEnergySource( solarPanel, energyChunksVisible ) {

    var thisSun = this;

    EnergySource.call( this, new Image( SUN_ICON ) );

    this.energyChunksVisible = energyChunksVisible;

    this.solarPanel = solarPanel;

    this.energyChunkEmissionCountdownTimer = ENERGY_CHUNK_EMISSION_PERIOD;

    this.sectorList = _.shuffle( _.range( NUM_EMISSION_SECTORS ) );

    // List of energy chunks that should be allowed to pass through the clouds
    // without bouncing (i.e. being reflected).
    this.energyChunksPassingThroughClouds = [];

    this.currentSectorIndex = 0;

    this.sunPosition = OFFSET_TO_CENTER_OF_SUN;

    // Clouds that can potentially block the sun's rays.  The positions are
    // set so that they appear between the sun and the solar panel, and must
    // not overlap with one another.
    this.clouds = [
      new Cloud( new Vector2( -0.01, 0.08 ), this.position ),
      new Cloud( new Vector2( 0.017, 0.0875 ), this.position ),
      new Cloud( new Vector2( 0.02, 0.105 ), this.position )
    ];

    this.addProperty( 'cloudiness', 0 );

    // Add/remove clouds based on the value of the cloudiness property.
    this.cloudinessProperty.link( function( cloudiness ) {
      var nClouds = thisSun.clouds.length;
      for ( var i = 0; i < nClouds; i++ ) {
        // Stagger the existence strength of the clouds.
        var value = Util.clamp( cloudiness * ( nClouds - i ), 0, 1 );
        thisSun.clouds[ i ].existenceStrengthProperty.set( value );
      }
    } );

    this.positionProperty.link( function( position ) {
      thisSun.sunPosition = position.plus( OFFSET_TO_CENTER_OF_SUN );
    } );

  }

  return inherit( EnergySource, SunEnergySource, {

    stepInTime: function( dt ) {
      var energyProduced = 0;
      if ( this.active === true ) {

        // See if it is time to emit a new energy chunk.
        this.energyChunkEmissionCountdownTimer -= dt;
        if ( this.energyChunkEmissionCountdownTimer <= 0 ) {
          // Create a new chunk and start it on its way.
          this.emitEnergyChunk();
          this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
        }

        // Move the energy chunks.
        this.updateEnergyChunkPositions( dt );

        // Calculate the amount of energy produced.
        energyProduced = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * ( 1 - this.cloudiness ) * dt;
      }

      // Produce the energy.
      return new Energy( EnergyType.LIGHT, energyProduced );
    },

    // TODO: fill out these stubs
    updateEnergyChunkPositions: function( dt ) {},
    emitEnergyChunk: function() {},
    preLoadEnergyChunks: function() {},
    getEnergyOutputRate: function() {},
    chooseNextEmissionAngle: function() {},
    activate: function() {},
    deactivate: function() {},
    getUserComponent: function() {},

    // For linter
    temp: function() {
      console.log(
        RADIUS,
        OFFSET_TO_CENTER_OF_SUN,
        ENERGY_CHUNK_EMISSION_PERIOD,
        RAND,
        MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN,
        NUM_EMISSION_SECTORS,
        EMISSION_SECTOR_SPAN,
        EMISSION_SECTOR_OFFSET );
    }
  } );
} );
