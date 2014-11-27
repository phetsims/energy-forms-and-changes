// Copyright 2002-2014, University of Colorado

/**
 * A movable model element that contains thermal energy and that, at least in
 * the model, has an overall shape that can be represented as a rectangle.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var Color = require( 'SCENERY/util/Color' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkDistributor' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkWanderController' );

  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyContainerCategory' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyType' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  // var Path = require('SCENERY/nodes/Path');
  var PropertySet = require( 'AXON/PropertySet' );
  var Rectangle = require( 'DOT/Rectangle' );
  // var TemperatureAndColor = require( 'ENERGY_FORMS_AND_CHANGES/common/TemperatureAndColor' );
  var Shape = require( 'KITE/Shape' );
  var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/UserModelMovableElement' );
  var Vector2 = require( 'DOT/Vector2' );


  // this.energy = 0; // In Joules.


  /*
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {number} mass // In kg
   * @param {number} specificHeat // In J/kg-K
   * @param {Property} energyChunksVisibleProperty
   * @constructor
   */
  function RectangularThermalMovableModelElement( initialPosition, width, height, mass, specificHeat, energyChunksVisibleProperty ) {
    UserMovableModelElement.call( this, initialPosition );
    this.mass = mass;
    this.width = width;
    this.height = height;
    this.specificHeat = specificHeat;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;


    this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;

    // Energy chunks that are approaching this model element.
    this.energyChunkWanderControllers = [];
    this.approachingEnergyChunks = new ObservableArray(); //

    // 2D "slices" of the container, used for 3D layering of energy chunks.
    this.slices = [];


    // Add the slices, a.k.a. layers, where the energy chunks will live.
    this.addEnergyChunkSlices();
    this.nextSliceIndex = this.slices.length / 2;

    // Add the initial energy chunks.
    this.addInitialEnergyChunks();
  }


  return inherit( UserMovableModelElement, RectangularThermalMovableModelElement, {
    /**
     * Get the rectangle that defines this elements position and shape in
     * model space.
     */

//    getRect: function() {
//      assert & assert(true,'getRect() must be define in a subclass');
//      return null;
//    },

    changeEnergy: function( deltaEnergy ) {
      this.energy += deltaEnergy;
    },

    getEnergy: function() {
      return this.energy;
    },

    getTemperature: function() {
      return this.energy / ( this.mass * this.specificHeat );
    },

    reset: function() {
      UserMovableModelElement.prototype.reset.call( this );
      this.energy = this.mass * this.specificHeat * EFACConstants.ROOM_TEMPERATURE;
      this.addInitialEnergyChunks();
    },

    step: function( dt ) {

      // Distribute the energy chunks contained within this model element.
      EnergyChunkDistributor.updatePositions.call( this, this.slices, dt );

      // Animate the energy chunks that are outside this model element.
      this.animateNonContainedEnergyChunks( dt );
    },

    animateNonContainedEnergyChunks: function( dt ) {
      var energyChunkWanderControllersCopy = this.energyChunkWanderControllers.slice( 0 );
      energyChunkWanderControllersCopy.forEach( function( energyChunkWanderController ) {
        energyChunkWanderController.updatePosition( dt );
        if ( this.getSliceBounds().containsPoint( energyChunkWanderController.energyChunk.position ) ) {
          this.moveEnergyChunkToSlices( energyChunkWanderController.energyChunk );
        }
      } );
    },

    /**
     * Add an energy chunk to this model element.  The energy chunk can be
     * outside of the element's rectangular bounds, in which case it is added
     * to the list of chunks that are moving towards the element, or it can be
     * positioned already inside, in which case it is immediately added to one
     * of the energy chunk "slices".
     *
     * @param energyChunk energy chunk to  add.
     */
    addEnergyChunk: function( energyChunk ) {
      if ( this.getSliceBounds().containsPoint( energyChunk.position ) ) {
        // Energy chunk is positioned within container bounds, so add it
        // directly to a slice.
        this.addEnergyChunkToNextSlice( energyChunk );
      }
      else {
        // Chunk is out of the bounds of this element, so make it wander
        // towards it.
        energyChunk.zPosition = 0;
        this.approachingEnergyChunks.push( energyChunk );
        this.energyChunkWanderControllers.push( new EnergyChunkWanderController( energyChunk, this.position ) );
      }
    },

    // Add an energy chunk to the next available slice.  Override for more elaborate behavior.

    addEnergyChunkToNextSlice: function( energyChunk ) {
      this.slices.get( this.nextSliceIndex ).addEnergyChunk( energyChunk );
      this.nextSliceIndex = ( this.nextSliceIndex + 1 ) % this.slices.length;
    },

    getSliceBounds: function() {
      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;
      this.slices.forEach( function( slice ) {
        var sliceBounds = slice.getShape().getBounds2D();
        if ( sliceBounds.getMinX() < minX ) {
          minX = sliceBounds.getMinX();
        }
        if ( sliceBounds.getMaxX() > maxX ) {
          maxX = sliceBounds.getMaxX();
        }
        if ( sliceBounds.getMinY() < minY ) {
          minY = sliceBounds.getMinY();
        }
        if ( sliceBounds.getMaxY() > maxY ) {
          maxY = sliceBounds.getMaxY();
        }
      } );
      return new Rectangle( minX, minY, maxX - minX, maxY - minY );
    },

    moveEnergyChunkToSlices: function( energyChunk ) {
      this.approachingEnergyChunks.remove( energyChunk );
      var energyChunkWanderControllersCopy = this.energyChunkWanderControllers.slice( 0 );
      this.energyChunkWanderControllersCopy.forEach( function( energyChunkWanderController ) {
        if ( energyChunkWanderController.energyChunk === energyChunk ) {
          this.energyChunkWanderControllers.remove( energyChunkWanderController );
        }
      } );
      this.addEnergyChunkToNextSlice( energyChunk );
    },

    // Boolean Operator
    removeEnergyChunk: function( energyChunk ) {
      this.slices.forEach( function( slice ) {
        if ( slice.energyChunkList.remove( energyChunk ) ) {
          return true;
        }
      } );
      return false;
    },

    /*
     * Extract the closest energy chunk to the provided point.  Compensate
     * distances for the z-offset so that z-positioning doesn't skew the
     * results, since the provided point is only 2D.
     *
     * @param point Comparison point.
     * @return Energy chunk, null if there are none available.
     */

    //TODO: this method was renamed
    extractClosestEnergyChunkForPoint: function( point ) {

      var closestEnergyChunk = null;
      var closestCompensatedDistance = Number.POSITIVE_INFINITY;

      // Identify the closest energy chunk.
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.forEach( function( energyChunk ) {

          // Compensate for the Z offset.  Otherwise front chunk will
          // almost always be chosen.

          var compensatedEnergyChunkPosition = energyChunk.position.minus( 0, EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER * energyChunk.zPosition );

          var compensatedDistance = compensatedEnergyChunkPosition.distance( point );
          if ( compensatedDistance < closestCompensatedDistance ) {
            closestEnergyChunk = energyChunk;
          }
        } );
      } );

      this.removeEnergyChunk( closestEnergyChunk );
      return closestEnergyChunk;
    },

    /*
     * Extract an energy chunk that is a good choice for being transferred to
     * the provided shape.  Generally, this means that it is close to the
     * shape.  This routine is not hugely general - it makes some assumptions
     * that make it work for blocks in beakers.  If support for other shapes is
     * needed, it will need some work.
     *
     * @param destinationShape
     * @return Energy chunk, null if none are available.
     */


    extractClosestEnergyChunk: function( destinationShape ) {

      var chunkToExtract = null;
      var myBounds = this.getSliceBounds();
      if ( destinationShape.contains( getThermalContactArea().getBounds() ) ) {
        // Our shape is contained by the destination.  Pick a chunk near
        // our right or left edge.

        var closestDistanceToVerticalEdge = Number.POSITIVE_INFINITY;
        this.slices.forEach( function( slice ) {
          slice.energyChunkList.forEach( function( energyChunk ) {
            var distanceToVerticalEdge = Math.min( Math.abs( myBounds.getMinX() - energyChunk.position.x ),
              Math.abs( myBounds.getMaxX() - energyChunk.position.x ) );

            if ( distanceToVerticalEdge < closestDistanceToVerticalEdge ) {
              chunkToExtract = energyChunk;
              closestDistanceToVerticalEdge = distanceToVerticalEdge;
            }
          } );
        } );
      }
      else if ( getThermalContactArea().getBounds().containsBound( destinationShape.getBounds2D() ) ) {
        // Our shape encloses the destination shape.  Choose a chunk that
        // is close but doesn't overlap with the destination shape.

        var closestDistanceToDestinationEdge = Number.POSITIVE_INFINITY;
        var destinationBounds = destinationShape.getBounds2D();
        this.slices.forEach( function( slice ) {
          slice.energyChunkList.forEach( function( energyChunk ) {
            var distanceToDestinationEdge = Math.min( Math.abs( destinationBounds.getMinX() - energyChunk.position.x ), Math.abs( destinationBounds.getMaxX() - energyChunk.position.x ) );
            if ( !destinationShape.contains( energyChunk.position ) && distanceToDestinationEdge < closestDistanceToDestinationEdge ) {
              chunkToExtract = energyChunk;
              closestDistanceToDestinationEdge = distanceToDestinationEdge;
            }
          } );
        } );
      }
      else {
        // There is no or limited overlap, so use center points.
        chunkToExtract = this.extractClosestEnergyChunkForPoint( new Vector2( destinationShape.getBounds2D().getCenterX(), destinationShape.getBounds2D().getCenterY() ) );
      }

      // Fail safe - If nothing found, get the first chunk.
      if ( chunkToExtract == null ) {
        console.log( " - Warning: No energy chunk found by extraction algorithm, trying first available.." );
        var i;
        var length = this.slices.length;
        for ( i = 0; i < length; i++ ) {
//        this.slices.forEach( function( slice ) {
          if ( this.slices[i].energyChunkList.length > 0 ) {

            chunkToExtract = this.slices[i].energyChunkList.get( 0 );
            //TODO do we want to break out from the if statement only
            break;
          }
          //       } );
        }
        if ( chunkToExtract == null ) {
          console.log( " - Warning: No chunks available for extraction." );
        }
      }

      this.removeEnergyChunk( chunkToExtract );

      return chunkToExtract;
    },

    /**
     * Initialization method that add the "slices" where the energy chunks
     * reside.  Should be called only once at initialization.
     */

    addEnergyChunkSlices: function() {

      assert && assert( this.slices.length == 0 ); // Make sure this method isn't being misused.

      // Defaults to a single slice matching the outline rectangle, override
      // for more sophisticated behavior.
      this.slices.push( new EnergyChunkContainerSlice( this.getRect(), 0, this.position ) );
    },


    addInitialEnergyChunks: function() {
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.clear();
      } );

      var targetNumChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER.apply( energy );

      var energyChunkBounds = this.getThermalContactArea().getBounds();
      while ( this.getNumEnergyChunks() < targetNumChunks ) {
        // Add a chunk at a random location in the block.
        this.addEnergyChunk( new EnergyChunk( EnergyType.THERMAL, EnergyChunkDistributor.generateRandomLocation.call( this, energyChunkBounds ), this.energyChunksVisibleProperty ) );
      }

      // Distribute the energy chunks within the container.
      var i;
      for ( i = 0; i < 1000; i++ ) {
        if ( !EnergyChunkDistributor.updatePositions( this.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL ) ) {
          break;
        }
      }
    },


    getNumEnergyChunks: function() {

      var numChunks = 0;
      this.slices.forEach( function( slice ) {
        numChunks += slice.getNumEnergyChunks();
      } );
      return numChunks + this.approachingEnergyChunks.length;
    },


    getSlices: function() {
      return this.slices;
    },


    exchangeEnergyWith: function( otherEnergyContainer, dt ) {

      var thermalContactLength = getThermalContactArea().getThermalContactLength( otherEnergyContainer.getThermalContactArea() );
      if ( thermalContactLength > 0 ) {
        if ( Math.abs( otherEnergyContainer.getTemperature() - this.getTemperature() ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {
          // Exchange energy between this and the other energy container.

          // TODO  do we use the getHeatTransferFactor
          var heatTransferConstant = this.getHeatTransferFactor( this.getEnergyContainerCategory(), otherEnergyContainer.getEnergyContainerCategory() );

          var numFullTimeStepExchanges = Math.floor( dt / MAX_HEAT_EXCHANGE_TIME_STEP );

          var leftoverTime = dt - ( numFullTimeStepExchanges * MAX_HEAT_EXCHANGE_TIME_STEP );
          var i;
          for ( i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
            var timeStep = i < numFullTimeStepExchanges ? MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;

            var thermalEnergyGained = ( otherEnergyContainer.getTemperature() - this.getTemperature() ) * thermalContactLength * heatTransferConstant * timeStep;
            otherEnergyContainer.changeEnergy( -thermalEnergyGained );
            this.changeEnergy( thermalEnergyGained );
          }
        }
      }
    },

    /*
     * Get the shape as is is projected into 3D in the view.  Ideally, this
     * wouldn't even be in the model, because it would be purely handled in the
     * view, but it proved necessary.
     */

    getProjectedShape: function() {
      // This projects a rectangle, override for other behavior.

      var forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( this, Block.SURFACE_WIDTH / 2 );

      var backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( this, -Block.SURFACE_WIDTH / 2 );

      var shape = new Shape();

      var rect = this.getRect();
      shape.moveToPoint( new Vector2( rect.getX(), rect.getY() ).plus( forwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( rect.getMaxX(), rect.getY() ).plus( forwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( rect.getMaxX(), rect.getY() ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( rect.getMaxX(), rect.getMaxY() ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( rect.getMinX(), rect.getMaxY() ).plus( backwardPerspectiveOffset ) )
        .lineToPoint( new Vector2( rect.getMinX(), rect.getMaxY() ).plus( forwardPerspectiveOffset ) )
        .close();
      return shape;
    },


    getCenterPoint: function() {
      return new Vector2( this.position.x, this.position.y + this.height / 2 );
    },


    /**
     * Get a number indicating the balance between the energy level and the
     * number of energy chunks owned by this model element.
     *
     * @return 0 if the number of energy chunks matches the energy level, a
     *         negative value if there is a deficit, and a positive value if there is
     *         a surplus.
     */

    getEnergyChunkBalance: function() {
      return this.getNumEnergyChunks() - EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER.apply( this.energy );
    }
  } )
    ;
} )
;

//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.Shape;
//import java.awt.geom.Rectangle2D;
//import java.util.ArrayList;
//import java.util.List;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
//import edu.colorado.phet.common.phetcommon.model.clock.IClock;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.util.ObservableList;
//import edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyType;
//
//import static edu.colorado.phet.energyformsandchanges.common.EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER;
//import static edu.colorado.phet.energyformsandchanges.common.EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP;
//import static edu.colorado.phet.energyformsandchanges.intro.model.HeatTransferConstants.getHeatTransferFactor;
//
///**
// * A movable model element that contains thermal energy and that, at least in
// * the model, has an overall shape that can be represented as a rectangle.
// *
// * @author John Blanco
// */
//public abstract class RectangularThermalMovableModelElement extends UserMovableModelElement implements ThermalEnergyContainer {
//
//  public final BooleanProperty energyChunksVisible;
//  protected double energy = 0; // In Joules.
//  protected final double specificHeat; // In J/kg-K
//  protected final double mass; // In kg
//  protected final double width;
//  protected final double height;
//  private int nextSliceIndex;
//
//  // 2D "slices" of the container, used for 3D layering of energy chunks.
//  protected final List<EnergyChunkContainerSlice> slices = new ArrayList<EnergyChunkContainerSlice>();
//
//  // Energy chunks that are approaching this model element.
//  public final ObservableList<EnergyChunk> approachingEnergyChunks = new ObservableList<EnergyChunk>();
//  protected final List<EnergyChunkWanderController> energyChunkWanderControllers = new ArrayList<EnergyChunkWanderController>();
//
//  /*
//   * Constructor.
//   *
//   * @param clock
//   */
//  protected RectangularThermalMovableModelElement( IClock clock, Vector2D initialPosition, double width, double height, double mass, double specificHeat, BooleanProperty energyChunksVisible ) {
//    super( initialPosition );
//    this.mass = mass;
//    this.width = width;
//    this.height = height;
//    this.specificHeat = specificHeat;
//    this.energyChunksVisible = energyChunksVisible;
//
//    energy = mass * specificHeat * EFACConstants.ROOM_TEMPERATURE;
//
//    // Hook up to the clock for time dependent behavior.
//    clock.addClockListener( new ClockAdapter() {
//      @Override public void clockTicked( ClockEvent clockEvent ) {
//        stepInTime( clockEvent.getSimulationTimeChange() );
//      }
//    } );
//
//    // Add the slices, a.k.a. layers, where the energy chunks will live.
//    addEnergyChunkSlices();
//    nextSliceIndex = slices.size() / 2;
//
//    // Add the initial energy chunks.
//    addInitialEnergyChunks();
//  }
//
//  /**
//   * Get the rectangle that defines this elements position and shape in
//   * model space.
//   */
//  public abstract Rectangle2D getRect();
//
//  public void changeEnergy( double deltaEnergy ) {
//    energy += deltaEnergy;
//  }
//
//  public double getEnergy() {
//    return energy;
//  }
//
//  public double getTemperature() {
//    return energy / ( mass * specificHeat );
//  }
//
//  @Override public void reset() {
//    super.reset();
//    energy = mass * specificHeat * EFACConstants.ROOM_TEMPERATURE;
//    addInitialEnergyChunks();
//  }
//
//  protected void stepInTime( double dt ) {
//
//    // Distribute the energy chunks contained within this model element.
//    EnergyChunkDistributor.updatePositions( slices, dt );
//
//    // Animate the energy chunks that are outside this model element.
//    animateNonContainedEnergyChunks( dt );
//  }
//
//  protected void animateNonContainedEnergyChunks( double dt ) {
//    for ( EnergyChunkWanderController energyChunkWanderController : new ArrayList<EnergyChunkWanderController>( energyChunkWanderControllers ) ) {
//      energyChunkWanderController.updatePosition( dt );
//      if ( getSliceBounds().contains( energyChunkWanderController.getEnergyChunk().position.get().toPoint2D() ) ) {
//        moveEnergyChunkToSlices( energyChunkWanderController.getEnergyChunk() );
//      }
//    }
//  }
//
//  /**
//   * Add an energy chunk to this model element.  The energy chunk can be
//   * outside of the element's rectangular bounds, in which case it is added
//   * to the list of chunks that are moving towards the element, or it can be
//   * positioned already inside, in which case it is immediately added to one
//   * of the energy chunk "slices".
//   *
//   * @param ec Energy chunk to add.
//   */
//  public void addEnergyChunk( EnergyChunk ec ) {
//    if ( getSliceBounds().contains( ec.position.get().toPoint2D() ) ) {
//      // Energy chunk is positioned within container bounds, so add it
//      // directly to a slice.
//      addEnergyChunkToNextSlice( ec );
//    }
//    else {
//      // Chunk is out of the bounds of this element, so make it wander
//      // towards it.
//      ec.zPosition.set( 0.0 );
//      approachingEnergyChunks.add( ec );
//      energyChunkWanderControllers.add( new EnergyChunkWanderController( ec, position ) );
//    }
//  }
//
//  // Add an energy chunk to the next available slice.  Override for more elaborate behavior.
//  protected void addEnergyChunkToNextSlice( EnergyChunk ec ) {
//    slices.get( nextSliceIndex ).addEnergyChunk( ec );
//    nextSliceIndex = ( nextSliceIndex + 1 ) % slices.size();
//  }
//
//  protected Rectangle2D getSliceBounds() {
//    double minX = Double.POSITIVE_INFINITY;
//    double minY = Double.POSITIVE_INFINITY;
//    double maxX = Double.NEGATIVE_INFINITY;
//    double maxY = Double.NEGATIVE_INFINITY;
//    for ( EnergyChunkContainerSlice slice : slices ) {
//      Rectangle2D sliceBounds = slice.getShape().getBounds2D();
//      if ( sliceBounds.getMinX() < minX ) {
//        minX = sliceBounds.getMinX();
//      }
//      if ( sliceBounds.getMaxX() > maxX ) {
//        maxX = sliceBounds.getMaxX();
//      }
//      if ( sliceBounds.getMinY() < minY ) {
//        minY = sliceBounds.getMinY();
//      }
//      if ( sliceBounds.getMaxY() > maxY ) {
//        maxY = sliceBounds.getMaxY();
//      }
//    }
//    return new Rectangle2D.Double( minX, minY, maxX - minX, maxY - minY );
//  }
//
//  protected void moveEnergyChunkToSlices( EnergyChunk ec ) {
//    approachingEnergyChunks.remove( ec );
//    for ( EnergyChunkWanderController energyChunkWanderController : new ArrayList<EnergyChunkWanderController>( energyChunkWanderControllers ) ) {
//      if ( energyChunkWanderController.getEnergyChunk() == ec ) {
//        energyChunkWanderControllers.remove( energyChunkWanderController );
//      }
//    }
//    addEnergyChunkToNextSlice( ec );
//  }
//
//  protected boolean removeEnergyChunk( EnergyChunk ec ) {
//    for ( EnergyChunkContainerSlice slice : slices ) {
//      if ( slice.energyChunkList.remove( ec ) ) {
//        return true;
//      }
//    }
//    return false;
//  }
//
//  /*
//   * Extract the closest energy chunk to the provided point.  Compensate
//   * distances for the z-offset so that z-positioning doesn't skew the
//   * results, since the provided point is only 2D.
//   *
//   * @param point Comparison point.
//   * @return Energy chunk, null if there are none available.
//   */
//  public EnergyChunk extractClosestEnergyChunk( Vector2D point ) {
//    EnergyChunk closestEnergyChunk = null;
//    double closestCompensatedDistance = Double.POSITIVE_INFINITY;
//
//    // Identify the closest energy chunk.
//    for ( EnergyChunkContainerSlice slice : slices ) {
//      for ( EnergyChunk ec : slice.energyChunkList ) {
//        // Compensate for the Z offset.  Otherwise front chunk will
//        // almost always be chosen.
//        Vector2D compensatedEcPosition = ec.position.get().minus( 0, EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER * ec.zPosition.get() );
//        double compensatedDistance = compensatedEcPosition.distance( point );
//        if ( compensatedDistance < closestCompensatedDistance ) {
//          closestEnergyChunk = ec;
//        }
//      }
//    }
//
//    removeEnergyChunk( closestEnergyChunk );
//    return closestEnergyChunk;
//  }
//
//  /*
//   * Extract an energy chunk that is a good choice for being transferred to
//   * the provided shape.  Generally, this means that it is close to the
//   * shape.  This routine is not hugely general - it makes some assumptions
//   * that make it work for blocks in beakers.  If support for other shapes is
//   * needed, it will need some work.
//   *
//   * @param destinationShape
//   * @return Energy chunk, null if none are available.
//   */
//  public EnergyChunk extractClosestEnergyChunk( Shape destinationShape ) {
//    EnergyChunk chunkToExtract = null;
//    Rectangle2D myBounds = getSliceBounds();
//    if ( destinationShape.contains( getThermalContactArea().getBounds() ) ) {
//      // Our shape is contained by the destination.  Pick a chunk near
//      // our right or left edge.
//      double closestDistanceToVerticalEdge = Double.POSITIVE_INFINITY;
//      for ( EnergyChunkContainerSlice slice : slices ) {
//        for ( EnergyChunk ec : slice.energyChunkList ) {
//          double distanceToVerticalEdge = Math.min( Math.abs( myBounds.getMinX() - ec.position.get().getX() ), Math.abs( myBounds.getMaxX() - ec.position.get().getX() ) );
//          if ( distanceToVerticalEdge < closestDistanceToVerticalEdge ) {
//            chunkToExtract = ec;
//            closestDistanceToVerticalEdge = distanceToVerticalEdge;
//          }
//        }
//      }
//    }
//    else if ( getThermalContactArea().getBounds().contains( destinationShape.getBounds2D() ) ) {
//      // Our shape encloses the destination shape.  Choose a chunk that
//      // is close but doesn't overlap with the destination shape.
//      double closestDistanceToDestinationEdge = Double.POSITIVE_INFINITY;
//      Rectangle2D destinationBounds = destinationShape.getBounds2D();
//      for ( EnergyChunkContainerSlice slice : slices ) {
//        for ( EnergyChunk ec : slice.energyChunkList ) {
//          double distanceToDestinationEdge = Math.min( Math.abs( destinationBounds.getMinX() - ec.position.get().getX() ), Math.abs( destinationBounds.getMaxX() - ec.position.get().getX() ) );
//          if ( !destinationShape.contains( ec.position.get().toPoint2D() ) && distanceToDestinationEdge < closestDistanceToDestinationEdge ) {
//            chunkToExtract = ec;
//            closestDistanceToDestinationEdge = distanceToDestinationEdge;
//          }
//        }
//      }
//    }
//    else {
//      // There is no or limited overlap, so use center points.
//      chunkToExtract = extractClosestEnergyChunk( new Vector2D( destinationShape.getBounds2D().getCenterX(), destinationShape.getBounds2D().getCenterY() ) );
//    }
//
//    // Fail safe - If nothing found, get the first chunk.
//    if ( chunkToExtract == null ) {
//      System.out.println( getClass().getName() + " - Warning: No energy chunk found by extraction algorithm, trying first available.." );
//      for ( EnergyChunkContainerSlice slice : slices ) {
//        if ( slice.energyChunkList.size() > 0 ){
//          chunkToExtract = slice.energyChunkList.get( 0 );
//          break;
//        }
//      }
//      if ( chunkToExtract == null ){
//        System.out.println(getClass().getName() + " - Warning: No chunks available for extraction.");
//      }
//    }
//
//    removeEnergyChunk( chunkToExtract );
//    return chunkToExtract;
//  }
//
//  /**
//   * Initialization method that add the "slices" where the energy chunks
//   * reside.  Should be called only once at initialization.
//   */
//  protected void addEnergyChunkSlices() {
//
//    assert ( slices.size() == 0 ); // Make sure this method isn't being misused.
//
//    // Defaults to a single slice matching the outline rectangle, override
//    // for more sophisticated behavior.
//    slices.add( new EnergyChunkContainerSlice( getRect(), 0, position ) );
//  }
//
//  protected void addInitialEnergyChunks() {
//    for ( EnergyChunkContainerSlice slice : slices ) {
//      slice.energyChunkList.clear();
//    }
//    int targetNumChunks = ENERGY_TO_NUM_CHUNKS_MAPPER.apply( energy );
//    Rectangle2D energyChunkBounds = getThermalContactArea().getBounds();
//    while ( getNumEnergyChunks() < targetNumChunks ) {
//      // Add a chunk at a random location in the block.
//      addEnergyChunk( new EnergyChunk( EnergyType.THERMAL, EnergyChunkDistributor.generateRandomLocation( energyChunkBounds ), energyChunksVisible ) );
//    }
//
//    // Distribute the energy chunks within the container.
//    for ( int i = 0; i < 1000; i++ ) {
//      if ( !EnergyChunkDistributor.updatePositions( slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL ) ){
//        break;
//      }
//    }
//  }
//
//  protected int getNumEnergyChunks() {
//    int numChunks = 0;
//    for ( EnergyChunkContainerSlice slice : slices ) {
//      numChunks += slice.getNumEnergyChunks();
//    }
//    return numChunks + approachingEnergyChunks.size();
//  }
//
//  public List<EnergyChunkContainerSlice> getSlices() {
//    return slices;
//  }
//
//  public void exchangeEnergyWith( ThermalEnergyContainer otherEnergyContainer, double dt ) {
//    double thermalContactLength = getThermalContactArea().getThermalContactLength( otherEnergyContainer.getThermalContactArea() );
//    if ( thermalContactLength > 0 ) {
//      if ( Math.abs( otherEnergyContainer.getTemperature() - getTemperature() ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {
//        // Exchange energy between this and the other energy container.
//        double heatTransferConstant = getHeatTransferFactor( this.getEnergyContainerCategory(), otherEnergyContainer.getEnergyContainerCategory() );
//        int numFullTimeStepExchanges = (int) Math.floor( dt / MAX_HEAT_EXCHANGE_TIME_STEP );
//        double leftoverTime = dt - ( numFullTimeStepExchanges * MAX_HEAT_EXCHANGE_TIME_STEP );
//        for ( int i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
//          double timeStep = i < numFullTimeStepExchanges ? MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
//          double thermalEnergyGained = ( otherEnergyContainer.getTemperature() - getTemperature() ) * thermalContactLength * heatTransferConstant * timeStep;
//          otherEnergyContainer.changeEnergy( -thermalEnergyGained );
//          changeEnergy( thermalEnergyGained );
//        }
//      }
//    }
//  }
//
//  /*
//   * Get the shape as is is projected into 3D in the view.  Ideally, this
//   * wouldn't even be in the model, because it would be purely handled in the
//   * view, but it proved necessary.
//   */
//  public Shape getProjectedShape() {
//    // This projects a rectangle, override for other behavior.
//    Vector2D forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( Block.SURFACE_WIDTH / 2 );
//    Vector2D backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( -Block.SURFACE_WIDTH / 2 );
//
//    DoubleGeneralPath path = new DoubleGeneralPath();
//    Rectangle2D rect = getRect();
//    path.moveTo( new Vector2D( rect.getX(), rect.getY() ).plus( forwardPerspectiveOffset ) );
//    path.lineTo( new Vector2D( rect.getMaxX(), rect.getY() ).plus( forwardPerspectiveOffset ) );
//    path.lineTo( new Vector2D( rect.getMaxX(), rect.getY() ).plus( backwardPerspectiveOffset ) );
//    path.lineTo( new Vector2D( rect.getMaxX(), rect.getMaxY() ).plus( backwardPerspectiveOffset ) );
//    path.lineTo( new Vector2D( rect.getMinX(), rect.getMaxY() ).plus( backwardPerspectiveOffset ) );
//    path.lineTo( new Vector2D( rect.getMinX(), rect.getMaxY() ).plus( forwardPerspectiveOffset ) );
//    path.closePath();
//    return path.getGeneralPath();
//  }
//
//  public Vector2D getCenterPoint() {
//    return new Vector2D( position.get().getX(), position.get().getY() + height / 2 );
//  }
//
//  /**
//   * Get a number indicating the balance between the energy level and the
//   * number of energy chunks owned by this model element.
//   *
//   * @return 0 if the number of energy chunks matches the energy level, a
//   *         negative value if there is a deficit, and a positive value if there is
//   *         a surplus.
//   */
//  public int getEnergyChunkBalance() {
//    return getNumEnergyChunks() - EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER.apply( energy );
//  }
//}