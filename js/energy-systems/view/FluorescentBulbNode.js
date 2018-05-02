// Copyright 2016-2018, University of Colorado Boulder

/**
 *
 * @author  Andrew Adare
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var FluorescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FluorescentBulb' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var LightRays = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRays' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {FluorescentBulb} lightBulb
   * @param {Property.<boolean>} energyChunksVisibeProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function FluorescentBulbNode( lightBulb, energyChunksVisibleProperty, modelViewTransform ) {

    EFACBaseNode.call( this, lightBulb, modelViewTransform );

    var lightRays = new LightRays( Vector2.ZERO, 30, 400, 20, Color.YELLOW );
    this.addChild( lightRays );

    // Only show the light rays when the energy chunks are not shown.
    energyChunksVisibleProperty.link( function( visible ) {
      lightRays.setVisible( !visible );
    } );

    // Add the images and the layer that will contain the energy chunks.
    this.addChild( new EFACModelImageNode( LightBulb.WIRE_FLAT_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.WIRE_CURVE_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.ELEMENT_BASE_BACK_IMAGE, modelViewTransform ) );
    this.addChild( new EnergyChunkLayer( lightBulb.energyChunkList, lightBulb.positionProperty, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.ELEMENT_BASE_FRONT_IMAGE, modelViewTransform ) );

    var nonEnergizedBack = new EFACModelImageNode( FluorescentBulb.BACK_OFF, modelViewTransform );
    var energizedBack = new EFACModelImageNode( FluorescentBulb.BACK_ON, modelViewTransform );
    var nonEnergizedFront = new EFACModelImageNode( FluorescentBulb.FRONT_OFF, modelViewTransform );
    var energizedFront = new EFACModelImageNode( FluorescentBulb.FRONT_ON, modelViewTransform );

    this.addChild( nonEnergizedBack );
    this.addChild( energizedBack );
    this.addChild( nonEnergizedFront );
    this.addChild( energizedFront );

    // Make bulb partially transparent when energy chunks visible.
    energyChunksVisibleProperty.link( function( visible ) {
      var opacity = visible ? 0.7 : 1.0;
      nonEnergizedFront.setOpacity( opacity );
      nonEnergizedBack.setOpacity( opacity );
    } );

    // Center the light rays on the bulb image.
    lightRays.y = energizedFront.bounds.center.y - energizedFront.bounds.height * 0.1;

    // Update the transparency of the lit bulb based on model element.
    lightBulb.litProportionProperty.link( function( litProportion ) {
      var opacity = energyChunksVisibleProperty.get() ? 0.7 * litProportion : litProportion;
      energizedFront.setOpacity( opacity );
      energizedBack.setOpacity( opacity );
      lightRays.setOpacity( opacity );
    } );

  }

  energyFormsAndChanges.register( 'FluorescentBulbNode', FluorescentBulbNode );

  return inherit( EFACBaseNode, FluorescentBulbNode, {} );
} );

