// Copyright 2016, University of Colorado Boulder

/**
 * a scenery node that represents a faucet from which water flows
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FaucetAndWater' );
  var FaucetNode = require( 'SCENERY_PHET/FaucetNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var WaterDropNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/WaterDropNode' );

  // constants
  var FAUCET_NODE_HORIZONTAL_LENGTH = 1400; // empirically determined to be long enough that end is generally not seen

  /**
   * @param {FaucetAndWater} faucet EnergySource
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function FaucetAndWaterNode( faucet, energyChunksVisibleProperty, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, faucet, modelViewTransform );

    var maxFlowProportion = 1.0;
    var faucetNode = new FaucetNode( maxFlowProportion, faucet.flowProportionProperty, faucet.activeProperty, {
      horizontalPipeLength: FAUCET_NODE_HORIZONTAL_LENGTH,
      verticalPipeLength: 40,
      scale: 0.45
    } );

    // position faucet node such that the water will appear to come out of it
    var faucetToWater = modelViewTransform.modelToViewDelta( FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN );
    faucetNode.right = faucetToWater.x + 30;
    faucetNode.bottom = faucetToWater.y;

    // create the water, which consists of a set of water drops
    var waterLayer = new Node();
    waterLayer.translate( faucetToWater );

    function addDroplet( droplet ) {
      var waterDropNode = new WaterDropNode( droplet, modelViewTransform );
      waterLayer.addChild( waterDropNode );

      // when droplet is removed from the model, remove its node from the view
      var itemRemovedListener = function( removedDroplet ) {
        if ( removedDroplet === droplet ) {
          waterLayer.removeChild( waterDropNode );

          // remove this listener to reclaim memory
          faucet.waterDrops.removeItemRemovedListener( itemRemovedListener );
        }
      };

      // link itemRemovedListener to the waterDrops ObservableArray
      faucet.waterDrops.addItemRemovedListener( itemRemovedListener );
    }

    faucet.waterDrops.addItemAddedListener( addDroplet );

    // create the energy chunk layer
    var energyChunkLayer = new EnergyChunkLayer( faucet.energyChunkList, faucet.positionProperty, modelViewTransform );

    this.addChild( waterLayer );
    this.addChild( energyChunkLayer );
    this.addChild( faucetNode );
  }

  energyFormsAndChanges.register( 'FaucetAndWaterNode', FaucetAndWaterNode );

  return inherit( MoveFadeModelElementNode, FaucetAndWaterNode );
} );
