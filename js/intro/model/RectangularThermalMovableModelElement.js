// Copyright 2014-2018, University of Colorado Boulder

/**
 * base type for a movable model element that contains thermal energy and that, at least in the model, has an overall
 * shape that can be represented as a rectangle
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkDistributor' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Shape = require( 'KITE/Shape' );
  var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/UserMovableModelElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {number} mass - in kg
   * @param {number} specificHeat - in J/kg-K
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function RectangularThermalMovableModelElement( initialPosition,
                                                  width,
                                                  height,
                                                  mass,
                                                  specificHeat,
                                                  energyChunksVisibleProperty ) {

    var self = this;
    UserMovableModelElement.call( this, initialPosition );

    // @public (read-only)
    this.mass = mass;
    this.width = width;
    this.height = height;
    this.specificHeat = specificHeat;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;

    // @public (read-only) {ObservableArray} - energy chunks that are approaching this model element
    this.approachingEnergyChunks = new ObservableArray();

    // @private - motion controllers for the energy chunks that are approaching this model element
    this.energyChunkWanderControllers = [];

    // when an approaching energy chunk is removed from the list, make sure its wander controller goes away too
    this.approachingEnergyChunks.addItemRemovedListener( function( removedEC ) {
      self.energyChunkWanderControllers = self.energyChunkWanderControllers.filter( function( wanderController ) {
        return wanderController.energyChunk !== removedEC;
      } );
    } );

    // @private {number} - minimum amount of energy that this is allowed to have
    this.minEnergy = EFACConstants.WATER_FREEZING_POINT_TEMPERATURE * mass * specificHeat;

    // @public (read-only) {EnergyChunkContainerSlice[]} 2D "slices" of the container, used for 3D layering of energy
    // chunks in the view
    this.slices = [];

    // add the slices
    this.addEnergyChunkSlices();
    this.nextSliceIndex = this.slices.length / 2; // @private

    // add the initial energy chunks
    this.addInitialEnergyChunks();
  }

  energyFormsAndChanges.register( 'RectangularThermalMovableModelElement', RectangularThermalMovableModelElement );

  return inherit( UserMovableModelElement, RectangularThermalMovableModelElement, {

    /**
     * get the rectangle that defines this elements position and shape in model space
     * @returns {Bounds2}
     * @public
     */
    getBounds: function() {
      assert && assert( false, 'this function should not be called in base class' );
    },

    /**
     * change the energy of this element by the desired value
     * @param {number} deltaEnergy
     * @public
     */
    changeEnergy: function( deltaEnergy ) {
      assert && assert( !_.isNaN( deltaEnergy ), 'invalided deltaEnergy, value = ' + deltaEnergy );
      this.energy += deltaEnergy;
    },

    /**
     * get the current energy content
     * @returns {number}
     * @public
     */
    getEnergy: function() {
      return this.energy;
    },

    /**
     * get the amount of energy above the minimum allowed
     * @returns {number}
     * @public
     */
    getEnergyAboveMinimum: function() {
      return this.energy - this.minEnergy;
    },

    /**
     *  get the temperature of this element as a function of energy, mass, and specific heat
     * @returns {number}
     * @public
     */
    getTemperature: function() {
      assert && assert( this.energy >= 0, 'Invalid energy: ' + this.energy );
      assert && assert( this.mass > 0, 'Invalid mass: ' + this.mass );
      assert && assert( this.specificHeat > 0, 'Invalid specific heat: ' + this.specificHeat );
      return this.energy / ( this.mass * this.specificHeat );
    },
    get temperature() {
      return this.getTemperature();
    },

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      UserMovableModelElement.prototype.reset.call( this );
      this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;
      this.addInitialEnergyChunks();
      this.approachingEnergyChunks.reset();
    },

    /**
     * step function to move this model element forward in time
     * @param {number} dt - time step in seconds
     * @public
     */
    step: function( dt ) {

      // distribute the energy chunks contained within this model element
      EnergyChunkDistributor.updatePositions( this.slices, dt );

      // animate the energy chunks that are outside this model element
      this.animateNonContainedEnergyChunks( dt );
    },

    /**
     * This function is called to animate energy chunks that are drifting towards the container, e.g. from the burner.
     * It is NOT called during "evaporation", even though the chunks are "non-contained".
     * @param {number} dt - time step, in seconds
     * @private
     */
    animateNonContainedEnergyChunks: function( dt ) {

      var self = this;

      // work from a copy of the list of wander controllers in case the list ends up changing
      var ecWanderControllers = this.energyChunkWanderControllers.slice();

      ecWanderControllers.forEach( function( ecWanderController ) {
        ecWanderController.updatePosition( dt );
        if ( self.getSliceBounds().containsPoint( ecWanderController.energyChunk.positionProperty.value ) ) {
          self.moveEnergyChunkToSlices( ecWanderController.energyChunk );
        }
      } );
    },

    /**
     * Add an energy chunk to this model element.  The energy chunk can be outside of the element's rectangular bounds,
     * in which case it is added to the list of chunks that are moving towards the element, or it can be positioned
     * already inside, in which case it is immediately added to one of the energy chunk "slices".
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunk: function( energyChunk ) {
      var bounds = this.getSliceBounds();

      // energy chunk is positioned within container bounds, so add it directly to a slice
      if ( bounds.containsPoint( energyChunk.positionProperty.value ) ) {
        this.addEnergyChunkToNextSlice( energyChunk );
      }

      // chunk is out of the bounds of this element, so make it wander towards it
      else {
        energyChunk.zPosition = 0;
        this.approachingEnergyChunks.push( energyChunk );
        this.energyChunkWanderControllers.push(
          new EnergyChunkWanderController( energyChunk, this.positionProperty )
        );
      }
    },

    /**
     * add an energy chunk to the next available slice, override for more elaborate behavior
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunkToNextSlice: function( energyChunk ) {
      this.slices[ this.nextSliceIndex ].addEnergyChunk( energyChunk );
      this.nextSliceIndex = ( this.nextSliceIndex + 1 ) % this.slices.length;
    },

    /**
     * get the composite bounds of all the slices that are used to hold the energy chunks
     * @returns {Bounds2}
     * @public
     */
    getSliceBounds: function() {
      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;
      this.slices.forEach( function( slice ) {
        var sliceBounds = slice.bounds;
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
    },

    /**
     * Transfer an EnergyChunk from the approachingEnergyChunks list to a slice in this model element. Find the
     * corresponding wander controller and remove it. A new wander controller is then associated with the transferred
     * chunk via a call to addEnergyChunk.
     * @param {EnergyChunk} energyChunk
     * @protected
     */
    moveEnergyChunkToSlices: function( energyChunk ) {
      this.approachingEnergyChunks.remove( energyChunk );
      this.addEnergyChunkToNextSlice( energyChunk );
    },

    /**
     * Remove an energy chunk from whatever energy chunk list it belongs to. If the chunk does not belong to a specific
     * energy chunk list, return false.
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
     * @public
     */
    removeEnergyChunk: function( energyChunk ) {
      this.slices.forEach( function( slice ) {
        if ( slice.energyChunkList.indexOf( energyChunk ) >= 0 ) {
          slice.energyChunkList.remove( energyChunk );
          return true;
        }
      } );
      return false;
    },

    /**
     * Locate, remove, and return the energy chunk that is closed to the provided point.  Compensate distances for the
     * z-offset so that z-positioning doesn't skew the results, since the provided point is 2D.
     * @param {Vector2} point - comparison point
     * @returns {EnergyChunk||null} closestEnergyChunk, null if there are none available
     * @public
     */
    extractEnergyChunkClosestToPoint: function( point ) {

      var closestEnergyChunk = null;
      var closestCompensatedDistance = Number.POSITIVE_INFINITY;

      // identify the closest energy chunk
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.forEach( function( energyChunk ) {

          // compensate for the Z offset, otherwise front chunk will almost always be chosen
          var compensatedEnergyChunkPosition = energyChunk.positionProperty.value.minusXY(
            0,
            EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER * energyChunk.zPositionProperty.value
          );
          var compensatedDistance = compensatedEnergyChunkPosition.distance( point );
          if ( compensatedDistance < closestCompensatedDistance ) {
            closestEnergyChunk = energyChunk;
            closestCompensatedDistance = compensatedDistance;
          }
        } );
      } );

      this.removeEnergyChunk( closestEnergyChunk );
      return closestEnergyChunk;
    },

    /**
     * extract an energy chunk that is a good choice for being transferred to the provided rectangular bounds
     * @param {Bounds2} destinationBounds
     * @returns {EnergyChunk|null} - a suitable energy chunk or null if no energy chunks are available
     * @public
     */
    extractEnergyChunkClosestToBounds: function( destinationBounds ) {

      var chunkToExtract = null;
      var myBounds = this.getSliceBounds();
      if ( destinationBounds.containsBounds( this.thermalContactArea ) ) {

        // this element's shape is contained by the destination - pick a chunk near our right or left edge
        var closestDistanceToVerticalEdge = Number.POSITIVE_INFINITY;
        this.slices.forEach( function( slice ) {
          slice.energyChunkList.forEach( function( energyChunk ) {
            var distanceToVerticalEdge = Math.min(
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
        var closestDistanceToDestinationEdge = Number.POSITIVE_INFINITY;
        this.slices.forEach( function( slice ) {
          slice.energyChunkList.forEach( function( energyChunk ) {
            var distanceToDestinationEdge =
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
        var length = this.slices.length;
        for ( var i = 0; i < length; i++ ) {
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
    },

    /**
     * Initialization method that add the "slices" where the energy chunks reside. Should be called only once at
     * initialization.
     * @private
     */
    addEnergyChunkSlices: function() {
      assert && assert( this.slices.length === 0 ); // make sure this method isn't being misused

      var sliceBounds = Bounds2.rect( this.rect.x, this.rect.y.this.rect.width, this.rect.height );

      // defaults to a single slice matching the outline rectangle, override for more sophisticated behavior
      this.slices.push( new EnergyChunkContainerSlice( sliceBounds, 0, this.position ) );
    },

    /**
     *  add initial energy chunks to this model element
     *  @private
     */
    addInitialEnergyChunks: function() {
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.clear();
      } );

      var targetNumChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );

      var energyChunkBounds = this.thermalContactArea;
      while ( this.getNumEnergyChunks() < targetNumChunks ) {

        // add a chunk at a random location in the block
        var location = EnergyChunkDistributor.generateRandomLocation( energyChunkBounds );
        var chunk = new EnergyChunk( EnergyType.THERMAL, location, Vector2.ZERO, this.energyChunksVisibleProperty );
        this.addEnergyChunk( chunk );
      }

      // distribute the energy chunks within the container
      for ( var i = 0; i < 500; i++ ) {
        var distributed = EnergyChunkDistributor.updatePositions( this.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL );
        if ( !distributed ) {
          break;
        }
      }
    },

    /**
     * @returns {number}
     * @public
     */
    getNumEnergyChunks: function() {

      var numChunks = 0;
      this.slices.forEach( function( slice ) {
        numChunks += slice.getNumEnergyChunks();
      } );
      return numChunks + this.approachingEnergyChunks.length;
    },

    /**
     * @param {RectangularThermalMovableModelElement} otherEnergyContainer
     * @param {number} dt - time of contact, in seconds
     * @public
     */
    exchangeEnergyWith: function( otherEnergyContainer, dt ) {

      var thermalContactLength = this
        .thermalContactArea
        .getThermalContactLength( otherEnergyContainer.thermalContactArea );

      if ( thermalContactLength > 0 ) {
        var deltaT = otherEnergyContainer.getTemperature() - this.getTemperature();

        // exchange energy between this and the other energy container
        if ( Math.abs( deltaT ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {

          var heatTransferConstant = HeatTransferConstants.getHeatTransferFactor( this.energyContainerCategory,
            otherEnergyContainer.energyContainerCategory );

          var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );

          var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
          var i;
          for ( i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
            var timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;

            var thermalEnergyGained = ( otherEnergyContainer.getTemperature() - this.getTemperature() ) *
                                      thermalContactLength * heatTransferConstant * timeStep;
            otherEnergyContainer.changeEnergy( -thermalEnergyGained );
            this.changeEnergy( thermalEnergyGained );
          }
        }
      }
    },

    /**
     * Get the shape as is is projected into 3D in the view.  Ideally, this wouldn't even be in the model, because it
     * would be purely handled in the view, but it proved necessary.
     * @returns {Shape}
     * @public
     */
    getProjectedShape: function() {

      // this projects a rectangle, override for other behavior
      var forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      var backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET( -EFACConstants.BLOCK_SURFACE_WIDTH / 2 );

      var shape = new Shape();

      var b = this.getBounds();
      shape.moveToPoint( new Vector2( b.minX, b.minY ).plus( forwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( b.maxX, b.minY ).plus( forwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( b.maxX, b.minY ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( b.maxX, b.maxY ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( b.minX, b.maxY ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( b.minX, b.maxY ).plus( forwardPerspectiveOffset ) )
        .close();
      return shape;
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint: function() {
      var position = this.positionProperty.value;
      return new Vector2( position.x, position.y + this.height / 2 );
    },

    /**
     * Get a number indicating the balance between the energy level and the number of energy chunks owned by this model
     * element.  Returns 0 if the number of energy chunks matches the energy level, a negative value if there is a
     * deficit, and a positive value if there is a surplus.
     * @returns {number}
     * @public
     */
    getEnergyChunkBalance: function() {
      return this.getNumEnergyChunks() - EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );
    }
  } );
} );
