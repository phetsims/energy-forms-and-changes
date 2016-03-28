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
  var BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  // var Image = require( 'SCENERY/nodes/Image' );
  var Vector2 = require( 'DOT/Vector2' );
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

    // Add the beaker.
    // A compensating MVT is needed because the beaker
    // node is being added as a child of this node, but wants to set its
    // own offset in model space.
    // var dx = -modelViewTransform.modelToViewDeltaX( beakerHeater.position.x );
    // var dy = -modelViewTransform.modelToViewDeltaY( beakerHeater.position.y );
    // var offset = new Vector2( dx, dy );

    var offset = new Vector2( -4,  -260 ); // Eyeballed. TODO: get from MVT?
    var scale = modelViewTransform.matrix.scaleVector;
    var beakerMvt = ModelViewTransform2.createOffsetXYScaleMapping( offset, scale.x, scale.y );

    var beakerView = new BeakerView( beakerHeater.beaker, energyChunksVisible, beakerMvt );

    this.addChild( beakerView.backNode );
    // addChild( new EnergyChunkLayer( beakerHeater.radiatedEnergyChunkList, beakerHeater.getObservablePosition(), mvt ) );
    this.addChild( beakerView.frontNode );
    // debugger;
  }

  energyFormsAndChanges.register( 'BeakerHeaterNode', BeakerHeaterNode );

  return inherit( EFACBaseNode, BeakerHeaterNode );
} );
