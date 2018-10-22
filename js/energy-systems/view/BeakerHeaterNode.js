// Copyright 2016, University of Colorado Boulder

/**
 * a Scenery Node representing the beaker heater in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var BeakerHeater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/BeakerHeater' );
  var BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var TemperatureAndColorSensorNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/TemperatureAndColorSensorNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var elementBaseBackImage = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var elementBaseFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var heaterElementOnImage = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element.png' );
  var heaterElementOffImage = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element_dark.png' );
  var wireBottomRightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_right.png' );
  var wireStraightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_straight.png' );

  // constants
  var COIL_NODE_CENTER_X_OFFSET = -4;
  var COIL_NODE_TOP_OFFSET = 15;

  /**
   * @param {BeakerHeater} beakerHeater
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BeakerHeaterNode( beakerHeater, energyChunksVisibleProperty, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, beakerHeater, modelViewTransform );

    var wireStraightNode = new Image( wireStraightImage, { left: -112, top: 78 } );
    var wireBottomRightNode = new Image( wireBottomRightImage, {
      left: wireStraightNode.right - 4,
      bottom: wireStraightNode.bottom + 2.5
    } );
    var elementBaseBackNode = new Image( elementBaseBackImage, {
      right: wireBottomRightNode.right + 22,
      top: wireBottomRightNode.top - 2.5
    } );
    var elementBaseFrontNode = new Image( elementBaseFrontImage, {
      centerX: elementBaseBackNode.centerX,
      top: wireBottomRightNode.top - 3
    } );
    var energizedCoilNode = new Image( heaterElementOnImage, {
      maxHeight: modelViewTransform.modelToViewDeltaX( BeakerHeater.HEATER_ELEMENT_2D_HEIGHT ),
      centerX: elementBaseFrontNode.centerX + COIL_NODE_CENTER_X_OFFSET,
      bottom: elementBaseFrontNode.top + COIL_NODE_TOP_OFFSET
    } );
    var nonEnergizedCoilNode = new Image( heaterElementOffImage, {
      maxHeight: modelViewTransform.modelToViewDeltaX( BeakerHeater.HEATER_ELEMENT_2D_HEIGHT ),
      centerX: elementBaseFrontNode.centerX + COIL_NODE_CENTER_X_OFFSET,
      bottom: elementBaseFrontNode.top + COIL_NODE_TOP_OFFSET
    } );

    // add the images that are used to depict this element along with the layer that will contain the energy chunks
    this.addChild( wireStraightNode );
    this.addChild( wireBottomRightNode );
    this.addChild( elementBaseBackNode );
    this.addChild( nonEnergizedCoilNode );
    this.addChild( energizedCoilNode );
    this.addChild( new EnergyChunkLayer( beakerHeater.energyChunkList, beakerHeater.positionProperty, modelViewTransform ) );
    this.addChild( elementBaseFrontNode );

    // create a scale-only MVT, since several sub-elements are relatively positioned
    var scaleAndTranslateMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      new Vector2( beakerHeater.beaker.positionProperty.value.x, 0 ),
      Vector2.ZERO,
      modelViewTransform.getMatrix().getScaleVector().x
    );

    // @public (read-only) {BeakerView}
    this.beakerView = new BeakerView( beakerHeater.beaker, energyChunksVisibleProperty, scaleAndTranslateMVT );

    this.addChild( this.beakerView.backNode );
    this.addChild( new EnergyChunkLayer(
      beakerHeater.radiatedEnergyChunkList,
      beakerHeater.beaker.positionProperty,
      modelViewTransform
    ) );
    this.addChild( this.beakerView.frontNode );

    // create a scale-only MVT, since several sub-elements are relatively positioned
    var scaleOnlyMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      Vector2.ZERO,
      modelViewTransform.getMatrix().getScaleVector().x
    );

    // Add the thermometer that will indicate the beaker water temperature.  Since the position of the thermometer is
    // relative to the beaker heater, the model view transform must be compensated
    var temperatureAndColorSensorNode = new TemperatureAndColorSensorNode( beakerHeater.temperatureAndColorSensor, {
      modelViewTransform: scaleOnlyMVT
    } );
    this.addChild( temperatureAndColorSensorNode );

    // update the transparency of the hot element to make the dark element appear to heat up
    beakerHeater.heatProportionProperty.link( function( litProportion ) {
      energizedCoilNode.opacity = litProportion;
    } );
  }

  energyFormsAndChanges.register( 'BeakerHeaterNode', BeakerHeaterNode );

  return inherit( MoveFadeModelElementNode, BeakerHeaterNode, {

    /**
     * step this view element, called by the framework
     * @param dt - time step, in seconds
     * @public
     */
    step: function( dt ) {
      this.beakerView.step( dt );
    }
  } );
} );
