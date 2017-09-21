// Copyright 2016-2017, University of Colorado Boulder

/**
 * Class representing the steam-generating tea pot in the model.
 *
 * @author John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Random = require( 'DOT/Random' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var TEAPOT_LARGE = require( 'image!ENERGY_FORMS_AND_CHANGES/teapot_large.png' );

  // Constants
  var TEAPOT_OFFSET = new Vector2( 0.0, 0.015 );
  var TEAPOT_IMAGE = new EFACModelImage( TEAPOT_LARGE, TEAPOT_OFFSET );

  // Offsets and other constants used for energy paths.  These are mostly
  // empirically determined and coordinated with the image.
  var SPOUT_BOTTOM_OFFSET = new Vector2( 0.03, 0.02 );
  var SPOUT_TIP_OFFSET = new Vector2( 0.25, 0.3 );
  var DISTANT_TARGET_OFFSET = new Vector2( 1, 1 );
  var WATER_SURFACE_HEIGHT_OFFSET = 0; // From teapot position, in meters.
  var THERMAL_ENERGY_CHUNK_Y_ORIGIN = -0.05; // Meters. Coordinated with heater position.
  var THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE = new RangeWithValue( -0.015, 0.015 ); // Meters. Coordinated with heater position.

  // Miscellaneous other constants.
  var MAX_ENERGY_CHANGE_RATE = EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 5; // In joules/second
  var COOLING_CONSTANT = 0.1; // Controls rate at which tea pot cools down, empirically determined.
  var COOL_DOWN_COMPLETE_THRESHOLD = 30; // In joules/second
  var ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new RangeWithValue( 0.12, 0.15 );
  var RAND = new Random();
  var ENERGY_CHUNK_WATER_TO_SPOUT_TIME = 0.7; // Used to keep chunks evenly spaced.

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} steamPowerableElementInPlaceProperty
   * @constructor
   */
  function TeaPot( energyChunksVisibleProperty, steamPowerableElementInPlaceProperty ) {

    EnergySource.call( this, new Image( TEAPOT_LARGE ) );

    this.heatCoolAmountProperty = new Property( 0 );
    this.energyProductionRateProperty = new Property( 0 );

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.steamPowerableElementInPlaceProperty = steamPowerableElementInPlaceProperty;
    this.heatEnergyProducedSinceLastChunk = EFACConstants.ENERGY_PER_CHUNK / 2;
    this.energyChunkMovers = [];

    // List of chunks that are not being transferred to the next energy system
    // element.
    this.exemptFromTransferEnergyChunks = [];

    // Flag for whether next chunk should be transferred or kept, used to
    // alternate transfer with non-transfer.
    this.transferNextAvailableChunk = true;
  }

  energyFormsAndChanges.register( 'TeaPot', TeaPot );

  return inherit( EnergySource, TeaPot, {

    /**
     * Animation for teapot and energy chunks
     *
     * @param  {number} dt timestep
     *
     * @returns {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

      if ( this.activeProperty.value ) {

        if ( this.heatCoolAmountProperty.value > 0 || this.energyProductionRateProperty.value > COOL_DOWN_COMPLETE_THRESHOLD ) {

          // Calculate the energy production rate.

          // Analogous to acceleration.
          var increase = this.heatCoolAmountProperty.value * MAX_ENERGY_CHANGE_RATE;

          // Analogous to friction.
          var decrease = this.energyProductionRateProperty.value * COOLING_CONSTANT;

          // Analogous to velocity.
          var rate = this.energyProductionRateProperty.value + increase * dt - decrease * dt;
          rate = Math.min( rate, EFACConstants.MAX_ENERGY_PRODUCTION_RATE );

          this.energyProductionRateProperty.set( rate );
        } else {
          // Clamp the energy production rate to zero so that it doesn't
          // trickle on forever.
          this.energyProductionRateProperty.set( 0 );
        }

        // See if it's time to emit a new energy chunk from the heater.
        this.heatEnergyProducedSinceLastChunk +=
          Math.max( this.heatCoolAmountProperty.value, 0 ) * EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt;

        if ( this.heatEnergyProducedSinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // Emit a new thermal energy chunk.
          var xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
          var x0 = this.positionProperty.value.x + xRange.min + RAND.nextDouble() * xRange.getLength();
          var y0 = this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN;
          var initialPosition = new Vector2( x0, y0 );

          var energyChunk = new EnergyChunk(
            EnergyType.THERMAL,
            initialPosition,
            Vector2.ZERO,
            this.energyChunksVisibleProperty );

          this.energyChunkList.push( energyChunk );

          this.heatEnergyProducedSinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;

          this.energyChunkMovers.push( new EnergyChunkPathMover( energyChunk,
            this.createThermalEnergyChunkPath( initialPosition, this.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        }

        // Move all energy chunks that are under this element's control.
        this.moveEnergyChunks( dt );
      }
      return new Energy( EnergyType.MECHANICAL, this.energyProductionRateProperty.value * dt, Math.PI / 2 );
    },

    /**
     * @param  {number} dt time step
     * @private
     */
    moveEnergyChunks: function( dt ) {
      var self = this;
      var chunkMovers = _.clone( this.energyChunkMovers );

      chunkMovers.forEach( function( mover ) {
        mover.moveAlongPath( dt );
        var chunk = mover.energyChunk;

        if ( mover.pathFullyTraversed ) {

          _.pull( self.energyChunkMovers, mover );

          // This is a thermal chunk that is coming out of the water.
          if ( chunk.energyTypeProperty.get() === EnergyType.THERMAL &&
            chunk.positionProperty.get().y === self.positionProperty.value.y + WATER_SURFACE_HEIGHT_OFFSET ) {

            if ( RAND.nextDouble() > 0.2 ) {

              // Turn the chunk into mechanical energy.
              chunk.energyTypeProperty.set( EnergyType.MECHANICAL );
            }

            // Set this chunk on a path to the base of the spout.
            var travelDistance = chunk.positionProperty.get().distance( self.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) );

            self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createPathToSpoutBottom( self.positionProperty.value ),
              travelDistance / ENERGY_CHUNK_WATER_TO_SPOUT_TIME ) );
          }

          // This chunk is moving out of the spout.
          else if ( chunk.positionProperty.get().equals( self.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) ) ) {
            self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createSpoutExitPath( self.positionProperty.value ),
              EFACConstants.ENERGY_CHUNK_VELOCITY /* This is a speed (scalar) */ ) );
          }

          // This chunk is out of view, and we are done with it.
          else {
            self.energyChunkList.remove( chunk );
          }
        }

        // Path not fully traversed
        else {

          // See if this energy chunks should be transferred to the
          // next energy system.
          if ( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL &&
            self.steamPowerableElementInPlaceProperty.get() &&
            ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( self.positionProperty.value.distance( chunk.positionProperty.get() ) ) &&
            !_.includes( self.exemptFromTransferEnergyChunks, chunk ) ) {

            // Send this chunk to the next energy system.
            if ( self.transferNextAvailableChunk ) {
              self.outgoingEnergyChunks.push( chunk );

              _.pull( self.energyChunkMovers, mover );

              // Alternate sending or keeping chunks.
              self.transferNextAvailableChunk = false;
            }

            // Don't transfer this chunk.
            // Set up to transfer the next one.
            else {
              self.exemptFromTransferEnergyChunks.push( chunk );

              self.transferNextAvailableChunk = true;
            }
          }

        }

      } );
    },

    /**
     * @param  {Vector2}  startPosition
     * @param  {Vector2}  teapotPosition
     *
     * @returns {Vector2[]}
     * @private
     */
    createThermalEnergyChunkPath: function( startPosition, teapotPosition ) {
      var path = [];

      path.push( new Vector2( startPosition.x, teapotPosition.y + WATER_SURFACE_HEIGHT_OFFSET ) );

      return path;
    },

    /**
     * @param  {Vector2} parentElementPosition
     *
     * @returns {Vector2[]}
     * @private
     */
    createPathToSpoutBottom: function( parentElementPosition ) {
      var path = [];

      path.push( parentElementPosition.plus( SPOUT_BOTTOM_OFFSET ) );

      return path;
    },

    /**
     * @param  {Vector2} parentElementPosition
     *
     * @returns {Vector2[]}
     * @private
     */
    createSpoutExitPath: function( parentElementPosition ) {
      var path = [];

      path.push( parentElementPosition.plus( SPOUT_TIP_OFFSET ) );
      path.push( parentElementPosition.plus( DISTANT_TARGET_OFFSET ) );

      return path;
    },


    /**
     * @public
     * @override
     */
    preLoadEnergyChunks: function() {
      this.clearEnergyChunks();

      // Return if no chunks to add.
      if ( this.energyProductionRateProperty.get() === 0 ) {
        return;
      }

      var preLoadComplete = false;
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // Simulate energy chunks moving through the system.
      while ( !preLoadComplete ) {
        energySinceLastChunk += this.energyProductionRateProperty.get() * dt;

        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // Create a chunk inside the teapot (at the water surface).
          var initialPosition = new Vector2( this.positionProperty.value.x,
            this.positionProperty.value.y + WATER_SURFACE_HEIGHT_OFFSET );

          var energyType = RAND.nextDouble() > 0.2 ? EnergyType.MECHANICAL : EnergyType.THERMAL;

          var newEnergyChunk = new EnergyChunk( energyType, initialPosition, this.energyChunksVisibleProperty );
          this.energyChunkList.push( newEnergyChunk );

          var travelDistance = newEnergyChunk.positionProperty.get().distance(
            this.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) );

          this.energyChunkMovers.push( new EnergyChunkPathMover( newEnergyChunk,
            this.createPathToSpoutBottom( this.positionProperty.value ),
            travelDistance / ENERGY_CHUNK_WATER_TO_SPOUT_TIME ) );

          energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        }

        // Update energy chunk positions.
        this.moveEnergyChunks( dt );

        if ( this.outgoingEnergyChunks.length > 0 ) {
          // An energy chunk has traversed to the output of this system, completing the preload.
          preLoadComplete = true;
        }
      }
    },

    /**
     * @returns {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      return new Energy( EnergyType.MECHANICAL, this.energyProductionRate, Math.PI / 2 );
    },

    /**
     * Deactivate the teapot
     * @public
     * @override
     */
    deactivate: function() {
      EnergySource.prototype.deactivate.call( this );
      this.heatCoolAmountProperty.reset();
      this.energyProductionRateProperty.reset();
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySource.prototype.clearEnergyChunks.call( this );
      this.exemptFromTransferEnergyChunks.length = 0;
      this.energyChunkMovers.length = 0;
    },

    reset: function() {
      this.heatCoolAmountProperty.reset();
      this.energyProductionRateProperty.reset();
    }

  }, {
    // Expose the following as public static members
    TEAPOT_IMAGE: TEAPOT_IMAGE
  } );
} );

