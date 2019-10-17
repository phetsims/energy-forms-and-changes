// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node that represents and electrical generator in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Generator = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Generator' );
  const Image = require( 'SCENERY/nodes/Image' );
  const merge = require( 'PHET_CORE/merge' );
  const MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  const Tandem = require( 'TANDEM/Tandem' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  const generatorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator.png' );
  const generatorWheelHubImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_hub.png' );
  const generatorWheelPaddlesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_paddles_short.png' );
  const generatorWheelSpokesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/generator_wheel_spokes.png' );
  const wireBottomLeftImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_left.png' );

  // constants
  const SPOKES_AND_PADDLES_CENTER_Y_OFFSET = -65;

  class GeneratorNode extends MoveFadeModelElementNode {

    /**
     * @param {Generator} generator EnergyConverter
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( generator, modelViewTransform, options ) {

      options = merge( {

        // {boolean} - whether the mechanical energy chunk layer is added
        addMechanicalEnergyChunkLayer: true,

        // phet-io
        tandem: Tandem.required
      }, options );

      super( generator, modelViewTransform, options.tandem );

      const generatorNode = new Image( generatorImage, { left: -107, top: -165 } );
      const spokesNode = new Image( generatorWheelSpokesImage, {
        centerX: generatorNode.centerX,
        centerY: generatorNode.centerY + SPOKES_AND_PADDLES_CENTER_Y_OFFSET
      } );
      const paddlesNode = new Image( generatorWheelPaddlesImage, {
        centerX: generatorNode.centerX,
        centerY: generatorNode.centerY + SPOKES_AND_PADDLES_CENTER_Y_OFFSET
      } );
      const generatorWheelHubNode = new Image( generatorWheelHubImage, {
        centerX: paddlesNode.centerX,
        centerY: paddlesNode.centerY,
        maxWidth: modelViewTransform.modelToViewDeltaX( Generator.WHEEL_RADIUS * 2 )
      } );
      const wireBottomLeftNode = new Image( wireBottomLeftImage, {
        right: generatorNode.right - 29,
        top: generatorNode.centerY - 30,
        scale: EFACConstants.WIRE_IMAGE_SCALE
      } );
      const connectorNode = new Image( connectorImage, {
        left: generatorNode.right - 2,
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

        // create this layer anyway so that it can be extracted and layered differently than it is be default
        this.mechanicalEnergyChunkLayer = new EnergyChunkLayer( generator.energyChunkList, modelViewTransform );
      }

      // update the rotation of the wheel image based on model value
      const wheelRotationPoint = new Vector2( paddlesNode.center.x, paddlesNode.center.y );
      generator.wheelRotationalAngleProperty.link( angle => {
        const delta = -angle - paddlesNode.getRotation();
        paddlesNode.rotateAround( wheelRotationPoint, delta );
        spokesNode.rotateAround( wheelRotationPoint, delta );
      } );

      // hide the paddles and show the spokes when in direct coupling mode
      generator.directCouplingModeProperty.link( directCouplingMode => {
        paddlesNode.setVisible( !directCouplingMode );
        spokesNode.setVisible( directCouplingMode );
      } );
    }

    /**
     * Return the mechanical energy chunk layer. This supports adding the energy chunk layer from
     * outside of this node to alter the layering order.
     * @returns {EnergyChunkLayer}
     * @public
     */
    getMechanicalEnergyChunkLayer() {
      assert && assert(
        !this.hasChild( this.mechanicalEnergyChunkLayer ),
        'this.mechanicalEnergyChunkLayer is already a child of GeneratorNode'
      );
      return this.mechanicalEnergyChunkLayer;
    }
  }

  return energyFormsAndChanges.register( 'GeneratorNode', GeneratorNode );
} );

