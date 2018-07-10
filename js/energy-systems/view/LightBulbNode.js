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
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var FluorescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FluorescentBulb' );
  var IncandescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/IncandescentBulb' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var LightRays = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRays' );
  var Vector2 = require( 'DOT/Vector2' );

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
    this.addChild( new EFACModelImageNode( LightBulb.WIRE_FLAT_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.WIRE_CURVE_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.ELEMENT_BASE_BACK_IMAGE, modelViewTransform ) );
    this.addChild( new EnergyChunkLayer( lightBulb.energyChunkList, lightBulb.positionProperty, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.ELEMENT_BASE_FRONT_IMAGE, modelViewTransform ) );

    if ( options.bulbType === 'fluorescent' ) {
      var nonEnergizedBack = new EFACModelImageNode( FluorescentBulb.BACK_OFF, modelViewTransform );
      var energizedBack = new EFACModelImageNode( FluorescentBulb.BACK_ON, modelViewTransform );
      var nonEnergizedFront = new EFACModelImageNode( FluorescentBulb.FRONT_OFF, modelViewTransform );
      var energizedFront = new EFACModelImageNode( FluorescentBulb.FRONT_ON, modelViewTransform );

      this.addChild( nonEnergizedBack );
      this.addChild( energizedBack );
      this.addChild( nonEnergizedFront );
      this.addChild( energizedFront );

      // make bulb partially transparent when energy chunks visible
      energyChunksVisibleProperty.link( function( visible ) {
        var opacity = visible ? 0.7 : 1.0;
        nonEnergizedFront.setOpacity( opacity );
        nonEnergizedBack.setOpacity( opacity );
      } );

      // center the light rays on the bulb image
      lightRays.y = energizedFront.bounds.center.y - energizedFront.bounds.height * 0.1;

      // update the transparency of the lit bulb based on model element
      lightBulb.litProportionProperty.link( function( litProportion ) {
        var opacity = energyChunksVisibleProperty.get() ? 0.7 * litProportion : litProportion;
        energizedFront.setOpacity( opacity );
        energizedBack.setOpacity( opacity );
        lightRays.setOpacity( opacity );
      } );
    }
    else {
      var nonEnergizedBulb = new EFACModelImageNode( IncandescentBulb.NON_ENERGIZED_BULB, modelViewTransform );
      var energizedBulb = new EFACModelImageNode( IncandescentBulb.ENERGIZED_BULB, modelViewTransform );
      this.addChild( nonEnergizedBulb );
      this.addChild( energizedBulb );

      // center the light rays on the bulb image
      lightRays.y = energizedBulb.bounds.center.y - energizedBulb.bounds.height * 0.1;

      // update the transparency of the lit bulb based on model element
      lightBulb.litProportionProperty.link( function( litProportion ) {
        energizedBulb.setOpacity( litProportion );
        lightRays.setOpacity( litProportion );
      } );
    }
  }

  energyFormsAndChanges.register( 'LightBulbNode', LightBulbNode );

  return inherit( MoveFadeModelElementNode, LightBulbNode, {} );
} );