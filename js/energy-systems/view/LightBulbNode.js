// Copyright 2018, University of Colorado Boulder

/**
 * a scenery node that represents a light bulb in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 * @author Chris Klusendorf
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRays = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRays' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var elementBaseBackImage = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var elementBaseFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var fluorescentOffBackImage = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_back_2.png' );
  var fluorescentOffFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_front_2.png' );
  var fluorescentOnBackImage = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_on_back_2.png' );
  var fluorescentOnFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_on_front_2.png' );
  var incandescentOffImage = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_2.png' );
  var incandescentOnImage = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_on_3.png' );
  var wireBottomRightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_right.png' );
  var wireStraightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_straight.png' );

  // constants
  var FLUORESCENT_BULB_TOP_OFFSET = 28;
  var INCANDESCENT_BULB_TOP_OFFSET = 31;

  /**
   * @param {FluorescentBulb} lightBulb
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function LightBulbNode( lightBulb, energyChunksVisibleProperty, modelViewTransform, options ) {

    options = _.extend( {

      // LightBulbNode options
      bulbType: 'fluorescent'
    }, options );

    assert && assert(
      options.bulbType === 'fluorescent' || options.bulbType === 'incandescent',
      'bulbType should be fluorescent or incandescent'
    );

    MoveFadeModelElementNode.call( this, lightBulb, modelViewTransform );

    var lightRays = new LightRays( Vector2.ZERO, 30, 400, 20, Color.YELLOW );
    this.addChild( lightRays );

    // only show the light rays when the energy chunks are not shown
    energyChunksVisibleProperty.link( function( visible ) {
      lightRays.setVisible( !visible );
    } );

    // add the images and the layer that will contain the energy chunks
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

    this.addChild( wireStraightNode );
    this.addChild( wireBottomRightNode );
    this.addChild( elementBaseBackNode );
    this.addChild( new EnergyChunkLayer( lightBulb.energyChunkList, lightBulb.positionProperty, modelViewTransform ) );
    this.addChild( elementBaseFrontNode );

    if ( options.bulbType === 'fluorescent' ) {
      var fluorescentOffBackNode = new Image( fluorescentOffBackImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );
      var fluorescentOnBackNode = new Image( fluorescentOnBackImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );
      var fluorescentOffFrontNode = new Image( fluorescentOffFrontImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );
      var fluorescentOnFrontNode = new Image( fluorescentOnFrontImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + FLUORESCENT_BULB_TOP_OFFSET
      } );

      this.addChild( fluorescentOffBackNode );
      this.addChild( fluorescentOnBackNode );
      this.addChild( fluorescentOffFrontNode );
      this.addChild( fluorescentOnFrontNode );

      // make bulb partially transparent when energy chunks visible
      energyChunksVisibleProperty.link( function( visible ) {
        var opacity = visible ? 0.7 : 1.0;
        fluorescentOffFrontNode.setOpacity( opacity );
        fluorescentOffBackNode.setOpacity( opacity );
      } );

      // center the light rays on the bulb image
      lightRays.y = fluorescentOnFrontNode.bounds.center.y - fluorescentOnFrontNode.bounds.height * 0.1;

      // update the transparency of the lit bulb based on model element
      lightBulb.litProportionProperty.link( function( litProportion ) {
        var opacity = energyChunksVisibleProperty.get() ? 0.7 * litProportion : litProportion;
        fluorescentOnFrontNode.setOpacity( opacity );
        fluorescentOnBackNode.setOpacity( opacity );
        lightRays.setOpacity( opacity );
      } );
    }
    else {
      var incandescentOffNode = new Image( incandescentOffImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + INCANDESCENT_BULB_TOP_OFFSET
      } );
      var incandescentOnNode = new Image( incandescentOnImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + INCANDESCENT_BULB_TOP_OFFSET
      } );
      this.addChild( incandescentOffNode );
      this.addChild( incandescentOnNode );

      // center the light rays on the bulb image
      lightRays.y = incandescentOnNode.bounds.center.y - incandescentOnNode.bounds.height * 0.1;

      // update the transparency of the lit bulb based on model element
      lightBulb.litProportionProperty.link( function( litProportion ) {
        incandescentOnNode.setOpacity( litProportion );
        lightRays.setOpacity( litProportion );
      } );
    }
  }

  energyFormsAndChanges.register( 'LightBulbNode', LightBulbNode );

  return inherit( MoveFadeModelElementNode, LightBulbNode, {} );
} );