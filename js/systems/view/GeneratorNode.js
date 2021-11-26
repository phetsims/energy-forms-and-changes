// Copyright 2016-2021, University of Colorado Boulder

/**
 * a Scenery Node that represents and electrical generator in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import connectorImage from '../../../images/connector_png.js';
import generatorImage from '../../../images/generator_png.js';
import generatorWheelHubImage from '../../../images/generator_wheel_hub_png.js';
import generatorWheelPaddlesImage from '../../../images/generator_wheel_paddles_short_png.js';
import generatorWheelSpokesImage from '../../../images/generator_wheel_spokes_png.js';
import wireBottomLeftImage from '../../../images/wire_bottom_left_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChangesStrings from '../../energyFormsAndChangesStrings.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Generator from '../model/Generator.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const SPOKES_AND_PADDLES_CENTER_Y_OFFSET = -65;

const generatorString = energyFormsAndChangesStrings.generator;

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
      tandem: Tandem.REQUIRED
    }, options );

    super( generator, modelViewTransform, options.tandem );

    const generatorNode = new Image( generatorImage, { left: -107, top: -165 } );
    const labelNode = new Text( generatorString, {
      font: new PhetFont( 19 ),
      centerX: generatorNode.centerX,
      bottom: generatorNode.bottom - 6,
      tandem: options.tandem.createTandem( 'labelNode' ),
      maxWidth: 160 // empirially determined
    } );
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
    this.addChild( labelNode );
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

energyFormsAndChanges.register( 'GeneratorNode', GeneratorNode );
export default GeneratorNode;