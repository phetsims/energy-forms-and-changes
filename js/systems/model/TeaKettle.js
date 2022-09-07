// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type representing the steam-generating tea kettle in the model.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import teaKettleIcon_png from '../../../images/teaKettleIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergySource from './EnergySource.js';

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
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, steamPowerableElementInPlaceProperty, energyChunkGroup, energyChunkPathMoverGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( teaKettleIcon_png ), options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.teaKettle;

    // @public {NumberProperty}
    this.heatProportionProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: options.tandem.createTandem( 'heatProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of heat coming from the heater'
    } );

    // @public (read-only) {NumberProperty}
    this.energyProductionRateProperty = new NumberProperty( 0, {
      range: new Range( 0, EFACConstants.MAX_ENERGY_PRODUCTION_RATE ),
      tandem: options.tandem.createTandem( 'energyProductionRateProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true
    } );

    // @public
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private
    this.steamPowerableElementInPlaceProperty = steamPowerableElementInPlaceProperty;
    this.heatEnergyProducedSinceLastChunk = EFACConstants.ENERGY_PER_CHUNK / 2;
    this.energyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @private - List of chunks that are not being transferred to the next energy system
    // element.
    this.exemptFromTransferEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'exemptFromTransferEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    assert && this.outgoingEnergyChunks.addItemAddedListener( chunk => {
      assert && assert( !this.exemptFromTransferEnergyChunks.includes( chunk ), 'Exempt means it should not go onto outgoing list' );
    } );

    // Flag for whether next chunk should be transferred or kept, used to
    // alternate transfer with non-transfer.
    this.transferNextAvailableChunk = true;
  }

  /**
   * Animation for tea kettle and energy chunks
   *
   * @param {number} dt
   * @returns {Energy}
   * @public
   */
  step( dt ) {

    if ( this.activeProperty.value ) {

      if ( this.heatProportionProperty.value > 0 || this.energyProductionRateProperty.value > COOL_DOWN_COMPLETE_THRESHOLD ) {

        // Calculate the energy production rate.

        // Analogous to acceleration.
        const increase = this.heatProportionProperty.value * MAX_ENERGY_CHANGE_RATE;

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
        Math.max( this.heatProportionProperty.value, 0 ) * EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt;

      if ( this.heatEnergyProducedSinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

        // Emit a new thermal energy chunk.
        const xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
        const x0 = this.positionProperty.value.x + xRange.min + dotRandom.nextDouble() * xRange.getLength();
        const y0 = this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN;
        const initialPosition = new Vector2( x0, y0 );

        const energyChunk = this.energyChunkGroup.createNextElement(
          EnergyType.THERMAL,
          initialPosition,
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );

        this.energyChunkList.push( energyChunk );

        this.heatEnergyProducedSinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;

        this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( energyChunk,
          createThermalEnergyChunkPath( initialPosition, this.positionProperty.value ),
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
    const chunkMovers = this.energyChunkMovers.slice();

    chunkMovers.forEach( mover => {
      mover.moveAlongPath( dt );
      const chunk = mover.energyChunk;

      if ( mover.pathFullyTraversed ) {

        this.energyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );

        // This is a thermal chunk that is coming out of the water.
        if ( chunk.energyTypeProperty.get() === EnergyType.THERMAL &&
             chunk.positionProperty.get().y === this.positionProperty.value.y + WATER_SURFACE_HEIGHT_OFFSET ) {
          if ( dotRandom.nextDouble() > 0.2 ) {

            // Turn the chunk into mechanical energy.
            chunk.energyTypeProperty.set( EnergyType.MECHANICAL );
          }

          // Set this chunk on a path to the base of the spout.
          const travelDistance = chunk.positionProperty.get().distance( this.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) );

          // create path mover to spout bottom
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, [ SPOUT_BOTTOM_OFFSET ] ),
            travelDistance / ENERGY_CHUNK_WATER_TO_SPOUT_TIME ) );
        }

        // This chunk is moving out of the spout.
        else if ( chunk.positionProperty.get().equals( this.positionProperty.value.plus( SPOUT_BOTTOM_OFFSET ) ) ) {
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
            EnergyChunkPathMover.createStraightPath( this.positionProperty.value, SPOUT_EXIT_ANGLE ),
            EFACConstants.ENERGY_CHUNK_VELOCITY /* This is a speed (scalar) */ ) );
        }

        // This chunk is out of view, and we are done with it.
        else {
          this.energyChunkList.remove( chunk );
          this.exemptFromTransferEnergyChunks.remove( chunk );
          this.energyChunkGroup.disposeElement( chunk );
        }
      }

      // Path not fully traversed
      else {

        // See if this energy chunks should be transferred to the
        // next energy system.
        if ( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL &&
             this.steamPowerableElementInPlaceProperty.get() &&
             ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( this.positionProperty.value.distance( chunk.positionProperty.get() ) ) &&
             !this.exemptFromTransferEnergyChunks.includes( chunk ) ) {

          // Send this chunk to the next energy system.
          if ( this.transferNextAvailableChunk ) {
            this.energyChunkList.remove( chunk );
            this.outgoingEnergyChunks.push( chunk );

            this.energyChunkMovers.remove( mover );
            this.energyChunkPathMoverGroup.disposeElement( mover );

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
                  !this.exemptFromTransferEnergyChunks.includes( chunk ) ) {
          this.exemptFromTransferEnergyChunks.push( chunk );
        }
      }

    } );
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
      if ( this.heatProportionProperty.value > 0 ) {
        // if the heater is on, determine the rate of chunk release by its level
        energySinceLastChunk += this.heatProportionProperty.value * EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt;
      }
      else {
        // otherwise, determine by the existing energy in the kettle
        energySinceLastChunk += this.energyProductionRateProperty.get() * dt;
      }

      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
        let initialPosition;
        const xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;

        if ( this.heatProportionProperty.value > 0 ) {

          // Create a thermal chunk inside the burner.
          initialPosition = new Vector2(
            this.positionProperty.value.x + xRange.min + dotRandom.nextDouble() * xRange.getLength(),
            this.positionProperty.value.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN
          );
        }
        else {

          // Create a thermal chunk inside the tea kettle.
          initialPosition = new Vector2( this.positionProperty.value.x, this.positionProperty.value.y );
        }

        const energyChunk = this.energyChunkGroup.createNextElement(
          EnergyType.THERMAL,
          initialPosition,
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );
        this.energyChunkList.push( energyChunk );

        this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( energyChunk,
          createThermalEnergyChunkPath( initialPosition, this.positionProperty.value ),
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
    this.heatProportionProperty.reset();
    this.energyProductionRateProperty.reset();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.exemptFromTransferEnergyChunks.clear(); // Disposal is done when energyChunkList is cleared
    this.energyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.energyChunkMovers.clear();
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      heatEnergyProducedSinceLastChunk: this.heatEnergyProducedSinceLastChunk,
      transferNextAvailableChunk: this.transferNextAvailableChunk
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState( stateObject ) {
    this.heatEnergyProducedSinceLastChunk = stateObject.heatEnergyProducedSinceLastChunk;
    this.transferNextAvailableChunk = stateObject.transferNextAvailableChunk;
  }
}

/**
 * @param {Vector2} startPosition
 * @param {Vector2} teaKettlePosition
 * @returns {Vector2[]}
 * @private
 */
const createThermalEnergyChunkPath = ( startPosition, teaKettlePosition ) => {
  const path = [];

  path.push( new Vector2( startPosition.x, teaKettlePosition.y + WATER_SURFACE_HEIGHT_OFFSET ) );

  return path;
};

// statics
TeaKettle.SPOUT_EXIT_ANGLE = SPOUT_EXIT_ANGLE;

energyFormsAndChanges.register( 'TeaKettle', TeaKettle );
export default TeaKettle;