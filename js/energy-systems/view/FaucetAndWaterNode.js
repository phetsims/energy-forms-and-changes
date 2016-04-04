// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FaucetAndWater' );
  var FaucetNode = require( 'SCENERY_PHET/FaucetNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var WaterDropNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/WaterDropNode' );

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

    // Create the water, which consists of a set of water drops.
    var waterLayer = new Node();

    faucet.waterDrops.addItemAddedListener( function( addedDrop ) {
      var itemAddedListener = this;
      var waterDropNode = new WaterDropNode( addedDrop, modelViewTransform );
      waterLayer.addChild( waterDropNode );
      faucet.waterDrops.addItemRemovedListener( function( removedDrop ) {
        if ( addedDrop === removedDrop ) {
          faucet.waterDrops.removeItemAddedListener( itemAddedListener );
          waterLayer.removeChild( waterDropNode );
        }
      } );
    } );

    // final PNode waterLayer = new PNode();
    // faucet.waterDrops.addElementAddedObserver( new VoidFunction1 < WaterDrop > () {
    //   public void apply( final WaterDrop addedWaterDrop ) {
    //     final PNode waterDropNode = new WaterDropNode( addedWaterDrop, mvt );
    //     waterLayer.addChild( waterDropNode );
    //     faucet.waterDrops.addElementRemovedObserver( new VoidFunction1 < WaterDrop > () {
    //       public void apply( WaterDrop removedWaterDrop ) {
    //         if ( removedWaterDrop == addedWaterDrop ) {
    //           faucet.waterDrops.removeElementAddedObserver( this );
    //           waterLayer.removeChild( waterDropNode );
    //         }
    //       }
    //     } );
    //   }
    // } );
    // var waterNode = new Path();
    // final PPath waterNode = new PhetPPath( EFACConstants.WATER_COLOR_OPAQUE );
    // waterNode.setOffset( -mvt.modelToViewX( 0 ) + mvt.modelToViewDeltaX( FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN.getX() ), -mvt.modelToViewY( 0 ) + mvt.modelToViewDeltaY( FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN.getY() ) );
    this.addChild( waterLayer );
    this.addChild( faucetNode );
  }

  return inherit( EFACBaseNode, FaucetAndWaterNode );
} );
