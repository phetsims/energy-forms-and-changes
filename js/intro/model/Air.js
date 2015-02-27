// Copyright 2002-2015, University of Colorado Boulder


/**
 * Class that represents the air in the model.  Air can hold heat, and can
 * exchange thermal energy with other model objects.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkWanderController' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/HeatTransferConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'DOT/Rectangle' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var ThermalEnergyContainer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalEnergyContainer' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  // 2D size of the air.  It is sized such that it will extend off the left,
  // right, and top edges of screen for the most common aspect ratios of the
  // view.
  var SIZE = new Dimension2( 0.7, 0.3 );

  // The thickness of the slice of air being modeled.  This is basically the
  // z dimension, and is used solely for volume calculations.
  var DEPTH = 0.1; // In meters.

  // Constants that define the heat carrying capacity of the air.
  var SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
  // var DENSITY = 0.001; // In kg/m^3, source = design document (and common knowledge).
  var DENSITY = 10; // In kg/m^3, far more dense than real air, done to make things cool faster.

  // Derived constants.
  var VOLUME = SIZE.width * SIZE.height * DEPTH;
  var MASS = VOLUME * DENSITY;
  var INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
  var THERMAL_CONTACT_AREA = new ThermalContactArea( new Rectangle( -SIZE.width / 2, 0, SIZE.width, SIZE.height ), true );


  var energy = INITIAL_ENERGY;


  /**
   * *
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Air( energyChunksVisibleProperty ) {

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Energy chunks that are approaching this model element.
    this.energyChunkWanderControllers = [];
    this.energyChunkList = new ObservableArray(); //
  }

  return inherit( ThermalEnergyContainer, Air, {

    step: function( dt ) {
      // Update the position of any energy chunks.
      this.energyChunkWanderControllers.forEach( function( energyChunkWanderController ) {
        energyChunkWanderController.updatePosition( dt );
        if ( !(this.getThermalContactArea().bounds.contains( energyChunkWanderController.energyChunk.position ) ) ) {
          // Remove this energy chunk.
          //TODO: dont we new to pass a copy instead
          this.energyChunkList.remove( energyChunkWanderController.energyChunk );
          this.energyChunkWanderControllers.remove( energyChunkWanderController );
        }
      } )

    },

    equalizeWithSurroundingAir: function( dt ) {
      if ( Math.abs( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) > EFACConstants.SIGNIFICANT_TEMPERATURE_DIFFERENCE ) {
        var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        var i;
        for ( i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
          var timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          //TODO: decide if we want HEAT transfer constants as properties;
          var thermalEnergyLost = ( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) * HeatTransferConstants.getAirToSurroundingAirHeatTransferFactor() * timeStep;
          this.changeEnergy( -thermalEnergyLost );
        }
      }
    },

    changeEnergy: function( deltaEnergy ) {
      energy += deltaEnergy;
    },

    getEnergy: function() {
      return energy;
    },

    reset: function() {
      energy = INITIAL_ENERGY;
      this.energyChunkList.clear();
      this.energyChunkWanderControllers.clear();
    },

    exchangeEnergyWith: function( energyContainer, dt ) {
      var thermalContactLength = this.getThermalContactArea().getThermalContactLength( energyContainer.getThermalContactArea() );
      if ( thermalContactLength > 0 ) {
        var excessEnergy = energyContainer.getEnergyBeyondMaxTemperature();
        if ( excessEnergy == 0 ) {
          // Container is below max temperature, exchange energy normally.
          //TODO: find a method to getHeatTransferFactor
          var heatTransferConstant = HeatTransferConstants.getHeatTransferFactor( this.getEnergyContainerCategory(), energyContainer.getEnergyContainerCategory() );
          var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
          var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
          var i;
          for ( i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
            var timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
            var thermalEnergyGained = ( energyContainer.getTemperature() - this.getTemperature() ) * thermalContactLength * heatTransferConstant * timeStep;
            energyContainer.changeEnergy( -thermalEnergyGained );
            this.changeEnergy( thermalEnergyGained );
          }
        }
        else {
          // Item is at max temperature.  Shed all excess energy into the air.
          energyContainer.changeEnergy( -excessEnergy );
          this.changeEnergy( excessEnergy );
        }
      }
    },

    addEnergyChunk: function( energyChunk, initialWanderConstraint ) {
      energyChunk.zPosition = 0.0;
      this.energyChunkList.push( energyChunk );
      this.energyChunkWanderControllers.push( new EnergyChunkWanderController( energyChunk,
        new Property( new Vector2( energyChunk.position.x, SIZE.height ) ),
        initialWanderConstraint ) );
    },


    getCenterPoint: function() {
      return new Vector2( 0, SIZE.height / 2 );
    },

    getThermalContactArea: function() {
      return THERMAL_CONTACT_AREA;
    },

    getTemperature: function() {
      return energy / ( MASS * SPECIFIC_HEAT );
    },

    getEnergyChunkList: function() {
      return this.energyChunkList;
    },

    getEnergyContainerCategory: function() {
      return EnergyContainerCategory.AIR;
    },

    getEnergyBeyondMaxTemperature: function() {
      // Air temperature is unlimited.
      return 0;
    }
  } );
} )
;

///**
// * Created by veillettem on 10/5/2014.
// */
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Rectangle2D;
//import java.util.ArrayList;
//import java.util.List;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//import edu.colorado.phet.common.phetcommon.util.ObservableList;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyType;
//import edu.umd.cs.piccolo.util.PDimension;
//
//import static edu.colorado.phet.energyformsandchanges.common.EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP;
//import static edu.colorado.phet.energyformsandchanges.intro.model.HeatTransferConstants.getHeatTransferFactor;
//
///**
// * Class that represents the air in the model.  Air can hold heat, and can
// * exchange thermal energy with other model objects.
// *
// * @author John Blanco
// */
//public class Air implements ThermalEnergyContainer {
//
//  //-------------------------------------------------------------------------
//  // Class Data
//  //-------------------------------------------------------------------------
//
//  // 2D size of the air.  It is sized such that it will extend off the left,
//  // right, and top edges of screen for the most common aspect ratios of the
//  // view.
//   static final Dimension2D SIZE = new PDimension( 0.7, 0.3 );
//
//  // The thickness of the slice of air being modeled.  This is basically the
//  // z dimension, and is used solely for volume calculations.
//  private static final double DEPTH = 0.1; // In meters.
//
//  // Constants that define the heat carrying capacity of the air.
//  private static final double SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
//  //    private static final double DENSITY = 0.001; // In kg/m^3, source = design document (and common knowledge).
//  private static final double DENSITY = 10; // In kg/m^3, far more dense than real air, done to make things cool faster.
//
//  // Derived constants.
//  private static final double VOLUME = SIZE.getWidth() * SIZE.getHeight() * DEPTH;
//  private static final double MASS = VOLUME * DENSITY;
//  private static final double INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
//  private static final ThermalContactArea THERMAL_CONTACT_AREA = new ThermalContactArea( new Rectangle2D.Double( -SIZE.getWidth() / 2, 0, SIZE.getWidth(), SIZE.getHeight() ), true );
//  //-------------------------------------------------------------------------
//  // Instance Data
//  //-------------------------------------------------------------------------
//
//  private double energy = INITIAL_ENERGY;
//  private final BooleanProperty energyChunksVisible;
//  private final ObservableList<EnergyChunk> energyChunkList = new ObservableList<EnergyChunk>();
//  private final List<EnergyChunkWanderController> energyChunkWanderControllers = new ArrayList<EnergyChunkWanderController>();
//
//  //-------------------------------------------------------------------------
//  // Constructor(s)
//  //-------------------------------------------------------------------------
//
//  /**
//   * Constructor.
//   */
//  public Air( ConstantDtClock clock, BooleanProperty energyChunksVisible ) {
//
//    this.energyChunksVisible = energyChunksVisible;
//
//    // Hook up to the clock for time dependent behavior.
//    clock.addClockListener( new ClockAdapter() {
//      @Override public void clockTicked( ClockEvent clockEvent ) {
//        stepInTime( clockEvent.getSimulationTimeChange() );
//      }
//    } );
//  }
//
//  //-------------------------------------------------------------------------
//  // Methods
//  //-------------------------------------------------------------------------
//
//  private void stepInTime( double dt ) {
//    // Update the position of any energy chunks.
//    for ( EnergyChunkWanderController energyChunkWanderController : new ArrayList<EnergyChunkWanderController>( energyChunkWanderControllers ) ) {
//      energyChunkWanderController.updatePosition( dt );
//      if ( !getThermalContactArea().getBounds().contains( energyChunkWanderController.getEnergyChunk().position ) ) {
//        // Remove this energy chunk.
//        energyChunkList.remove( energyChunkWanderController.getEnergyChunk() );
//        energyChunkWanderControllers.remove( energyChunkWanderController );
//      }
//    }
//
//    equalizeWithSurroundingAir( dt );
//  }
//
//  private void equalizeWithSurroundingAir( double dt ) {
//    if ( Math.abs( getTemperature() - EFACConstants.ROOM_TEMPERATURE ) > EFACConstants.SIGNIFICANT_TEMPERATURE_DIFFERENCE ) {
//      int numFullTimeStepExchanges = (int) Math.floor( dt / MAX_HEAT_EXCHANGE_TIME_STEP );
//      double leftoverTime = dt - ( numFullTimeStepExchanges * MAX_HEAT_EXCHANGE_TIME_STEP );
//      for ( int i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
//        double timeStep = i < numFullTimeStepExchanges ? MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
//        double thermalEnergyLost = ( getTemperature() - EFACConstants.ROOM_TEMPERATURE ) * HeatTransferConstants.AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR.get() * timeStep;
//        changeEnergy( -thermalEnergyLost );
//      }
//    }
//  }
//
//  public void changeEnergy( double deltaEnergy ) {
//    energy += deltaEnergy;
//  }
//
//  public double getEnergy() {
//    return energy;
//  }
//
//  public void reset() {
//    energy = INITIAL_ENERGY;
//    energyChunkList.clear();
//    energyChunkWanderControllers.clear();
//  }
//
//  public void exchangeEnergyWith( ThermalEnergyContainer energyContainer, double dt ) {
//    double thermalContactLength = getThermalContactArea().getThermalContactLength( energyContainer.getThermalContactArea() );
//    if ( thermalContactLength > 0 ) {
//      double excessEnergy = energyContainer.getEnergyBeyondMaxTemperature();
//      if ( excessEnergy == 0 ) {
//        // Container is below max temperature, exchange energy normally.
//        double heatTransferConstant = getHeatTransferFactor( this.getEnergyContainerCategory(), energyContainer.getEnergyContainerCategory() );
//        int numFullTimeStepExchanges = (int) Math.floor( dt / MAX_HEAT_EXCHANGE_TIME_STEP );
//        double leftoverTime = dt - ( numFullTimeStepExchanges * MAX_HEAT_EXCHANGE_TIME_STEP );
//        for ( int i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
//          double timeStep = i < numFullTimeStepExchanges ? MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
//          double thermalEnergyGained = ( energyContainer.getTemperature() - getTemperature() ) * thermalContactLength * heatTransferConstant * timeStep;
//          energyContainer.changeEnergy( -thermalEnergyGained );
//          changeEnergy( thermalEnergyGained );
//        }
//      }
//      else {
//        // Item is at max temperature.  Shed all excess energy into the air.
//        energyContainer.changeEnergy( -excessEnergy );
//        changeEnergy( excessEnergy );
//      }
//    }
//  }
//
//  public void addEnergyChunk( EnergyChunk ec, Rectangle2D initialWanderConstraint ) {
//    ec.zPosition.set( 0.0 );
//    energyChunkList.add( ec );
//    energyChunkWanderControllers.add( new EnergyChunkWanderController( ec,
//        new Property<Vector2D>( new Vector2D( ec.position.x, SIZE.getHeight() ) ),
//      initialWanderConstraint ) );
//  }
//
//  public EnergyChunk requestEnergyChunk( Vector2D point ) {
//    // Create a new chunk at the top of the air above the specified point.
//    return new EnergyChunk( EnergyType.THERMAL, point.getX(), SIZE.getHeight(), energyChunksVisible );
//  }
//
//  public Vector2D getCenterPoint() {
//    return new Vector2D( 0, SIZE.getHeight() / 2 );
//  }
//
//  public ThermalContactArea getThermalContactArea() {
//    return THERMAL_CONTACT_AREA;
//  }
//
//  public double getTemperature() {
//    return energy / ( MASS * SPECIFIC_HEAT );
//  }
//
//  public ObservableList<EnergyChunk> getEnergyChunkList() {
//    return energyChunkList;
//  }
//
//  public EnergyContainerCategory getEnergyContainerCategory() {
//    return EnergyContainerCategory.AIR;
//  }
//
//  public double getEnergyBeyondMaxTemperature() {
//    // Air temperature is unlimited.
//    return 0;
//  }
//}
