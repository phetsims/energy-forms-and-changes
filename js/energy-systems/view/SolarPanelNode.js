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
  // var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  // var Path = require( 'SCENERY/nodes/Path' );
  // var Vector2 = require( 'DOT/Vector2' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var SolarPanel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SolarPanel' );

  // images
  var connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var solarPanelGenImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_gen.png' );
  var solarPanelImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel.png' );
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
    var panelNode = new Image( solarPanelImage, {
      centerX: 0,
      bottom: 0,
      maxHeight: modelViewTransform.modelToViewDeltaX( SolarPanel.SOLAR_PANEL_SIZE.height )
    } );
    var postNode = new Image( solarPanelPostImage, { top: panelNode.bottom - 5 } );
    var windowNode = new Image( solarPanelGenImage, {
      centerX: postNode.centerX,
      top: postNode.centerY
    } );
    var wireBottomLeftNode = new Image( wireBottomLeftImage, {
      right: windowNode.right - 20,
      bottom: windowNode.centerY + 13
    } );
    var connectorNode = new Image( connectorImage, { left: windowNode.right - 2, centerY: windowNode.centerY } );

    // add in correct order for layering effect
    this.addChild( wireBottomLeftNode );
    this.addChild( postNode );
    this.addChild( panelNode );
    this.addChild( new EnergyChunkLayer( solarPanel.energyChunkList, solarPanel.positionProperty, modelViewTransform ) );
    this.addChild( windowNode );
    this.addChild( connectorNode );

    // create a scale-only MVT since the absorption shape is relatively positioned
    // var scaleOnlyMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
    //   Vector2.ZERO,
    //   Vector2.ZERO,
    //   modelViewTransform.getMatrix().getScaleVector().x
    // );

    // shapes from model can be shown to adjust image position
    // this.addChild( new Path( scaleOnlyMVT.modelToViewShape( solarPanel.absorptionShape ), { stroke: 'red' } ) );
  }

  energyFormsAndChanges.register( 'SolarPanelNode', SolarPanelNode );

  return inherit( MoveFadeModelElementNode, SolarPanelNode );
} );

