// Copyright 2002-2015, University of Colorado

/**
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var BasicStroke = require( 'java.awt.BasicStroke' );
  var Color = require( 'SCENERY/util/Color' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );


  // constants
  var SHOW_BOUNDS = false;

  /**
   *
   * @param {Air} air
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function AirNode( air, modelViewTransform ) {

    Node.call( this );

    var airNode = this;

    if ( SHOW_BOUNDS ) {
      this.addChild( new Path( modelViewTransform.modelToView( air.getThermalContactArea().bounds ), {
        fill: 'red',
        lineWidth: 1
      } ) );
    }
    // Create a layer where energy chunks will be placed.
    var energyChunkLayer = new Node();
    this.addChild( energyChunkLayer );
    // Watch for energy chunks coming and going and add/remove nodes accordingly.
    air.getEnergyChunkList().addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      energyChunkLayer.addChild( energyChunkNode );
      air.getEnergyChunkList().addItemRemovedListener( function( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          energyChunkLayer.removeChild( energyChunkNode );
          air.getEnergyChunkList().removeItemRemovedListener( this );
        }
      } );
    } );
  }

  return inherit( Node, AirNode );
} );


//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
//import edu.colorado.phet.energyformsandchanges.common.view.EnergyChunkNode;
//import edu.colorado.phet.energyformsandchanges.intro.model.Air;
//import edu.umd.cs.piccolo.PNode;
//
///**
// * @author John Blanco
// */
//public class AirNode extends PNode {
//
//  private static final boolean SHOW_BOUNDS = false;
//
//  public AirNode( final Air air, final ModelViewTransform modelViewTransform ) {
//    if ( SHOW_BOUNDS ) {
//      addChild( new PhetPPath( modelViewTransform.modelToView( air.getThermalContactArea().getBounds() ), new BasicStroke( 1 ), Color.RED ) );
//    }
//
//    // Create a layer where energy chunks will be placed.
//    final PNode energyChunkLayer = new PNode();
//    addChild( energyChunkLayer );
//
//    // Watch for energy chunks coming and going and add/remove nodes accordingly.
//    air.getEnergyChunkList().addElementAddedObserver( new VoidFunction1<EnergyChunk>() {
//      public void apply( final EnergyChunk addedEnergyChunk ) {
//        final PNode energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
//        energyChunkLayer.addChild( energyChunkNode );
//        air.getEnergyChunkList().addElementRemovedObserver( new VoidFunction1<EnergyChunk>() {
//          public void apply( EnergyChunk removedEnergyChunk ) {
//            if ( removedEnergyChunk === addedEnergyChunk ) {
//              energyChunkLayer.removeChild( energyChunkNode );
//              air.getEnergyChunkList().removeElementRemovedObserver( this );
//            }
//          }
//        } );
//      }
//    } );
//  }
//}

