// Copyright 2016, University of Colorado Boulder

/**
 *
 * @author  Andrew Adare
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var FluorescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FluorescentBulb' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );

  // constants

  /**
   *
   * @param {FluorescentBulb} lightBulb
   * @param {Property<boolean>} energyChunksVisibe
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function FluorescentBulbNode( lightBulb, energyChunksVisible, modelViewTransform ) {

    EFACBaseNode.call( this, lightBulb, modelViewTransform );

    // TODO: Add light rays from Java
    // Add the images and the layer that will contain the energy chunks.

    this.addChild( new EFACModelImageNode( LightBulb.WIRE_FLAT_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.WIRE_CURVE_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( LightBulb.ELEMENT_BASE_BACK_IMAGE, modelViewTransform ) );
    // addChild( new EnergyChunkLayer( lightBulb.energyChunkList, lightBulb.getObservablePosition(), mvt ) );
    this.addChild( new EFACModelImageNode( LightBulb.ELEMENT_BASE_FRONT_IMAGE, modelViewTransform ) );

    var nonEnergizedBack = new EFACModelImageNode( FluorescentBulb.BACK_OFF, modelViewTransform );
    var energizedBack = new EFACModelImageNode( FluorescentBulb.BACK_ON, modelViewTransform );
    var nonEnergizedFront = new EFACModelImageNode( FluorescentBulb.FRONT_OFF, modelViewTransform );
    var energizedFront = new EFACModelImageNode( FluorescentBulb.FRONT_ON, modelViewTransform );

    this.addChild( nonEnergizedBack );
    this.addChild( energizedBack );
    this.addChild( nonEnergizedFront );
    this.addChild( energizedFront );
  }

  energyFormsAndChanges.register( 'FluorescentBulbNode', FluorescentBulbNode );

  return inherit( EFACBaseNode, FluorescentBulbNode, {} );
} );