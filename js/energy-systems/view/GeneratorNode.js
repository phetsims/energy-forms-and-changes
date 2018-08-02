// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node that represents and electrical generator in the view
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
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Generator' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var generatorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator.png' );
  var generatorWheelHubImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_hub_2.png' );
  var generatorWheelPaddlesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_paddles_short.png' );
  var generatorWheelSpokesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_spokes.png' );
  var wireBlackLeftImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_left.png' );

  /**
   * @param {Generator} generator EnergyConverter
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GeneratorNode( generator, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, generator, modelViewTransform );

    var generatorNode = new Image( generatorImage, { left: -107, top: -165 } );
    var spokesNode = new Image( generatorWheelSpokesImage, {
      centerX: generatorNode.centerX,
      centerY: generatorNode.centerY - 65
    } );
    var paddlesNode = new Image( generatorWheelPaddlesImage, {
      centerX: generatorNode.centerX,
      centerY: generatorNode.centerY - 65
    } );
    var generatorWheelHubNode = new Image( generatorWheelHubImage, {
      centerX: paddlesNode.centerX,
      centerY: paddlesNode.centerY,
      maxWidth: modelViewTransform.modelToViewDeltaX( Generator.WHEEL_RADIUS * 2 )
    } );
    var wireBlackLeftNode = new Image( wireBlackLeftImage, {
      right: generatorNode.right - 29,
      top: generatorNode.centerY - 34
    } );
    var connectorNode = new Image( connectorImage, {
      left: generatorNode.right - 3,
      centerY: generatorNode.centerY + 88
    } );

    this.addChild( wireBlackLeftNode );
    this.addChild( new EnergyChunkLayer( generator.electricalEnergyChunks, generator.positionProperty, modelViewTransform ) );
    this.addChild( generatorNode );
    this.addChild( connectorNode );
    this.addChild( spokesNode );
    this.addChild( paddlesNode );
    this.addChild( generatorWheelHubNode );
    this.addChild( new EnergyChunkLayer( generator.hiddenEnergyChunks, generator.positionProperty, modelViewTransform ) );
    this.addChild( new EnergyChunkLayer( generator.energyChunkList, generator.positionProperty, modelViewTransform ) );

    // update the rotation of the wheel image based on model value
    var wheelRotationPoint = new Vector2( paddlesNode.center.x, paddlesNode.center.y );
    generator.wheelRotationalAngleProperty.link( function( angle ) {
      var delta = -angle - paddlesNode.getRotation();
      paddlesNode.rotateAround( wheelRotationPoint, delta );
      spokesNode.rotateAround( wheelRotationPoint, delta );
    } );

    // hide the paddles and show the spokes when in direct coupling mode
    generator.directCouplingModeProperty.link( function( directCouplingMode ) {
      paddlesNode.setVisible( !directCouplingMode );
      spokesNode.setVisible( directCouplingMode );
    } );
  }

  energyFormsAndChanges.register( 'GeneratorNode', GeneratorNode );

  return inherit( MoveFadeModelElementNode, GeneratorNode );
} );

