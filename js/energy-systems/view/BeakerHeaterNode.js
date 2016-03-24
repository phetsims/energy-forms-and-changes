// Copyright 2016, University of Colorado Boulder

/**
 * Node representing the beaker heater view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var BeakerHeater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/BeakerHeater' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  // var Image = require( 'SCENERY/nodes/Image' );

  /**
   * @param {BeakerHeater} beakerHeater
   * @param {Property<boolean>} energyChunksVisibe
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BeakerHeaterNode( beakerHeater, energyChunksVisible, modelViewTransform ) {

    EFACBaseNode.call( this, beakerHeater, modelViewTransform );

    // Add the images that are used to depict this element along with the
    // layer that will contain the energy chunks.
    this.addChild( new EFACModelImageNode( BeakerHeater.WIRE_STRAIGHT_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( BeakerHeater.WIRE_CURVE_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( BeakerHeater.ELEMENT_BASE_BACK_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( BeakerHeater.HEATER_ELEMENT_OFF_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( BeakerHeater.ELEMENT_BASE_FRONT_IMAGE, modelViewTransform ) );

    // final PImage energizedCoil = addImageNode( BeakerHeater.HEATER_ELEMENT_ON_IMAGE );
    // addChild( new EnergyChunkLayer( beakerHeater.energyChunkList, beakerHeater.getObservablePosition(), mvt ) );

  }

  energyFormsAndChanges.register( 'BeakerHeaterNode', BeakerHeaterNode );

  return inherit( EFACBaseNode, BeakerHeaterNode );
} );