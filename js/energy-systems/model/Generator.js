// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyConverter' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var GENERATOR_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_icon.png' );
  var CONNECTOR = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var GENERATOR = require( 'image!ENERGY_FORMS_AND_CHANGES/generator.png' );
  var GENERATOR_WHEEL_HUB_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_hub_2.png' );
  var GENERATOR_WHEEL_PADDLES_SHORT = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_paddles_short.png' );
  var GENERATOR_WHEEL_SPOKES = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_spokes.png' );
  var WIRE_BLACK_LEFT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_left.png' );

  // Constants

  // Attributes of the wheel and generator.
  var WHEEL_MOMENT_OF_INERTIA = 5; // In kg.
  var RESISTANCE_CONSTANT = 3; // Controls max speed and rate of slow down, empirically determined.
  var MAX_ROTATIONAL_VELOCITY = Math.PI / 2; // In radians/sec, empirically determined.

  // Images used to represent this model element in the view.
  // Offsets empirically determined
  var WHEEL_CENTER_OFFSET = new Vector2( 0, 0.03 );
  var LEFT_SIDE_OF_WHEEL_OFFSET = new Vector2( -0.030, 0.03 );
  var CONNECTOR_OFFSET = new Vector2( 0.057, -0.04 );

  var HOUSING_IMAGE = new EFACModelImage( GENERATOR, GENERATOR.width, new Vector2( 0, 0 ) );
  var WHEEL_PADDLES_IMAGE = new EFACModelImage( GENERATOR_WHEEL_PADDLES_SHORT, GENERATOR_WHEEL_PADDLES_SHORT.width, WHEEL_CENTER_OFFSET );
  var WHEEL_HUB_IMAGE = new EFACModelImage( GENERATOR_WHEEL_HUB_2, GENERATOR_WHEEL_HUB_2.width, WHEEL_CENTER_OFFSET );
  var SHORT_SPOKES_IMAGE = new EFACModelImage( GENERATOR_WHEEL_SPOKES, GENERATOR_WHEEL_SPOKES.width, WHEEL_CENTER_OFFSET );
  var CONNECTOR_IMAGE = new EFACModelImage( CONNECTOR, CONNECTOR.width, CONNECTOR_OFFSET );
  var WIRE_CURVED_IMAGE = new EFACModelImage( WIRE_BLACK_LEFT, WIRE_BLACK_LEFT.width, new Vector2( 0.0185, -0.015 ) );
  var WHEEL_RADIUS = WHEEL_HUB_IMAGE.width / 2;

  // Offsets used to create the paths followed by the energy chunks.
  var START_OF_WIRE_CURVE_OFFSET = WHEEL_CENTER_OFFSET.plus( 0.01, -0.05 );
  var WIRE_CURVE_POINT_1_OFFSET = WHEEL_CENTER_OFFSET.plus( 0.015, -0.06 );
  var WIRE_CURVE_POINT_2_OFFSET = WHEEL_CENTER_OFFSET.plus( 0.03, -0.07 );
  var CENTER_OF_CONNECTOR_OFFSET = CONNECTOR_OFFSET;

  /**
   * @param {Property<boolean>} energyChunksVisible
   * @constructor
   */
  function Generator( energyChunksVisible ) {

    // Add args to constructor as needed
    EnergyConverter.call( this, new Image( GENERATOR_ICON ) );

    this.energyChunksVisible = energyChunksVisible;

    this.addProperty( 'wheelRotationalAngle', 0 );

    // Flag that controls "direct coupling mode", which means that the
    // generator wheel turns at a rate that is directly proportionate to the
    // incoming energy, with no rotational inertia.
    this.addProperty( 'directCouplingMode', false );

    this.wheelRotationalVelocity = 0;
    this.energyChunkMovers = [];

    // The electrical energy chunks are kept on a separate list to support
    // placing them on a different layer in the view.
    this.electricalEnergyChunks = new ObservableArray();

    // The "hidden" energy chunks are kept on a separate list mainly for
    // code clarity.
    this.hiddenEnergyChunks = new ObservableArray();
  }

  return inherit( EnergyConverter, Generator, {
    /**
     * [step description]
     *
     * @param {Number} dt timestep
     *
     * @return {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

    },

    /**
     * [description]
     *
     * @param {Number} dt timestep
     *
     * @return {Energy}
     * @private
     */
    updateEnergyChunkPositions: function( dt ) {

    },

    /**
     * [preLoadEnergyChunks description]
     * @public
     * @override
     */
    preLoadEnergyChunks: function() {

    },

    /**
     * @param {Vector2} panelPosition [description]
     * @private
     */
    createMechanicalEnergyChunkPath: function( panelPosition ) {

    },

    /**
     * @param {Vector2} panelPosition [description]
     * @private
     */
    createElectricalEnergyChunkPath: function( panelPosition ) {

    },

    /**
     * @param {Vector2} panelPosition [description]
     * @private
     */
    createHiddenEnergyChunkPath: function( panelPosition ) {

    },

    /**
     * [getEnergyOutputRate description]
     *
     * @return {Energy} [description]
     * @public
     * @override
     */
    getEnergyOutputRate: function() {

    },

    /**
     * [deactivate description]
     * @public
     * @override
     */
    deactivate: function() {

    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {

    },

    /**
     * [description]
     * @public
     * @override
     */
    extractOutgoingEnergyChunks: function() {

    },

    passLint: function() {
      console.log(
        WHEEL_MOMENT_OF_INERTIA,
        RESISTANCE_CONSTANT,
        MAX_ROTATIONAL_VELOCITY,
        LEFT_SIDE_OF_WHEEL_OFFSET,
        WHEEL_RADIUS,
        START_OF_WIRE_CURVE_OFFSET,
        WIRE_CURVE_POINT_1_OFFSET,
        WIRE_CURVE_POINT_2_OFFSET,
        CENTER_OF_CONNECTOR_OFFSET
      );
    }

  }, {
    SHORT_SPOKES_IMAGE: SHORT_SPOKES_IMAGE,
    WHEEL_PADDLES_IMAGE: WHEEL_PADDLES_IMAGE,
    WIRE_CURVED_IMAGE: WIRE_CURVED_IMAGE,
    HOUSING_IMAGE: HOUSING_IMAGE,
    CONNECTOR_IMAGE: CONNECTOR_IMAGE,
    WHEEL_HUB_IMAGE: WHEEL_HUB_IMAGE
  } );
} );