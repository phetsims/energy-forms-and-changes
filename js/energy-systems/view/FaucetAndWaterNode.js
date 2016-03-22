// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FaucetAndWater' );
  var FaucetNode = require( 'SCENERY_PHET/FaucetNode' );
  var inherit = require( 'PHET_CORE/inherit' );

  // Constants
  var FAUCET_NODE_HORIZONTAL_LENGTH = 700; // In screen coords, which are close to pixels

  /**
   * @param {FaucetAndWater} faucet EnergySource
   * @param {Property<boolean>} energyChunksVisible [description]
   * @param {ModelViewTransform2} modelViewTransform  [description]
   * @constructor
   */
  function FaucetAndWaterNode( faucet, energyChunksVisible, modelViewTransform ) {

    EFACBaseNode.call( this, faucet, modelViewTransform );

    var maxFlowProportion = 1.0;
    var faucetNode = new FaucetNode( maxFlowProportion, faucet.flowProportionProperty, faucet.activeProperty, {
      horizontalPipeLength: FAUCET_NODE_HORIZONTAL_LENGTH,
      verticalPipeLength: 40,
      closeOnRelease: false
    } );

    faucetNode.setScaleMagnitude( 0.5 );

    // Position faucet node
    var faucetToWater = modelViewTransform.modelToViewDelta( FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN );
    var dx = -faucetNode.center.x + faucetToWater.x;
    var dy = +3.3 * faucetNode.center.y + faucetToWater.y; // Empirically tweaked TODO
    faucetNode.translate( dx, dy );

    this.addChild( faucetNode );
  }

  return inherit( EFACBaseNode, FaucetAndWaterNode );
} );