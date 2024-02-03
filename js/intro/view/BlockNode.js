// Copyright 2014-2023, University of Colorado Boulder

/**
 * Node that represents a block in the view.  The blocks in the model are 2D, and this node gives them some perspective
 * in order to make them appear to be 3D.
 *
 * @author John Blanco
 * @author Martin Veillette
 * @author Jesse Greenberg
 */

import Matrix3 from '../../../../dot/js/Matrix3.js';
import Transform3 from '../../../../dot/js/Transform3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image, Node, Path, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import brickTextureFront_png from '../../../images/brickTextureFront_png.js';
import brickTextureRight_png from '../../../images/brickTextureRight_png.js';
import brickTextureTop_png from '../../../images/brickTextureTop_png.js';
import ironTextureFront_png from '../../../images/ironTextureFront_png.js';
import ironTextureRight_png from '../../../images/ironTextureRight_png.js';
import ironTextureTop_png from '../../../images/ironTextureTop_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import BlockType from '../model/BlockType.js';
import EnergyChunkContainerSliceNode from './EnergyChunkContainerSliceNode.js';
import ThermalElementDragHandler from './ThermalElementDragHandler.js';

const brickString = EnergyFormsAndChangesStrings.brick;
const ironString = EnergyFormsAndChangesStrings.iron;

// constants
const BLOCK_IMAGES = {};
BLOCK_IMAGES[ BlockType.BRICK ] = {
  front: brickTextureFront_png,
  side: brickTextureRight_png,
  top: brickTextureTop_png
};
BLOCK_IMAGES[ BlockType.IRON ] = {
  front: ironTextureFront_png,
  side: ironTextureRight_png,
  top: ironTextureTop_png
};
const LABEL_FONT = new PhetFont( 26 );
const OUTLINE_LINE_WIDTH = 3;
const PERSPECTIVE_ANGLE = EFACConstants.BLOCK_PERSPECTIVE_ANGLE;
const BLOCK_ATTRIBUTES = {};
BLOCK_ATTRIBUTES[ BlockType.IRON ] = { label: ironString };
BLOCK_ATTRIBUTES[ BlockType.BRICK ] = { label: brickString };

class BlockNode extends Node {

