// Copyright 2002-2015, University of Colorado

/**
 * Class containing the constants that control the rate of heat transfer
 * between the various model elements that can contain heat, as well as methods
 * for obtaining the heat transfer value for any two model elements that are
 * capable of exchanging heat.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  function HeatTransferConstants() {
    var BRICK_IRON_HEAT_TRANSFER_FACTOR = 1000.0;
    var BRICK_WATER_HEAT_TRANSFER_FACTOR = 1000.0;
    var BRICK_AIR_HEAT_TRANSFER_FACTOR = 50.0;
    var IRON_WATER_HEAT_TRANSFER_FACTOR = 1000.0;
    var IRON_AIR_HEAT_TRANSFER_FACTOR = 50.0;
    var WATER_AIR_HEAT_TRANSFER_FACTOR = 50.0;
    this.AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR = 10000.0;

    this.heatTransferConstantsMap = {};
    this.heatTransferConstantsMap[ 'iron' ][ 'brick' ] = BRICK_IRON_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'brick' ][ 'iron' ] = BRICK_IRON_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'water' ][ 'brick' ] = BRICK_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'brick' ][ 'water' ] = BRICK_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'air' ][ 'brick' ] = BRICK_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'brick' ][ 'air' ] = BRICK_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'water' ][ 'air' ] = WATER_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'air' ][ 'water' ] = WATER_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'water' ][ 'iron' ] = IRON_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'iron' ][ 'water' ] = IRON_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'iron' ][ 'air' ] = IRON_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'air' ][ 'iron' ] = IRON_AIR_HEAT_TRANSFER_FACTOR;
  }

  return inherit( Object, HeatTransferConstants, {
    getHeatTransferFactor: function( element1, element2 ) {
      return this.heatTransferConstantsMap[ element1 ][ element2 ];
    },
    getAirToSurroundingAirHeatTransferFactor: function() {
      return this.AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR;
    }
  } );
} );


//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.util.HashMap;
//import java.util.Map;
//
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//
///**
// * Class containing the constants that control the rate of heat transfer
// * between the various model elements that can contain heat, as well as methods
// * for obtaining the heat transfer value for any two model elements that are
// * capable of exchanging heat.
// *
// * @author John Blanco
// */
//public class HeatTransferConstants {
//
//  // Heat transfer values.  NOTE: Originally, these were constants, but the
//  // design team requested that they be changeable via a developer control,
//  // which is why they are now properties.
//  public static final Property<Double> BRICK_IRON_HEAT_TRANSFER_FACTOR = new Property<Double>( 1000.0 );
//  public static final Property<Double> BRICK_WATER_HEAT_TRANSFER_FACTOR = new Property<Double>( 1000.0 );
//  public static final Property<Double> BRICK_AIR_HEAT_TRANSFER_FACTOR = new Property<Double>( 50.0 );
//  public static final Property<Double> IRON_WATER_HEAT_TRANSFER_FACTOR = new Property<Double>( 1000.0 );
//  public static final Property<Double> IRON_AIR_HEAT_TRANSFER_FACTOR = new Property<Double>( 50.0 );
//  public static final Property<Double> WATER_AIR_HEAT_TRANSFER_FACTOR = new Property<Double>( 50.0 );
//  public static final Property<Double> AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR = new Property<Double>( 10000.0 );
//
//  // Maps for obtaining transfer constants for a given thermal element.
//  private static final Map<EnergyContainerCategory, Property<Double>> HEAT_TRANSFER_FACTORS_FOR_BRICK = new HashMap<EnergyContainerCategory, Property<Double>>() {{
//    put( EnergyContainerCategory.IRON, BRICK_IRON_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.WATER, BRICK_WATER_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.AIR, BRICK_AIR_HEAT_TRANSFER_FACTOR );
//  }};
//  private static final Map<EnergyContainerCategory, Property<Double>> HEAT_TRANSFER_FACTORS_FOR_IRON = new HashMap<EnergyContainerCategory, Property<Double>>() {{
//    put( EnergyContainerCategory.BRICK, BRICK_IRON_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.WATER, BRICK_WATER_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.AIR, BRICK_AIR_HEAT_TRANSFER_FACTOR );
//  }};
//  private static final Map<EnergyContainerCategory, Property<Double>> HEAT_TRANSFER_FACTORS_FOR_WATER = new HashMap<EnergyContainerCategory, Property<Double>>() {{
//    put( EnergyContainerCategory.BRICK, BRICK_WATER_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.IRON, IRON_WATER_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.AIR, WATER_AIR_HEAT_TRANSFER_FACTOR );
//  }};
//  private static final Map<EnergyContainerCategory, Property<Double>> HEAT_TRANSFER_FACTORS_FOR_AIR = new HashMap<EnergyContainerCategory, Property<Double>>() {{
//    put( EnergyContainerCategory.BRICK, BRICK_AIR_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.IRON, IRON_AIR_HEAT_TRANSFER_FACTOR );
//    put( EnergyContainerCategory.WATER, WATER_AIR_HEAT_TRANSFER_FACTOR );
//  }};
//  private static final Map<EnergyContainerCategory, Map<EnergyContainerCategory, Property<Double>>> CONTAINER_CATEGORY_MAP = new HashMap<EnergyContainerCategory, Map<EnergyContainerCategory, Property<Double>>>() {{
//    put( EnergyContainerCategory.BRICK, HEAT_TRANSFER_FACTORS_FOR_BRICK );
//    put( EnergyContainerCategory.IRON, HEAT_TRANSFER_FACTORS_FOR_IRON );
//    put( EnergyContainerCategory.WATER, HEAT_TRANSFER_FACTORS_FOR_WATER );
//    put( EnergyContainerCategory.AIR, HEAT_TRANSFER_FACTORS_FOR_AIR );
//  }};
//
//  public static double getHeatTransferFactor( EnergyContainerCategory container1, EnergyContainerCategory container2 ) {
//    return CONTAINER_CATEGORY_MAP.get( container1 ).get( container2 ).get();
//  }
//}

