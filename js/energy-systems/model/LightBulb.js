// Copyright 2016, University of Colorado Boulder

/**
 * Base class for light bulbs in the model.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  // var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  // var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var inherit = require( 'PHET_CORE/inherit' );
  // var Image = require( 'SCENERY/nodes/Image' );
  // var Random = require( 'DOT/Random' );
  // var Vector2 = require( 'DOT/Vector2' );

  // Images
  var ELEMENT_BASE_BACK = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var ELEMENT_BASE_FRONT = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var WIRE_BLACK_62 = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_62.png' );
  var WIRE_BLACK_RIGHT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_right.png' );

  // Constants - uncomment as needed
  // var WIRE_FLAT_IMAGE = new EFACModelImage( WIRE_BLACK_62, WIRE_BLACK_62.width, new Vector2( -0.036, -0.04 ) );
  // var WIRE_CURVE_IMAGE = new EFACModelImage( WIRE_BLACK_RIGHT, WIRE_BLACK_RIGHT.width, new Vector2( -0.009, -0.016 ) );
  // var ELEMENT_BASE_FRONT_IMAGE = new EFACModelImage( ELEMENT_BASE_FRONT, ELEMENT_BASE_FRONT.width, new Vector2( 0, 0.0 ) );
  // var ELEMENT_BASE_BACK_IMAGE = new EFACModelImage( ELEMENT_BASE_BACK, ELEMENT_BASE_BACK.width, new Vector2( 0, 0.0 ) );

  // var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.04 );
  // var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  // var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  // var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  // var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0005, -0.0175 );
  // var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0, -0.01 );
  // var OFFSET_TO_RADIATE_POINT = new Vector2( 0, 0.066 );

  // var RADIATED_ENERGY_CHUNK_MAX_DISTANCE = 0.5;
  // var RAND = new Random();
  // var THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range( 2, 2.5 );
  // var ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
  // var LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
  // var LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

  /**
   * @param {Image} iconImage
   * @param {Boolean} hasFilament
   * @param {Property<Boolean>} energyChunksVisible
   * @constructor
   */
  function LightBulb( iconImage, hasFilament, energyChunksVisible ) {

    EnergyUser.call( this, iconImage );

    this.hasFilament = hasFilament;
    this.energyChunksVisible = energyChunksVisible;

    // Fewer thermal energy chunks are radiated for bulbs without a filament.
    this.proportionOfThermalChunksRadiated = hasFilament ? 0.35 : 0.2;

    this.addProperty( 'litProportion', 0 );
    this.electricalEnergyChunkMovers = [];
    this.filamentEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
  }

  return inherit( EnergyUser, LightBulb, {
    /**
     * [stepInTime description]
     *
     * @param  {Number} dt timestep
     * @param  {Energy} incomingEnergy [description]
     * @public
     * @override
     */
    stepInTime: function( dt, incomingEnergy ) {},

    /**
     * [description]
     *
     * @param  {Number} dt timestep
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {},

    /**
     * [description]
     *
     * @param  {Number} dt timestep
     * @private
     */
    moveFilamentEnergyChunks: function( dt ) {},

    /**
     * [description]
     *
     * @param  {Number} dt timestep
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {},

    /**
     * [preLoadEnergyChunks description]
     *
     * @param  {Energy} incomingEnergyRate [description]
     * @public
     * @override
     */
    preLoadEnergyChunks: function( incomingEnergyRate ) {},

    /**
     * [description]
     *
     * @param  {EnergyChunk} energyChunk [description]
     * @private
     */
    radiateEnergyChunk: function( energyChunk ) {},

    /**
     * [createThermalEnergyChunkPath description]
     *
     * @param  {Vector2} startingPoint [description]
     *
     * @return {Array<Vector2>} [description]
     * @private
     */
    createThermalEnergyChunkPath: function( startingPoint ) {},

    /**
     * [description]
     *
     * @param  {Vector2} center [description]
     *
     * @return {Array<Vector2>} [description]
     * @private
     */
    createElectricalEnergyChunkPath: function( center ) {},

    /**
     * [generateThermalChunkTimeOnFilament description]
     *
     * @return {Number} [description]
     * @private
     */
    generateThermalChunkTimeOnFilament: function() {},

    /**
     * [getTotalPathLength description]
     *
     * @return {Number} [description]
     * @private
     */
    getTotalPathLength: function() {},

    deactivate: function() {},

    clearEnergyChunks: function() {}

  }, {
    // Export module-scope consts for static access
    WIRE_BLACK_RIGHT: WIRE_BLACK_RIGHT,
    WIRE_BLACK_62: WIRE_BLACK_62,
    ELEMENT_BASE_FRONT: ELEMENT_BASE_FRONT,
    ELEMENT_BASE_BACK: ELEMENT_BASE_BACK
  } );
} );