  /**
   * @param {Block} block
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} constrainPosition
   * @param {BooleanProperty} simIsPlayingProperty
   * @param {Object} [options]
   */
  constructor( block, modelViewTransform, constrainPosition, simIsPlayingProperty, options ) {
    options = merge( {

      // Allow a node to be specified that will act as the parent for approaching energy chunks - this makes it so that
      // the energy chunks that are outside the block don't affect the bounds of the block.
      approachingEnergyChunksLayer: null,
      cursor: 'pointer',

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: Node.NodeIO
    }, options );

    super( options );

    // @public (read-only)
    this.block = block;

    // extract the scale transform from the MVT so that we can separate the shape from the position of the block
    const scaleVector = modelViewTransform.matrix.getScaleVector();
    const scaleTransform = new Transform3( Matrix3.scaling( scaleVector.x, -scaleVector.y ) );

    // get a view representation of the block without perspective
    const blockRect = scaleTransform.transformShape( block.getUntransformedBounds() );

    // create the shape for the front of the block
    const perspectiveEdgeSize = modelViewTransform.modelToViewDeltaX(
      block.getBounds().width * EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION
    );
    const blockFaceOffset = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotated( -PERSPECTIVE_ANGLE );
    const backCornersOffset = new Vector2( perspectiveEdgeSize, 0 ).rotated( -PERSPECTIVE_ANGLE );
    const lowerLeftFrontCorner = new Vector2( blockRect.minX, blockRect.getMaxY() ).plus( blockFaceOffset );
    const lowerRightFrontCorner = new Vector2( blockRect.maxX, blockRect.getMaxY() ).plus( blockFaceOffset );
    const upperRightFrontCorner = new Vector2( blockRect.maxX, blockRect.getMinY() ).plus( blockFaceOffset );
    const upperLeftFrontCorner = new Vector2( blockRect.minX, blockRect.getMinY() ).plus( blockFaceOffset );
    const upperLeftBackCorner = upperLeftFrontCorner.plus( backCornersOffset );
    const upperRightBackCorner = upperRightFrontCorner.plus( backCornersOffset );
    const lowerRightBackCorner = lowerRightFrontCorner.plus( backCornersOffset );


    // create the outline of the block
    const blockOutline = new Shape()
      .moveToPoint( upperLeftBackCorner )
      .lineToPoint( upperRightBackCorner )
      .lineToPoint( upperRightFrontCorner )
      .lineToPoint( upperLeftFrontCorner )
      .lineToPoint( upperLeftBackCorner )
      .moveToPoint( upperLeftFrontCorner )
      .lineToPoint( lowerLeftFrontCorner )
      .lineToPoint( lowerRightFrontCorner )
      .lineToPoint( upperRightFrontCorner )
      .moveToPoint( lowerRightFrontCorner )
      .lineToPoint( lowerRightBackCorner )
      .lineToPoint( upperRightBackCorner );

    // create the shape of the front of the block
    const blockFaceShape = new Shape();
    blockFaceShape.moveToPoint( upperRightFrontCorner )
      .lineToPoint( upperLeftFrontCorner )
      .lineToPoint( lowerLeftFrontCorner )
      .lineToPoint( lowerRightFrontCorner )
      .close();

    // create the shape of the top of the block
    const blockTopShape = new Shape();
    blockTopShape.moveToPoint( upperLeftFrontCorner )
      .lineToPoint( upperLeftBackCorner )
      .lineToPoint( upperRightBackCorner )
      .lineToPoint( upperRightFrontCorner )
      .close();

    // create the shape of the side of the block
    const blockSideShape = new Shape();
    blockSideShape.moveToPoint( upperRightBackCorner )
      .lineToPoint( lowerRightBackCorner )
      .lineToPoint( lowerRightFrontCorner )
      .lineToPoint( upperRightFrontCorner )
      .close();

    // Create the shape for the back of the block, which can only be seen when the block is transparent.  The lines are
    // shortened a little so that they don't stick out from behind the block.
    const lowerLeftBackCorner = lowerLeftFrontCorner.plus( backCornersOffset );
    const blockBackShape = new Shape();
    blockBackShape.moveToPoint( lowerLeftBackCorner )
      .lineTo( lowerRightBackCorner.x - OUTLINE_LINE_WIDTH, lowerRightBackCorner.y )
      .moveToPoint( lowerLeftBackCorner )
      .lineTo(
        lowerLeftFrontCorner.x + Math.sin( PERSPECTIVE_ANGLE ) * OUTLINE_LINE_WIDTH,
        lowerLeftFrontCorner.y - Math.cos( PERSPECTIVE_ANGLE ) * OUTLINE_LINE_WIDTH
      )
      .moveToPoint( lowerLeftBackCorner )
      .lineTo( upperLeftBackCorner.x, upperLeftBackCorner.y + OUTLINE_LINE_WIDTH );

    const edgeColor = block.color.darkerColor( 0.5 );

    // add the back of the block
    const blockBack = new Path( blockBackShape, {
      lineWidth: OUTLINE_LINE_WIDTH,
      stroke: edgeColor,
      lineCap: 'round'
    } );
    this.addChild( blockBack );

    // @private - create the layers where the energy chunks will be placed
    this.energyChunkRootNode = new Node();
    this.addChild( this.energyChunkRootNode );
    for ( let i = block.slices.length - 1; i >= 0; i-- ) {
      this.energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( block.slices.get( i ), modelViewTransform ) );
    }

    // add the face, top, and sides of the block
    const blockFace = this.createSurface(
      blockFaceShape,
      block.color,
      BLOCK_IMAGES[ block.blockType ] ? BLOCK_IMAGES[ block.blockType ].front : null
    );
    const blockTop = this.createSurface(
      blockTopShape,
      block.color,
      BLOCK_IMAGES[ block.blockType ] ? BLOCK_IMAGES[ block.blockType ].top : null
    );
    const blockSide = this.createSurface(
      blockSideShape,
      block.color,
      BLOCK_IMAGES[ block.blockType ] ? BLOCK_IMAGES[ block.blockType ].side : null
    );
    this.addChild( blockTop );
    this.addChild( blockSide );
    this.addChild( blockFace );

    // add the outline
    const frontOutline = new Path( blockOutline, {
      stroke: edgeColor,
      lineWidth: OUTLINE_LINE_WIDTH,
      lineCap: 'round',
      lineJoin: 'round'
    } );
    this.addChild( frontOutline );

