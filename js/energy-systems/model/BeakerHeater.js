// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  // var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/HeatTransferConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  // var Random = require( 'DOT/Random' );
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

  var WIRE_STRAIGHT_IMAGE = new EFACModelImage( WIRE_BLACK_62, new Vector2( -0.036, -0.04 ) );
  var WIRE_CURVE_IMAGE = new EFACModelImage( WIRE_BLACK_RIGHT, new Vector2( -0.009, -0.016 ) );
  var ELEMENT_BASE_BACK_IMAGE = new EFACModelImage( ELEMENT_BASE_BACK, new Vector2( 0, 0 ) );
  var ELEMENT_BASE_FRONT_IMAGE = new EFACModelImage( ELEMENT_BASE_FRONT, new Vector2( 0, 0.0005 ) );
  var HEATER_ELEMENT_OFF_IMAGE = new EFACModelImage( HEATER_ELEMENT_DARK, HEATER_ELEMENT_OFFSET );
  var HEATER_ELEMENT_ON_IMAGE = new EFACModelImage( HEATER_ELEMENT, HEATER_ELEMENT_OFFSET );

  // var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.04 );
  // var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  // var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  // var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  // var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0005, -0.0175 );
  // var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0, -0.01 );
  // var OFFSET_TO_CONVERSION_POINT = new Vector2( 0, 0.012 );

  // var RAND = new Random();
  var BEAKER_WIDTH = 0.075; // In meters.
  var BEAKER_HEIGHT = BEAKER_WIDTH * 0.9;
  var BEAKER_OFFSET = new Vector2( 0, 0.025 );
  // var THERMOMETER_OFFSET = new Vector2( 0.033, 0.035 );
  // var HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY = 0.0075; // In meters/sec, quite slow.
  // var HEATER_ELEMENT_2D_HEIGHT = HEATER_ELEMENT_OFF_IMAGE.height;
  var MAX_HEAT_GENERATION_RATE = 5000; // Joules/sec, not connected to incoming energy.
  // var RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.2; // In meters.
  var HEAT_ENERGY_CHANGE_RATE = 0.5; // In proportion per second.

  /**
   * @param {Property<Boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function BeakerHeater( energyChunksVisibleProperty ) {

    EnergyUser.call( this, new Image( WATER_ICON ) );
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    this.addProperty( 'heatProportion', 0 );
    this.electricalEnergyChunkMovers = [];
    this.heatingElementEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];

    this.beaker = new Beaker( BEAKER_OFFSET, BEAKER_WIDTH, BEAKER_HEIGHT, energyChunksVisibleProperty );

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

    /**
     * [step description]
     *
     * @param  {Number} dt timestep
     * @param  {Energy} incomingEnergy [description]
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      if ( !this.active ) {
        return;
      }

      // Handle any incoming energy chunks.
      if ( this.incomingEnergyChunks.length > 0 ) {
        this.incomingEnergyChunks.forEach( function( chunk ) {
          if ( chunk.energyType === EnergyType.ELECTRICAL ) {
            // Add the energy chunk to the list of those under management.
            this.energyChunkList.push( chunk );

            // And a "mover" that will move this energy chunk through
            // the wire to the heating element.
            // electricalEnergyChunkMovers.add( new EnergyChunkPathMover( incomingEnergyChunk,
            //   createElectricalEnergyChunkPath( getPosition() ),
            //   EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          } else {
            // By design, this shouldn't happen, so warn if it does.
            console.warn( 'Ignoring energy chunk with unexpected type ' + chunk.energyType );
          }

        } );

        // Clear incoming chunks array
        this.incomingEnergyChunks.length = 0;
      }
      this.moveElectricalEnergyChunks( dt );
      this.moveThermalEnergyChunks( dt );

      var energyFraction = incomingEnergy.amount / ( EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt );

      // Set the proportion of max heat being generated by the heater element.
      if ( ( this.energyChunksVisibleProperty.get() && this.heatingElementEnergyChunkMovers.length > 0 ) ||
        ( !this.energyChunksVisibleProperty.get() && incomingEnergy.type === EnergyType.ELECTRICAL ) ) {
        this.heatProportionProperty.set( Math.min( energyFraction, this.heatProportion + HEAT_ENERGY_CHANGE_RATE * dt ) );
      } else {
        this.heatProportionProperty.set( Math.max( 0, this.heatProportion - HEAT_ENERGY_CHANGE_RATE * dt ) );
      }

      // Add energy to the beaker based on heat coming from heat element.
      this.beaker.changeEnergy( this.heatProportion * MAX_HEAT_GENERATION_RATE * dt );

      // Remove energy from the beaker based on loss of heat to the
      // surrounding air.
      var temperatureGradient = this.beaker.getTemperature() - EFACConstants.ROOM_TEMPERATURE;
      if ( Math.abs( temperatureGradient ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {
        var beakerRect = this.beaker.getRawOutlineRect();
        var thermalContactArea = ( beakerRect.width * 2 ) + ( beakerRect.height * 2 ) * this.beaker.fluidLevel;
        var transferFactor = HeatTransferConstants.getHeatTransferFactor( 'water', 'air' );
        var thermalEnergyLost = temperatureGradient * transferFactor * thermalContactArea * dt;

        this.beaker.changeEnergy( -thermalEnergyLost );

        if ( this.beaker.getEnergyBeyondMaxTemperature() > 0 ) {
          // Prevent the water from going beyond the boiling point.
          this.beaker.changeEnergy( -this.beaker.getEnergyBeyondMaxTemperature() );
        }
      }

      this.beaker.step( dt );

      // TODO
      // energy chunk stuff
    },

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

    /**
     * Reset some variables/properties when deactivated by carousel
     * @public
     * @override
     */
    deactivate: function() {
      EnergyUser.prototype.deactivate.call( this );
      this.heatProportionProperty.set( 0 );
      this.beaker.reset();
    },

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

