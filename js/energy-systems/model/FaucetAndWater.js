// Copyright 2016, University of Colorado Boulder

/**
 * Class that represents a faucet that can be turned on to provide mechanical
 * energy to other energy system elements.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Random = require( 'DOT/Random' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Vector2 = require( 'DOT/Vector2' );
  var WaterDrop = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/WaterDrop' );

  // Images
  var FAUCET_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/faucet_icon.png' );

  // Constants
  var OFFSET_FROM_CENTER_TO_WATER_ORIGIN = new Vector2( 0.072, 0.09 );
  var FALLING_ENERGY_CHUNK_VELOCITY = 0.09; // In meters/second.
  var MAX_WATER_WIDTH = 0.01; // In meters.
  var MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER = 0.5; // In meters.
  var RAND = new Random();
  var ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new RangeWithValue( 0.05, 0.06 );

  // The following acceleration constant defines the rate at which the water
  // flows from the faucet.  The value used is not the actual value in
  // Earth's gravitational field - it has been tweaked for optimal visual
  // effect.
  var ACCELERATION_DUE_TO_GRAVITY = new Vector2( 0, -0.15 );

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} waterPowerableElementInPlace
   * @constructor
   */
  function FaucetAndWater( energyChunksVisibleProperty, waterPowerableElementInPlaceProperty ) {

    EnergySource.call( this, new Image( FAUCET_ICON ) );

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Flag that is used to decide whether to pass energy chunks to the next
    // energy system element.
    this.waterPowerableElementInPlaceProperty = waterPowerableElementInPlaceProperty;

    // Proportion of full available flow that is occurring.
    this.addProperty( 'flowProportion', 0 );

    // Water drops that comprise the stream of water.
    this.waterDrops = new ObservableArray();

    // List of chunks that are not being transferred to the next energy system
    // element.
    this.exemptFromTransferEnergyChunks = [];

    this.energySinceLastChunk = 0;

    // Flag for whether next chunk should be transferred or kept, used to
    // alternate transfer with non-transfer.
    this.transferNextAvailableChunk = true;
  }

  energyFormsAndChanges.register( 'FaucetAndWater', FaucetAndWater );

  return inherit( EnergySource, FaucetAndWater, {

    /**
     * @private
     * @return {EnergyChunk} New energy chunk
     */
    createNewChunk: function() {

      // Random x value within water column for "watery" appearance
      var x = ( RAND.nextDouble() - 0.5 ) * this.flowProportion * MAX_WATER_WIDTH / 2 + MAX_WATER_WIDTH / 2;

      var initialPosition = this.position
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
     * [step description]
     *
     * @param  {Number} dt timestep
     *
     * @return {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

      if ( !this.active ) {
        return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
      }

      var self = this;

      // Add water droplets as needed based on flow rate.
      if ( this.flowProportion > 0 ) {
        var initialOffset = new Vector2( 0, 0 );
        var initialWidth = this.flowProportion * MAX_WATER_WIDTH * ( 1 + ( RAND.nextDouble() - 0.5 ) * 0.2 );
        var initialSize = new Dimension2( initialWidth, initialWidth );
        this.waterDrops.push( new WaterDrop( initialOffset, new Vector2( 0, 0 ), initialSize ) );
      }

      // Make the water droplets fall.
      this.waterDrops.forEach( function( drop ) {
        drop.velocityProperty.set( drop.velocity.plus( ACCELERATION_DUE_TO_GRAVITY.times( dt ) ) );
        drop.offsetFromParentProperty.set( drop.offsetFromParent.plus( drop.velocity.times( dt ) ) );
      } );

      // Remove drops that have run their course by iterating over a copy and checking for matches.
      var waterDropsCopy = this.waterDrops.getArray().slice( 0 );
      waterDropsCopy.forEach( function( drop ) {
        if ( drop.offsetFromParent.distance( self.position ) > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
          if ( self.waterDrops.contains( drop ) ) {
            self.waterDrops.remove( drop );
          }
        }
      } );

      // Check if time to emit an energy chunk and, if so, do it.
      this.energySinceLastChunk += EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportion * dt;
      this.addChunkIfEnoughEnergy();

      // Update energy chunk positions.
      this.energyChunkList.forEach( function( chunk ) {

        // Make the chunk fall.
        chunk.translateBasedOnVelocity( dt );

        // See if chunk is in the location where it can be transferred
        // to the next energy system.
        var position = self.position.plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).y - chunk.positionProperty.value.y;
        var chunkInRange = ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( position );
        var chunkExempt = self.exemptFromTransferEnergyChunks.indexOf( chunk ) >= 0;

        if ( self.waterPowerableElementInPlaceProperty.value && chunkInRange && !chunkExempt ) {

          if ( self.transferNextAvailableChunk ) {
            // Send this chunk to the next energy system.
            self.outgoingEnergyChunks.push( chunk );

            // Alternate sending or keeping chunks.
            self.transferNextAvailableChunk = false;
          } else {
            // Don't transfer this chunk.
            self.exemptFromTransferEnergyChunks.push( chunk );

            // Set up to transfer the next one.
            self.transferNextAvailableChunk = true;
          }
        }

        // Remove it if it is out of visible range.
        var chunkDistance = self.position.plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).distance( chunk.positionProperty.value );
        if ( chunkDistance > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
          self.energyChunkList.remove( chunk );
          _.pull( self.exemptFromTransferEnergyChunks, chunk );
        }

      } );

      // Generate the appropriate amount of energy.
      var energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportion * dt;
      return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
    },

    /**
     * [preLoadEnergyChunks description]
     * @public
     * @override
     */
    preLoadEnergyChunks: function() {
      this.clearEnergyChunks();

      // Define translation function here to avoid creating anonymous function
      // inside loop
      function translateChunks( chunks, dt ) {
        chunks.forEach( function( chunk ) {
          chunk.translateBasedOnVelocity( dt );
        } );
      }

      var preLoadTime = 3; // In seconds, empirically determined.
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var tempEnergyChunkList = [];

      // Simulate energy chunks moving through the system.
      while ( preLoadTime > 0 ) {
        this.energySinceLastChunk += this.getEnergyOutputRate().amount * dt;
        if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          tempEnergyChunkList.push( this.createNewChunk() );
          this.energySinceLastChunk = this.energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        // Make the chunks fall.
        translateChunks( tempEnergyChunkList, dt );

        preLoadTime -= dt;
      }

      // Now that they are positioned, add these to the 'real' list of energy chunks.
      this.energyChunkList.concat( tempEnergyChunkList );

    },

    /**
     * [getEnergyOutputRate description]
     *
     * @return {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      var energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportion;
      return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
    },

    /**
     * [deactivate description]
     * @public
     * @override
     */
    deactivate: function() {
      EnergySource.prototype.deactivate.call( this );
      this.waterDrops.clear();
    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySource.prototype.clearEnergyChunks.call( this );
      this.exemptFromTransferEnergyChunks.length = 0;
    }

  }, {
    OFFSET_FROM_CENTER_TO_WATER_ORIGIN: OFFSET_FROM_CENTER_TO_WATER_ORIGIN
  } );
} );

