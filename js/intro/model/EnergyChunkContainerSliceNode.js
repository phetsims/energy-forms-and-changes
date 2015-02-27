/**
 * A node that represents a 2D surface on which energy chunks reside.  The
 * surface contains z-dimension information, and can thus be used to create an
 * effect of layering in order to get a bit of a 3D appearance.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/energyChunkNode' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/node/Node' );

  // constants
  var ALWAYS_SHOW_OUTLINE = false;


  function EnergyChunkContainerSliceNode( energyChunkContainerSlice, modelViewTransform ) {

    var self = this;

    energyChunkContainerSlice.energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      self.addChild( energyChunkNode );
      energyChunkContainerSlice.energyChunkList.addItemRemovedListener( function( removedEnergyChunk ) {
        if ( removedEnergyChunk == addedEnergyChunk ) {
          self.removeChild( energyChunkNode );
          energyChunkContainerSlice.energyChunkList.removeItemRemovedListener( this );
        }
      } );
    } );
  }


  return inherit( Node, EnergyChunkContainerSliceNode );
} );

//TODO remove comments

//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
//import edu.colorado.phet.energyformsandchanges.common.view.EnergyChunkNode;
//import edu.umd.cs.piccolo.PNode;
//
///**
// * A node that represents a 2D surface on which energy chunks reside.  The
// * surface contains z-dimension information, and can thus be used to create an
// * effect of layering in order to get a bit of a 3D appearance.
// *
// * @author John Blanco
// */
//public class EnergyChunkContainerSliceNode extends PNode {
//
//  private static final boolean ALWAYS_SHOW_OUTLINE = false;
//
//  public EnergyChunkContainerSliceNode( final EnergyChunkContainerSlice energyChunkContainerSlice, final ModelViewTransform modelViewTransform ) {
//    this( energyChunkContainerSlice, modelViewTransform, false, Color.RED );
//  }
//
//  public EnergyChunkContainerSliceNode( final EnergyChunkContainerSlice energyChunkContainerSlice, final ModelViewTransform modelViewTransform, boolean showOutline, Color outlineColor ) {
//
//    // Watch for energy chunks coming and going and add/remove nodes accordingly.
//    energyChunkContainerSlice.energyChunkList.addElementAddedObserver( new VoidFunction1<EnergyChunk>() {
//      public void apply( final EnergyChunk addedEnergyChunk ) {
//        final PNode energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
//        addChild( energyChunkNode );
//        energyChunkContainerSlice.energyChunkList.addElementRemovedObserver( new VoidFunction1<EnergyChunk>() {
//          public void apply( EnergyChunk removedEnergyChunk ) {
//            if ( removedEnergyChunk == addedEnergyChunk ) {
//              removeChild( energyChunkNode );
//              energyChunkContainerSlice.energyChunkList.removeElementRemovedObserver( this );
//            }
//          }
//        } );
//      }
//    } );
//
//    // For debug.
//    if ( showOutline || ALWAYS_SHOW_OUTLINE ) {
//      addChild( new PhetPPath( modelViewTransform.modelToView( energyChunkContainerSlice.getShape() ), new BasicStroke( 1 ), outlineColor ) );
//    }
//  }
//}
