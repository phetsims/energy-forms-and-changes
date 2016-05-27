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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'DOT/Random' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var ELEMENT_BASE_BACK = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var ELEMENT_BASE_FRONT = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var WIRE_BLACK_62 = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_62.png' );
  var WIRE_BLACK_RIGHT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_right.png' );

  // Constants - uncomment as needed
  var WIRE_FLAT_IMAGE = new EFACModelImage( WIRE_BLACK_62, new Vector2( -0.036, -0.04 ) );
  var WIRE_CURVE_IMAGE = new EFACModelImage( WIRE_BLACK_RIGHT, new Vector2( -0.009, -0.016 ) );
  var ELEMENT_BASE_FRONT_IMAGE = new EFACModelImage( ELEMENT_BASE_FRONT, new Vector2( 0, 0.0 ) );
  var ELEMENT_BASE_BACK_IMAGE = new EFACModelImage( ELEMENT_BASE_BACK, new Vector2( 0, 0.0 ) );

  var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.04 );
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0005, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0, -0.01 );
  var OFFSET_TO_RADIATE_POINT = new Vector2( 0, 0.066 );

  var RADIATED_ENERGY_CHUNK_MAX_DISTANCE = 0.5;
  var RAND = new Random();
  var THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range( 2, 2.5 );
  var ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
  var LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
  var LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

  /**
   * @param {Image} iconImage
   * @param {Boolean} hasFilament
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function LightBulb( iconImage, hasFilament, energyChunksVisibleProperty ) {

    EnergyUser.call( this, iconImage );

    this.hasFilament = hasFilament;
    this.energychunksVisibleProperty = energyChunksVisibleProperty;

    // Fewer thermal energy chunks are radiated for bulbs without a filament.
    this.proportionOfThermalChunksRadiated = hasFilament ? 0.35 : 0.2;

    this.addProperty( 'litProportion', 0 );
    this.electricalEnergyChunkMovers = [];
    this.filamentEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
    this.goRightNextTime = true; // @private
  }

  energyFormsAndChanges.register( 'LightBulb', LightBulb );

  return inherit( EnergyUser, LightBulb, {
    /**
     * [step description]
     *
     * @param  {Number} dt timestep
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {},

    /**
     *
     *
     * @param  {Number} dt timestep
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {},

    /**
     *
     *
     * @param  {Number} dt timestep
     * @private
     */
    moveFilamentEnergyChunks: function( dt ) {},

    /**
     *
     *
     * @param  {Number} dt timestep
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {},

    /**
     * [preLoadEnergyChunks description]
     *
     * @param  {Energy} incomingEnergyRate
     * @public
     * @override
     */
    preLoadEnergyChunks: function( incomingEnergyRate ) {},

    /**
     *
     *
     * @param  {EnergyChunk} energyChunk
     * @private
     */
    radiateEnergyChunk: function( energyChunk ) {
      if ( RAND.nextDouble() > this.proportionOfThermalChunksRadiated ) {
        energyChunk.energyType.set( EnergyType.LIGHT );
      } else {
        energyChunk.energyType.set( EnergyType.THERMAL );
      }

      // Path of radiated light chunks
      var path = [];

      path.push( this.position
        .plus( OFFSET_TO_RADIATE_POINT )
        .plus( new Vector2( 0, RADIATED_ENERGY_CHUNK_MAX_DISTANCE )
          .rotated( ( RAND.nextDouble() - 0.5 ) * ( Math.PI / 2 ) ) ) );

      this.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover(
        energyChunk,
        path,
        EFACConstants.ENERGY_CHUNK_VELOCITY ) );
    },

    /**
     * [createThermalEnergyChunkPath description]
     *
     * @param  {Vector2} startingPoint
     *
     * @return {Vector2[]}
     * @private
     */
    createThermalEnergyChunkPath: function( startingPoint ) {
      var path = [];
      var filamentWidth = 0.03;
      var x = ( 0.5 + RAND.nextDouble() / 2 ) * filamentWidth / 2 * ( this.goRightNextTime ? 1 : -1 );

      path.push( new Vector2( x, 0 ) );
      this.goRightNextTime = !this.goRightNextTime;

      return path;
    },

    /**
     * @param  {Vector2} center
     *
     * @return {Vector2[]}
     * @private
     */
    createElectricalEnergyChunkPath: function( center ) {
      var path = [];

      path.push( center.plus( OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND ) );
      path.push( center.plus( OFFSET_TO_FIRST_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SECOND_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_THIRD_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_BOTTOM_OF_CONNECTOR ) );
      path.push( center.plus( OFFSET_TO_RADIATE_POINT ) );

      return path;
    },

    /**
     * @return {Number} time
     * @private
     */
    generateThermalChunkTimeOnFilament: function() {
      return THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.min +
        RAND.nextDouble() * THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.getLength();
    },

    /**
     * @param {Vector2} startingLocation
     * @param {Vector2[]} pathPoints
     * @return {Number}
     * @private
     */
    getTotalPathLength: function( startingLocation, pathPoints ) {
      if ( pathPoints.length === 0 ) {
        return 0;
      }

      var pathLength = startingLocation.distance( pathPoints[ 0 ] );
      for ( var i = 0; i < pathPoints.length - 1; i++ ) {
        pathLength += pathPoints[ i ].distance( pathPoints[ i + 1 ] );
      }

      return pathLength;
    },

    /**
     * Deactivate the light bulb.
     * @public
     * @override
     */
    deactivate: function() {
      EnergyUser.prototype.deactivate.call( this );
      this.litProportionProperty.set( 0 );
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergyUser.prototype.clearEnergyChunks.call( this );
      this.electricalEnergyChunkMovers.length = 0;
      this.filamentEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;
    }

  }, {
    // Export module-scope consts for static access
    WIRE_BLACK_RIGHT: WIRE_BLACK_RIGHT,
    WIRE_BLACK_62: WIRE_BLACK_62,
    ELEMENT_BASE_FRONT: ELEMENT_BASE_FRONT,
    ELEMENT_BASE_BACK: ELEMENT_BASE_BACK,

    WIRE_FLAT_IMAGE: WIRE_FLAT_IMAGE,
    WIRE_CURVE_IMAGE: WIRE_CURVE_IMAGE,
    ELEMENT_BASE_FRONT_IMAGE: ELEMENT_BASE_FRONT_IMAGE,
    ELEMENT_BASE_BACK_IMAGE: ELEMENT_BASE_BACK_IMAGE
  } );
} );

