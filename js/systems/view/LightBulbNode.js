// Copyright 2018-2022, University of Colorado Boulder

/**
 * a scenery node that represents a light bulb in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color, Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import elementBaseBack_png from '../../../images/elementBaseBack_png.js';
import elementBaseFront_png from '../../../images/elementBaseFront_png.js';
import fluorescentBack_png from '../../../images/fluorescentBack_png.js';
import fluorescentFront_png from '../../../images/fluorescentFront_png.js';
import fluorescentOnBack_png from '../../../images/fluorescentOnBack_png.js';
import fluorescentOnFront_png from '../../../images/fluorescentOnFront_png.js';
import incandescent_png from '../../../images/incandescent_png.js';
import incandescentOn_png from '../../../images/incandescentOn_png.js';
import wireBottomRight_png from '../../../images/wireBottomRight_png.js';
import wireStraight_png from '../../../images/wireStraight_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import LightRays from './LightRays.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const FLUORESCENT_BULB_TOP_OFFSET = 28;
const INCANDESCENT_BULB_TOP_OFFSET = 31;

class LightBulbNode extends MoveFadeModelElementNode {

  /**
   * @param {FluorescentBulb} lightBulb
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( lightBulb, energyChunksVisibleProperty, modelViewTransform, options ) {

    options = merge( {

      // LightBulbNode options
      bulbType: 'fluorescent',

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    assert && assert(
      options.bulbType === 'fluorescent' || options.bulbType === 'incandescent',
      'bulbType should be fluorescent or incandescent'
    );

    super( lightBulb, modelViewTransform, options.tandem );

    const lightRays = new LightRays( Vector2.ZERO, 30, 400, 20, Color.YELLOW );
    this.addChild( lightRays );

    // only show the light rays when the energy chunks are not shown
    energyChunksVisibleProperty.link( visible => {
      lightRays.setVisible( !visible );
    } );

    // add the images and the layer that will contain the energy chunks
    const wireStraightNode = new Image( wireStraight_png, {
      left: -110.5,
      top: 78,
      scale: EFACConstants.WIRE_IMAGE_SCALE
    } );
    const wireBottomRightNode = new Image( wireBottomRight_png, {
      left: wireStraightNode.right - 4,
      bottom: wireStraightNode.bottom + 2.3,
      scale: EFACConstants.WIRE_IMAGE_SCALE
    } );
    const elementBaseBackNode = new Image( elementBaseBack_png, {
      maxWidth: EFACConstants.ELEMENT_BASE_WIDTH,
      right: wireBottomRightNode.right + 22,
      top: wireBottomRightNode.top - 2.5
    } );
    const elementBaseFrontNode = new Image( elementBaseFront_png, {
      maxWidth: elementBaseBackNode.width,
      centerX: elementBaseBackNode.centerX,
      top: wireBottomRightNode.top - 3
    } );

    this.addChild( wireStraightNode );
    this.addChild( wireBottomRightNode );
    this.addChild( elementBaseBackNode );
    this.addChild( new EnergyChunkLayer( lightBulb.energyChunkList, modelViewTransform, {
      parentPositionProperty: lightBulb.positionProperty
    } ) );
    this.addChild( elementBaseFrontNode );

    if ( options.bulbType === 'fluorescent' ) {
      const fluorescentOffBackNode = new Image( fluorescentBack_png, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );
      const fluorescentOnBackNode = new Image( fluorescentOnBack_png, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );
      const fluorescentOffFrontNode = new Image( fluorescentFront_png, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );
      const fluorescentOnFrontNode = new Image( fluorescentOnFront_png, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );

      this.addChild( fluorescentOffBackNode );
      this.addChild( fluorescentOnBackNode );
      this.addChild( fluorescentOffFrontNode );
      this.addChild( fluorescentOnFrontNode );

      // make bulb partially transparent when energy chunks visible
      energyChunksVisibleProperty.link( visible => {
        const opacity = visible ? 0.7 : 1.0;
        fluorescentOffFrontNode.setOpacity( opacity );
        fluorescentOffBackNode.setOpacity( opacity );
      } );

      // center the light rays on the bulb image
      lightRays.y = fluorescentOnFrontNode.bounds.center.y - fluorescentOnFrontNode.bounds.height * 0.1;

      // update the transparency of the lit bulb based on model element
      lightBulb.litProportionProperty.link( litProportion => {
        const opacity = energyChunksVisibleProperty.get() ? 0.7 * litProportion : litProportion;
        fluorescentOnFrontNode.setOpacity( opacity );
        fluorescentOnBackNode.setOpacity( opacity );
        lightRays.setOpacity( opacity );
      } );
    }
    else {
      const incandescentOffNode = new Image( incandescent_png, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + INCANDESCENT_BULB_TOP_OFFSET
      } );
      const incandescentOnNode = new Image( incandescentOn_png, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + INCANDESCENT_BULB_TOP_OFFSET
      } );
      this.addChild( incandescentOffNode );
      this.addChild( incandescentOnNode );

      // center the light rays on the bulb image
      lightRays.y = incandescentOnNode.bounds.center.y - incandescentOnNode.bounds.height * 0.1;

      // update the transparency of the lit bulb based on model element
      lightBulb.litProportionProperty.link( litProportion => {
        incandescentOnNode.setOpacity( litProportion );
        lightRays.setOpacity( litProportion );
      } );
    }
  }
}

energyFormsAndChanges.register( 'LightBulbNode', LightBulbNode );
export default LightBulbNode;