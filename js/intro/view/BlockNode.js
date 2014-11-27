// Copyright 2002-2012, University of Colorado
/**
 * Piccolo node that represents a block in the view.  The blocks in the model
 * are 2D, and this class gives them some perspective in order to make them
 * appear to be 3D.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EFACIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EFACIntroModel' );
  var EnergyChunkContainerSliceNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkContainerSliceNode' );
  var Font = require( 'SCENERY/util/Font' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );


  // constants


  // Constants that define the 3D projection.  Public so that model can reference.
  var PERSPECTIVE_ANGLE = Math.atan2( -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER, -EFACConstants.Z_TO_X_OFFSET_MULTIPLIER );
  var PERSPECTIVE_EDGE_PROPORTION = Math.sqrt( Math.pow( EFACConstants.Z_TO_X_OFFSET_MULTIPLIER, 2 ) +
                                               Math.pow( EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER, 2 ) );

  var LABEL_FONT = new PhetFont( 32, false );
  var OUTLINE_STROKE = new BasicStroke( 3, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL );
  var OUTLINE_STROKE_COLOR = Color.DARK_GRAY;

  var SHOW_2D_REPRESENTATION = false;


  function BlockNode( model, block, mvt ) {
    Node.call( this, { cursor: 'pointer'  } );
    var blockNode = this;
    this.block = block;
    // shape from the position of the block.
    var scaleTransform = AffineTransform.getScaleInstance( mvt.getTransform().getScaleX(), mvt.getTransform().getScaleY() );
    // Create the shape for the front of the block.
    var blockRectInViewCoords = scaleTransform.createTransformedShape( Block.getRawShape() ).bounds;
    var perspectiveEdgeSize = mvt.modelToViewDeltaX( block.getRect().getWidth() * PERSPECTIVE_EDGE_PROPORTION );
    var blockFaceOffset = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotate( -PERSPECTIVE_ANGLE );
    var backCornersOffset = new Vector2( perspectiveEdgeSize, 0 ).rotate( -PERSPECTIVE_ANGLE );
    var lowerLeftFrontCorner = new Vector2( blockRectInViewCoords.getMinX(), blockRectInViewCoords.getMaxY() ).plus( blockFaceOffset );
    var lowerRightFrontCorner = new Vector2( blockRectInViewCoords.getMaxX(), blockRectInViewCoords.getMaxY() ).plus( blockFaceOffset );
    var upperRightFrontCorner = new Vector2( blockRectInViewCoords.getMaxX(), blockRectInViewCoords.getMinY() ).plus( blockFaceOffset );
    var upperLeftFrontCorner = new Vector2( blockRectInViewCoords.getMinX(), blockRectInViewCoords.getMinY() ).plus( blockFaceOffset );
    var blockFaceShape = Shape.rectangle( lowerLeftFrontCorner.getX(), upperLeftFrontCorner.getY(), blockRectInViewCoords.getWidth(), blockRectInViewCoords.getHeight() );
    // Create the shape of the top of the block.
    var upperLeftBackCorner = upperLeftFrontCorner.plus( backCornersOffset );
    var upperRightBackCorner = upperRightFrontCorner.plus( backCornersOffset );
    var blockTopShape = new Shape();
    blockTopShape.moveToPoint( upperLeftFrontCorner )
      .lineToPoint( upperRightFrontCorner )
      .lineToPoint( upperRightBackCorner )
      .lineToPoint( upperLeftBackCorner )
      .lineToPoint( upperLeftFrontCorner );
    //   var blockTopShape = blockTopPath.getGeneralPath();
    // Create the shape of the side of the block.
    var lowerRightBackCorner = lowerRightFrontCorner.plus( backCornersOffset );
    var blockSideShape = new Shape();
    blockSideShape.moveToPoint( upperRightFrontCorner )
      .lineToPoint( lowerRightFrontCorner )
      .lineToPoint( lowerRightBackCorner )
      .lineToPoint( upperRightBackCorner )
      .lineToPoint( upperRightFrontCorner );

    // Create the shape for the back of the block.
    var lowerLeftBackCorner = lowerLeftFrontCorner.plus( backCornersOffset );
    var blockBackShape = new Shape();
    blockBackShape.moveToPoint( lowerLeftBackCorner )
      .lineToPoint( lowerRightBackCorner )
      .moveToPoint( lowerLeftBackCorner )
      .lineToPoint( lowerLeftFrontCorner )
      .moveToPoint( lowerLeftBackCorner )
      .lineToPoint( upperLeftBackCorner );

    // Add the back of the block.
    var blockBack = new Path( blockBackShape, OUTLINE_STROKE, OUTLINE_STROKE_COLOR );
    this.addChild( blockBack );
    // Create the layers where the energy chunks will be placed.
    var energyChunkRootNode = new Node();
    this.addChild( energyChunkRootNode );
    for ( var i = block.getSlices().size() - 1; i >= 0; i-- ) {
      energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( block.getSlices().get( i ), mvt ) );
    }
    // Add the face, top, and sides of the block.
    var blockFace = this.createSurface( blockFaceShape, block.getColor(), block.getFrontTextureImage() );
    var blockTop = this.createSurface( blockTopShape, block.getColor(), block.getTopTextureImage() );
    var blockSide = this.createSurface( blockSideShape, block.getColor(), block.getSideTextureImage() );
    this.addChild( blockFace );
    this.addChild( blockTop );
    this.addChild( blockSide );
    if ( SHOW_2D_REPRESENTATION ) {
      this.addChild( new Path( scaleTransform.createTransformedShape( Block.getRawShape() ), new BasicStroke( 1 ), Color.RED ) );
    }
    // Position and add the label.
    var label = new Text( block.getLabel() );
    label.setFont( LABEL_FONT );
    if ( label.bounds.width >= mvt.modelToViewDeltaX( Block.SURFACE_WIDTH * 0.9 ) ) {
      // Scale the label to fit on the face of the block.
      var scale = (mvt.modelToViewDeltaX( Block.SURFACE_WIDTH * 0.9 ) / label.bounds.width);
      label.setScale( scale );
    }
    var labelCenterX = (upperLeftFrontCorner.x + upperRightFrontCorner.x) / 2;
    var labelCenterY = (upperLeftFrontCorner.y - mvt.modelToViewDeltaY( Block.SURFACE_WIDTH ) / 2);
    label.translation = {x: labelCenterX, y: labelCenterY};
    this.addChild( label );
    // this model element and add/remove them as needed.

    this.approachingEnergyChunkParentNode = new Node();
    block.approachingEnergyChunks.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, mvt );
      var parentNode = this.approachingEnergyChunkParentNode == null ? energyChunkRootNode : this.approachingEnergyChunkParentNode;
      parentNode.addChild( energyChunkNode );
      block.approachingEnergyChunks.addItemRemovedListener( function( removedEnergyChunk ) {
        if ( removedEnergyChunk == addedEnergyChunk ) {
          parentNode.removeChild( energyChunkNode );
          block.approachingEnergyChunks.removeItemRemovedListener( this );
        }
      } );
    } );
    // that it looks like they are in the block.
    block.energyChunksVisibleProperty.link( function( energyChunksVisible ) {
      var opaqueness = energyChunksVisible ? 0.5 : 1.0;
      blockFace.setTransparency( opaqueness );
      blockTop.setTransparency( opaqueness );
      blockSide.setTransparency( opaqueness );
      label.setTransparency( opaqueness );
    } );
    // Update the offset if and when the model position changes.
    block.positionProperty.link( function( newPosition ) {
      setOffset( mvt.modelToView( newPosition ) );
      // nodes can handle their own positioning.
      energyChunkRootNode.translation = mvt.modelToView( newPosition ).rotate( Math.PI );
    } );
    // Add the drag handler.
    var offsetPosToCenter = new Vector2( this.bounds.getCenterX() - mvt.modelToViewX( block.position.x ), this.bounds.getCenterY() - mvt.modelToViewY( block.position.y ) );
    this.addInputListener( new ThermalElementDragHandler( block, this, mvt, new ThermalItemMotionConstraint( model, block, this, mvt, offsetPosToCenter ) ) );
  }

  return inherit( Node, BlockNode, {
//-------------------------------------------------------------------------
// Methods
//-------------------------------------------------------------------------
    setApproachingEnergyChunkParentNode: function( node ) {
      // This should not be set more than once.
      assert && assert( this.approachingEnergyChunkParentNode == null );
      this.approachingEnergyChunkParentNode = node;
    },
    /*
     * Convenience method to avoid code duplication.  Adds a node of the given
     * shape, color, and texture (if a texture is specified).
     */
