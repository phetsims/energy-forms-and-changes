// Copyright 2014-2015, University of Colorado Boulder

/**
 * Class that represents a solar panel in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyConverter' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'DOT/Random' );
  var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  // TODO: These are in the Java code, but should they be moved to view code?
  var CONNECTOR = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var SOLAR_PANEL = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel.png' );
  var SOLAR_PANEL_GEN = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_gen.png' );
  var SOLAR_PANEL_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_icon.png' );
  var SOLAR_PANEL_POST_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_post_2.png' );
  var SUN_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/sun_icon.png' );
  var WIRE_BLACK_LEFT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_left.png' );

  // Constants
  var RAND = new Random();
  var SOLAR_PANEL_OFFSET = new Vector2( 0, 0.044 );
  var CONVERTER_IMAGE_OFFSET = new Vector2( 0.015, -0.040 );
  var CONNECTOR_IMAGE_OFFSET = new Vector2( 0.057, -0.04 );

  var SOLAR_PANEL_IMAGE = new EFACModelImage( SOLAR_PANEL, SOLAR_PANEL_OFFSET, { width: 0.15 } );
  var CONVERTER_IMAGE = new EFACModelImage( SOLAR_PANEL_GEN, CONVERTER_IMAGE_OFFSET );
  var CURVED_WIRE_IMAGE = new EFACModelImage( WIRE_BLACK_LEFT, CONVERTER_IMAGE_OFFSET.plus( 0.009, 0.024 ) );
  var POST_IMAGE = new EFACModelImage( SOLAR_PANEL_POST_2, CONVERTER_IMAGE_OFFSET.plus( new Vector2( 0, 0.04 ) ) );
  var CONNECTOR_IMAGE = new EFACModelImage( CONNECTOR, CONNECTOR_IMAGE_OFFSET );

  var halfWidth = SOLAR_PANEL_IMAGE.width / 2;
  var halfHeight = SOLAR_PANEL_IMAGE.height / 2;
  var PANEL_IMAGE_BOUNDS = new Bounds2( -halfWidth, -halfHeight, halfWidth, halfHeight );

  // TODO
  // private static final DoubleGeneralPath ABSORPTION_SHAPE = new DoubleGeneralPath() {{
  //     double absorptionZoneWidth = PANEL_IMAGE_BOUNDS.getWidth() * 0.2;
  //     moveTo( PANEL_IMAGE_BOUNDS.getMinX(), PANEL_IMAGE_BOUNDS.getMinY() );
  //     moveTo( PANEL_IMAGE_BOUNDS.getMaxX() - absorptionZoneWidth, PANEL_IMAGE_BOUNDS.getMaxY() );
  //     lineTo( PANEL_IMAGE_BOUNDS.getMaxX(), PANEL_IMAGE_BOUNDS.getMaxY() );
  //     lineTo( PANEL_IMAGE_BOUNDS.getMinX() + absorptionZoneWidth, PANEL_IMAGE_BOUNDS.getMinY() );
  //     lineTo( PANEL_IMAGE_BOUNDS.getMinX(), PANEL_IMAGE_BOUNDS.getMinY() );
  //     closePath();
  // }};


  // Constants used for creating the path followed by the energy chunks.
  // Many of these numbers were empirically determined based on the images,
  // and will need updating if the images change.
  var OFFSET_TO_CONVERGENCE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x, 0.01 );
  var OFFSET_TO_FIRST_CURVE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x, -0.025 );
  var OFFSET_TO_SECOND_CURVE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x + 0.005, -0.033 );
  var OFFSET_TO_THIRD_CURVE_POINT = new Vector2( CONVERTER_IMAGE_OFFSET.x + 0.015, CONNECTOR_IMAGE_OFFSET.y );
  var OFFSET_TO_CONNECTOR_CENTER = CONNECTOR_IMAGE_OFFSET;

  // Inter chunk spacing time for when the chunks reach the 'convergence
  // point' at the bottom of the solar panel.  It is intended to
  // approximately match the rate at which the sun emits energy chunks.
  var MIN_INTER_CHUNK_TIME = 1 / ( SunEnergySource.ENERGY_CHUNK_EMISSION_PERIOD * SunEnergySource.NUM_EMISSION_SECTORS ); // In seconds.

  /**
   * Solar panel is an energy converter
   *
   * @param {Property<boolean>} energyChunksVisible
   * @constructor
   */
  function SolarPanel( energyChunksVisible ) {
    EnergyConverter.call( this, new Image( SOLAR_PANEL_ICON ) );
    this.energyChunkMovers = [];
    this.latestChunkArrivalTime = 0;
    this.energyOutputRate = 0;
    this.energyChunksVisible = energyChunksVisible;
  }

  // TODO fill out these stubs
  return inherit( EnergyConverter, SolarPanel, {
    step: function( dt, incomingEnergy ) {},
    moveEnergyChunks: function( dt ) {},
    preLoadEnergyChunks: function( incomingEnergyRate ) {},
    getEnergyOutputRate: function() {},
    chooseChunkVelocityOnPanel: function() {},
    clearEnergyChunks: function() {},
    createPathToPanelBottom: function() {},
    createPathThroughConverter: function() {},
    getAbsorptionShape: function() {},
    getUserComponent: function() {},
    temp: function() {
      console.log(
        SUN_ICON,
        RAND,
        PANEL_IMAGE_BOUNDS,
        OFFSET_TO_CONVERGENCE_POINT,
        OFFSET_TO_FIRST_CURVE_POINT,
        OFFSET_TO_SECOND_CURVE_POINT,
        OFFSET_TO_THIRD_CURVE_POINT,
        OFFSET_TO_CONNECTOR_CENTER,
        MIN_INTER_CHUNK_TIME
      );
    }

  }, {
    CURVED_WIRE_IMAGE: CURVED_WIRE_IMAGE,
    POST_IMAGE: POST_IMAGE,
    SOLAR_PANEL_IMAGE: SOLAR_PANEL_IMAGE,
    CONVERTER_IMAGE: CONVERTER_IMAGE,
    CONNECTOR_IMAGE: CONNECTOR_IMAGE
  } );
} );