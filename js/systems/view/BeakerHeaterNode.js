// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node representing the beaker heater in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BeakerHeater = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/BeakerHeater' );
  const BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Image = require( 'SCENERY/nodes/Image' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  const EFACTemperatureAndColorSensorNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EFACTemperatureAndColorSensorNode' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const elementBaseBackImage = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  const elementBaseFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  const heaterElementOffImage = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element_dark.png' );
  const heaterElementOnImage = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element.png' );
  const wireBottomRightShortImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_right_short.png' );
  const wireStraightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_straight.png' );

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
      this.beakerView = new BeakerView( beakerHeater.beaker, energyChunksVisibleProperty, scaleAndTranslateMVT );

      // from here on, the beakerView's position is updated by this, BeakerHeater
      this.beakerView.setFollowPosition( false );

      // back of the beaker
      this.addChild( this.beakerView.backNode );

      // between the front and back of the beaker we put a layer that will hold the radiated energy chunks
      this.addChild( new EnergyChunkLayer(
        beakerHeater.radiatedEnergyChunkList,
        modelViewTransform, {
          parentPositionProperty: beakerHeater.positionProperty }
      ) );

      // front of the beaker
      this.addChild( this.beakerView.frontNode );

      // create a scale-only MVT, since several sub-elements are relatively positioned
      const scaleOnlyMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        Vector2.ZERO,
        Vector2.ZERO,
        modelViewTransform.getMatrix().getScaleVector().x
      );

      // Add the thermometer that will indicate the beaker water temperature.  Since the position of the thermometer is
      // relative to the beaker heater, the model view transform must be compensated
      const temperatureAndColorSensorNode = new EFACTemperatureAndColorSensorNode(
        beakerHeater.thermometer,
        { modelViewTransform: scaleOnlyMVT }
      );
      this.addChild( temperatureAndColorSensorNode );

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
      this.beakerView.step( dt );
    }
  }

  return energyFormsAndChanges.register( 'BeakerHeaterNode', BeakerHeaterNode );
} );
