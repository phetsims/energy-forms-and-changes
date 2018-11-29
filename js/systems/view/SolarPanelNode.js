// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node that depicts a solar panel in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var SolarPanel = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/SolarPanel' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var solarPanelGenImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_gen.png' );
  var solarPanelImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel.png' );
  var solarPanelPostImage = require( 'image!ENERGY_FORMS_AND_CHANGES/solar_panel_post_2.png' );
  var wireBottomLeftImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_left.png' );

  /**
   * @param {SolarPanel} solarPanel - model of a solar panel
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function SolarPanelNode( solarPanel, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, solarPanel, modelViewTransform );

    // create a scale-only MVT since the absorption shape is relatively positioned
    var scaleOnlyMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      Vector2.ZERO,
      modelViewTransform.getMatrix().getScaleVector().x
    );

    // Add an image for the actual panel portion, i.e. the part that collects the solar energy.  The aspect ratio of
    // the image should be reasonably close to the shape described by the model to avoid visual distortion.
    var panelNode = new Image( solarPanelImage );
    panelNode.scale(
      modelViewTransform.modelToViewDeltaX( solarPanel.untranslatedPanelBounds.width ) / panelNode.width,
      -modelViewTransform.modelToViewDeltaY( solarPanel.untranslatedPanelBounds.height ) / panelNode.height
    );
    panelNode.center = scaleOnlyMVT.modelToViewPosition( solarPanel.untranslatedPanelBounds.center );

    // add the other portions of the solar panel assembly
    var postNode = new Image( solarPanelPostImage, {
      centerX: modelViewTransform.modelToViewDeltaX( SolarPanel.PANEL_CONNECTOR_OFFSET.x ),
      top: panelNode.bottom - 5
    } );
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
    this.addChild( new EnergyChunkLayer( solarPanel.energyChunkList, modelViewTransform, {
      parentPositionProperty: solarPanel.positionProperty
    } ) );
    this.addChild( windowNode );
    this.addChild( connectorNode );

    // for debug
    if ( EFACQueryParameters.showHelperShapes ) {

      // add a shape that shows the bounds of the collection area
      var panelBoundsShape = Shape.rect(
        solarPanel.untranslatedPanelBounds.minX,
        solarPanel.untranslatedPanelBounds.minY,
        solarPanel.untranslatedPanelBounds.width,
        solarPanel.untranslatedPanelBounds.height
      );
      this.addChild( new Path( scaleOnlyMVT.modelToViewShape( panelBoundsShape ), {
        stroke: 'green'
      } ) );

      // add a shape that shows where light energy chunks should be absorbed
      this.addChild( new Path( scaleOnlyMVT.modelToViewShape( solarPanel.untranslatedAbsorptionShape ), {
        stroke: 'red',
        lineJoin: 'round'
      } ) );

      // create a marker the shows where the center of the node is
      var crossLength = 15;
      var crossShape = new Shape()
        .moveTo( -crossLength / 2, 0 )
        .lineTo( crossLength / 2, 0 )
        .moveTo( 0, -crossLength / 2 )
        .lineTo( 0, crossLength / 2 );
      this.addChild( new Path( crossShape, {
        stroke: 'red',
        lineWidth: 3
      } ) );


    }
  }

  energyFormsAndChanges.register( 'SolarPanelNode', SolarPanelNode );

  return inherit( MoveFadeModelElementNode, SolarPanelNode );
} );

