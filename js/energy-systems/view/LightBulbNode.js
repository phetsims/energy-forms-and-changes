// Copyright 2016-2018, University of Colorado Boulder

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
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRays = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRays' );
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
  var wireFlatImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_62.png' );
  var wireCurveImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_right.png' );

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
    var wireFlatNode = new Image( wireFlatImage, { left: -112, top: 77 } );
    var wireCurveNode = new Image( wireCurveImage, { left: wireFlatNode.right - 1, bottom: wireFlatNode.bottom + 1 } );
    var elementBaseBackNode = new Image( elementBaseBackImage, {
      right: wireCurveNode.right + 24,
      top: wireCurveNode.top - 2
    } );
    var elementBaseFrontNode = new Image( elementBaseFrontImage, {
      centerX: elementBaseBackNode.centerX,
      top: wireCurveNode.top - 3
    } );

    this.addChild( wireFlatNode );
    this.addChild( wireCurveNode );
    this.addChild( elementBaseBackNode );
    this.addChild( new EnergyChunkLayer( lightBulb.energyChunkList, lightBulb.positionProperty, modelViewTransform ) );
    this.addChild( elementBaseFrontNode );

    if ( options.bulbType === 'fluorescent' ) {
      var fluorescentOffBackNode = new Image( fluorescentOffBackImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + 28
      } );
      var fluorescentOnBackNode = new Image( fluorescentOnBackImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + 28
      } );
      var fluorescentOffFrontNode = new Image( fluorescentOffFrontImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + 28
      } );
      var fluorescentOnFrontNode = new Image( fluorescentOnFrontImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + 28
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
        bottom: elementBaseFrontNode.top + 31
      } );
      var incandescentOnNode = new Image( incandescentOnImage, {
        centerX: elementBaseFrontNode.centerX,
        bottom: elementBaseFrontNode.top + 31
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