//private
    createSurface: function( shape, fillColor, textureImage ) {
      var root = new Node();
      // provided, this may end up getting partially or entirely covered up.
      root.addChild( new Path( shape, {fill: fillColor} ) );
      if ( textureImage != null ) {
        // Add the clipped texture.
        var clippedTexture = new Node();
        clippedTexture.shape = shape;
        var texture = new Image( textureImage );
        // Scale up the texture image if needed.
        var textureScale = 1;
        if ( texture.bounds.width < clippedTexture.bounds.width ) {
          textureScale = clippedTexture.bounds.width / texture.bounds.width;
        }
        if ( texture.bounds.height < clippedTexture.bounds.height ) {
          textureScale = Math.max( clippedTexture.bounds.height / texture.bounds.height, textureScale );
        }
        texture.setScale( textureScale );
        // Add the texture to the clip node in order to clip it.
        texture.translation = {x: clippedTexture.bounds.minX, y: clippedTexture.bounds.minY };
        clippedTexture.addChild( texture );
        root.addChild( clippedTexture );
      }
      // Add the outlined shape so that edges are visible.
      root.addChild( new Path( shape, OUTLINE_STROKE, OUTLINE_STROKE_COLOR ) );
      return root;
    }
  } );
} );


//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//import java.awt.Font;
//import java.awt.Image;
//import java.awt.Shape;
//import java.awt.Stroke;
//import java.awt.geom.AffineTransform;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath;
//import edu.colorado.phet.common.phetcommon.view.util.PhetFont;
//import edu.colorado.phet.common.piccolophet.event.CursorHandler;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
//import edu.colorado.phet.energyformsandchanges.common.view.EnergyChunkNode;
//import edu.colorado.phet.energyformsandchanges.intro.model.Block;
//import edu.colorado.phet.energyformsandchanges.intro.model.EFACIntroModel;
//import edu.colorado.phet.energyformsandchanges.intro.model.EnergyChunkContainerSliceNode;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.nodes.PImage;
//import edu.umd.cs.piccolo.nodes.PText;
//import edu.umd.cs.piccolox.nodes.PClip;
//import edu.umd.cs.piccolox.nodes.PComposite;
//
///**
// * Piccolo node that represents a block in the view.  The blocks in the model
// * are 2D, and this class gives them some perspective in order to make them
// * appear to be 3D.
// *
// * @author John Blanco
// */
//public class BlockNode extends PComposite {
//
//  //-------------------------------------------------------------------------
//  // Class Data
//  //-------------------------------------------------------------------------
//
//  // Constants that define the 3D projection.  Public so that model can reference.
//  public static final double PERSPECTIVE_ANGLE = Math.atan2( -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER, -EFACConstants.Z_TO_X_OFFSET_MULTIPLIER );
//  public static final double PERSPECTIVE_EDGE_PROPORTION = Math.sqrt( Math.pow( EFACConstants.Z_TO_X_OFFSET_MULTIPLIER, 2 ) +
//                                                                      Math.pow( EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER, 2 ) );
//
//  private static final Font LABEL_FONT = new PhetFont( 32, false );
//  private static final Stroke OUTLINE_STROKE = new BasicStroke( 3, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL );
//  private static final Color OUTLINE_STROKE_COLOR = Color.DARK_GRAY;
//
//  // Debug controls.
//  private static final boolean SHOW_2D_REPRESENTATION = false;
//
//  //-------------------------------------------------------------------------
//  // Instance Data
//  //-------------------------------------------------------------------------
//
//  // Node where approaching energy chunks are placed if set.  This can be
//  // used to make sure that approaching energy chunks stay "out front".
//  private PNode approachingEnergyChunkParentNode = null;
//
//  //-------------------------------------------------------------------------
//  // Constructor(s)
//  //-------------------------------------------------------------------------
//
//  public BlockNode( final EFACIntroModel model, final Block block, final ModelViewTransform mvt ) {
//
//    // Extract the scale transform from the MVT so that we can separate the
//    // shape from the position of the block.
//    AffineTransform scaleTransform = AffineTransform.getScaleInstance( mvt.getTransform().getScaleX(), mvt.getTransform().getScaleY() );
//
//    // Create the shape for the front of the block.
//    Rectangle2D blockRectInViewCoords = scaleTransform.createTransformedShape( Block.getRawShape() ).getBounds2D();
//    double perspectiveEdgeSize = mvt.modelToViewDeltaX( block.getRect().getWidth() * PERSPECTIVE_EDGE_PROPORTION );
//    Vector2D blockFaceOffset = new Vector2D( -perspectiveEdgeSize / 2, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE );
//    Vector2D backCornersOffset = new Vector2D( perspectiveEdgeSize, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE );
//    Vector2D lowerLeftFrontCorner = new Vector2D( blockRectInViewCoords.getMinX(), blockRectInViewCoords.getMaxY() ).plus( blockFaceOffset );
//    Vector2D lowerRightFrontCorner = new Vector2D( blockRectInViewCoords.getMaxX(), blockRectInViewCoords.getMaxY() ).plus( blockFaceOffset );
//    Vector2D upperRightFrontCorner = new Vector2D( blockRectInViewCoords.getMaxX(), blockRectInViewCoords.getMinY() ).plus( blockFaceOffset );
//    Vector2D upperLeftFrontCorner = new Vector2D( blockRectInViewCoords.getMinX(), blockRectInViewCoords.getMinY() ).plus( blockFaceOffset );
//    Shape blockFaceShape = new Rectangle2D.Double( lowerLeftFrontCorner.getX(),
//      upperLeftFrontCorner.getY(),
//      blockRectInViewCoords.getWidth(),
//      blockRectInViewCoords.getHeight() );
//
//    // Create the shape of the top of the block.
//    Vector2D upperLeftBackCorner = upperLeftFrontCorner.plus( backCornersOffset );
//    Vector2D upperRightBackCorner = upperRightFrontCorner.plus( backCornersOffset );
//    DoubleGeneralPath blockTopPath = new DoubleGeneralPath();
//    blockTopPath.moveTo( upperLeftFrontCorner );
//    blockTopPath.lineTo( upperRightFrontCorner );
//    blockTopPath.lineTo( upperRightBackCorner );
//    blockTopPath.lineTo( upperLeftBackCorner );
//    blockTopPath.lineTo( upperLeftFrontCorner );
//    Shape blockTopShape = blockTopPath.getGeneralPath();
//
//    // Create the shape of the side of the block.
//    Vector2D lowerRightBackCorner = lowerRightFrontCorner.plus( backCornersOffset );
//    DoubleGeneralPath blockSidePath = new DoubleGeneralPath();
//    blockSidePath.moveTo( upperRightFrontCorner );
//    blockSidePath.lineTo( lowerRightFrontCorner );
//    blockSidePath.lineTo( lowerRightBackCorner );
//    blockSidePath.lineTo( upperRightBackCorner );
//    blockSidePath.lineTo( upperRightFrontCorner );
//    Shape blockSideShape = blockSidePath.getGeneralPath();
//
//    // Create the shape for the back of the block.
//    Vector2D lowerLeftBackCorner = lowerLeftFrontCorner.plus( backCornersOffset );
//    DoubleGeneralPath blockBackPath = new DoubleGeneralPath();
//    blockBackPath.moveTo( lowerLeftBackCorner );
//    blockBackPath.lineTo( lowerRightBackCorner );
//    blockBackPath.moveTo( lowerLeftBackCorner );
//    blockBackPath.lineTo( lowerLeftFrontCorner );
//    blockBackPath.moveTo( lowerLeftBackCorner );
//    blockBackPath.lineTo( upperLeftBackCorner );
//    Shape blockBackShape = blockBackPath.getGeneralPath();
//
//    // Add the back of the block.
//    final PNode blockBack = new PhetPPath( blockBackShape, OUTLINE_STROKE, OUTLINE_STROKE_COLOR );
//    addChild( blockBack );
//
//    // Create the layers where the energy chunks will be placed.
//    final PNode energyChunkRootNode = new PNode();
//    addChild( energyChunkRootNode );
//    for ( int i = block.getSlices().size() - 1; i >= 0; i-- ) {
//      energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( block.getSlices().get( i ), mvt ) );
//    }
//
//    // Add the face, top, and sides of the block.
//    final PNode blockFace = createSurface( blockFaceShape, block.getColor(), block.getFrontTextureImage() );
//    final PNode blockTop = createSurface( blockTopShape, block.getColor(), block.getTopTextureImage() );
//    final PNode blockSide = createSurface( blockSideShape, block.getColor(), block.getSideTextureImage() );
//    addChild( blockFace );
//    addChild( blockTop );
//    addChild( blockSide );
//
//    if ( SHOW_2D_REPRESENTATION ) {
//      addChild( new PhetPPath( scaleTransform.createTransformedShape( Block.getRawShape() ), new BasicStroke( 1 ), Color.RED ) );
//    }
//
//    // Position and add the label.
//    final PText label = new PText( block.getLabel() );
//    label.setFont( LABEL_FONT );
//    if ( label.getFullBoundsReference().width >= mvt.modelToViewDeltaX( Block.SURFACE_WIDTH * 0.9 ) ) {
//      // Scale the label to fit on the face of the block.
//      double scale = ( mvt.modelToViewDeltaX( Block.SURFACE_WIDTH * 0.9 ) / label.getFullBoundsReference().width );
//      label.setScale( scale );
//    }
//    double labelCenterX = ( upperLeftFrontCorner.getX() + upperRightFrontCorner.getX() ) / 2;
//    double labelCenterY = ( upperLeftFrontCorner.getY() - mvt.modelToViewDeltaY( Block.SURFACE_WIDTH ) / 2 );
//    label.centerFullBoundsOnPoint( labelCenterX, labelCenterY );
//    addChild( label );
//
//    // Watch for coming and going of energy chunks that are approaching
//    // this model element and add/remove them as needed.
//    block.approachingEnergyChunks.addElementAddedObserver( new VoidFunction1<EnergyChunk>() {
//      public void apply( final EnergyChunk addedEnergyChunk ) {
//        final PNode energyChunkNode = new EnergyChunkNode( addedEnergyChunk, mvt );
//        final PNode parentNode = approachingEnergyChunkParentNode == null ? energyChunkRootNode : approachingEnergyChunkParentNode;
//        parentNode.addChild( energyChunkNode );
//        block.approachingEnergyChunks.addElementRemovedObserver( new VoidFunction1<EnergyChunk>() {
//          public void apply( EnergyChunk removedEnergyChunk ) {
//            if ( removedEnergyChunk == addedEnergyChunk ) {
//              parentNode.removeChild( energyChunkNode );
//              block.approachingEnergyChunks.removeElementRemovedObserver( this );
//            }
//          }
//        } );
//      }
//    } );
//
//    // Make the block be transparent when the energy chunks are visible so
//    // that it looks like they are in the block.
//    block.energyChunksVisible.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean energyChunksVisible ) {
//        float opaqueness = energyChunksVisible ? 0.5f : 1.0f;
//        blockFace.setTransparency( opaqueness );
//        blockTop.setTransparency( opaqueness );
//        blockSide.setTransparency( opaqueness );
//        label.setTransparency( opaqueness );
//      }
//    } );
//
//    // Update the offset if and when the model position changes.
//    block.position.addObserver( new VoidFunction1<Vector2D>() {
//      public void apply( Vector2D newPosition ) {
//
//        setOffset( mvt.modelToView( newPosition ).toPoint2D() );
//
//        // Compensate the energy chunk layer so that the energy chunk
//        // nodes can handle their own positioning.
//        energyChunkRootNode.setOffset( mvt.modelToView( newPosition ).getRotatedInstance( Math.PI ).toPoint2D() );
//      }
//    } );
//
//    // Add the cursor handler.
//    addInputEventListener( new CursorHandler( CursorHandler.HAND ) );
//
//    // Add the drag handler.
//    Vector2D offsetPosToCenter = new Vector2D( getFullBoundsReference().getCenterX() - mvt.modelToViewX( block.position.get().getX() ),
//        getFullBoundsReference().getCenterY() - mvt.modelToViewY( block.position.get().getY() ) );
//    addInputEventListener( new ThermalElementDragHandler( block, this, mvt, new ThermalItemMotionConstraint( model, block, this, mvt, offsetPosToCenter ) ) );
//  }
//
//  //-------------------------------------------------------------------------
//  // Methods
//  //-------------------------------------------------------------------------
//
//  public void setApproachingEnergyChunkParentNode( PNode node ) {
//    assert approachingEnergyChunkParentNode == null; // This should not be set more than once.
//    approachingEnergyChunkParentNode = node;
//  }
//
//  /*
//   * Convenience method to avoid code duplication.  Adds a node of the given
//   * shape, color, and texture (if a texture is specified).
//   */
//
//  private PNode createSurface( Shape shape, Color fillColor, Image textureImage ) {
//
//    PNode root = new PNode();
//
//    // Add the filled shape.  Note that in cases where a texture is
//    // provided, this may end up getting partially or entirely covered up.
//    root.addChild( new PhetPPath( shape, fillColor ) );
//
//    if ( textureImage != null ) {
//
//      // Add the clipped texture.
//      PClip clippedTexture = new PClip();
//      clippedTexture.setPathTo( shape );
//      PImage texture = new PImage( textureImage );
//
//      // Scale up the texture image if needed.
//      double textureScale = 1;
//      if ( texture.getFullBoundsReference().width < clippedTexture.getFullBoundsReference().width ) {
//        textureScale = clippedTexture.getFullBoundsReference().width / texture.getFullBoundsReference().width;
//      }
//      if ( texture.getFullBoundsReference().height < clippedTexture.getFullBoundsReference().height ) {
//        textureScale = Math.max( clippedTexture.getFullBoundsReference().height / texture.getFullBoundsReference().height, textureScale );
//      }
//      texture.setScale( textureScale );
//
//      // Add the texture to the clip node in order to clip it.
//      texture.setOffset( clippedTexture.getFullBoundsReference().getMinX(), clippedTexture.getFullBoundsReference().getMinY() );
//      clippedTexture.addChild( texture );
//      root.addChild( clippedTexture );
//    }
//
//    // Add the outlined shape so that edges are visible.
//    root.addChild( new PhetPPath( shape, OUTLINE_STROKE, OUTLINE_STROKE_COLOR ) );
//
//    return root;
//  }
//}

