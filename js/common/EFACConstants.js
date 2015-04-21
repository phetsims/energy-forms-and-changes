// Copyright 2002-2015, University of Colorado Boulder


/**
 * Shared constants used in multiple locations within the sim.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
//  var Brick = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Brick' );
  var Color = require( 'SCENERY/util/Color' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  //var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var FRAMES_PER_SECOND = 60.0;
  var SIM_TIME_PER_TICK_NORMAL = 1 / FRAMES_PER_SECOND;
  var NOMINAL_WATER_OPACITY = 0.75;

  var FIRST_TAB_BACKGROUND_COLOR = new Color( 245, 235, 175 );

  var Z_TO_X_OFFSET_MULTIPLIER = -0.25;
  var Z_TO_Y_OFFSET_MULTIPLIER = -0.25;

  var LOW_ENERGY_FOR_MAP_FUNCTION = 200;
  var HIGH_ENERGY_FOR_MAP_FUNCTION = 100;
  var NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING = 1.25;
  var NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP = 2.4; //Close to rounding to 3 so that little energy needed to transfer a chunk.

  var MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE = new LinearFunction( LOW_ENERGY_FOR_MAP_FUNCTION,
    HIGH_ENERGY_FOR_MAP_FUNCTION,
    NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
    NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP );

  var MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE = new LinearFunction( NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
    NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP,
    LOW_ENERGY_FOR_MAP_FUNCTION,
    HIGH_ENERGY_FOR_MAP_FUNCTION );


  return {
    ROOM_TEMPERATURE: 296, // In Kelvin.
    FREEZING_POINT_TEMPERATURE: 273.15, // In Kelvin.
    BOILING_POINT_TEMPERATURE: 373.15, // In Kelvin.

    // Time values for normal and fast-forward motion.
    FRAMES_PER_SECOND: 30.0,
    SIM_TIME_PER_TICK_NORMAL: 1 / FRAMES_PER_SECOND,
    SIM_TIME_PER_TICK_FAST_FORWARD: SIM_TIME_PER_TICK_NORMAL * 4,
    MAX_HEAT_EXCHANGE_TIME_STEP: SIM_TIME_PER_TICK_NORMAL,

    // Constants used for creating projections that have a 3D-ish look.
    Z_TO_X_OFFSET_MULTIPLIER: -0.25,
    Z_TO_Y_OFFSET_MULTIPLIER: -0.25,

    MAP_Z_TO_XY_OFFSET: function( zValue ) {
      return new Vector2( zValue * Z_TO_X_OFFSET_MULTIPLIER, zValue * Z_TO_Y_OFFSET_MULTIPLIER );
    },

    // For comparing temperatures.
    SIGNIFICANT_TEMPERATURE_DIFFERENCE: 1E-3, // In degrees K.

    // Constant function for energy chunk mapping. The basis for this function
    // is that the brick has 2 energy chunks at room temp, one at the freezing
    // point of water.

//TODO uncomment
    // LOW_ENERGY_FOR_MAP_FUNCTION: Brick.ENERGY_AT_WATER_FREEZING_TEMPERATURE,
    // HIGH_ENERGY_FOR_MAP_FUNCTION: Brick.ENERGY_AT_ROOM_TEMPERATURE,


    ENERGY_TO_NUM_CHUNKS_MAPPER: function( energy ) {
      return Math.max( Math.round( MAP_ENERGY_TO_NUM_CHUNKS_DOUBLE( energy ) ), 0 );
    },

    ENERGY_PER_CHUNK: MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE( 2 ) - MAP_NUM_CHUNKS_TO_ENERGY_DOUBLE( 1 ),

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

    // Constants that control the speed of the energy chunks
    ENERGY_CHUNK_VELOCITY: 0.04, // In meters/sec.

    // Constants that define surface width and edge properties of various rectangular objects
    SURFACE_WIDTH: 0.045,
    PERSPECTIVE_EDGE_PROPORTION: Math.sqrt( Math.pow( Z_TO_X_OFFSET_MULTIPLIER, 2 ) +
                                             Math.pow( Z_TO_Y_OFFSET_MULTIPLIER, 2 ) ),
    PERSPECTIVE_ANGLE: Math.atan2( -Z_TO_Y_OFFSET_MULTIPLIER, -Z_TO_X_OFFSET_MULTIPLIER ),

    // Constants for the burners.
    INITIAL_FLUID_LEVEL: 0.5,
    BURNER_EDGE_TO_HEIGHT_RATIO: 0.2, // Multiplier empirically determined for best look.
    BURNER_PERSPECTIVE_ANGLE: Math.PI / 4 // Positive is counterclockwise, a value of 0 produces a non-skewed rectangle.
  };
} );
