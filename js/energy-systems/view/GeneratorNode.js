// Copyright 2016, University of Colorado Boulder

/**
 * Node representing the water-powered generator in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Generator' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Generator} generator EnergyConverter
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GeneratorNode( generator, modelViewTransform ) {

    EFACBaseNode.call( this, generator, modelViewTransform );

    var spokesNode = new EFACModelImageNode( Generator.SHORT_SPOKES_IMAGE, modelViewTransform );
    var paddlesNode = new EFACModelImageNode( Generator.WHEEL_PADDLES_IMAGE, modelViewTransform );

    this.addChild( new EFACModelImageNode( Generator.WIRE_CURVED_IMAGE, modelViewTransform ) );
    // this.addChild( new EnergyChunkLayer( generator.electricalEnergyChunks, generator.getObservablePosition(), modelViewTransform ) );
    this.addChild( new EFACModelImageNode( Generator.HOUSING_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( Generator.CONNECTOR_IMAGE, modelViewTransform ) );
    this.addChild( spokesNode );
    this.addChild( paddlesNode );
    this.addChild( new EFACModelImageNode( Generator.WHEEL_HUB_IMAGE, modelViewTransform ) );
    // this.addChild( new EnergyChunkLayer( generator.hiddenEnergyChunks, generator.getObservablePosition(), modelViewTransform ) );
    // this.addChild( new EnergyChunkLayer( generator.energyChunkList, generator.getObservablePosition(), modelViewTransform ) );
  }

  return inherit( EFACBaseNode, GeneratorNode );
} );