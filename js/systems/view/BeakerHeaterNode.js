// Copyright 2016-2020, University of Colorado Boulder

/**
 * a Scenery Node representing the beaker heater in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import elementBaseBackImage from '../../../images/element_base_back_png.js';
import elementBaseFrontImage from '../../../images/element_base_front_png.js';
import heaterElementOffImage from '../../../images/heater_element_dark_png.js';
import heaterElementOnImage from '../../../images/heater_element_png.js';
import wireBottomRightShortImage from '../../../images/wire_bottom_right_short_png.js';
import wireStraightImage from '../../../images/wire_straight_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import BeakerView from '../../common/view/BeakerView.js';
import EFACTemperatureAndColorSensorNode from '../../common/view/EFACTemperatureAndColorSensorNode.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerHeater from '../model/BeakerHeater.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const COIL_CENTER_X_OFFSET = -4;
const COIL_TOP_OFFSET = 15;

class BeakerHeaterNode extends MoveFadeModelElementNode {

  /**
   * @param {BeakerHeater} beakerHeater
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( beakerHeater, energyChunksVisibleProperty, modelViewTransform, tandem ) {
    super( beakerHeater, modelViewTransform, tandem );

    const wireStraightNode = new Image( wireStraightImage, {
      left: -111,
      top: 78,
      scale: EFACConstants.WIRE_IMAGE_SCALE
    } );
    const wireBottomRightNode = new Image( wireBottomRightShortImage, {
      left: wireStraightNode.right - 4,
      bottom: wireStraightNode.bottom + 2.1,
      scale: EFACConstants.WIRE_IMAGE_SCALE
    } );
    const elementBaseBackNode = new Image( elementBaseBackImage, {
      maxWidth: EFACConstants.ELEMENT_BASE_WIDTH,
      right: wireBottomRightNode.right + 22,
      top: wireBottomRightNode.top - 2.5
    } );
    const elementBaseFrontNode = new Image( elementBaseFrontImage, {
      maxWidth: elementBaseBackNode.width,
      centerX: elementBaseBackNode.centerX,
      top: wireBottomRightNode.top - 3
    } );
    const energizedCoilNode = new Image( heaterElementOnImage, {
      maxHeight: modelViewTransform.modelToViewDeltaX( BeakerHeater.HEATER_ELEMENT_2D_HEIGHT ),
      centerX: elementBaseFrontNode.centerX + COIL_CENTER_X_OFFSET,
      bottom: elementBaseFrontNode.top + COIL_TOP_OFFSET
    } );
    const nonEnergizedCoilNode = new Image( heaterElementOffImage, {
      maxHeight: modelViewTransform.modelToViewDeltaX( BeakerHeater.HEATER_ELEMENT_2D_HEIGHT ),
      centerX: elementBaseFrontNode.centerX + COIL_CENTER_X_OFFSET,
      bottom: elementBaseFrontNode.top + COIL_TOP_OFFSET
    } );

    // add the images that are used to depict this element along with the layer that will contain the energy chunks
    this.addChild( wireStraightNode );
    this.addChild( wireBottomRightNode );
    this.addChild( elementBaseBackNode );
    this.addChild( nonEnergizedCoilNode );
    this.addChild( energizedCoilNode );
    this.addChild( new EnergyChunkLayer(
      beakerHeater.energyChunkList,
      modelViewTransform,
      { parentPositionProperty: beakerHeater.positionProperty }
    ) );
    this.addChild( elementBaseFrontNode );

    // create a scale-and-translate MVT
    const scaleAndTranslateMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( beakerHeater.beaker.positionProperty.value.x, 0 ),
      Vector2.ZERO,
      modelViewTransform.getMatrix().getScaleVector().x
    );

    // @public (read-only) {BeakerView}
    this.beakerProxyNode = new BeakerView( beakerHeater.beaker, energyChunksVisibleProperty, scaleAndTranslateMVT, {
      tandem: tandem.createTandem( 'beakerProxyNode' )
    } );

    // from here on, the beakerView's position is updated by this, BeakerHeater
    this.beakerProxyNode.setFollowPosition( false );

    // back of the beaker
    this.addChild( this.beakerProxyNode.backNode );

    // between the front and back of the beaker we put a layer that will hold the radiated energy chunks
    this.addChild( new EnergyChunkLayer(
      beakerHeater.radiatedEnergyChunkList,
      modelViewTransform, {
        parentPositionProperty: beakerHeater.positionProperty
      }
    ) );

    // front of the beaker
    this.addChild( this.beakerProxyNode.frontNode );

    // create a scale-only MVT, since several sub-elements are relatively positioned
    const scaleOnlyMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      Vector2.ZERO,
      modelViewTransform.getMatrix().getScaleVector().x
    );

    // Add the thermometer that will indicate the beaker water temperature.  Since the position of the thermometer is
    // relative to the beaker heater, the model view transform must be compensated
    const thermometerNode = new EFACTemperatureAndColorSensorNode(
      beakerHeater.thermometer, {
        modelViewTransform: scaleOnlyMVT,
        tandem: tandem.createTandem( 'thermometerNode' )
      }
    );
    this.addChild( thermometerNode );

    // update the transparency of the hot element to make the dark element appear to heat up
    beakerHeater.heatProportionProperty.link( litProportion => {
      energizedCoilNode.opacity = litProportion;
    } );
  }

  /**
   * step this view element, called by the framework
   * @param dt - time step, in seconds
   * @public
   */
  step( dt ) {
    this.beakerProxyNode.step( dt );
  }

  /**
   * @public
   */
  reset() {
    this.beakerProxyNode.reset();
  }
}

energyFormsAndChanges.register( 'BeakerHeaterNode', BeakerHeaterNode );
export default BeakerHeaterNode;