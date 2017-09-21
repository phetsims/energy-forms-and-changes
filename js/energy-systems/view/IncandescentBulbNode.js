// Copyright 2016-2017, University of Colorado Boulder

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
  var IncandescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/IncandescentBulb' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var LightRays = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRays' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {IncandescentBulb} lightBulb
   * @param {Property.<boolean>} energyChunksVisibeProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function IncandescentBulbNode( lightBulb, energyChunksVisibleProperty, modelViewTransform ) {

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
    this.addChild( new EFACModelImageNode( IncandescentBulb.NON_ENERGIZED_BULB, modelViewTransform ) );

    var energizedBulb = new EFACModelImageNode( IncandescentBulb.ENERGIZED_BULB, modelViewTransform );
    this.addChild( energizedBulb );

    // Center the light rays on the bulb image.
    lightRays.y = energizedBulb.bounds.center.y - energizedBulb.bounds.height * 0.1;

    // Update the transparency of the lit bulb based on model element.
    lightBulb.litProportionProperty.link( function( litProportion ) {
      energizedBulb.setOpacity( litProportion );
      lightRays.setOpacity( litProportion );
    } );

  }

  energyFormsAndChanges.register( 'IncandescentBulbNode', IncandescentBulbNode );

  return inherit( EFACBaseNode, IncandescentBulbNode, {} );
} );