    if ( EFACQueryParameters.show2DBlockBounds ) {
      const blockBounds = scaleTransform.transformBounds2( block.getUntransformedBounds() );

      // compensate for inverted Y axis when creating view representation
      this.addChild( new Rectangle(
        blockBounds.minX,
        blockBounds.minY - blockBounds.height,
        blockBounds.width,
        blockBounds.height,
        { fill: 'red', lineWidth: 1 }
      ) );
    }

    // position and add the label
    const labelText = new Text( BLOCK_ATTRIBUTES[ block.blockType ].label, {
      font: LABEL_FONT,
      maxWidth: modelViewTransform.modelToViewDeltaX( EFACConstants.BLOCK_SURFACE_WIDTH * 0.9 ),
      centerX: ( upperLeftFrontCorner.x + upperRightFrontCorner.x ) / 2,
      centerY: ( upperLeftFrontCorner.y + lowerLeftFrontCorner.y ) / 2,
      tandem: options.tandem.createTandem( 'labelText' ),
      phetioVisiblePropertyInstrumented: true
    } );
    this.addChild( labelText );

    // watch for coming and going of energy chunks that are approaching this model element and add/remove them as needed
    block.approachingEnergyChunks.addItemAddedListener( addedEnergyChunk => {
      const energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );

      // if a node was specified for the approaching energy chunks, use it, otherwise make them a child of this node
      const parentNode = options.approachingEnergyChunkParentNode || this.energyChunkRootNode;
      parentNode.addChild( energyChunkNode );

      const removalListener = removedEnergyChunk => {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          parentNode.removeChild( energyChunkNode );
          energyChunkNode.dispose();
          block.approachingEnergyChunks.removeItemRemovedListener( removalListener );
        }
      };
      block.approachingEnergyChunks.addItemRemovedListener( removalListener );
    } );

    // make the block be transparent when the energy chunks are visible so that it looks like they are inside the block
    block.energyChunksVisibleProperty.link( energyChunksVisible => {
      const opacity = energyChunksVisible ? 0.5 : 1.0;
      blockFace.opacity = opacity;
      blockTop.opacity = opacity;
      blockSide.opacity = opacity;
      blockBack.opacity = opacity / 2; // make back less opaque to create a look of distance
      labelText.opacity = opacity;
      frontOutline.opacity = opacity;

      // don't bother displaying the back if the block is not in see-through mode
      blockBack.visible = energyChunksVisible;
    } );

    // update the offset when the model position changes
    block.positionProperty.link( newPosition => {

      this.translation = modelViewTransform.modelToViewPosition( newPosition );

      // compensate the energy chunk layer so that the energy chunk nodes can handle their own positioning
      this.energyChunkRootNode.translation =
        modelViewTransform.modelToViewPosition( newPosition ).rotated( Math.PI );
    } );

    // add the drag handler
    this.addInputListener( new ThermalElementDragHandler(
      block,
      this,
      modelViewTransform,
      constrainPosition,
      simIsPlayingProperty,
      options.tandem.createTandem( 'dragListener' )
    ) );
  }

  /**
   * convenience method to avoid code duplication - adds a node of the given shape, color, and texture (if specified)
   * @param {Shape} shape
   * @param {Color} fillColor
   * @param {Image} textureImage
   * @returns {Node}
   * @private
   */
  createSurface( shape, fillColor, textureImage ) {

    let surfaceNode = null;

    if ( textureImage ) {

      // create a root node to which the texture and outline can be added separately
      surfaceNode = new Node();

      const textureClipNode = new Node( {
        clipArea: shape
      } );

      // create the texture image
      const texture = new Image( textureImage, {
        minWidth: shape.bounds.width,
        minHeight: shape.bounds.height,
        left: shape.bounds.minX,
        top: shape.bounds.minY
      } );

      // add the texture to the clip node in order to clip it
      // texture.leftTop = new Vector2( shape.bounds.minX, shape.bounds.minY );
      textureClipNode.addChild( texture );

      // add texture node to the root
      surfaceNode.addChild( textureClipNode );

      // add the outline
      surfaceNode.addChild( new Path( shape ) );
    }
    else {

      // add filled shape using only color
      surfaceNode = new Path( shape, { fill: fillColor } );
    }

    return surfaceNode;
  }
}

energyFormsAndChanges.register( 'BlockNode', BlockNode );
export default BlockNode;