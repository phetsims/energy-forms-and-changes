// Copyright 2014-2015, University of Colorado Boulder

/**
 * A movable model element that contains thermal energy and that, at least in
 * the model, has an overall shape that can be represented as a rectangle.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkDistributor' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Shape = require( 'KITE/Shape' );
  var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/UserMovableModelElement' );
  var Vector2 = require( 'DOT/Vector2' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );

  /**
   * Constructor for a RectangularThermalMovableModelElement.  This implements
   * the behavior of a superclass for many objects in this sim such as Block,
   * Beaker, Brick, and IronBlock.
   *
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {number} mass - In kg
   * @param {number} specificHeat - In J/kg-K
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function RectangularThermalMovableModelElement(
    initialPosition,
    width,
    height,
    mass,
    specificHeat,
    energyChunksVisibleProperty ) {
    UserMovableModelElement.call( this, initialPosition );
    this.mass = mass;
    this.width = width;
    this.height = height;
    this.specificHeat = specificHeat;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;

    // Energy chunks that are approaching this model element.
    this.energyChunkWanderControllers = [];
    this.approachingEnergyChunks = new ObservableArray();

    // 2D "slices" of the container, used for 3D layering of energy chunks.
    this.slices = [];

    // Add the slices, a.k.a. layers, where the energy chunks will live.
    this.addEnergyChunkSlices();
    this.nextSliceIndex = this.slices.length / 2;

    // Add the initial energy chunks.
    this.addInitialEnergyChunks();
  }

  energyFormsAndChanges.register( 'RectangularThermalMovableModelElement', RectangularThermalMovableModelElement );

  return inherit( UserMovableModelElement, RectangularThermalMovableModelElement, {

    /**
     * Get the rectangle that defines this elements position and shape in
     * model space.
     */
    getBounds: function() {
      console.error( 'getBounds must be implemented in descendant classes.' );
    },

    /**
     * Change the energy of this element by the desired value.
     *
     * @param {number} deltaEnergy
     */
    changeEnergy: function( deltaEnergy ) {
      assert && assert( !_.isNaN( deltaEnergy ), 'deltaEnergy is ' + deltaEnergy );
      this.energy += deltaEnergy;
    },

    getEnergy: function() {
      return this.energy;
    },

    /**
     *  Get the temperature of this element as a function of energy, mass, and specific heat.
     *
     * @returns {number}
     */
    getTemperature: function() {
      assert && assert( this.energy >= 0, 'Invalid energy: ' + this.energy );
      assert && assert( this.mass > 0, 'Invalid mass: ' + this.mass );
      assert && assert( this.specificHeat > 0, 'Invalid specific heat: ' + this.specificHeat );
      return this.energy / ( this.mass * this.specificHeat );
    },

    reset: function() {
      UserMovableModelElement.prototype.reset.call( this );
      this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;
      this.addInitialEnergyChunks();
      this.energyChunksVisibleProperty.reset();
      this.approachingEnergyChunks.reset();
    },

    step: function( dt ) {

      // Distribute the energy chunks contained within this model element.
      EnergyChunkDistributor.updatePositions( this.slices, dt );

      // Animate the energy chunks that are outside this model element.
      this.animateNonContainedEnergyChunks( dt );
    },

    /**
     * This function is called when a chunk is drifting towards the container, e.g. from the burner.
     * It is not called during "evaporation", even though the chunks are "non-contained".
     * @param {number} dt
     */
    animateNonContainedEnergyChunks: function( dt ) {
      var self = this;
      var controllers = this.energyChunkWanderControllers.slice( 0 );
      controllers.forEach( function( controller ) {
        controller.updatePosition( dt );
        if ( self.getSliceBounds().containsPoint( controller.energyChunk.positionProperty.value ) ) {
          self.moveEnergyChunkToSlices( controller.energyChunk );
        }
      } );
    },

    /**
     * Add an energy chunk to this model element.  The energy chunk can be outside
     * of the element's rectangular bounds, in which case it is added to the list
     * of chunks that are moving towards the element, or it can be positioned
     * already inside, in which case it is immediately added to one of the energy
     * chunk "slices".
     *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      var bounds = this.getSliceBounds();

      // Energy chunk is positioned within container bounds, so add it directly to a slice.
      if ( bounds.containsPoint( energyChunk.positionProperty.value ) ) {
        this.addEnergyChunkToNextSlice( energyChunk );
      }

      // Chunk is out of the bounds of this element, so make it wander towards it.
      else {
        // console.log( 'RTMME: adding controller' );
        energyChunk.zPosition = 0;
        this.approachingEnergyChunks.push( energyChunk );
        this.energyChunkWanderControllers.push(
          new EnergyChunkWanderController( energyChunk, this.positionProperty, null ) );
      }
    },

    /**
     * Add an energy chunk to the next available slice.  Override for more elaborate behavior.
     *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunkToNextSlice: function( energyChunk ) {
      this.slices[ this.nextSliceIndex ].addEnergyChunk( energyChunk );
      this.nextSliceIndex = ( this.nextSliceIndex + 1 ) % this.slices.length;
    },

    /**
     * Returns the bounds of all the slices.
     *
     * @returns {Bounds2}
     */
    getSliceBounds: function() {
      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;
      this.slices.forEach( function( slice ) {
        var sliceBounds = slice.shape.bounds;
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
     *  Transfer an EnergyChunk from the approachingEnergyChunks list to a slice
     *  in this model element. Find the corresponding wander controller and
     *  remove it. A new wander controller is then associated with the transferred
     *  chunk via a call to addEnergyChunk.
     *
     * @param {EnergyChunk} energyChunk
     */
    moveEnergyChunkToSlices: function( energyChunk ) {
      var self = this;
      this.approachingEnergyChunks.remove( energyChunk );
      var energyChunkWanderControllersCopy = this.energyChunkWanderControllers.slice( 0 );
      energyChunkWanderControllersCopy.forEach( function( energyChunkWanderController ) {
        if ( energyChunkWanderController.energyChunk === energyChunk ) {
          var index = self.energyChunkWanderControllers.indexOf( energyChunkWanderController );
          if ( index > -1 ) {
            self.energyChunkWanderControllers.splice( index, 1 );
          }
        }
      } );
      this.addEnergyChunkToNextSlice( energyChunk );
    },

    /**
     * Remove an energy chunk from whatever energy chunk list it belongs to.
     * If the chunk does not belong to a specific energy chunk list, return false.
     *
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
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
     * Extract the closest energy chunk to the provided point.  Compensate
     * distances for the z-offset so that z-positioning doesn't skew the results,
     * since the provided point is only 2D.
     *
     * @param {Vector2} point - Comparison point.
     * @return {EnergyChunk||null} closestEnergyChunk, null if there are none available.
     */
    extractClosestEnergyChunkToPoint: function( point ) {

      var closestEnergyChunk = null;
      var closestCompensatedDistance = Number.POSITIVE_INFINITY;

      // Identify the closest energy chunk.
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.forEach( function( energyChunk ) {
          // Compensate for the Z offset.  Otherwise front chunk will almost always be chosen.
          var compensatedEnergyChunkPosition =
            energyChunk.positionProperty.value.minusXY( 0, EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER * energyChunk.zPosition );
          var compensatedDistance = compensatedEnergyChunkPosition.distance( point );
          if ( compensatedDistance < closestCompensatedDistance ) {
            closestEnergyChunk = energyChunk;
          }
        } );
      } );

      // console.log( 'RTMME: removing chunk (ECECTP)' );
      this.removeEnergyChunk( closestEnergyChunk );
      return closestEnergyChunk;
    },

    /**
     * Extract an energy chunk that is a good choice for being transferred to
     * the provided shape.  Generally, this means that it is close to the shape.
     * This routine is not hugely general - it makes some assumption that make it
     * work for blocks in beakers.  If support for other shapes is needed, it
     * will need some work.
     *
     * @param destinationShape
     * @returns {EnergyChunk||null} return null if none are available.
     */
    extractClosestEnergyChunk: function( destinationShape ) {

      var chunkToExtract = null;
      var myBounds = this.getSliceBounds();
      if ( destinationShape.intersectsBounds( this.getThermalContactArea() ) ) {
        // Our shape is contained by the destination.  Pick a chunk near
        // our right or left edge.

        var closestDistanceToVerticalEdge = Number.POSITIVE_INFINITY;
        this.slices.forEach( function( slice ) {
          slice.energyChunkList.forEach( function( energyChunk ) {
            var distanceToVerticalEdge = Math.min( Math.abs( myBounds.minX - energyChunk.positionProperty.value.x ),
              Math.abs( myBounds.x - energyChunk.positionProperty.value.x ) );

            if ( distanceToVerticalEdge < closestDistanceToVerticalEdge ) {
              chunkToExtract = energyChunk;
              closestDistanceToVerticalEdge = distanceToVerticalEdge;
            }
          } );
        } );
      }
      else if ( this.getThermalContactArea().containsBounds( destinationShape.bounds ) ) {
        // Our shape encloses the destination shape.  Choose a chunk that
        // is close but doesn't overlap with the destination shape.

        var closestDistanceToDestinationEdge = Number.POSITIVE_INFINITY;
        var destinationBounds = destinationShape.bounds;
        this.slices.forEach( function( slice ) {
          slice.energyChunkList.forEach( function( energyChunk ) {
            var distanceToDestinationEdge =
              Math.min( Math.abs( destinationBounds.minX - energyChunk.positionProperty.value.x ),
                Math.abs( destinationBounds.maxX - energyChunk.positionProperty.value.x ) );
            if ( !destinationShape.containsPoint( energyChunk.positionProperty.value ) &&
              distanceToDestinationEdge < closestDistanceToDestinationEdge ) {
              chunkToExtract = energyChunk;
              closestDistanceToDestinationEdge = distanceToDestinationEdge;
            }
          } );
        } );
      }
      else {
        // There is no or limited overlap, so use center points.
        chunkToExtract = this.extractClosestEnergyChunkToPoint(
          new Vector2( destinationShape.bounds.centerX, destinationShape.bounds.centerY ) );
      }

      // Fail safe - If nothing found, get the first chunk.
      if ( chunkToExtract === null ) {
        console.log( ' - Warning: No energy chunk found by extraction algorithm, trying first available..' );
        var length = this.slices.length;
        for ( var i = 0; i < length; i++ ) {
          if ( this.slices[ i ].energyChunkList.length > 0 ) {
            chunkToExtract = this.slices[ i ].energyChunkList.get( 0 );
            break;
          }
        }
        if ( chunkToExtract === null ) {
          console.log( ' - Warning: No chunks available for extraction.' );
        }
      }
      // console.log( 'RTMME: removing chunk (ECEC)' );
      this.removeEnergyChunk( chunkToExtract );

      return chunkToExtract;
    },

    /**
     * Initialization method that add the "slices" where the energy chunks reside.
     * Should be called only once at initialization.
     */
    addEnergyChunkSlices: function() {
      assert && assert( this.slices.length === 0 ); // Make sure this method isn't being misused.

      var rect = this.getRect();
      var rectShape = Shape.rect( rect.x, rect.y, rect.width, rect.height );

      // Defaults to a single slice matching the outline rectangle, override
      // for more sophisticated behavior.
      this.slices.push( new EnergyChunkContainerSlice( rectShape, 0, this.position ) );
    },

    /**
     *  Add initial energy chunks to this model element.
     */
    addInitialEnergyChunks: function() {
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.clear();
      } );

      var targetNumChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );

      var energyChunkBounds = this.getThermalContactArea();
      while ( this.getNumEnergyChunks() < targetNumChunks ) {
        // Add a chunk at a random location in the block.
        var location = EnergyChunkDistributor.generateRandomLocation( energyChunkBounds );
        var chunk = new EnergyChunk( EnergyType.THERMAL, location, Vector2.ZERO, this.energyChunksVisibleProperty );
        // console.log( 'RTMME: adding chunk at ', location );
        this.addEnergyChunk( chunk );
      }

      // Distribute the energy chunks within the container.
      var i;
      for ( i = 0; i < 1000; i++ ) {
        if ( !EnergyChunkDistributor.updatePositions( this.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL ) ) {
          break;
        }
      }
    },

    /**
     *
     * @returns {number}
     */
    getNumEnergyChunks: function() {

      var numChunks = 0;
      this.slices.forEach( function( slice ) {
        numChunks += slice.getNumEnergyChunks();
      } );
      return numChunks + this.approachingEnergyChunks.length;
    },

    exchangeEnergyWith: function( otherEnergyContainer, dt ) {

      var thermalContactLength = this
        .getThermalContactArea()
        .getThermalContactLength( otherEnergyContainer.getThermalContactArea() );

      if ( thermalContactLength > 0 ) {
        var deltaT = otherEnergyContainer.getTemperature() - this.getTemperature();

        // Exchange energy between this and the other energy container.
        if ( Math.abs( deltaT ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {

          var heatTransferConstant = HeatTransferConstants.getHeatTransferFactor( this.getEnergyContainerCategory(),
            otherEnergyContainer.getEnergyContainerCategory() );

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
     * Get the shape as is is projected into 3D in the view.  Ideally, this
     * wouldn't even be in the model, because it would be purely handled in the
     * view, but it proved necessary.
     *
     * @returns {Shape}
     */
    getProjectedShape: function() {
      // This projects a rectangle, override for other behavior.
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
     *
     * @returns {Vector2}
     */
    getCenterPoint: function() {
      return new Vector2( this.position.x, this.position.y + this.height / 2 );
    },


    /**
     * Get a number indicating the balance between the energy level and the
     * number of energy chunks owned by this model element.  Returns 0 if the
     * number of energy chunks matches the energy level, a negative value if
     * there is a deficity, and a positive value if there is a surplus.
     *
     * @returns {number}
     */
    getEnergyChunkBalance: function() {
      return this.getNumEnergyChunks() - EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );
    }
  } );
} );
