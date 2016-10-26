// Copyright 2014-2015, University of Colorado Boulder

/**
 * Node that represents a block in the view.  The blocks in the model are 2D, and this class gives them some perspective
 * in order to make them appear to be 3D.
 *
 * @author John Blanco
 * @author Martin Veillette
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EnergyChunkContainerSliceNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EnergyChunkContainerSliceNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );
  var ThermalItemMotionConstraint = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalItemMotionConstraint' );
  var Vector2 = require( 'DOT/Vector2' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Transform3 = require( 'DOT/Transform3' );
  var Matrix3 = require( 'DOT/Matrix3' );

  // constants
  var LABEL_FONT = new PhetFont( 32, false );
  var OUTLINE_LINEWIDTH = 3;
  var OUTLINE_STROKE = Color.DARK_GRAY;

  var SHOW_2D_REPRESENTATION = true;

  /**
   * Constructor for a BlockNode.
   *
   * @param model
   * @param {Block} block
   * @param {Bounds2} stageBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BlockNode( model, block, stageBounds, modelViewTransform ) {

    var self = this;

    Node.call( this, {
      cursor: 'pointer'
    } );

    this.block = block;
    this.approachingEnergyChunkParentNode = null;
    this.modelViewTransform = modelViewTransform;

    // Extract the scale transform from the MVT so that we can separate the shape from the position of the block.
    var scaleVector = modelViewTransform.matrix.getScaleVector();
    var scaleTransform = new Transform3( Matrix3.scaling( scaleVector.x, scaleVector.y ) );

    // Note that blockRect is in view coordinates.
    // The shift by the block height is not in the original Java, but without it, the blocks sit too low.
    var blockShape = block.getRawShape();
    var blockRect = scaleTransform.transformShape( blockShape.shiftedY( -blockShape.height ) );

    // Create the shape for the front of the block.
    var perspectiveEdgeSize = modelViewTransform.modelToViewDeltaX(
      block.getBounds().width * EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION );
    var blockFaceOffset = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotated( -EFACConstants.BLOCK_PERSPECTIVE_ANGLE );
    var backCornersOffset = new Vector2( perspectiveEdgeSize, 0 ).rotated( -EFACConstants.BLOCK_PERSPECTIVE_ANGLE );
    var lowerLeftFrontCorner = new Vector2( blockRect.minX, blockRect.getMaxY() ).plus( blockFaceOffset );
    var lowerRightFrontCorner = new Vector2( blockRect.maxX, blockRect.getMaxY() ).plus( blockFaceOffset );
    var upperRightFrontCorner = new Vector2( blockRect.maxX, blockRect.getMinY() ).plus( blockFaceOffset );
    var upperLeftFrontCorner = new Vector2( blockRect.minX, blockRect.getMinY() ).plus( blockFaceOffset );
    var blockFaceShape = Shape.rectangle(
      lowerLeftFrontCorner.x,
      upperLeftFrontCorner.y,
      blockRect.width,
      blockRect.height );

    // Create the shape of the top of the block.
    var upperLeftBackCorner = upperLeftFrontCorner.plus( backCornersOffset );
    var upperRightBackCorner = upperRightFrontCorner.plus( backCornersOffset );
    var blockTopShape = new Shape();
    blockTopShape.moveToPoint( upperLeftFrontCorner )
      .lineToPoint( upperRightFrontCorner )
      .lineToPoint( upperRightBackCorner )
      .lineToPoint( upperLeftBackCorner )
      .lineToPoint( upperLeftFrontCorner );

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
    var blockBack = new Path( blockBackShape, {
      lineWidth: OUTLINE_LINEWIDTH,
      stroke: OUTLINE_STROKE
    } );
    this.addChild( blockBack );

    // Create the layers where the energy chunks will be placed.
    this.energyChunkRootNode = new Node();
    this.addChild( this.energyChunkRootNode );
    for ( var i = block.slices.length - 1; i >= 0; i-- ) {
      this.energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( block.slices[ i ], modelViewTransform ) );
    }

    // Add the face, top, and sides of the block.
    var blockFace = this.createSurface( blockFaceShape, block.getColor(), block.getFrontTextureImage() );
    var blockTop = this.createSurface( blockTopShape, block.getColor(), block.getTopTextureImage() );
    var blockSide = this.createSurface( blockSideShape, block.getColor(), block.getSideTextureImage() );
    this.addChild( blockFace );
    this.addChild( blockTop );
    this.addChild( blockSide );

    if ( SHOW_2D_REPRESENTATION ) {
      this.addChild( new Rectangle( modelViewTransform.modelToViewBounds( block.getRawShape(), {
        fill: 'red',
        lineWidth: 1
      } ) ) );
    }

    // Position and add the label.
    var label = new Text( block.getLabel() );
    label.setFont( LABEL_FONT );
    if ( label.bounds.width >= modelViewTransform.modelToViewDeltaX( EFACConstants.BLOCK_SURFACE_WIDTH * 0.9 ) ) {
      // Scale the label to fit on the face of the block.  This also supports translations.
      var scale = modelViewTransform.modelToViewDeltaX( EFACConstants.BLOCK_SURFACE_WIDTH * 0.9 ) / label.bounds.width;
      label.setScale( scale );
    }
    var labelCenterX = ( upperLeftFrontCorner.x + upperRightFrontCorner.x ) / 2;
    var labelCenterY =
      ( upperLeftFrontCorner.y - modelViewTransform.modelToViewDeltaY( EFACConstants.BLOCK_SURFACE_WIDTH ) / 2 );
    label.center = new Vector2( labelCenterX, labelCenterY );
    this.addChild( label );

    // Watch for coming and going of energy chunks that are approaching
    // this model element and add/remove them as needed.
    block.approachingEnergyChunks.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );

      var parentNode = ( self.approachingEnergyChunkParentNode === null ) ?
        self.energyChunkRootNode :
        self.approachingEnergyChunkParentNode;

      parentNode.addChild( energyChunkNode );

      block.approachingEnergyChunks.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          // console.log( 'BN: Removing chunk node (approaching chunks)' );
          parentNode.removeChild( energyChunkNode );
          block.approachingEnergyChunks.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // Make the block be transparent when the energy chunks are visible so that it looks like they are in the block.
    block.energyChunksVisibleProperty.link( function( energyChunksVisible ) {
      var opaqueness = energyChunksVisible ? 0.5 : 1.0;
      blockFace.opacity = opaqueness;
      blockTop.opacity = opaqueness;
      blockSide.opacity = opaqueness;
      label.opacity = opaqueness;
    } );

    // Update the offset if and when the model position changes.
    block.positionProperty.link( function( newPosition ) {

      self.translation = modelViewTransform.modelToViewPosition( newPosition );

      // Compensate the energy chunk layer so that the energy chunk nodes can handle their own positioning.
      self.energyChunkRootNode.translation =
        modelViewTransform.modelToViewPosition( newPosition ).rotated( Math.PI );
    } );

    // Add the drag handler.
    var offsetPosToCenter = new Vector2(
      this.bounds.centerX - modelViewTransform.modelToViewX( block.positionProperty.value.x ),
      this.bounds.centerY - modelViewTransform.modelToViewY( block.positionProperty.value.y ) );
    this.addInputListener( new ThermalElementDragHandler( block, this, modelViewTransform,
      new ThermalItemMotionConstraint( model, block, this, stageBounds, modelViewTransform, offsetPosToCenter ) ) );
  }

  energyFormsAndChanges.register( 'BlockNode', BlockNode );

  return inherit( Node, BlockNode, {

    /**
     *
     * @param {Node} node
     */
    setApproachingEnergyChunkParentNode: function( node ) {
      // This should not be set more than once.
      assert && assert( this.approachingEnergyChunkParentNode === null );
      this.approachingEnergyChunkParentNode = node;
    },

    /**
     * Convenience method to avoid code duplication.  Adds a node of the given shape, color, and texture (if a texture
     * is specified).
     *
     * @param {Shape} shape
     * @param {Color} fillColor
     * @param {Image} textureImage
     * @returns {Node}
     * @private
     */
    createSurface: function( shape, fillColor, textureImage ) {

      var root = new Node( {
        clipArea: shape
      } );

      // Add the filled shape.  Note that in cases where a texture is provided, this may end up getting partially or
      // entirely covered up.
      root.addChild( new Path( shape, {
        fill: fillColor
      } ) );

      if ( textureImage !== null ) {

        // Add the texture image.
        var texture = new Image( textureImage );

        // Scale up the texture image if needed.
        var textureScale = 1;
        if ( texture.bounds.width < shape.bounds.width ) {
          textureScale = shape.bounds.width / texture.bounds.width;
        }
        if ( texture.bounds.height < shape.bounds.height ) {
          textureScale = Math.max( shape.bounds.height / texture.bounds.height, textureScale );
        }
        texture.scale( textureScale );

        // Add the texture to the clip node in order to clip it.
        texture.leftTop = new Vector2( shape.bounds.minX, shape.bounds.minY );
        root.addChild( texture );
      }

      // Add the outlined shape so that edges are visible.
      root.addChild( new Path( shape, {
        lineWidth: OUTLINE_LINEWIDTH,
        stroke: OUTLINE_STROKE
      } ) );

      return root;

    }
  } );
} );

