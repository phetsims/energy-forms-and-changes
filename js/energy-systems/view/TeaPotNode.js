// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var inherit = require( 'PHET_CORE/inherit' );

  // TODO uncomment when needed
  // var BURNER_WIDTH = 125; // Empirically determined.
  // var BURNER_HEIGHT = BURNER_WIDTH * 0.75;
  // var BURNER_OPENING_WIDTH = BURNER_WIDTH * 0.1;

  /**
   * @param {TeaPot} teaPot              EnergySource
   * @param {Property<boolean>} energyChunksVisible [description]
   * @param {ModelViewTransform2} modelViewTransform  [description]
   * @constructor
   */
  function TeaPotNode( teaPot, energyChunksVisible, modelViewTransform ) {

    EFACBaseNode.call( this, teaPot, modelViewTransform );

    // this.teaPotImageNode = new ModelElementImageNode( TeaPot.TEAPOT_IMAGE, mvt );

  }

  return inherit( EFACBaseNode, TeaPotNode );
} );