// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the 'Energy Systems' screen of the Energy Forms And Changes simulation.
 *
 * @author  John Blanco
 * @author  Martin Veillette (Berea College)
 * @author  Jesse Greenberg
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var CheckBox = require( 'SUN/CheckBox' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkLegend = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EnergyChunkLegend' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var mockupImage = require( 'image!ENERGY_FORMS_AND_CHANGES/mockup_energy_systems.png' );

  // Strings
  var energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );

  // Constants
  var EDGE_INSET = 10;

  /**
   * @param {EnergySystemsModel} model
   * @constructor
   */
  function EnergySystemsScreenView( model ) {

    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 768, 504 )
    } );

    var thisScreenView = this;

    //Show the mock-up and a slider to change its transparency
    function addMockupImage() {
      var opacity = new Property( 0.8 );
      var image = new Image( mockupImage, {
        pickable: false
      } );
      image.scale( thisScreenView.layoutBounds.width / image.width );
      opacity.linkAttribute( image, 'opacity' );
      thisScreenView.addChild( image );
      thisScreenView.addChild( new HSlider( opacity, {
        min: 0,
        max: 1
      }, {
        top: 10,
        left: 10
      } ) );
    }

    // Create the legend for energy chunk types
    function addEnergyChunkLegend() {
      var legend = new EnergyChunkLegend();
      var x = 0.9 * thisScreenView.layoutBounds.width;
      var y = 0.5 * thisScreenView.layoutBounds.height;
      legend.center = new Vector2( x, y );
      thisScreenView.addChild( legend );
    }

    // Check box panel to display energy chunks
    function addCheckBoxPanel() {
      var label = new Text( energySymbolsString, {
        font: new PhetFont( 20 )
      } );

      var energyChunkNode = EnergyChunkNode.createEnergyChunkNode( EnergyType.THERMAL );
      energyChunkNode.scale( 1.0 );
      energyChunkNode.pickable = false;

      var checkBox = new CheckBox( new LayoutBox( {
        children: [ label, energyChunkNode ],
        orientation: 'horizontal',
        spacing: 5
      } ), model.energyChunksVisibleProperty );

      var panel = new Panel( checkBox, {
        fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
        stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
        lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH
      } );
      panel.rightTop = new Vector2( thisScreenView.layoutBounds.width - EDGE_INSET, EDGE_INSET );
      thisScreenView.addChild( panel );
    }

    // Create and add the Reset All Button in the bottom right, which resets the model
    function addResetButton() {
      var resetAllButton = new ResetAllButton( {
        listener: function() {
          model.reset();
        },
        right: thisScreenView.layoutBounds.maxX - 10,
        bottom: thisScreenView.layoutBounds.maxY - 10
      } );
      thisScreenView.addChild( resetAllButton );
    }

    addMockupImage();
    addEnergyChunkLegend();
    addCheckBoxPanel();
    addResetButton();

  }

  return inherit( ScreenView, EnergySystemsScreenView );
} );
