// Copyright 2014-2020, University of Colorado Boulder

/**
 * base type for a movable model element that contains thermal energy and that, at least in the model, has an overall
 * shape that can be represented as a rectangle
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  const energyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/energyChunkDistributor' );
  const EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'DOT/Rectangle' );
  const Shape = require( 'KITE/Shape' );
  const ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ThermalContactArea' );
  const UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/UserMovableModelElement' );
  const Vector2 = require( 'DOT/Vector2' );

  // const
  const MAX_ENERGY_CHUNK_REDISTRIBUTION_TIME = 2; // in seconds, empirically determined to allow good distributions

  class RectangularThermalMovableModelElement extends UserMovableModelElement {

    /**
     * @param {Vector2} initialPosition
     * @param {number} width
     * @param {number} height
     * @param {number} mass - in kg
     * @param {number} specificHeat - in J/kg-K
     * @param {BooleanProperty} energyChunksVisibleProperty
     * @param {Object} [options]
     */
    constructor( initialPosition, width, height, mass, specificHeat, energyChunksVisibleProperty, options ) {
      super( initialPosition, options );

      // @public (read-only)
      this.mass = mass;
      this.width = width;
      this.height = height;
      this.specificHeat = specificHeat;
      this.energyChunksVisibleProperty = energyChunksVisibleProperty;
      this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;

      assert && assert( this.mass > 0, `Invalid mass: ${this.mass}` );
      assert && assert( this.specificHeat > 0, `Invalid specific heat: ${this.specificHeat}` );

      // @public (read-only) {ObservableArray} - energy chunks that are approaching this model element
      this.approachingEnergyChunks = new ObservableArray();

      // @private - motion controllers for the energy chunks that are approaching this model element
      this.energyChunkWanderControllers = [];

      // @private {Bounds2} - composite bounds for this model element, maintained as position changes
      this.bounds = Bounds2.NOTHING.copy();

      // @protected {ThermalContactArea} - the 2D area for this element where it can be in contact with another thermal
      // elements and thus exchange heat, generally set by descendant classes
      this.thermalContactArea = new ThermalContactArea( Bounds2.NOTHING.copy(), false );

      // @public (read-only) {NumberProperty}
      this.temperatureProperty = new NumberProperty( EFACConstants.ROOM_TEMPERATURE, {
        range: new Range( EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700 ), // in kelvin, empirically determined max
        units: 'K',
        tandem: options.tandem.createTandem( 'temperatureProperty' ),
        phetioReadOnly: true,
        phetioHighFrequency: true,
        phetioDocumentation: 'the temperature of the element'
      } );

      // update the composite bounds as the model element moves
      this.positionProperty.link( position => {
        this.bounds.setMinMax(
          position.x - width / 2,
          position.y,
          position.x + width / 2,
          position.y + height
        );
      } );

      // @private {Dot.Rectangle} - untranslated bounds for this model element
      this.untransformedBounds = new Rectangle( -this.width / 2, 0, this.width, this.height );

      // @private {Bounds2} - composite relative bounds for this model element, cached after first calculation
      this.relativeCompositeBounds = null;

      // @private {Shape} - untranslated shape that accounts for 3D projection
      const forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      const backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET( -EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      this.untranslatedProjectedShape = new Shape()
        .moveToPoint( new Vector2( -width / 2, 0 ).plus( forwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( width / 2, 0 ).plus( forwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( width / 2, 0 ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( width / 2, height ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( -width / 2, height ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( -width / 2, height ).plus( forwardPerspectiveOffset ) )
        .close();

      // @private {Shape} - The projected shape translated to the current position.  This is only updated when requested,
      // so should never be accessed directly, since it could be out of date.  See the associated getter method.
      this.latestProjectedShape = this.untranslatedProjectedShape;

      // @private {Vector2} - the position when the projected shape was last updated, used to tell if update is needed
      this.latestProjectedShapePosition = Vector2.ZERO;

      // @private {Matrix3} - a reusable matrix, used to reduce allocations when updating the projected shape
      this.translationMatrix = Matrix3.translation( initialPosition.x, initialPosition.y );

      // @private {number} - a value that is used to implement a countdown timer for energy chunk redistribution
      this.energyChunkDistributionCountdownTimer = 0;

      // perform the initial update of the projected shape
      this.getProjectedShape();

      // when an approaching energy chunk is removed from the list, make sure its wander controller goes away too
      this.approachingEnergyChunks.addItemRemovedListener( removedEC => {

        // find the wander controller that is controlling the motion of this energy chunk
        const wanderController = _.find( this.energyChunkWanderControllers, wanderController => {
          return wanderController.energyChunk === removedEC;
        } );

        assert && assert( wanderController, 'there should always be a wander controller for each approaching EC' );

        this.energyChunkWanderControllers = _.without( this.energyChunkWanderControllers, wanderController );

        // dispose the wander controller
        wanderController.dispose();
      } );

      // @private {number} - minimum amount of energy that this is allowed to have
      this.minEnergy = EFACConstants.WATER_FREEZING_POINT_TEMPERATURE * mass * specificHeat;

      // @public (read-only) {EnergyChunkContainerSlice[]} 2D "slices" of the container, used for 3D layering of energy
      // chunks in the view
      this.slices = [];

      // add the slices
      this.addEnergyChunkSlices();

      // add the initial energy chunks
      this.addInitialEnergyChunks();
    }

    /**
     * Get the composite bounds, meaning the total rectangular bounds occupied by this model element, for the provided
     * position, which may well not be the model element's current position.  This is essentially asking, "what would
     * your 2D bounds be if you were at this position?"
     * @param {Vector2} position
     * @param {Bounds2} [bounds] - an optional pre-allocated bounds instance, saves memory allocations
     */
    getCompositeBoundsForPosition( position, bounds ) {

      // if the relative composite bounds have not yet been calculated do it now - should only be necessary once
      if ( !this.relativeCompositeBounds ) {

        const relativeCompositeBounds = Bounds2.NOTHING.copy();

        this.relativePositionTestingBoundsList.forEach( relativePositionTestingBounds => {
          relativeCompositeBounds.includeBounds( relativePositionTestingBounds );
        } );
        this.relativeCompositeBounds = relativeCompositeBounds;
      }

      // allocate a Bounds2 instance if none was provided
      if ( !bounds ) {
        bounds = Bounds2.NOTHING.copy();
      }

      bounds.setMinMax(
        this.relativeCompositeBounds.minX + position.x,
        this.relativeCompositeBounds.minY + position.y,
        this.relativeCompositeBounds.maxX + position.x,
        this.relativeCompositeBounds.maxY + position.y
      );

      return bounds;
    }

    /**
     * get the untranslated rectangle
     * @returns {Dot.Rectangle}
     * @public
     */
    getUntransformedBounds() {
      return this.untransformedBounds;
    }

    /**
     * get the bounds for this model element, meaning the full rectangular space that it occupies
     * @returns {Bounds2}
     */
    getBounds() {
      return this.bounds;
    }

    /**
     * change the energy of this element by the desired value
     * @param {number} deltaEnergy
     * @public
     */
    changeEnergy( deltaEnergy ) {
      assert && assert( !_.isNaN( deltaEnergy ), `invalided deltaEnergy, value = ${deltaEnergy}` );
      this.energy += deltaEnergy;
    }

    /**
     * get the current energy content
     * @returns {number}
     * @public
     */
    getEnergy() {
      return this.energy;
    }

    /**
     * get the amount of energy above the minimum allowed
     * @returns {number}
     * @public
     */
    getEnergyAboveMinimum() {
      return this.energy - this.minEnergy;
    }

    /**
     * get the temperature of this element as a function of energy, mass, and specific heat
     * @returns {number}
     * @public
     */
    getTemperature() {
      assert && assert( this.energy >= 0, `Invalid energy: ${this.energy}` );
      return this.energy / ( this.mass * this.specificHeat );
    }

    get temperature() {
      return this.getTemperature();
    }

    /**
     * restore initial state
     * @public
     */
    reset() {
      super.reset();
      this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;
      this.temperatureProperty.reset();
      this.addInitialEnergyChunks();
      this.approachingEnergyChunks.reset();
      this.clearECDistributionCountdown();
    }

    /**
     * step function to move this model element forward in time
     * @param {number} dt - time step in seconds
     * @public
     */
    step( dt ) {
      this.temperatureProperty.set( this.getTemperature() );

      if ( this.energyChunkDistributionCountdownTimer > 0 ) {

        // distribute the energy chunks contained within this model element
        const redistributed = energyChunkDistributor.updatePositions( this.slices, dt );

        if ( !redistributed ) {

          // the energy chunks are reasonably well distributed, no more needed, so clear the countdown timer
          this.clearECDistributionCountdown();
        }
        else {

          // decrement the countdown timer
          this.energyChunkDistributionCountdownTimer = Math.max( this.energyChunkDistributionCountdownTimer - dt, 0 );
        }
      }

      // animate the energy chunks that are outside this model element
      this.animateNonContainedEnergyChunks( dt );
    }

    /**
     * This function is called to animate energy chunks that are drifting towards the container, e.g. from the burner.
     * It is NOT called during "evaporation", even though the chunks are "non-contained".
     * @param {number} dt - time step, in seconds
     * @private
     */
    animateNonContainedEnergyChunks( dt ) {

      // work from a copy of the list of wander controllers in case the list ends up changing
      const ecWanderControllers = this.energyChunkWanderControllers.slice();

      ecWanderControllers.forEach( ecWanderController => {
        ecWanderController.updatePosition( dt );
        if ( this.getSliceBounds().containsPoint( ecWanderController.energyChunk.positionProperty.value ) ) {
          this.moveEnergyChunkToSlices( ecWanderController.energyChunk );
        }
      } );
    }

    /**
     * Add an energy chunk to this model element.  The energy chunk can be outside of the element's rectangular bounds,
     * in which case it is added to the list of chunks that are moving towards the element, or it can be positioned
     * already inside, in which case it is immediately added to one of the energy chunk "slices".
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunk( energyChunk ) {
      const bounds = this.getSliceBounds();

      // energy chunk is positioned within container bounds, so add it directly to a slice
      if ( bounds.containsPoint( energyChunk.positionProperty.value ) ) {
        this.addEnergyChunkToSlice( energyChunk );
      }

      // chunk is out of the bounds of this element, so make it wander towards it
      else {
        energyChunk.zPosition = 0;
        this.approachingEnergyChunks.push( energyChunk );
        this.energyChunkWanderControllers.push(
          new EnergyChunkWanderController( energyChunk, this.positionProperty )
        );
      }
    }

    /**
     * add an energy chunk to one of the energy chunk container slices owned by this model element
     * @param {EnergyChunk} energyChunk
     * @protected
     */
    addEnergyChunkToSlice( energyChunk ) {

      // start with a slice at or near the middle of the order
      let sliceIndex = Math.floor( ( this.slices.length - 1 ) / 2 );
      let sliceIndexWithLowestEnergyDensity = null;
      let lowestEnergyDensityFound = Number.NEGATIVE_INFINITY;

      for ( let ecSliceCount = 0; ecSliceCount < this.slices.length; ecSliceCount++ ) {
        const slice = this.slices[ sliceIndex ];
        const sliceArea = slice.bounds.width * slice.bounds.height;
        const energyChunkDensity = slice.getNumberOfEnergyChunks() / sliceArea;
        if ( sliceIndexWithLowestEnergyDensity === null || energyChunkDensity < lowestEnergyDensityFound ) {
          sliceIndexWithLowestEnergyDensity = sliceIndex;
          lowestEnergyDensityFound = energyChunkDensity;
        }
        sliceIndex = ( sliceIndex + 1 ) % this.slices.length;
      }

      // add the energy chunk to the slice with the lowest density of energy chunks
      this.slices[ sliceIndexWithLowestEnergyDensity ].addEnergyChunk( energyChunk );

      // trigger redistribution of the energy chunks
      this.resetECDistributionCountdown();
    }

    /**
     * get the composite bounds of all the slices that are used to hold the energy chunks
     * @returns {Bounds2}
     * @public
     */
    getSliceBounds() {
      let minX = Number.POSITIVE_INFINITY;
      let minY = Number.POSITIVE_INFINITY;
      let maxX = Number.NEGATIVE_INFINITY;
      let maxY = Number.NEGATIVE_INFINITY;
      this.slices.forEach( slice => {
        const sliceBounds = slice.bounds;
        if ( sliceBounds.minX < minX ) {
          minX = sliceBounds.minX;
        }
        if ( sliceBounds.maxX > maxX ) {
          maxX = sliceBounds.maxX;
        }
        if ( sliceBounds.minY < minY ) {
          minY = sliceBounds.minY;
        }
        if ( sliceBounds.maxY > maxY ) {
          maxY = sliceBounds.maxY;
        }
      } );
      return new Bounds2( minX, minY, maxX, maxY );
    }

    /**
     * Transfer an EnergyChunk from the approachingEnergyChunks list to a slice in this model element. Find the
     * corresponding wander controller and remove it. A new wander controller is then associated with the transferred
     * chunk via a call to addEnergyChunk.
     * @param {EnergyChunk} energyChunk
     * @protected
     */
    moveEnergyChunkToSlices( energyChunk ) {
      this.approachingEnergyChunks.remove( energyChunk );
      this.addEnergyChunkToSlice( energyChunk );
    }

    /**
     * Remove an energy chunk from whatever energy chunk list it belongs to. If the chunk does not belong to a specific
     * energy chunk list, return false.
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
     * @public
     */
    removeEnergyChunk( energyChunk ) {
      this.slices.forEach( slice => {
        if ( slice.energyChunkList.indexOf( energyChunk ) >= 0 ) {
          slice.energyChunkList.remove( energyChunk );
          this.resetECDistributionCountdown();
          return true;
        }
      } );
      return false;
    }

    /**
     * Locate, remove, and return the energy chunk that is closed to the provided point.  Compensate distances for the
     * z-offset so that z-positioning doesn't skew the results, since the provided point is 2D.
     * @param {Vector2} point - comparison point
     * @returns {EnergyChunk||null} closestEnergyChunk, null if there are none available
     * @public
     */
    extractEnergyChunkClosestToPoint( point ) {

      // make sure this element doesn't give up all its energy chunks
      if ( this.getNumberOfEnergyChunksInElement() <= 1 ) {
        return null;
      }

      let closestEnergyChunk = null;
      let closestCompensatedDistance = Number.POSITIVE_INFINITY;

      // identify the closest energy chunk
      this.slices.forEach( slice => {
        slice.energyChunkList.forEach( energyChunk => {

          // compensate for the Z offset, otherwise front chunk will almost always be chosen
          const compensatedEnergyChunkPosition = energyChunk.positionProperty.value.minusXY(
            0,
            EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER * energyChunk.zPositionProperty.value
          );
          const compensatedDistance = compensatedEnergyChunkPosition.distance( point );
          if ( compensatedDistance < closestCompensatedDistance ) {
            closestEnergyChunk = energyChunk;
            closestCompensatedDistance = compensatedDistance;
          }
        } );
      } );

      this.removeEnergyChunk( closestEnergyChunk );
      return closestEnergyChunk;
    }

    /**
     * extract an energy chunk that is a good choice for being transferred to the provided rectangular bounds
     * @param {Bounds2} destinationBounds
     * @returns {EnergyChunk|null} - a suitable energy chunk or null if no energy chunks are available
     * @public
     */
    extractEnergyChunkClosestToBounds( destinationBounds ) {

      // make sure this element doesn't give up all its energy chunks
      if ( this.getNumberOfEnergyChunksInElement() <= 1 ) {
        return null;
      }

      let chunkToExtract = null;
      const myBounds = this.getSliceBounds();
      if ( destinationBounds.containsBounds( this.thermalContactArea ) ) {

        // this element's shape is contained by the destination - pick a chunk near our right or left edge
        let closestDistanceToVerticalEdge = Number.POSITIVE_INFINITY;
        this.slices.forEach( slice => {
          slice.energyChunkList.forEach( energyChunk => {
            const distanceToVerticalEdge = Math.min(
              Math.abs( myBounds.minX - energyChunk.positionProperty.value.x ),
              Math.abs( myBounds.maxX - energyChunk.positionProperty.value.x )
            );

            if ( distanceToVerticalEdge < closestDistanceToVerticalEdge ) {
              chunkToExtract = energyChunk;
              closestDistanceToVerticalEdge = distanceToVerticalEdge;
            }
          } );
        } );
      }
      else if ( this.thermalContactArea.containsBounds( destinationBounds ) ) {

        // This element's shape encloses the destination shape - choose a chunk that is close but doesn't overlap with
        // the destination shape.
        let closestDistanceToDestinationEdge = Number.POSITIVE_INFINITY;
        this.slices.forEach( slice => {
          slice.energyChunkList.forEach( energyChunk => {
            const distanceToDestinationEdge =
              Math.min( Math.abs( destinationBounds.minX - energyChunk.positionProperty.value.x ),
                Math.abs( destinationBounds.maxX - energyChunk.positionProperty.value.x ) );
            if ( !destinationBounds.containsPoint( energyChunk.positionProperty.value ) &&
                 distanceToDestinationEdge < closestDistanceToDestinationEdge ) {
              chunkToExtract = energyChunk;
              closestDistanceToDestinationEdge = distanceToDestinationEdge;
            }
          } );
        } );
      }
      else {

        // there is no or limited overlap, so use center points
        chunkToExtract = this.extractEnergyChunkClosestToPoint( destinationBounds.getCenter() );
      }

      // fail safe - if nothing found, get the first chunk
      if ( chunkToExtract === null ) {
        console.warn( 'No energy chunk found by extraction algorithm, trying first available..' );
        const length = this.slices.length;
        for ( let i = 0; i < length; i++ ) {
          if ( this.slices[ i ].energyChunkList.length > 0 ) {
            chunkToExtract = this.slices[ i ].energyChunkList.get( 0 );
            break;
          }
        }
        if ( chunkToExtract === null ) {
          console.warn( 'No chunks available for extraction.' );
        }
      }
      this.removeEnergyChunk( chunkToExtract );
      return chunkToExtract;
    }

    /**
     * Initialization method that add the "slices" where the energy chunks reside. Should be called only once at
     * initialization.
     * @protected
     */
    addEnergyChunkSlices() {
      assert && assert( this.slices.length === 0 ); // make sure this method isn't being misused

      const sliceBounds = Bounds2.rect( this.rect.x, this.rect.y.this.rect.width, this.rect.height );

      // defaults to a single slice matching the outline rectangle, override for more sophisticated behavior
      this.slices.push( new EnergyChunkContainerSlice( sliceBounds, 0, this.positionProperty.value ) );
    }

    /**
     *  add initial energy chunks to this model element
     *  @protected
     */
    addInitialEnergyChunks() {

      // clear out the current energy chunks
      this.slices.forEach( slice => {
        slice.energyChunkList.clear();
      } );

      // calculate how many energy chunks should be present based on the amount of energy in this container
      const targetNumberOfEnergyChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );
      const smallOffset = 0.00001; // used so that the ECs don't start on top of each other

      // start with the middle slice and cycle through in order, added chunks evenly to each
      let slideIndex = Math.floor( this.slices.length / 2 ) - 1;
      let numberOfEnergyChunksAdded = 0;
      while ( numberOfEnergyChunksAdded < targetNumberOfEnergyChunks ) {
        const slice = this.slices[ slideIndex ];
        const numberOfEnergyChunksInSlice = slice.getNumberOfEnergyChunks();
        const center = slice.bounds.center.plusXY(
          smallOffset * numberOfEnergyChunksAdded, smallOffset * numberOfEnergyChunksInSlice
        );
        slice.addEnergyChunk(
          new EnergyChunk( EnergyType.THERMAL, center, Vector2.ZERO, this.energyChunksVisibleProperty )
        );
        numberOfEnergyChunksAdded++;
        slideIndex = ( slideIndex + 1 ) % this.slices.length;
      }

      // clear the distribution timer and do a more thorough distribution below
      this.clearECDistributionCountdown();

      // distribute the initial energy chunks within the container using the repulsive algorithm
      for ( let i = 0; i < EFACConstants.MAX_NUMBER_OF_INITIALIZATION_DISTRIBUTION_CYCLES; i++ ) {
        const distributed = energyChunkDistributor.updatePositions( this.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL );
        if ( !distributed ) {
          break;
        }
      }
    }

    /**
     * get the number of energy chunks that are actually in the element, excluding any that are on the way
     * @returns {number}
     * @private
     */
    getNumberOfEnergyChunksInElement() {
      let numberOfChunks = 0;
      this.slices.forEach( slice => {
        numberOfChunks += slice.getNumberOfEnergyChunks();
      } );
      return numberOfChunks;
    }

    /**
     * @returns {number}
     * @public
     */
    getNumberOfEnergyChunks() {
      return this.getNumberOfEnergyChunksInElement() + this.approachingEnergyChunks.length;
    }

    /**
     * @param {RectangularThermalMovableModelElement} otherEnergyContainer
     * @param {number} dt - time of contact, in seconds
     * @returns {number} - amount of energy exchanged, in joules
     * @public
     */
    exchangeEnergyWith( otherEnergyContainer, dt ) {

      let amountOfEnergyExchanged = 0; // direction is from this to the other
      const thermalContactLength = this
        .thermalContactArea
        .getThermalContactLength( otherEnergyContainer.thermalContactArea );

      if ( thermalContactLength > 0 ) {
        const deltaT = otherEnergyContainer.getTemperature() - this.getTemperature();

        // exchange energy between this and the other energy container
        if ( Math.abs( deltaT ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {

          const heatTransferConstant = HeatTransferConstants.getHeatTransferFactor( this.energyContainerCategory,
            otherEnergyContainer.energyContainerCategory );

          const numberOfFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );

          const leftoverTime = dt - ( numberOfFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
          for ( let i = 0; i < numberOfFullTimeStepExchanges + 1; i++ ) {
            const timeStep = i < numberOfFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;

            const thermalEnergyGained = ( otherEnergyContainer.getTemperature() - this.getTemperature() ) *
                                        thermalContactLength * heatTransferConstant * timeStep;
            otherEnergyContainer.changeEnergy( -thermalEnergyGained );
            this.changeEnergy( thermalEnergyGained );
            amountOfEnergyExchanged += -thermalEnergyGained;
          }
        }
      }
      return amountOfEnergyExchanged;
    }

    /**
     * Get the shape as is is projected into 3D in the view.  Ideally, this wouldn't even be in the model, because it
     * would be purely handled in the view, but it proved necessary.
     * @returns {Shape}
     * @public
     */
    getProjectedShape() {

      const currentPosition = this.positionProperty.get();

      // update the projected shape only if the position has changed since the last request
      if ( !this.latestProjectedShapePosition.equals( currentPosition ) ) {
        this.translationMatrix.setToTranslation( currentPosition.x, currentPosition.y );
        this.latestProjectedShape = this.untranslatedProjectedShape.transformed( this.translationMatrix );
        this.latestProjectedShapePosition = this.positionProperty.get();
      }
      return this.latestProjectedShape;
    }

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint() {
      const position = this.positionProperty.value;
      return new Vector2( position.x, position.y + this.height / 2 );
    }

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterTopPoint() {
      const position = this.positionProperty.value;
      return new Vector2( position.x, position.y + this.height );
    }

    /**
     * Get a number indicating the balance between the energy level and the number of energy chunks owned by this model
     * element.  Returns 0 if the number of energy chunks matches the energy level, a negative value if there is a
     * deficit, and a positive value if there is a surplus.
     * @returns {number}
     * @public
     */
    getEnergyChunkBalance() {
      return this.getNumberOfEnergyChunks() - EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );
    }

    /**
     * Reset the energy chunk distribution countdown timer, which will cause EC distribution to start and continue
     * until the countdown reaches zero or no more distribution is needed.
     * @protected
     */
    resetECDistributionCountdown() {
      this.energyChunkDistributionCountdownTimer = MAX_ENERGY_CHUNK_REDISTRIBUTION_TIME;
    }

    /**
     * clear the redistribution countdown timer, which will stop any further redistribution
     * @protected
     */
    clearECDistributionCountdown() {
      this.energyChunkDistributionCountdownTimer = 0;
    }
  }

  return energyFormsAndChanges.register( 'RectangularThermalMovableModelElement', RectangularThermalMovableModelElement );
} );
