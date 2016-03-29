// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Random = require( 'DOT/Random' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var WATER_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/water_icon.png' );
  var WIRE_BLACK_62 = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_62.png' );
  var WIRE_BLACK_RIGHT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_right.png' );
  var ELEMENT_BASE_BACK = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var ELEMENT_BASE_FRONT = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var HEATER_ELEMENT = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element.png' );
  var HEATER_ELEMENT_DARK = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element_dark.png' );

  var HEATER_ELEMENT_OFFSET = new Vector2( -0.002, 0.022 );

  var WIRE_STRAIGHT_IMAGE = new EFACModelImage( WIRE_BLACK_62, WIRE_BLACK_62.width, new Vector2( -0.036, -0.04 ) );
  var WIRE_CURVE_IMAGE = new EFACModelImage( WIRE_BLACK_RIGHT, WIRE_BLACK_RIGHT.width, new Vector2( -0.009, -0.016 ) );
  var ELEMENT_BASE_BACK_IMAGE = new EFACModelImage( ELEMENT_BASE_BACK, ELEMENT_BASE_BACK.width, new Vector2( 0, 0 ) );
  var ELEMENT_BASE_FRONT_IMAGE = new EFACModelImage( ELEMENT_BASE_FRONT, ELEMENT_BASE_FRONT.width, new Vector2( 0, 0.0005 ) );
  var HEATER_ELEMENT_OFF_IMAGE = new EFACModelImage( HEATER_ELEMENT_DARK, HEATER_ELEMENT_DARK.width, HEATER_ELEMENT_OFFSET );
  var HEATER_ELEMENT_ON_IMAGE = new EFACModelImage( HEATER_ELEMENT, HEATER_ELEMENT.width, HEATER_ELEMENT_OFFSET );

  var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.04 );
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0005, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0, -0.01 );
  var OFFSET_TO_CONVERSION_POINT = new Vector2( 0, 0.012 );

  var RAND = new Random();
  var BEAKER_WIDTH = 0.075; // In meters.
  var BEAKER_HEIGHT = BEAKER_WIDTH * 0.9;
  var BEAKER_OFFSET = new Vector2( 0, 0.025 );
  var THERMOMETER_OFFSET = new Vector2( 0.033, 0.035 );
  var HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY = 0.0075; // In meters/sec, quite slow.
  var HEATER_ELEMENT_2D_HEIGHT = HEATER_ELEMENT_OFF_IMAGE.height;
  var MAX_HEAT_GENERATION_RATE = 5000; // Joules/sec, not connected to incoming energy.
  var RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.2; // In meters.
  var HEAT_ENERGY_CHANGE_RATE = 0.5; // In proportion per second.

  function BeakerHeater( energyChunksVisible ) {

    EnergyUser.call( this, new Image( WATER_ICON ) );
    this.energyChunksVisible = energyChunksVisible;

    this.addProperty( 'heatProportion', 0 );
    this.electricalEnergyChunkMovers = [];
    this.heatingElementEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];

    this.beaker = new Beaker( BEAKER_OFFSET, BEAKER_WIDTH, BEAKER_HEIGHT, energyChunksVisible );

    // this.thermometer = new Thermometer( clock, new ITemperatureModel() {
    //   public TemperatureAndColor getTemperatureAndColorAtLocation( Vector2D location ) {
    //     return new TemperatureAndColor( beaker.getTemperature(), EFACConstants.WATER_COLOR_OPAQUE );
    //   }
    // }, THERMOMETER_OFFSET, true );

    this.radiatedEnergyChunkList = new ObservableArray();

    // // Update the position of the beaker and thermometer when the overall
    // // model element position changes.
    // getObservablePosition().addObserver( new VoidFunction1 < Vector2D > () {
    //   public void apply( Vector2D position ) {
    //     beaker.position.set( position.plus( BEAKER_OFFSET ) );
    //     thermometer.position.set( position.plus( THERMOMETER_OFFSET ) );
    //   }
    // } );

  }

  energyFormsAndChanges.register( 'BeakerHeater', BeakerHeater );

  return inherit( EnergyUser, BeakerHeater, {
    passLint: function() {
      console.log(
        OFFSET_TO_LEFT_SIDE_OF_WIRE,
        OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND,
        OFFSET_TO_FIRST_WIRE_CURVE_POINT,
        OFFSET_TO_SECOND_WIRE_CURVE_POINT,
        OFFSET_TO_THIRD_WIRE_CURVE_POINT,
        OFFSET_TO_BOTTOM_OF_CONNECTOR,
        OFFSET_TO_CONVERSION_POINT,
        RAND,
        BEAKER_HEIGHT,
        BEAKER_OFFSET,
        THERMOMETER_OFFSET,
        HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY,
        HEATER_ELEMENT_2D_HEIGHT,
        MAX_HEAT_GENERATION_RATE,
        RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE,
        HEAT_ENERGY_CHANGE_RATE );
    },

    /**
     * [step description]
     *
     * @param  {Number} dt timestep
     * @param  {Energy} incomingEnergy [description]
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {},

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
    moveThermalEnergyChunks: function( dt ) {},

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

    deactivate: function() {},

    clearEnergyChunks: function() {},

    /**
     * [description]
     *
     * @param  {Vector2} startingPoint [description]
     *
     * @return {Array<Vector2>} [description]
     * @private
     */
    createHeaterElementEnergyChunkPath: function( startingPoint ) {},

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
     * [description]
     *
     * @param  {Vector2} startingPoint [description]
     *
     * @return {Array<Vector2>} [description]
     * @private
     */
    createRadiatedEnergyChunkPath: function( startingPoint ) {}

  }, {
    WIRE_STRAIGHT_IMAGE: WIRE_STRAIGHT_IMAGE,
    WIRE_CURVE_IMAGE: WIRE_CURVE_IMAGE,
    ELEMENT_BASE_BACK_IMAGE: ELEMENT_BASE_BACK_IMAGE,
    HEATER_ELEMENT_OFF_IMAGE: HEATER_ELEMENT_OFF_IMAGE,
    HEATER_ELEMENT_ON_IMAGE: HEATER_ELEMENT_ON_IMAGE,
    ELEMENT_BASE_FRONT_IMAGE: ELEMENT_BASE_FRONT_IMAGE
  } );
} );