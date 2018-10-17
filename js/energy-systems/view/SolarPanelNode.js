// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery Node that depicts a solar panel in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  // var Path = require( 'SCENERY/nodes/Path' );

  // images
  var connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var solarPanelImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel.png' );
  var solarPanelGenImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_gen.png' );
  var solarPanelPostImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_post_2.png' );
  var wireBottomLeftImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_left.png' );

  /**
   * @param {SolarPanel} solarPanel From the model
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function SolarPanelNode( solarPanel, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, solarPanel, modelViewTransform );

    // these are manually positioned so that they match the energy chunk flow defined in the model
    // the center of the node is at (0,0), so these are all positioned around that
    // the positions will have to be carefully repositioned if the images change
    var panelNode = new Image( solarPanelImage, { left: -195, top: -190 } );
    var postNode = new Image( solarPanelPostImage, { top: panelNode.bottom - 5 } );
    var windowNode = new Image( solarPanelGenImage, {
      centerX: postNode.centerX,
      top: postNode.centerY
    } );
    var wireBottomLeftNode = new Image( wireBottomLeftImage, {
      right: windowNode.right - 20,
      bottom: windowNode.centerY + 13
    } );
    var connectorNode = new Image( connectorImage, { left: windowNode.right, centerY: windowNode.centerY } );

    // add in correct order for layering effect
    this.addChild( wireBottomLeftNode );
    this.addChild( postNode );
    this.addChild( panelNode );
    this.addChild( new EnergyChunkLayer( solarPanel.energyChunkList, solarPanel.positionProperty, modelViewTransform ) );
    this.addChild( windowNode );
    this.addChild( connectorNode );

    // shapes from model can be shown to adjust image position
    // this.addChild( new Path( modelViewTransform.modelToViewShape( solarPanel.absorptionShape ), { stroke: 'red' } ) );
  }

  energyFormsAndChanges.register( 'SolarPanelNode', SolarPanelNode );

  return inherit( MoveFadeModelElementNode, SolarPanelNode );
} );

