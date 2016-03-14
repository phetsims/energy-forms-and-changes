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
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var EFACResources = require( 'ENERGY_FORMS_AND_CHANGES/EFACResources' );
  var EnergyConverter = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyConverter' );
  var Vector2 = require( 'DOT/Vector2' );
  var Random = require( 'DOT/Random' );

  // Constants
  var RAND = new Random();
  var SOLAR_PANEL_OFFSET = new Vector2( 0, 0.044 );
  var SOLAR_PANEL_IMAGE = new ModelElementImage( EFACResources.SOLAR_PANEL, 0.15, SOLAR_PANEL_OFFSET );
  var CONVERTER_IMAGE_OFFSET = new Vector2( 0.015, -0.040 );
  var CONVERTER_IMAGE = new ModelElementImage( EFACResources.SOLAR_PANEL_GEN, CONVERTER_IMAGE_OFFSET );
  var CURVED_WIRE_IMAGE = new ModelElementImage( EFACResources.WIRE_BLACK_LEFT,
    CONVERTER_IMAGE_OFFSET.plus( 0.009, 0.024 ) );
  var POST_IMAGE = new ModelElementImage( EFACResources.SOLAR_PANEL_POST_2,
    CONVERTER_IMAGE_OFFSET.plus( new Vector2( 0, 0.04 ) ) );
  var CONNECTOR_IMAGE_OFFSET = new Vector2( 0.057, -0.04 );
  var CONNECTOR_IMAGE = new ModelElementImage( EFACResources.CONNECTOR, CONNECTOR_IMAGE_OFFSET );
  var PANEL_IMAGE_BOUNDS = new Rectangle2D.Double( -SOLAR_PANEL_IMAGE.getWidth() / 2, -SOLAR_PANEL_IMAGE.getHeight() / 2,
    SOLAR_PANEL_IMAGE.getWidth(),
    SOLAR_PANEL_IMAGE.getHeight() );

  /**
   * Solar panel is an energy converter
   *
   * @param {[type]} energyChunksVisible [description]
   * @constructor
   */
  function SolarPanel( energyChunksVisible ) {
    EnergyConverter.call( this, new Image( EFACResources.SOLAR_PANEL_ICON ) );
    // TODO: simulation clock? I don't think it is needed.
    this.energyChunksVisible = energyChunksVisible;

    this.energyChunkMovers = [];
    this.latestChunkArrivalTime = 0;
    this.energyOutputRate = 0;
  }

  // TODO fill out these stubs
  return inherit( EnergyConverter, SolarPanel, {
    stepInTime: function( dt, incomingEnergy ) {},
    moveEnergyChunks: function( dt ) {},
    preLoadEnergyChunks: function( incomingEnergyRate ) {},
    getEnergyOutputRate: function() {},
    clearEnergyChunks: function() {},
    createPathToPanelBottom: function() {},
    createPathThroughConverter: function() {},
    getAbsorptionShape: function() {},
    getUserComponent: function() {}
  } );
} );
