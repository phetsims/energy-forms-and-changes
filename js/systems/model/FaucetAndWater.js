// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type that represents a faucet that can be turned on to provide mechanical energy to other energy system elements
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Vector2 = require( 'DOT/Vector2' );
  var WaterDrop = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/WaterDrop' );

  // images
  var FAUCET_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/faucet_icon.png' );

  // constants
  var FALLING_ENERGY_CHUNK_VELOCITY = 0.09; // In meters/second.
  var MAX_WATER_WIDTH = 0.014; // In meters.
  var MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER = 0.5; // In meters.
  var ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range( 0.07, 0.08 );
  var FALLING_WATER_DELAY = 0.4; // time to pass before wheel starts turning after faucet starts, in seconds

  // where the water and energy chunks originate inside the faucet head, not where they emerge from the faucet
  var OFFSET_FROM_CENTER_TO_WATER_ORIGIN = new Vector2( 0.069, 0.105 );

  // center-x, bottom-y of the faucet head - where the water and energy chunks emerge from
  var OFFSET_FROM_CENTER_TO_FAUCET_HEAD = OFFSET_FROM_CENTER_TO_WATER_ORIGIN.plusXY( 0, -0.022 );

  // The following acceleration constant defines the rate at which the water flows from the faucet.  The value used is
  // not the actual value in Earth's gravitational field - it has been tweaked for optimal visual effect.
  var ACCELERATION_DUE_TO_GRAVITY = new Vector2( 0, -0.15 );

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {BooleanProperty} waterPowerableElementInPlace
   * @constructor
   */
  function FaucetAndWater( energyChunksVisibleProperty, waterPowerableElementInPlaceProperty ) {

    EnergySource.call( this, new Image( FAUCET_ICON ) );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.waterFaucet.value;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private {BooleanProperty} - a flag that is used to decide whether to pass energy chunks to the next energy
    // system element
    this.waterPowerableElementInPlaceProperty = waterPowerableElementInPlaceProperty;

    // @public {BooleanProperty} proportion of full available flow that is occurring
    this.flowProportionProperty = new Property( 0 );

    // @public {read-only) {WaterDrop[]} - water drops that comprise the stream of water
    this.waterDrops = [];

    // @private {EnergyChunks[]} - list of chunks that are exempt from being transferred to the next energy system element
    this.exemptFromTransferEnergyChunks = [];

    // @private {Energy[]} - list of Energy to be sent after a delay has passed
    this.flowEnergyDelay = [];

    // @private {number}
    this.energySinceLastChunk = 0;

    // @private {boolean} - flag for whether next chunk should be transferred or kept, used to alternate transfer with
    // non-transfer
    this.transferNextAvailableChunk = true;
  }

  energyFormsAndChanges.register( 'FaucetAndWater', FaucetAndWater );

  return inherit( EnergySource, FaucetAndWater, {

    /**
     * create a new energy chunk with the appropriate attributes for falling water
     * @returns {EnergyChunk}
     * @private
     */
    createNewChunk: function() {

      // random x value within water column for "watery" appearance
      var x = ( phet.joist.random.nextDouble() - 0.5 ) * this.flowProportionProperty.value * MAX_WATER_WIDTH / 2;

      var initialPosition = this.positionProperty.value
        .plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN )
        .plus( new Vector2( x, 0 ) );

      var velocity = new Vector2( 0, -FALLING_ENERGY_CHUNK_VELOCITY );

      return new EnergyChunk( EnergyType.MECHANICAL, initialPosition, velocity, this.energyChunksVisibleProperty );
    },

    /**
     * @private
     */
    addChunkIfEnoughEnergy: function() {
      if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
        var chunk = this.createNewChunk();
        this.energyChunkList.push( chunk );
        this.energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
      }
    },

    /**
     * step in time
     * @param  {number} dt time step, in seconds
     * @returns {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

      if ( !this.activeProperty.value ) {
        return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
      }

      var self = this;

      // add water droplets as needed based on flow rate
      if ( this.flowProportionProperty.value > 0 ) {
        var initialPosition = new Vector2( 0, 0 );
        var initialWidth = this.flowProportionProperty.value * MAX_WATER_WIDTH *
                           ( 1 + ( phet.joist.random.nextDouble() - 0.5 ) * 0.2 );
        var initialSize = new Dimension2( initialWidth, initialWidth );
        this.waterDrops.push( new WaterDrop( initialPosition, new Vector2( 0, 0 ), initialSize ) );
      }

      // make the water droplets fall
      this.waterDrops.forEach( function( drop ) {
        var v = drop.velocityProperty.value;
        drop.velocityProperty.set( v.plus( ACCELERATION_DUE_TO_GRAVITY.times( dt ) ) );
        drop.position.set( drop.position.plus( v.times( dt ) ) );
      } );

      // remove drops that have run their course by iterating over a copy and checking for matches
      var waterDropsCopy = this.waterDrops;
      waterDropsCopy.forEach( function( drop ) {
        if ( drop.position.distance( self.positionProperty.value ) > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
          var index = self.waterDrops.indexOf( drop );
          if ( index !== -1 ) {
            self.waterDrops.splice( index, 1 );
          }
        }
      } );

      // check if time to emit an energy chunk and, if so, do it
      this.energySinceLastChunk += EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;
      this.addChunkIfEnoughEnergy();

      // update energy chunk positions
      this.energyChunkList.forEach( function( chunk ) {

        // make the chunk fall
        chunk.translateBasedOnVelocity( dt );

        // see if chunk is in the location where it can be transferred to the next energy system
        var yPosition = self.positionProperty.get().plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).y -
                        chunk.positionProperty.value.y;
        var chunkInRange = ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( yPosition );
        var chunkExempt = self.exemptFromTransferEnergyChunks.indexOf( chunk ) >= 0;

        if ( self.waterPowerableElementInPlaceProperty.value && chunkInRange && !chunkExempt ) {

          if ( self.transferNextAvailableChunk ) {

            // send this chunk to the next energy system
            self.outgoingEnergyChunks.push( chunk );

            // alternate sending or keeping chunks
            self.transferNextAvailableChunk = false;
          }
          else {

            // don't transfer this chunk
            self.exemptFromTransferEnergyChunks.push( chunk );

            // set up to transfer the next one
            self.transferNextAvailableChunk = true;
          }
        }

        // remove the energy chunk if it is out of visible range
        var chunkDistance = self.positionProperty.get()
          .plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).distance( chunk.positionProperty.value );
        if ( chunkDistance > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
          self.energyChunkList.remove( chunk );
          _.pull( self.exemptFromTransferEnergyChunks, chunk );
        }
      } );

      // generate the appropriate amount of energy
      var energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;

      // add incoming energy to delay queue
      this.flowEnergyDelay.push( new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2, { creationTime: new Date().getTime() } ) );

      // send along saved energy values if enough time has passed
      if ( this.flowEnergyDelay[ 0 ].creationTime + FALLING_WATER_DELAY * 1000 <= new Date().getTime() ) {
        return this.flowEnergyDelay.shift();
      }
      else {
        return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
      }
    },

    /**
     * @public
     * @override
     */
    preloadEnergyChunks: function() {
      this.clearEnergyChunks();

      // define translation function here to avoid creating anonymous function inside loop
      function translateChunks( chunks, dt ) {
        chunks.forEach( function( chunk ) {
          chunk.translateBasedOnVelocity( dt );
        } );
      }

      var preloadTime = 3; // In seconds, empirically determined.
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var tempEnergyChunkList = [];

      // simulate energy chunks moving through the system
      while ( preloadTime > 0 ) {
        this.energySinceLastChunk += this.getEnergyOutputRate().amount * dt;
        if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          tempEnergyChunkList.push( this.createNewChunk() );
          this.energySinceLastChunk = this.energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        // make the chunks fall
        translateChunks( tempEnergyChunkList, dt );

        preloadTime -= dt;
      }

      // now that they are positioned, add these to the 'real' list of energy chunks
      tempEnergyChunkList.forEach( function( ec ) {
        this.energyChunkList.push( ec );
      } );
    },

    /**
     * @returns {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      var energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value;
      assert && assert( energyAmount >= 0, 'EnergyAmount is ' + energyAmount );
      return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
    },

    /**
     * @public
     * @override
     */
    deactivate: function() {
      this.flowProportionProperty.reset();
      this.waterDrops.length = 0;
      EnergySource.prototype.deactivate.call( this );
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySource.prototype.clearEnergyChunks.call( this );
      this.exemptFromTransferEnergyChunks.length = 0;
    }


  }, {

    // statics
    OFFSET_FROM_CENTER_TO_WATER_ORIGIN: OFFSET_FROM_CENTER_TO_WATER_ORIGIN,
    OFFSET_FROM_CENTER_TO_FAUCET_HEAD: OFFSET_FROM_CENTER_TO_FAUCET_HEAD,
    MAX_WATER_WIDTH: MAX_WATER_WIDTH
  } );
} );
