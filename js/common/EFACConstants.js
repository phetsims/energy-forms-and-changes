// Copyright 2014-2021, University of Colorado Boulder

/**
 * shared constants for the Energy Forms and Changes simulation
 *
 * @author John Blanco
 */

import LinearFunction from '../../../dot/js/LinearFunction.js';
import Utils from '../../../dot/js/Utils.js';
import Vector2 from '../../../dot/js/Vector2.js';
import ScreenView from '../../../joist/js/ScreenView.js';
import { Color } from '../../../scenery/js/imports.js';
import energyFormsAndChanges from '../energyFormsAndChanges.js';

// constants used for creating projections that have a 3D-ish look.
const Z_TO_X_OFFSET_MULTIPLIER = -0.25;
const Z_TO_Y_OFFSET_MULTIPLIER = -0.25;

// physical temperature constants
const ROOM_TEMPERATURE = 296; // in degrees Kelvin
const WATER_FREEZING_POINT_TEMPERATURE = 273.15; // in degrees Kelvin

// constants that define physical parameters of various rectangular objects.
const BRICK_DENSITY = 3300; // in kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable
const BRICK_SPECIFIC_HEAT = 840; // in J/kg-K, source = design document
const BLOCK_SURFACE_WIDTH = 0.045;

// brick constants needed for energy chunk mapping
const BRICK_ENERGY_AT_ROOM_TEMPERATURE = Math.pow( BLOCK_SURFACE_WIDTH, 3 ) * BRICK_DENSITY * BRICK_SPECIFIC_HEAT * ROOM_TEMPERATURE; // In joules.
const BRICK_ENERGY_AT_FREEZING_TEMPERATURE = Math.pow( BLOCK_SURFACE_WIDTH, 3 ) * BRICK_DENSITY * BRICK_SPECIFIC_HEAT * WATER_FREEZING_POINT_TEMPERATURE; // In joules.

// constants for temperature-energy mapping functions
const LOW_ENERGY_FOR_MAP_FUNCTION = BRICK_ENERGY_AT_FREEZING_TEMPERATURE;
const HIGH_ENERGY_FOR_MAP_FUNCTION = BRICK_ENERGY_AT_ROOM_TEMPERATURE;

// empirically determined
const NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING = 1.25;
const NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP = 2.4; // close to rounding to 3 so that little energy needed to transfer first chunk

// time values for normal and fast-forward motion
const FRAMES_PER_SECOND = 60.0;
const SIM_TIME_PER_TICK_NORMAL = 1 / FRAMES_PER_SECOND;

// colors
const NOMINAL_WATER_OPACITY = 0.75;
const FIRST_SCREEN_BACKGROUND_COLOR = new Color( 249, 244, 205 );
const SECOND_SCREEN_BACKGROUND_COLOR = new Color( 249, 244, 205 );

// mapping function that maps the energy to the number of energy chunks
const MAP_ENERGY_TO_NUM_CHUNKS = new LinearFunction(
  LOW_ENERGY_FOR_MAP_FUNCTION,
  HIGH_ENERGY_FOR_MAP_FUNCTION,
  NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
  NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP
);

// mapping function that maps the number of chunks of energy to the energy value
const MAP_NUM_CHUNKS_TO_ENERGY = new LinearFunction(
  NUM_ENERGY_CHUNKS_IN_BRICK_AT_FREEZING,
  NUM_ENERGY_CHUNKS_IN_BRICK_AT_ROOM_TEMP,
  LOW_ENERGY_FOR_MAP_FUNCTION,
  HIGH_ENERGY_FOR_MAP_FUNCTION
);

