// Copyright 2016-2019, University of Colorado Boulder

/**
 * a type representing the steam-generating tea kettle in the model.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const Energy = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Energy' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySource' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const TEAPOT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/tea_kettle_icon.png' );

  // constants

  // Offsets and other constants used for energy paths.  These are mostly
  // empirically determined and coordinated with the image.
  const SPOUT_BOTTOM_OFFSET = new Vector2( 0.03, 0.02 );
  const SPOUT_EXIT_ANGLE = 0.876; // in radians
  const WATER_SURFACE_HEIGHT_OFFSET = 0; // From tea kettle position, in meters.
  const THERMAL_ENERGY_CHUNK_Y_ORIGIN = -0.05; // Meters. Coordinated with heater position.
  const THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE = new Range( -0.015, 0.015 ); // Meters. Coordinated with heater position.

  // Miscellaneous other constants.
  const MAX_ENERGY_CHANGE_RATE = EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 5; // In joules/second
  const COOLING_CONSTANT = 0.1; // Controls rate at which tea kettle cools down, empirically determined.
  const COOL_DOWN_COMPLETE_THRESHOLD = 30; // In joules/second
  const ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range( 0.12, 0.15 );
  const ENERGY_CHUNK_WATER_TO_SPOUT_TIME = 0.7; // Used to keep chunks evenly spaced.

  class TeaKettle extends EnergySource {

    /**
     * @param {Property.<boolean>} energyChunksVisibleProperty
     * @param {Property.<boolean>} steamPowerableElementInPlaceProperty
     */
    constructor( energyChunksVisibleProperty, steamPowerableElementInPlaceProperty ) {
      super( new Image( TEAPOT_ICON ) );

      // @public {string} - a11y name
      this.a11yName = EFACA11yStrings.teaKettle.value;

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

    /**
     * Animation for tea kettle and energy chunks
     *
     * @param  {number} dt timestep
     *
     * @returns {Energy}
     * @public
     * @override
     */
    step( dt ) {

      if ( this.activeProperty.value ) {

        if ( this.heatCoolAmountProperty.value > 0 || this.energyProductionRateProperty.value > COOL_DOWN_COMPLETE_THRESHOLD ) {

          // Calculate the energy production rate.

          // Analogous to acceleration.
          const increase = this.heatCoolAmountProperty.value * MAX_ENERGY_CHANGE_RATE;

          // Analogous to friction.
          const decrease = this.energyProductionRateProperty.value * COOLING_CONSTANT;

          // Analogous to velocity.
          let rate = this.energyProductionRateProperty.value + increase * dt - decrease * dt;
          rate = Math.min( rate, EFACConstants.MAX_ENERGY_PRODUCTION_RATE );

          this.energyProductionRateProperty.set( rate );
        }
        else {
          // Clamp the energy production rate to zero so that it doesn't
          // trickle on forever.
          this.energyProductionRateProperty.set( 0 );
        }

        // See if it's time to emit a new energy chunk from the heater.
        this.heatEnergyProducedSinceLastChunk +=
          Math.max( this.heatCoolAmountProperty.value, 0 ) * EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt;

        if ( this.heatEnergyProducedSinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // Emit a new thermal energy chunk.
          const xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
          const x0 = this.positionProperty.value.x + xRange.min + phet.joist.random.nextDouble() * xRange.getLength();
          const y0 = this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN;
          const initialPosition = new Vector2( x0, y0 );

          const energyChunk = new EnergyChunk(
            EnergyType.THERMAL,
            initialPosition,
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );

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
    }

    /**
     * @param  {number} dt time step
     * @private
     */
    moveEnergyChunks( dt ) {
      const chunkMovers = _.clone( this.energyChunkMovers );

      chunkMovers.forEach( mover => {
        mover.moveAlongPath( dt );
        const chunk = mover.energyChunk;

        if ( mover.pathFullyTraversed ) {

          _.pull( this.energyChunkMovers, mover );

          // This is a thermal chunk that is coming out of the water.
          if ( chunk.energyTypeProperty.get() === EnergyType.THERMAL &&
               chunk.positionProperty.get().y === this.positionProperty.value.y + WATER_SURFACE_HEIGHT_OFFSET ) {
            if ( phet.joist.random.nextDouble() > 0.2 ) {

              // Turn the chunk into mechanical energy.
              chunk.energyTypeProperty.set( EnergyType.MECHANICAL );
            }

            // Set this chunk on a path to the base of the spout.
            const travelDistance = chunk.positionProperty.get().distance( this.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) );

            // create path mover to spout bottom
            this.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, [ SPOUT_BOTTOM_OFFSET ] ),
              travelDistance / ENERGY_CHUNK_WATER_TO_SPOUT_TIME ) );
          }

          // This chunk is moving out of the spout.
          else if ( chunk.positionProperty.get().equals( this.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) ) ) {
            this.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              EnergyChunkPathMover.createStraightPath( this.positionProperty.value, SPOUT_EXIT_ANGLE ),
              EFACConstants.ENERGY_CHUNK_VELOCITY /* This is a speed (scalar) */ ) );
          }

          // This chunk is out of view, and we are done with it.
          else {
            this.energyChunkList.remove( chunk );
          }
        }

        // Path not fully traversed
        else {

          // See if this energy chunks should be transferred to the
          // next energy system.
          if ( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL &&
               this.steamPowerableElementInPlaceProperty.get() &&
               ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( this.positionProperty.value.distance( chunk.positionProperty.get() ) ) &&
               !_.includes( this.exemptFromTransferEnergyChunks, chunk ) ) {

            // Send this chunk to the next energy system.
            if ( this.transferNextAvailableChunk ) {
              this.outgoingEnergyChunks.push( chunk );

              _.pull( this.energyChunkMovers, mover );

              // Alternate sending or keeping chunks.
              this.transferNextAvailableChunk = false;
            }

            // Don't transfer this chunk.
            // Set up to transfer the next one.
            else {
              this.exemptFromTransferEnergyChunks.push( chunk );

              this.transferNextAvailableChunk = true;
            }
          }

          // if a chunk has reached the position where it should transfer to the next system, but no steam powerable
          // element is in place, add the chunk to the list of non transfers
          else if ( !this.steamPowerableElementInPlaceProperty.get() &&
                    ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains(
                      this.positionProperty.value.distance( chunk.positionProperty.get() )
                    ) &&
                    !_.includes( this.exemptFromTransferEnergyChunks, chunk ) ) {
            this.exemptFromTransferEnergyChunks.push( chunk );
          }
        }

      } );
    }

    /**
     * @param  {Vector2}  startPosition
     * @param  {Vector2}  teaKettlePosition
     *
     * @returns {Vector2[]}
     * @private
     */
    createThermalEnergyChunkPath( startPosition, teaKettlePosition ) {
      const path = [];

      path.push( new Vector2( startPosition.x, teaKettlePosition.y + WATER_SURFACE_HEIGHT_OFFSET ) );

      return path;
    }

    /**
     * @public
     * @override
     */
    preloadEnergyChunks() {
      this.clearEnergyChunks();

      // Return if no chunks to add.
      if ( this.energyProductionRateProperty.get() === 0 ) {
        return;
      }

      let preloadComplete = false;
      const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // Simulate energy chunks moving through the system.
      while ( !preloadComplete ) {
        energySinceLastChunk += this.energyProductionRateProperty.get() * dt;

        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // Create a thermal chunk inside the burner.
          const xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
          const initialPosition = new Vector2(
            this.positionProperty.value.x + xRange.min + phet.joist.random.nextDouble() * xRange.getLength(),
            this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN
          );

          const energyChunk = new EnergyChunk(
            EnergyType.THERMAL,
            initialPosition,
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );
          this.energyChunkList.push( energyChunk );

          this.energyChunkMovers.push( new EnergyChunkPathMover( energyChunk,
            this.createThermalEnergyChunkPath( initialPosition, this.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY
          ) );

          energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        }

        // Update energy chunk positions.
        this.moveEnergyChunks( dt );

        if ( this.outgoingEnergyChunks.length > 0 || this.exemptFromTransferEnergyChunks.length > 0 ) {

          // An energy chunk has traversed to the output of this system, or passed the point of moving to the next system.
          preloadComplete = true;

          // a chunk was recently released from the burner because of preloading, so reset the heat energy level
          this.heatEnergyProducedSinceLastChunk = 0;
        }
      }
    }

    /**
     * @returns {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate() {
      return new Energy( EnergyType.MECHANICAL, this.energyProductionRateProperty.value, Math.PI / 2 );
    }

    /**
     * Deactivate the tea kettle
     * @public
     * @override
     */
    deactivate() {
      super.deactivate();
      this.heatCoolAmountProperty.reset();
      this.energyProductionRateProperty.reset();
    }

    /**
     * @public
     * @override
     */
    clearEnergyChunks() {
      super.clearEnergyChunks();
      this.exemptFromTransferEnergyChunks.length = 0;
      this.energyChunkMovers.length = 0;
    }
  }

  // statics
  TeaKettle.SPOUT_EXIT_ANGLE = SPOUT_EXIT_ANGLE;

  return energyFormsAndChanges.register( 'TeaKettle', TeaKettle );
} );

