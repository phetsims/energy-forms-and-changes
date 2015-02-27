// Copyright 2002-2015, University of Colorado

/**
 * Class that represents a "beaker container" in the view.  A beaker container
 * is a beaker that contains fluid, and in which other objects can be placed,
 * generally displacing the fluid.
 * <p/>
 * See the header comments in the parent class for some important information
 * about how this class is used on the canvas.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  //modules
  var Area = require( 'java.awt.geom.Area' );
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EFACIntroModel' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );


  /**
   * *
   * @param model
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BeakerContainerView( model, modelViewTransform ) {
    BeakerView.call( this, model.getBeaker(), model.energyChunksVisible, modelViewTransform );

    this.modelViewTransform = modelViewTransform;
    this.model = model;
    
    // mask hides energy chunks that overlap with blocks.
    for ( var block in model.getBlockList() ) {
      block.positionProperty.link( function() {
        this.updateEnergyChunkClipMask( model, this.energyChunkClipNode );
      } );
    }
    var beaker = model.getBeaker();
    model.getBeaker().positionProperty.link( function( position ) {
      BeakerContainerView.this.updateEnergyChunkClipMask( model, this.energyChunkClipNode );
    } );
    // Add the cursor handler.
    grabNode.addInputListener( new CursorHandler( CursorHandler.HAND ) );
    // Add the drag handler.
    var offsetPosToCenter = new Vector2( grabNode.bounds.centerX - modelViewTransform.modelToViewX( beaker.position.x ), grabNode.bounds.centerY - modelViewTransform.modelToViewY( beaker.position.y ) );
    grabNode.addInputListener( new ThermalElementDragHandler( beaker, grabNode, modelViewTransform, new ThermalItemMotionConstraint( model, beaker, grabNode, modelViewTransform, offsetPosToCenter ) ) );
  }

  return inherit( BeakerView, BeakerContainerView, {
// Update the clipping mask that hides energy chunks behind blocks that are in the beaker.
    updateEnergyChunkClipMask: function( model, clip ) {
      var forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( Block.SURFACE_WIDTH / 2 );
      var backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( -Block.SURFACE_WIDTH / 2 );
      var clippingMask = new Area( frontNode.bounds );
      for ( var block in model.getBlockList() ) {
        if ( model.getBeaker().getRect().contains( block.getRect() ) ) {
          var rect = block.getRect();

          var shape = new Shape()
            .moveToPoint( new Vector2( rect.getX(), rect.getY() ).plus( forwardPerspectiveOffset ) )
            .lineToPoint( new Vector2( rect.maxX, rect.getY() ).plus( forwardPerspectiveOffset ) )
            .lineToPoint( new Vector2( rect.maxX, rect.getY() ).plus( backwardPerspectiveOffset ) )
            .lineToPoint( new Vector2( rect.maxX, rect.maxY ).plus( backwardPerspectiveOffset ) )
            .lineToPoint( new Vector2( rect.minX, rect.maxY ).plus( backwardPerspectiveOffset ) )
            .lineToPoint( new Vector2( rect.minX, rect.maxY ).plus( forwardPerspectiveOffset ) )
            .close();
          clippingMask.subtract( new Area( this.modelViewTransform.modelToViewShape( shape ) ) );
        }
      }
      clip.setPathTo( clippingMask );
    }
  } );
} );


//
//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.geom.Area;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.IClock;
//import edu.colorado.phet.common.phetcommon.util.SimpleObserver;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath;
//import edu.colorado.phet.common.piccolophet.event.CursorHandler;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.common.model.Beaker;
//import edu.colorado.phet.energyformsandchanges.common.view.BeakerView;
//import edu.colorado.phet.energyformsandchanges.intro.model.Block;
//import edu.colorado.phet.energyformsandchanges.intro.model.EFACIntroModel;
//import edu.umd.cs.piccolox.nodes.PClip;
//
///**
// * Class that represents a "beaker container" in the view.  A beaker container
// * is a beaker that contains fluid, and in which other objects can be placed,
// * generally displacing the fluid.
// * <p/>
// * See the header comments in the parent class for some important information
// * about how this class is used on the canvas.
// *
// * @author John Blanco
// */
//public class BeakerContainerView extends BeakerView {
//
//  public BeakerContainerView( IClock clock, final EFACIntroModel model, final ModelViewTransform modelViewTransform ) {
//    super( clock, model.getBeaker(), model.energyChunksVisible, modelViewTransform );
//
//    // Update the clipping mask when any of the blocks move.  The clipping
//    // mask hides energy chunks that overlap with blocks.
//    for ( Block block : model.getBlockList() ) {
//      block.position.addObserver( new SimpleObserver() {
//        public void update() {
//          updateEnergyChunkClipMask( model, energyChunkClipNode );
//        }
//      } );
//    }
//
//    Beaker beaker = model.getBeaker();
//    model.getBeaker().position.addObserver( new VoidFunction1<Vector2D>() {
//      public void apply( Vector2D position ) {
//        BeakerContainerView.this.updateEnergyChunkClipMask( model, energyChunkClipNode );
//      }
//    } );
//
//    // Add the cursor handler.
//    grabNode.addInputEventListener( new CursorHandler( CursorHandler.HAND ) );
//
//    // Add the drag handler.
//    final Vector2D offsetPosToCenter = new Vector2D( grabNode.getFullBoundsReference().getCenterX() - modelViewTransform.modelToViewX( beaker.position.x ),
//        grabNode.getFullBoundsReference().getCenterY() - modelViewTransform.modelToViewY( beaker.position.y ) );
//
//    grabNode.addInputEventListener( new ThermalElementDragHandler( beaker,
//      grabNode,
//      modelViewTransform,
//      new ThermalItemMotionConstraint( model,
//        beaker,
//        grabNode,
//        modelViewTransform,
//        offsetPosToCenter ) ) );
//  }
//
//  // Update the clipping mask that hides energy chunks behind blocks that are in the beaker.
//  protected void updateEnergyChunkClipMask( EFACIntroModel model, PClip clip ) {
//    Vector2D forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( Block.SURFACE_WIDTH / 2 );
//    Vector2D backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( -Block.SURFACE_WIDTH / 2 );
//
//    Area clippingMask = new Area( frontNode.getFullBoundsReference() );
//    for ( Block block : model.getBlockList() ) {
//      if ( model.getBeaker().getRect().contains( block.getRect() ) ) {
//        DoubleGeneralPath path = new DoubleGeneralPath();
//        Rectangle2D rect = block.getRect();
//        path.moveTo( new Vector2D( rect.getX(), rect.getY() ).plus( forwardPerspectiveOffset ) );
//        path.lineTo( new Vector2D( rect.maxX, rect.getY() ).plus( forwardPerspectiveOffset ) );
//        path.lineTo( new Vector2D( rect.maxX, rect.getY() ).plus( backwardPerspectiveOffset ) );
//        path.lineTo( new Vector2D( rect.maxX, rect.maxY ).plus( backwardPerspectiveOffset ) );
//        path.lineTo( new Vector2D( rect.minX, rect.getMaxY() ).plus( backwardPerspectiveOffset ) );
//        path.lineTo( new Vector2D( rect.minX, rect.getMaxY() ).plus( forwardPerspectiveOffset ) );
//        path.closePath();
//        clippingMask.subtract( new Area( modelViewTransform.modelToView( path.getGeneralPath() ) ) );
//      }
//    }
//    clip.setPathTo( clippingMask );
//  }
//}
