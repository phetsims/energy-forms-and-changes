// Copyright 2014-2015, University of Colorado Boulder

/**
 * Shared constants used in multiple locations within the sim.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  // modules
  //var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Color = require( 'SCENERY/util/Color' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants used for creating projections that have a 3D-ish look.
  var Z_TO_X_OFFSET_MULTIPLIER = -0.25;
  var Z_TO_Y_OFFSET_MULTIPLIER = -0.25;

  // Physical temperature constants.
  var ROOM_TEMPERATURE = 296; // In Kelvin.
  var FREEZING_POINT_TEMPERATURE = 273.15; // In Kelvin.
  //var BOILING_POINT_TEMPERATURE = 373.15; // In Kelvin.

  // constants that define physical parameters of various rectangular objects.
  var BRICK_DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.
  var BRICK_SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
  var BLOCK_SURFACE_WIDTH = 0.045;

  // Some brick constants needed for energy chunk mapping.
  var BRICK_ENERGY_AT_ROOM_TEMPERATURE = Math.pow( BLOCK_SURFACE_WIDTH, 3 ) * BRICK_DENSITY * BRICK_SPECIFIC_HEAT * ROOM_TEMPERATURE; // In joules.
  var BRICK_ENERGY_AT_FREEZING_TEMPERATURE = Math.pow( BLOCK_SURFACE_WIDTH, 3 ) * BRICK_DENSITY * BRICK_SPECIFIC_HEAT * FREEZING_POINT_TEMPERATURE; // In joules.

  // constants for mapping functions.
  var LOW_ENERGY_FOR_MAP_FUNCTION = BRICK_ENERGY_AT_FREEZING_TEMPERATURE;
  var HIGH_ENERGY_FOR_MAP_FUNCTION = BRICK_ENERGY_AT_ROOM_TEMPERATURE;
  var NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING = 1.25;
  var NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP = 2.4; //Close to rounding to 3 so that little energy needed to transfer a chunk.

  // Time values for normal and fast-forward motion.
  var FRAMES_PER_SECOND = 60.0;
  var SIM_TIME_PER_TICK_NORMAL = 1 / FRAMES_PER_SECOND;

  // Colors that are used in multiple places.
  var NOMINAL_WATER_OPACITY = 0.75;
  var FIRST_TAB_BACKGROUND_COLOR = new Color( 245, 235, 175 );

  // Mapping function that maps the energy to the number of energy chunks.
  var MAP_ENERGY_TO_NUM_CHUNKS = new LinearFunction(
    LOW_ENERGY_FOR_MAP_FUNCTION,
    HIGH_ENERGY_FOR_MAP_FUNCTION,
    NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
    NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP );

  // Mapping function that maps the number of chunks of energy to the energy value.
  var MAP_NUM_CHUNKS_TO_ENERGY = new LinearFunction( NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
    NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP,
    LOW_ENERGY_FOR_MAP_FUNCTION,
    HIGH_ENERGY_FOR_MAP_FUNCTION );

  var EFACConstants = {

    // Physical temperature constants.
    ROOM_TEMPERATURE: 296, // In Kelvin.
    FREEZING_POINT_TEMPERATURE: 273.15, // In Kelvin.
    BOILING_POINT_TEMPERATURE: 373.15, // In Kelvin.

    // Mapping function that maps the energy to the number of energy chunks.
    MAP_ENERGY_TO_NUM_CHUNKS: MAP_ENERGY_TO_NUM_CHUNKS,

    // Mapping function that maps the number of chunks of energy to the energy value.
    MAP_NUM_CHUNKS_TO_ENERGY: MAP_NUM_CHUNKS_TO_ENERGY,

    // Time values for normal and fast-forward motion.
    FRAMES_PER_SECOND: FRAMES_PER_SECOND,
    SIM_TIME_PER_TICK_NORMAL: 1 / FRAMES_PER_SECOND,
    SIM_TIME_PER_TICK_FAST_FORWARD: SIM_TIME_PER_TICK_NORMAL * 4,
    MAX_HEAT_EXCHANGE_TIME_STEP: SIM_TIME_PER_TICK_NORMAL,

    MAP_Z_TO_XY_OFFSET: function( zValue ) {
      return new Vector2( zValue * Z_TO_X_OFFSET_MULTIPLIER, zValue * Z_TO_Y_OFFSET_MULTIPLIER );
    },

    // For comparing temperatures.
    SIGNIFICANT_TEMPERATURE_DIFFERENCE: 1E-3, // In degrees K.

    ENERGY_TO_NUM_CHUNKS_MAPPER: function( energy ) {
      return Math.max( Util.roundSymmetric( MAP_ENERGY_TO_NUM_CHUNKS( energy ) ), 0 );
    },

    ENERGY_PER_CHUNK: MAP_NUM_CHUNKS_TO_ENERGY( 2 ) - MAP_NUM_CHUNKS_TO_ENERGY( 1 ),

    // Threshold for deciding when two temperatures can be considered equal.
    TEMPERATURES_EQUAL_THRESHOLD: 1E-6, // In Kelvin.

    // Constant used by all of the "energy systems" in order to keep the amount
    // of energy generated, converted, and consumed consistent.
    MAX_ENERGY_PRODUCTION_RATE: 10000, // In joules/sec.

    // Colors that are used in multiple places.
    NOMINAL_WATER_OPACITY: 0.75,
    WATER_COLOR_OPAQUE: new Color( 175, 238, 238 ),
    WATER_COLOR_IN_BEAKER: new Color( 175, 238, 238, NOMINAL_WATER_OPACITY ),
    FIRST_TAB_BACKGROUND_COLOR: new Color( 245, 235, 175 ),
    SECOND_TAB_BACKGROUND_COLOR: FIRST_TAB_BACKGROUND_COLOR,
    CONTROL_PANEL_BACKGROUND_COLOR: new Color( 199, 229, 199 ), // Pale gray green.  JB, NP, and AP voted on this as a fave.  Maybe too close to water though.

    CONTROL_PANEL_OUTLINE_LINE_WIDTH: 1.5,
    CONTROL_PANEL_OUTLINE_STROKE: 'black',
    CLOCK_CONTROL_BACKGROUND_COLOR: new Color( 120, 120, 120 ),

    // Model-view transform scale factor for Energy Systems tab.
    ENERGY_SYSTEMS_MVT_SCALE_FACTOR: 2200,

    // constants that control the speed of the energy chunks
    ENERGY_CHUNK_VELOCITY: 0.04, // In meters/sec.

    // constants that define physical parameters of various rectangular objects.
    BRICK_DENSITY: 3300, // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.
    BRICK_SPECIFIC_HEAT: 840, // In J/kg-K, source = design document.
    BLOCK_SURFACE_WIDTH: 0.045,
    BLOCK_PERSPECTIVE_EDGE_PROPORTION: Math.sqrt( Math.pow( Z_TO_X_OFFSET_MULTIPLIER, 2 ) +
      Math.pow( Z_TO_Y_OFFSET_MULTIPLIER, 2 ) ),
    BLOCK_PERSPECTIVE_ANGLE: Math.atan2( -Z_TO_Y_OFFSET_MULTIPLIER, -Z_TO_X_OFFSET_MULTIPLIER ),

    // constants for the burners.
    INITIAL_FLUID_LEVEL: 0.5,
    BURNER_EDGE_TO_HEIGHT_RATIO: 0.2, // Multiplier empirically determined for best look.
    BURNER_PERSPECTIVE_ANGLE: Math.PI / 4, // Positive is counterclockwise, a value of 0 produces a non-skewed rectangle.

    // constants used for creating projections that have a 3D-ish look.
    Z_TO_X_OFFSET_MULTIPLIER: Z_TO_X_OFFSET_MULTIPLIER,
    Z_TO_Y_OFFSET_MULTIPLIER: Z_TO_Y_OFFSET_MULTIPLIER
  };

  energyFormsAndChanges.register( 'EFACConstants', EFACConstants );

  return EFACConstants;
} );

