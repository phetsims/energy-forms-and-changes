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
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Generator' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var generatorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator.png' );
  var generatorWheelHubImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_hub_2.png' );
  var generatorWheelPaddlesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_paddles_short.png' );
  var generatorWheelSpokesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_spokes.png' );
  var wireBottomLeftImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_left.png' );

  // constants
  var SPOKES_AND_PADDLES_CENTER_Y_OFFSET = -65;

  /**
   * @param {Generator} generator EnergyConverter
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function GeneratorNode( generator, modelViewTransform, options ) {

    options = _.extend( {

      // {boolean} - whether the mechanical energy chunk layer is added
      addMechanicalEnergyChunkLayer: true
    }, options );

    MoveFadeModelElementNode.call( this, generator, modelViewTransform );

    var generatorNode = new Image( generatorImage, { left: -107, top: -165 } );
    var spokesNode = new Image( generatorWheelSpokesImage, {
      centerX: generatorNode.centerX,
      centerY: generatorNode.centerY + SPOKES_AND_PADDLES_CENTER_Y_OFFSET
    } );
    var paddlesNode = new Image( generatorWheelPaddlesImage, {
      centerX: generatorNode.centerX,
      centerY: generatorNode.centerY + SPOKES_AND_PADDLES_CENTER_Y_OFFSET
    } );
    var generatorWheelHubNode = new Image( generatorWheelHubImage, {
      centerX: paddlesNode.centerX,
      centerY: paddlesNode.centerY,
      maxWidth: modelViewTransform.modelToViewDeltaX( Generator.WHEEL_RADIUS * 2 )
    } );
    var wireBottomLeftNode = new Image( wireBottomLeftImage, {
      right: generatorNode.right - 29,
      top: generatorNode.centerY - 30
    } );
    var connectorNode = new Image( connectorImage, {
      left: generatorNode.right - 3,
      centerY: generatorNode.centerY + 90
    } );

    this.addChild( wireBottomLeftNode );
    this.addChild( new EnergyChunkLayer( generator.electricalEnergyChunks, modelViewTransform, {
      parentPositionProperty: generator.positionProperty
    } ) );
    this.addChild( generatorNode );
    this.addChild( connectorNode );
    this.addChild( spokesNode );
    this.addChild( paddlesNode );
    this.addChild( generatorWheelHubNode );
    this.addChild( new EnergyChunkLayer( generator.hiddenEnergyChunks, modelViewTransform, {
      parentPositionProperty: generator.positionProperty
    } ) );

    // @public (read-only)
    this.mechanicalEnergyChunkLayer = null;

    if ( options.addMechanicalEnergyChunkLayer ) {
      this.mechanicalEnergyChunkLayer = new EnergyChunkLayer( generator.energyChunkList, modelViewTransform, {
        parentPositionProperty: generator.positionProperty
      } );
      this.addChild( this.mechanicalEnergyChunkLayer );
    }
    else {
      this.mechanicalEnergyChunkLayer = new EnergyChunkLayer( generator.energyChunkList, modelViewTransform );
    }

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

  return inherit( MoveFadeModelElementNode, GeneratorNode, {
    /**
     * Return the mechanical energy chunk layer. This supports adding the energy chunk layer from
     * outside of this node to alter the layering order.
     *
     * @public
     * @returns {EnergyChunkLayer}
     */
    getMechanicalEnergyChunkLayer: function() {
      assert && assert( !this.hasChild( this.mechanicalEnergyChunkLayer ),
        'this.mechanicalEnergyChunkLayer is already a child of GeneratorNode' );
      return this.mechanicalEnergyChunkLayer;
    }
  } );
} );

