// Copyright 2002-2015, University of Colorado

/**
 * Model element that represents a burner in the simulation.  The burner can
 * heat and also cool other model elements.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACIntroCanvas = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EFACIntroCanvas' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkWanderController' );
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var SetProperty = require( 'AXON/SetProperty' );
  var Vector2 = require( 'DOT/Vector2' );


  // constants
  var WIDTH = 0.075; // In meters.
  var HEIGHT = WIDTH * 1;
  var MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen.
  var CONTACT_DISTANCE = 0.001; // In meters.
  var ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // In meters, empirically chosen.

  // Because of the way that energy chunks are exchanged between thermal
  // modeling elements within this simulation, things can end up looking a
  // bit odd if a burner is turned on with nothing on it.  To account for
  // this, a separate energy generation rate is used when a burner is
  // exchanging energy directly with the air.
  var MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3; // joules/sec, multiplier empirically chosen.

  //-------------------------------------------------------------------------
  // Instance Data
  //-------------------------------------------------------------------------


  BoundedProperty;
  heatCoolLevel = new BoundedDoubleProperty( 0.0, -1, 1 );
  Property < HorizontalSurface > topSurface;

  var energyChunkList = new ObservableArray();
  var energyChunkWanderControllers = [];

  // Track energy transferred to anything sitting on the burner.
  var energyExchangedWithObjectSinceLastChunkTransfer = 0;

  // Track build up of energy for transferring chunks to/from the air.
  var energyExchangedWithAirSinceLastChunkTransfer = 0;

  /**
   * *
   * @param {Vector2} position - The position in model space where this burner exists. By convention for this simulation, the position is
   * @param {Property.<boolean>} energyChunksVisibleProperty Property that controls whether the energy chunks are visible
   * @constructor
   */
  function Burner( position, energyChunksVisibleProperty ) {
    this.position = new Vector2( position );
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    // dropping objects on top of burner.

    var rectangle = this.getOutlineRect();
    var perspectiveCompensation = rectangle.height * EFACIntroCanvas.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos( BurnerStandNode.PERSPECTIVE_ANGLE );
    this.topSurface = new Property( new HorizontalSurface( new Range( rectangle.minX - perspectiveCompensation, rectangle.maxX + perspectiveCompensation ), rectangle.maxY, this ) );

    heatCoolLevelProperty.link( function( newValue, oldValue ) {
      if ( newValue == 0 || (Math.signum( oldValue ) != Math.signum( newValue )) ) {
        // clear accumulated heat/cool amount.
        energyExchangedWithAirSinceLastChunkTransfer = 0;
      }
    } );
    // Clear the accumulated energy transfer if thing is removed from burner.
    var somethingOnTop = new BooleanProperty( false );
    somethingOnTopProperty.link( function( somethingOnTop ) {
      if ( !somethingOnTop ) {
        energyExchangedWithObjectSinceLastChunkTransfer = 0;
      }
    } );
  }

  return inherit( ModelElement, Burner, {
//-------------------------------------------------------------------------
// Methods
//-------------------------------------------------------------------------
    /**
     * Get a rectangle that defines the outline of the burner.  In the model the burner is essentially a 2D rectangle.
     *
     * @return {Rectangle} Rectangle that defines the outline in model space.
     */
    getOutlineRect: function() {
      return new Rectangle( position.x - WIDTH / 2, position.y, WIDTH, HEIGHT );
    },

    /**
     * *
     * @returns {Property.<HorizontalSurface>}
     */
    getTopSurfaceProperty: function() {
      return this.topSurface;
    },
    /**
     * Interact with a thermal energy container, adding or removing energy
     * based on the current heat/cool setting.
     *
     * @param [ThermalEnergyContainer} thermalEnergyContainer - Model object that will get or give energy.
     * @param {number} dt - Amount of time (delta time).
     */
    addOrRemoveEnergyToFromObject: function( thermalEnergyContainer, dt ) {
      // This shouldn't be used for air - there is a specific method for that.
      assert && assert( !(thermalEnergyContainer instanceof Air) );
      if ( this.inContactWith( thermalEnergyContainer ) ) {
        var deltaEnergy = 0;
        if ( thermalEnergyContainer.getTemperature() > EFACConstants.FREEZING_POINT_TEMPERATURE ) {
          deltaEnergy = MAX_ENERGY_GENERATION_RATE * heatCoolLevel.get() * dt;
        }
        thermalEnergyContainer.changeEnergy( deltaEnergy );
        energyExchangedWithObjectSinceLastChunkTransfer += deltaEnergy;
      }
    },
    /**
     * *
     * @param air
     * @param dt
     */
    addOrRemoveEnergyToFromAir: function( air, dt ) {
      var deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * heatCoolLevel.get() * dt;
      air.changeEnergy( deltaEnergy );
      energyExchangedWithAirSinceLastChunkTransfer += deltaEnergy;
    },

    /**
     * *
     * @param thermalEnergyContainer
     * @returns {boolean}
     */
    inContactWith: function( thermalEnergyContainer ) {
      var containerThermalArea = thermalEnergyContainer.getThermalContactArea().getBounds();
      return (containerThermalArea.getCenterX() > this.getOutlineRect().getMinX() && containerThermalArea.getCenterX() < this.getOutlineRect().getMaxX() && Math.abs( containerThermalArea.getMinY() - this.getOutlineRect().getMaxY() ) < CONTACT_DISTANCE);
    },

    /**
     *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      energyChunk.zPosition.set( 0.0 );
      energyChunkList.add( energyChunk );
      energyChunkWanderControllers.add( new EnergyChunkWanderController( energyChunk, new Property( this.getEnergyChunkStartEndPoint() ) ) );
      energyExchangedWithAirSinceLastChunkTransfer = 0;
      energyExchangedWithObjectSinceLastChunkTransfer = 0;
    },

    /**
     * @private
     * @returns {Vector2}
     */
    getEnergyChunkStartEndPoint: function() {
      return this.getCenterPoint();
    },
    /**
     * Request an energy chunk from the burner.
     *
     * @param {Vector2} point Point from which to search for closest chunk.
     * @return {EnergyChunk} Closest energy chunk, null if none are contained.
     */
    extractClosestEnergyChunk: function( point ) {
      var closestEnergyChunk = null;
      if ( energyChunkList.size() > 0 ) {
        for ( var energyChunk in energyChunkList ) {
          if ( energyChunk.position.distance( position ) > ENERGY_CHUNK_CAPTURE_DISTANCE && (closestEnergyChunk == null || energyChunk.position.distance( point ) < closestEnergyChunk.position.distance( point )) ) {
            // Found a closer chunk.
            closestEnergyChunk = energyChunk;
          }
        }
        energyChunkList.remove( closestEnergyChunk );
        for ( var energyChunkWanderController in new ArrayList( energyChunkWanderControllers ) ) {
          if ( energyChunkWanderController.getEnergyChunk() == closestEnergyChunk ) {
            energyChunkWanderControllers.remove( energyChunkWanderController );
          }
        }
      }
      if ( closestEnergyChunk == null && heatCoolLevel.get() > 0 ) {
        // Create an energy chunk.
        closestEnergyChunk = new EnergyChunk( EnergyType.THERMAL, getEnergyChunkStartEndPoint(), energyChunksVisible );
      }
      if ( closestEnergyChunk != null ) {
        energyExchangedWithAirSinceLastChunkTransfer = 0;
        energyExchangedWithObjectSinceLastChunkTransfer = 0;
      }
      else {
        console.log( getClass().getName() + " - Warning: Request for energy chunk from burner when not in heat mode and no chunks contained, returning null." );
      }
      return closestEnergyChunk;
    },
    /**
     * *
     * @returns {Vector2}
     */
    getCenterPoint: function() {
      return new Vector2( position.x, position.y + HEIGHT / 2 );
    },
    /**
     *
     */
    reset: function() {
      super.reset();
      energyChunkList.clear();
      energyChunkWanderControllers.clear();
      energyExchangedWithAirSinceLastChunkTransfer = 0;
      energyExchangedWithObjectSinceLastChunkTransfer = 0;
      heatCoolLevel.reset();
    },

    /**
     * *
     * @param {ThermalEnergyContainer} thermalEnergyContainers
     * @returns {boolean}
     */
    areAnyOnTop: function( thermalEnergyContainers ) {
      for ( var thermalEnergyContainer in thermalEnergyContainers ) {
        if ( this.inContactWith( thermalEnergyContainer ) ) {
          return true;
        }
      }
      return false;
    },
    /**
     * *
     * @returns {number}
     */
    getEnergyChunkCountForAir: function() {
      var count = 0;
      // almost to the burner).
      if ( energyChunkList.size() > 0 && heatCoolLevel.get() >= 0 ) {
        for ( var energyChunk in energyChunkList ) {
          if ( position.distance( energyChunk.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE ) {
            count++;
          }
        }
      }
      if ( count == 0 ) {
        // chunk transfer warrants another chunk.
        count = Math.round( energyExchangedWithAirSinceLastChunkTransfer / EFACConstants.ENERGY_PER_CHUNK );
      }
      return count;
    },

    /**
     * @private
     * @param dt
     */
    stepInTime: function( dt ) {
      // Animate energy chunks.
      for ( var energyChunkWanderController in new ArrayList( energyChunkWanderControllers ) ) {
        energyChunkWanderController.updatePosition( dt );
        if ( energyChunkWanderController.destinationReached() ) {
          energyChunkList.remove( energyChunkWanderController.getEnergyChunk() );
          energyChunkWanderControllers.remove( energyChunkWanderController );
        }
      }
    },

    /**
     * *
     * @returns {Rectangle}
     */
    getFlameIceRect: function() {
      // be coordinated with the view.
      var outlineRect = this.getOutlineRect();
      return new Rectangle( outlineRect.centerX - outlineRect.width / 4, outlineRect.centerY, outlineRect.width / 2, outlineRect.height / 2 );
    },

    /**
     * *
     * @returns {number}
     */
    getTemperature: function() {
      // low value is limited to the freezing point of water.
      return Math.max( EFACConstants.ROOM_TEMPERATURE + heatCoolLevel.get() * 100, EFACConstants.FREEZING_POINT_TEMPERATURE );
    },
    /**
     * Get the number of excess of deficit energy chunks for interaction with
     * thermal objects (as opposed to air).
     *
     * @return Number of energy chunks that could be supplied or consumed.
     *         Negative value indicates that chunks should come in.
     */
    getEnergyChunkBalanceWithObjects: function() {
      return (Math.floor( Math.abs( energyExchangedWithObjectSinceLastChunkTransfer ) / EFACConstants.ENERGY_PER_CHUNK ) * Math.signum( energyExchangedWithObjectSinceLastChunkTransfer ));
    },
    /**
     * *
     * @returns {boolean}
     */
    canSupplyEnergyChunk: function() {
      return heatCoolLevel.get() > 0;
    },
    /**
     * *
     * @returns {boolean}
     */
    canAcceptEnergyChunk: function() {
      return heatCoolLevel.get() < 0;
    },
// Convenience class - a Property<Double> with a limited range.
    define( function( require ) {

      function BoundedDoubleProperty( value, minValue, maxValue ) {
        super( value );
        bounds = new Property( new DoubleRange( minValue, maxValue ) );
      }

      return inherit( Property, BoundedDoubleProperty, {
        set: function( value ) {
          var boundedValue = MathUtil.clamp( bounds.get().getMin(), value, bounds.get().getMax() );
          super.set( boundedValue );
        }
      } );
    } );
} );
} )