const EFACConstants = {

  // intro screen customization
  IRON_KEY: 'iron', // used to validate query parameter values and map to the corresponding Enumeration type
  BRICK_KEY: 'brick',
  WATER_KEY: 'water',
  OLIVE_OIL_KEY: 'oliveOil',

  // modify with caution - the intro screen element layout heavily relies on these
  MAX_NUMBER_OF_INTRO_ELEMENTS: 4,
  MAX_NUMBER_OF_INTRO_BURNERS: 2,
  MAX_NUMBER_OF_INTRO_BEAKERS: 2,

  // Cap large dt values, which occur when the tab containing the sim had been hidden and then re-shown
  maxDT: 0.1,

  // physical temperature constants
  ROOM_TEMPERATURE: ROOM_TEMPERATURE,
  WATER_FREEZING_POINT_TEMPERATURE: WATER_FREEZING_POINT_TEMPERATURE, // in degrees Kelvin
  WATER_BOILING_POINT_TEMPERATURE: 373.15, // in degrees Kelvin
  OLIVE_OIL_BOILING_POINT_TEMPERATURE: 573.15, // in degrees Kelvin

  // mapping function that maps the energy to the number of energy chunks
  MAP_ENERGY_TO_NUM_CHUNKS: MAP_ENERGY_TO_NUM_CHUNKS,

  // mapping function that maps the number of chunks of energy to the energy value
  MAP_NUM_CHUNKS_TO_ENERGY: MAP_NUM_CHUNKS_TO_ENERGY,

  // time values for normal and fast-forward motion
  FRAMES_PER_SECOND: FRAMES_PER_SECOND,
  SIM_TIME_PER_TICK_NORMAL: 1 / FRAMES_PER_SECOND,
  MAX_HEAT_EXCHANGE_TIME_STEP: SIM_TIME_PER_TICK_NORMAL,

  MAP_Z_TO_XY_OFFSET: zValue => {
    return new Vector2( zValue * Z_TO_X_OFFSET_MULTIPLIER, zValue * Z_TO_Y_OFFSET_MULTIPLIER );
  },

  // for comparing temperatures
  SIGNIFICANT_TEMPERATURE_DIFFERENCE: 1E-3, // in degrees Kelvin

  ENERGY_TO_NUM_CHUNKS_MAPPER: energy => {
    return Math.max( Utils.roundSymmetric( MAP_ENERGY_TO_NUM_CHUNKS.evaluate( energy ) ), 0 );
  },

  ENERGY_PER_CHUNK: MAP_NUM_CHUNKS_TO_ENERGY.evaluate( 2 ) - MAP_NUM_CHUNKS_TO_ENERGY.evaluate( 1 ),

  // threshold for deciding when two temperatures can be considered equal
  TEMPERATURES_EQUAL_THRESHOLD: 1E-6, // in degrees Kelvin

  // Constant used by all of the "energy systems" in order to keep the amount of energy generated, converted, and
  // consumed consistent.
  MAX_ENERGY_PRODUCTION_RATE: 10000, // in joules/sec

  // colors
  NOMINAL_WATER_OPACITY: 0.7,
  WATER_COLOR_OPAQUE: new Color( 175, 238, 238 ),
  WATER_COLOR_IN_BEAKER: new Color( 175, 238, 238, NOMINAL_WATER_OPACITY ),
  WATER_STEAM_COLOR: new Color( 255, 255, 255 ),
  OLIVE_OIL_COLOR_IN_BEAKER: new Color( 255, 210, 0 ),
  OLIVE_OIL_STEAM_COLOR: new Color( 230, 230, 230 ),
  FIRST_SCREEN_BACKGROUND_COLOR: FIRST_SCREEN_BACKGROUND_COLOR,
  SECOND_SCREEN_BACKGROUND_COLOR: SECOND_SCREEN_BACKGROUND_COLOR,
  CONTROL_PANEL_BACKGROUND_COLOR: new Color( 229, 236, 255 ), // Pale gray purple. AP, AR, and CK like this.
  TEMPERATURE_SENSOR_INACTIVE_COLOR: new Color( 'white' ),

  // appearance of controls
  CONTROL_PANEL_OUTLINE_LINE_WIDTH: 1.5,
  CONTROL_PANEL_OUTLINE_STROKE: new Color( 120, 120, 120 ),
  CLOCK_CONTROL_BACKGROUND_COLOR: new Color( 160, 160, 160 ),
  ENERGY_SYMBOLS_PANEL_CORNER_RADIUS: 6,
  ENERGY_SYMBOLS_PANEL_MIN_WIDTH: 215,
  ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH: 180,
  ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION: 5,
  CONTROL_PANEL_CORNER_RADIUS: 10,
  RESET_ALL_BUTTON_RADIUS: 20,
  PLAY_PAUSE_BUTTON_RADIUS: 20,
  STEP_FORWARD_BUTTON_RADIUS: 15,

  // used to scale down the element base image, which is used in multiple system elements
  ELEMENT_BASE_WIDTH: 72,

  // used to scale down the wire images, which are used in multiple system elements
  WIRE_IMAGE_SCALE: 0.48,

  // model-view transform scale factors for each screen - smaller zooms out, larger zooms in
  INTRO_MVT_SCALE_FACTOR: 1700,
  SYSTEMS_MVT_SCALE_FACTOR: 2200,

  // constants for energy chunks
  ENERGY_CHUNK_VELOCITY: 0.04, // in meters/sec
  ENERGY_CHUNK_WIDTH: 19, // in screen coords, which are close to pixels. Empirically determined to look nice.

  // the maximum number of times that the energy chunk distribution algorithm should run when initializing energy
  // chunks in their containers. Containers like the water beaker can take more cycles than this threshold, but cause
  // the sim reset time to be too long if not limited.
  MAX_NUMBER_OF_INITIALIZATION_DISTRIBUTION_CYCLES: 500,

  // max travel height of energy chunks, in meters. the y-center position and zoom factors are different on each
  // screen, so these were empirically determined to visually match on both screens
  INTRO_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT: 0.85,
  SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT: 0.55,

  // constants that define physical parameters of various objects
  WATER_SPECIFIC_HEAT: 3000, // In J/kg-K.  The real value for water is 4186, but this was adjusted so that there
                             // aren't too many chunks and so that a chunk is needed as soon as heating starts.
  WATER_DENSITY: 1000.0, // In kg/m^3, source = design document (and common knowledge).
  OLIVE_OIL_SPECIFIC_HEAT: 1411, // In J/kg-K. real value is 1970 (need to confirm) but this is scaled to match water
  OLIVE_OIL_DENSITY: 916.0, // In kg/m^3, need to confirm with design doc
  BRICK_SPECIFIC_HEAT: BRICK_SPECIFIC_HEAT,
  BRICK_DENSITY: BRICK_DENSITY,
  IRON_SPECIFIC_HEAT: 450, // In J/kg-K, source = design doc
  IRON_DENSITY: 7800, // In kg/m^3, source = design doc
  BLOCK_SURFACE_WIDTH: 0.045,
  BLOCK_PERSPECTIVE_EDGE_PROPORTION: Math.sqrt( Math.pow( Z_TO_X_OFFSET_MULTIPLIER, 2 ) +
                                                Math.pow( Z_TO_Y_OFFSET_MULTIPLIER, 2 ) ),
  BLOCK_PERSPECTIVE_ANGLE: Math.atan2( -Z_TO_Y_OFFSET_MULTIPLIER, -Z_TO_X_OFFSET_MULTIPLIER ),
  FADE_COEFFICIENT_IN_AIR: 0.005,

  // constants for the burners.
  INITIAL_FLUID_PROPORTION: 0.5,
  BURNER_EDGE_TO_HEIGHT_RATIO: 0.2, // multiplier empirically determined for best look
  BURNER_PERSPECTIVE_ANGLE: Math.PI / 4, // positive is counterclockwise, a value of 0 produces a non-skewed rectangle

  // constants used for creating projections that have a 3D-ish look
  Z_TO_X_OFFSET_MULTIPLIER: Z_TO_X_OFFSET_MULTIPLIER,
  Z_TO_Y_OFFSET_MULTIPLIER: Z_TO_Y_OFFSET_MULTIPLIER,

  // use the default layout bounds
  SCREEN_LAYOUT_BOUNDS: ScreenView.DEFAULT_LAYOUT_BOUNDS

  // A note for energy-forms-and-changes-strings_en.json (which cannot have comments): the keys for the screen names
  // are incorrect, as they do not follow the form 'screen.{{screenName}}', but the sim was published and translated
  // before that was noticed. See https://github.com/phetsims/energy-forms-and-changes/issues/249 for discussion.
};

energyFormsAndChanges.register( 'EFACConstants', EFACConstants );
export default EFACConstants;
