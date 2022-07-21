// Copyright 2018-2022, University of Colorado Boulder

/**
 * a scenery node that represents a fan in the view
 *
 * @author Chris Klusendorf
 */

import { Image, Node } from '../../../../scenery/js/imports.js';
import connector_png from '../../../images/connector_png.js';
import fan01_png from '../../../images/fan01_png.js';
import fan02_png from '../../../images/fan02_png.js';
import fan03_png from '../../../images/fan03_png.js';
import fan04_png from '../../../images/fan04_png.js';
import fan05_png from '../../../images/fan05_png.js';
import fan06_png from '../../../images/fan06_png.js';
import fan07_png from '../../../images/fan07_png.js';
import fan08_png from '../../../images/fan08_png.js';
import fan09_png from '../../../images/fan09_png.js';
import fan10_png from '../../../images/fan10_png.js';
import wireBottomRightShort_png from '../../../images/wireBottomRightShort_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const FAN_IMAGES = [
  fan01_png, fan02_png, fan03_png, fan04_png, fan05_png,
  fan06_png, fan07_png, fan08_png, fan09_png, fan10_png
];
const NUMBER_OF_FAN_IMAGES = FAN_IMAGES.length;

class FanNode extends MoveFadeModelElementNode {

  /**
   * @param {Fan} fan
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( fan, energyChunksVisibleProperty, modelViewTransform, tandem ) {
    super( fan, modelViewTransform, tandem );

    // add the images and the layer that will contain the energy chunks
    const wireBottomRightNode = new Image( wireBottomRightShort_png, {
      left: -109.5,
      bottom: 105,
      scale: EFACConstants.WIRE_IMAGE_SCALE
    } );
    const connectorNode = new Image( connector_png, {
      right: wireBottomRightNode.right + 10,
      bottom: wireBottomRightNode.top + 3
    } );

    this.addChild( wireBottomRightNode );

    const fanBladeRootNode = new Node();
    const fanBladeImageNodes = [];

    // fan blade image nodes
    for ( let i = 0; i < NUMBER_OF_FAN_IMAGES; i++ ) {
      fanBladeImageNodes.push( new Image( FAN_IMAGES[ i ], {
        left: connectorNode.right - 2,
        centerY: connectorNode.centerY,
        scale: 0.74
      } ) );
      fanBladeImageNodes[ i ].setVisible( false );
      fanBladeRootNode.addChild( fanBladeImageNodes[ i ] );
    }

    // animate blades by setting image visibility based on fan rotation angle
    let visibleFanNode = fanBladeImageNodes[ 0 ];
    fan.bladePositionProperty.link( angle => {
      assert && assert( angle >= 0 && angle <= 2 * Math.PI, `Angle out of range: ${angle}` );
      const i = mapAngleToImageIndex( angle );
      visibleFanNode.setVisible( false );
      visibleFanNode = fanBladeImageNodes[ i ];
      visibleFanNode.setVisible( true );
    } );
    this.addChild( fanBladeRootNode );

    this.addChild( new EnergyChunkLayer( fan.energyChunkList, modelViewTransform, {
      parentPositionProperty: fan.positionProperty
    } ) );
    this.addChild( connectorNode );
  }
}

/**
 * find the image index corresponding to this angle in radians
 * @param {number} angle
 * @returns {number} - image index
 */
const mapAngleToImageIndex = angle => {
  const i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUMBER_OF_FAN_IMAGES ) );
  assert && assert( i >= 0 && i < NUMBER_OF_FAN_IMAGES );
  return i;
};

energyFormsAndChanges.register( 'FanNode', FanNode );
export default FanNode;