/*
 // // Copyright 2002-2015, University of Colorado
 // package edu.colorado.phet.energyformsandchanges.intro.model;
 //
 // import java.awt.geom.Rectangle2D;
 // import java.util.ArrayList;
 // import java.util.List;
 //
 // import edu.colorado.phet.common.phetcommon.math.MathUtil;
 // import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
 // import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
 // import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
 // import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
 // import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
 // import edu.colorado.phet.common.phetcommon.model.property.ChangeObserver;
 // import edu.colorado.phet.common.phetcommon.model.property.Property;
 // import edu.colorado.phet.common.phetcommon.util.DoubleRange;
 // import edu.colorado.phet.common.phetcommon.util.ObservableList;
 // import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
 // import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
 // import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
 // import edu.colorado.phet.energyformsandchanges.common.model.EnergyType;
 // import edu.colorado.phet.energyformsandchanges.common.view.BurnerStandNode;
 // import edu.colorado.phet.energyformsandchanges.intro.view.EFACIntroCanvas;
 //
 // /**
 // * Model element that represents a burner in the simulation.  The burner can
 // * heat and also cool other model elements.
 // *
 // * @author John Blanco
 // */
//public class Burner extends ModelElement {
//
//  //-------------------------------------------------------------------------
//  // Class Data
//  //-------------------------------------------------------------------------
//
//   static  double WIDTH = 0.075; // In meters.
//  private static final double HEIGHT = WIDTH * 1;
//  private static final double MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen.
//  private static final double CONTACT_DISTANCE = 0.001; // In meters.
//  private static final double ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // In meters, empirically chosen.
//
//  // Because of the way that energy chunks are exchanged between thermal
//  // modeling elements within this simulation, things can end up looking a
//  // bit odd if a burner is turned on with nothing on it.  To account for
//  // this, a separate energy generation rate is used when a burner is
//  // exchanging energy directly with the air.
//  private static final double MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3; // joules/sec, multiplier empirically chosen.
//
//  //-------------------------------------------------------------------------
//  // Instance Data
//  //-------------------------------------------------------------------------
//
//  private final Vector2D position;
//
//  public final BoundedDoubleProperty heatCoolLevel = new BoundedDoubleProperty( 0.0, -1, 1 );
//  private final Property<HorizontalSurface> topSurface;
//  private final BooleanProperty energyChunksVisible;
//  public final ObservableList<EnergyChunk> energyChunkList = new ObservableList<EnergyChunk>();
//  private final List<EnergyChunkWanderController> energyChunkWanderControllers = new ArrayList<EnergyChunkWanderController>();
//
//  // Track energy transferred to anything sitting on the burner.
//  private double energyExchangedWithObjectSinceLastChunkTransfer = 0;
//
//  // Track build up of energy for transferring chunks to/from the air.
//  private double energyExchangedWithAirSinceLastChunkTransfer = 0;
//
//  //-------------------------------------------------------------------------
//  // Constructor(s)
//  //-------------------------------------------------------------------------
//
//  /**
//   * Constructor.
//   *
//   * @param clock               Clock that steps this burner in time.
//   * @param position            The position in model space where this burner
//   *                            exists. By convention for this simulation,
//   *                            the position is
//   * @param energyChunksVisible Property that controls whether the energy
//   *                            chunks are visible.
//   */
//  public Burner( ConstantDtClock clock, Vector2D position, BooleanProperty energyChunksVisible ) {
//    this.position = new Vector2D( position );
//    this.energyChunksVisible = energyChunksVisible;
//
//    // Create and add the top surface.  Some compensation for perspective
//    // is necessary in order to avoid problems with edge overlap when
//    // dropping objects on top of burner.
//    double perspectiveCompensation = getOutlineRect().getHeight() * EFACIntroCanvas.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos( BurnerStandNode.PERSPECTIVE_ANGLE );
//    topSurface = new Property<HorizontalSurface>( new HorizontalSurface( new DoubleRange( getOutlineRect().getMinX() - perspectiveCompensation,
//          getOutlineRect().getMaxX() + perspectiveCompensation ),
//      getOutlineRect().getMaxY(),
//      this ) );
//
//    clock.addClockListener( new ClockAdapter() {
//      @Override public void clockTicked( ClockEvent clockEvent ) {
//        stepInTime( clockEvent.getSimulationTimeChange() );
//      }
//    } );
//
//    heatCoolLevel.addObserver( new ChangeObserver<Double>() {
//      public void update( Double newValue, Double oldValue ) {
//        if ( newValue == 0 || ( Math.signum( oldValue ) != Math.signum( newValue ) ) ) {
//          // If the burner has been turned off or switched modes,
//          // clear accumulated heat/cool amount.
//          energyExchangedWithAirSinceLastChunkTransfer = 0;
//        }
//      }
//    } );
//
//    // Clear the accumulated energy transfer if thing is removed from burner.
//    BooleanProperty somethingOnTop = new BooleanProperty( false );
//    somethingOnTop.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean somethingOnTop ) {
//        if ( !somethingOnTop ) {
//          energyExchangedWithObjectSinceLastChunkTransfer = 0;
//        }
//      }
//    } );
//  }
//
//  //-------------------------------------------------------------------------
//  // Methods
//  //-------------------------------------------------------------------------
//
//  /**
//   * Get a rectangle that defines the outline of the burner.  In the model,
//   * the burner is essentially a 2D rectangle.
//   *
//   * @return Rectangle that defines the outline in model space.
//   */
//  public Rectangle2D getOutlineRect() {
//    return new Rectangle2D.Double( position.x - WIDTH / 2,
//      position.y,
//      WIDTH,
//      HEIGHT );
//  }
//
//  @Override public Property<HorizontalSurface> getTopSurfaceProperty() {
//    return topSurface;
//  }
//
//  /**
//   * Interact with a thermal energy container, adding or removing energy
//   * based on the current heat/cool setting.
//   *
//   * @param thermalEnergyContainer Model object that will get or give energy.
//   * @param dt                     Amount of time (delta time).
//   */
//  public void addOrRemoveEnergyToFromObject( ThermalEnergyContainer thermalEnergyContainer, double dt ) {
//    assert !( thermalEnergyContainer instanceof Air );  // This shouldn't be used for air - there is a specific method for that.
//    if ( inContactWith( thermalEnergyContainer ) ) {
//      double deltaEnergy = 0;
//      if ( thermalEnergyContainer.getTemperature() > EFACConstants.FREEZING_POINT_TEMPERATURE ) {
//        deltaEnergy = MAX_ENERGY_GENERATION_RATE * heatCoolLevel.get() * dt;
//      }
//      thermalEnergyContainer.changeEnergy( deltaEnergy );
//      energyExchangedWithObjectSinceLastChunkTransfer += deltaEnergy;
//    }
//  }
//
//  public void addOrRemoveEnergyToFromAir( Air air, double dt ) {
//    double deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * heatCoolLevel.get() * dt;
//    air.changeEnergy( deltaEnergy );
//    energyExchangedWithAirSinceLastChunkTransfer += deltaEnergy;
//  }
//
//  public boolean inContactWith( ThermalEnergyContainer thermalEnergyContainer ) {
//    Rectangle2D containerThermalArea = thermalEnergyContainer.getThermalContactArea().getBounds();
//    return ( containerThermalArea.getCenterX() > getOutlineRect().getMinX() &&
//             containerThermalArea.getCenterX() < getOutlineRect().getMaxX() &&
//             Math.abs( containerThermalArea.getMinY() - getOutlineRect().getMaxY() ) < CONTACT_DISTANCE );
//  }
//
//  public void addEnergyChunk( EnergyChunk ec ) {
//    energyChunk.zPosition.set( 0.0 );
//    energyChunkList.add( energyChunk );
//    energyChunkWanderControllers.add( new EnergyChunkWanderController( energyChunk, new Property<Vector2D>( getEnergyChunkStartEndPoint() ) ) );
//    energyExchangedWithAirSinceLastChunkTransfer = 0;
//    energyExchangedWithObjectSinceLastChunkTransfer = 0;
//  }
//
//  private Vector2D getEnergyChunkStartEndPoint() {
//    return new Vector2D( getCenterPoint().getX(), getCenterPoint().getY() );
//  }
//
//  /**
//   * Request an energy chunk from the burner.
//   *
//   * @param point Point from which to search for closest chunk.
//   * @return Closest energy chunk, null if none are contained.
//   */
//  public EnergyChunk extractClosestEnergyChunk( Vector2D point ) {
//    EnergyChunk closestEnergyChunk = null;
//    if ( energyChunkList.size() > 0 ) {
//      for ( EnergyChunk energyChunk : energyChunkList ) {
//        if ( energyChunk.position.distance( position ) > ENERGY_CHUNK_CAPTURE_DISTANCE &&
//             ( closestEnergyChunk == null || energyChunk.position.distance( point ) < closestEnergyChunk.position.distance( point ) ) ) {
//          // Found a closer chunk.
//          closestEnergyChunk = energyChunk;
//        }
//      }
//      energyChunkList.remove( closestEnergyChunk );
//      for ( EnergyChunkWanderController energyChunkWanderController : new ArrayList<EnergyChunkWanderController>( energyChunkWanderControllers ) ) {
//        if ( energyChunkWanderController.getEnergyChunk() == closestEnergyChunk ) {
//          energyChunkWanderControllers.remove( energyChunkWanderController );
//        }
//      }
//    }
//
//    if ( closestEnergyChunk == null && heatCoolLevel.get() > 0 ) {
//      // Create an energy chunk.
//      closestEnergyChunk = new EnergyChunk( EnergyType.THERMAL, getEnergyChunkStartEndPoint(), energyChunksVisible );
//    }
//
//    if ( closestEnergyChunk != null ) {
//      energyExchangedWithAirSinceLastChunkTransfer = 0;
//      energyExchangedWithObjectSinceLastChunkTransfer = 0;
//    }
//    else {
//      System.out.println( getClass().getName() + " - Warning: Request for energy chunk from burner when not in heat mode and no chunks contained, returning null." );
//    }
//
//    return closestEnergyChunk;
//  }
//
//  public Vector2D getCenterPoint() {
//    return new Vector2D( position.x, position.y + HEIGHT / 2 );
//  }
//
//  @Override public void reset() {
//    super.reset();
//    energyChunkList.clear();
//    energyChunkWanderControllers.clear();
//    energyExchangedWithAirSinceLastChunkTransfer = 0;
//    energyExchangedWithObjectSinceLastChunkTransfer = 0;
//    heatCoolLevel.reset();
//  }
//
//  public boolean areAnyOnTop( ThermalEnergyContainer... thermalEnergyContainers ) {
//    for ( ThermalEnergyContainer thermalEnergyContainer : thermalEnergyContainers ) {
//      if ( inContactWith( thermalEnergyContainer ) ) {
//        return true;
//      }
//    }
//    return false;
//  }
//
//  public int getEnergyChunkCountForAir() {
//    int count = 0;
//    // If there are approaching chunks, and the mode has switched to off or
//    // to heating, the chunks should go back to the air (if they're not
//    // almost to the burner).
//    if ( energyChunkList.size() > 0 && heatCoolLevel.get() >= 0 ) {
//      for ( EnergyChunk energyChunk : energyChunkList ) {
//        if ( position.distance( energyChunk.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE ) {
//          count++;
//        }
//      }
//    }
//    if ( count == 0 ) {
//      // See whether the energy exchanged with the air since the last
//      // chunk transfer warrants another chunk.
//      count = (int) Math.round( energyExchangedWithAirSinceLastChunkTransfer / EFACConstants.ENERGY_PER_CHUNK );
//    }
//    return count;
//  }
//
//  private void stepInTime( double dt ) {
//
//    // Animate energy chunks.
//    for ( EnergyChunkWanderController energyChunkWanderController : new ArrayList<EnergyChunkWanderController>( energyChunkWanderControllers ) ) {
//      energyChunkWanderController.updatePosition( dt );
//      if ( energyChunkWanderController.destinationReached() ) {
//        energyChunkList.remove( energyChunkWanderController.getEnergyChunk() );
//        energyChunkWanderControllers.remove( energyChunkWanderController );
//      }
//    }
//  }
//
//  public Rectangle2D getFlameIceRect() {
//
//    // This is the area where the flame and ice appear in the view.  Must
//    // be coordinated with the view.
//    Rectangle2D outlineRect = getOutlineRect();
//    return new Rectangle2D.Double( outlineRect.getCenterX() - outlineRect.width / 4,
//      outlineRect.getCenterY(),
//        outlineRect.width / 2,
//        outlineRect.height / 2 );
//  }
//
//  public double getTemperature() {
//    // The multiplier is empirically determined for desired behavior. The
//    // low value is limited to the freezing point of water.
//    return Math.max( EFACConstants.ROOM_TEMPERATURE + heatCoolLevel.get() * 100, EFACConstants.FREEZING_POINT_TEMPERATURE );
//  }
//
//  /**
//   * Get the number of excess of deficit energy chunks for interaction with
//   * thermal objects (as opposed to air).
//   *
//   * @return Number of energy chunks that could be supplied or consumed.
//   *         Negative value indicates that chunks should come in.
//   */
//  public int getEnergyChunkBalanceWithObjects() {
//    return (int) ( Math.floor( Math.abs( energyExchangedWithObjectSinceLastChunkTransfer ) / EFACConstants.ENERGY_PER_CHUNK ) * Math.signum( energyExchangedWithObjectSinceLastChunkTransfer ) );
//  }
//
//  public boolean canSupplyEnergyChunk() {
//    return heatCoolLevel.get() > 0;
//  }
//
//  public boolean canAcceptEnergyChunk() {
//    return heatCoolLevel.get() < 0;
//  }
//
//  // Convenience class - a Property<Double> with a limited range.
//  public static class BoundedDoubleProperty extends Property<Double> {
//
//    private final Property<DoubleRange> bounds;
//
//  public BoundedDoubleProperty( Double value, double minValue, double maxValue ) {
//    super( value );
//    bounds = new Property<DoubleRange>( new DoubleRange( minValue, maxValue ) );
//  }
//
//  @Override public void set( Double value ) {
//    double boundedValue = MathUtil.clamp( bounds.get().getMin(), value, bounds.get().getMax() );
//    super.set( boundedValue );
//  }
//}
//}

* /