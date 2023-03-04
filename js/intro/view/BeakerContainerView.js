// Copyright 2014-2023, University of Colorado Boulder

/**
 * Node that represents a "beaker container" in the view.  A beaker container is a beaker that contains fluid, and in
 * which other objects can be placed, which generally displaces the fluid.
 *
 * See the header comments in the parent class for some important information about how this class is used on the
 * canvas.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import Multilink from '../../../../axon/js/Multilink.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Shape } from '../../../../kite/js/imports.js';
import { Path } from '../../../../scenery/js/imports.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import EFACConstants from '../../common/EFACConstants.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import BeakerView from '../../common/view/BeakerView.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ThermalElementDragHandler from './ThermalElementDragHandler.js';

// constants
const BLOCK_PERSPECTIVE_ANGLE = EFACConstants.BLOCK_PERSPECTIVE_ANGLE;
const BLOCK_PERSPECTIVE_EDGE_PROPORTION = EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION;

class BeakerContainerView extends BeakerView {

  /**
   * @param {Beaker} beaker
   * @param {EFACIntroModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} constrainPosition
   * @param {Object} [options]
   */
  constructor( beaker, model, modelViewTransform, constrainPosition, options ) {
    super( beaker, model.energyChunksVisibleProperty, modelViewTransform, options );

    // @private
    this.beaker = beaker;

    // variables for creating reusable shapes for doing the updates to the clipping areas
    const beakerRectangleWidthInView = -modelViewTransform.modelToViewDeltaY( beaker.width );
    const beakerRectangleHeightInView = -modelViewTransform.modelToViewDeltaY( beaker.height );

    // @private {Shape} - A shape that corresponds to the untransformed beaker content shape, used for the energy chunk
    // clip area.  It is extended a ways up for chunks that come from the top of the air and extends down for those that
    // go between the beaker and the heater/cooler.
    this.untransformedBeakerClipShape = Shape.rect(
      -beakerRectangleWidthInView / 2,
      -beakerRectangleHeightInView * 9,
      beakerRectangleWidthInView,
      beakerRectangleHeightInView * 9.5
    );

    // @private - These values are used for calculating the clipping caused by the presence of blocks in the beaker.
    // They are computed once here so that they don't have to be recomputed every time the clipping shape is updated.
    // This assumes the blocks are all the same size and do not change size. Only needed if any blocks exist.
    if ( model.blockGroup.count ) {
      this.blockWidthInView = modelViewTransform.modelToViewDeltaX( model.blockGroup.getElement( 0 ).width );
      this.blockHeightInView = -modelViewTransform.modelToViewDeltaY( model.blockGroup.getElement( 0 ).height );
      const perspectiveEdgeSize = this.blockWidthInView * BLOCK_PERSPECTIVE_EDGE_PROPORTION;
      this.forwardProjectionVector = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotated( -BLOCK_PERSPECTIVE_ANGLE );
    }

    if ( EFACQueryParameters.showHelperShapes ) {
      this.clipAreaHelperNode = new Path( this.untransformedBeakerClipShape, {
        fill: 'rgba(255, 0, 0, 0.2)'
      } );
      this.energyChunkRootNode.addChild( this.clipAreaHelperNode );
    }

    // Update the clipping area based on the motion of this beaker, the blocks, and whether the energy chunks are
    // visible.  The clipping area hides energy chunks that overlap with blocks, making it look much less visually
    // distracting, as though the energy chunks in the beaker are behind the blocks.
    const propertiesThatInfluenceClipArea = [];
    model.blockGroup.forEach( block => {
      propertiesThatInfluenceClipArea.push( block.positionProperty );
    } );
    propertiesThatInfluenceClipArea.push( beaker.positionProperty );
    propertiesThatInfluenceClipArea.push( model.energyChunksVisibleProperty );
    Multilink.multilink( propertiesThatInfluenceClipArea, () => {
      this.updateEnergyChunkClipArea( beaker, model.blockGroup, model.energyChunksVisibleProperty.value, modelViewTransform );
    } );

    // add an input listener to make this draggable
    this.grabNode.addInputListener( new ThermalElementDragHandler(
      beaker,
      this.grabNode,
      modelViewTransform,
      constrainPosition,
      model.isPlayingProperty,
      options.tandem.createTandem( 'dragListener' )
    ) );
  }

  /**
   * Update the clipping area that is used to hide energy chunks that are in the beaker but occluded by blocks that
   * are ALSO in the beaker.
   * @param {Beaker} beaker
   * @param {Block[]} blocks
   * @param {boolean} energyChunksVisible
   * @param {ModelViewTransform2} modelViewTransform
   * @private
   */
  updateEnergyChunkClipArea( beaker, blocks, energyChunksVisible, modelViewTransform ) {

    if ( energyChunksVisible ) {

      // The clip area is defined by an outer rectangle that is basically the entire beaker area and then some inner
      // rectangles for the blocks if they overlap with the beaker.  The inner pieces have to be drawn with the opposite
      // winding order from the outer ones in order to create the "hole" effect.  The outer shape extends above and
      // below the basic beaker model rectangle in order to prevent clipping of energy chunks that are positioned at
      // the upper and lower rim of the beaker and energy chunks moving between the beaker and the heater/cooler.
      const clipArea = this.untransformedBeakerClipShape.transformed(
        Matrix3.translationFromVector( modelViewTransform.modelToViewPosition( beaker.positionProperty.get() ) )
      );

      // add the "holes" in the clip mask that correspond to the blocks
      this.addProjectedBlocksToClipArea( blocks, clipArea, modelViewTransform );

      // set the updated clip area
      this.energyChunkRootNode.clipArea = clipArea;

      if ( this.clipAreaHelperNode ) {
        this.clipAreaHelperNode.setShape( clipArea );
      }
    }
    else {

      // If the energy chunks aren't visible, don't have a clip area at all.  This was found to be necessary because
      // on Firefox, not setting it to null would cause the energy chunks to still be visible when they shouldn't be,
      // see https://github.com/phetsims/energy-forms-and-changes/issues/173.
      this.energyChunkRootNode.clipArea = null;
    }
  }

  /**
   * Add shapes corresponded to the provided blocks to the provide clip area shape, accounting for any 3D projection
   * used for the blocks. This essentially creates "holes" in the clip mask preventing anything in the parent node
   * (generally energy chunks) from being rendered in the same place as the blocks. This method can handle any number
   * of blocks stacked in the beaker, but only clips for the bottom two, since the beaker can only fit two blocks,
   * plus a tiny bit of a third.
   * @param {PhetioGroup.<Block>} blockGroup
   * @param {Shape} clipAreaShape
   * @param {ModelViewTransform2} modelViewTransform
   * @private
   */
  addProjectedBlocksToClipArea( blockGroup, clipAreaShape, modelViewTransform ) {
    assert && assert( blockGroup instanceof PhetioGroup, 'invalid blockGroup' );

    // hoisted block variable
    let block;

    // if neither of the blocks is in the beaker then there are no "holes" to add, use C-style loop for performance
    let blocksInBeaker = [];
    for ( let i = 0; i < blockGroup.count; i++ ) {
      block = blockGroup.getElement( i );
      if ( this.beaker.getBounds().containsPoint( block.positionProperty.value ) ||
           this.beaker.topSurface.elementOnSurfaceProperty.value === block ) {
        blocksInBeaker.push( block );
      }
    }
    if ( blocksInBeaker.length === 0 ) {

      // nothing to do, bail
      return;
    }

    // use the bounds of the shape for faster tests, assumes that it is rectangular
    const chipAreaShapeBounds = clipAreaShape.bounds;

    // determine whether the blocks are stacked upon each other
    let blocksAreStacked = false;
    if ( blocksInBeaker.length > 1 ) {
      blocksInBeaker = _.sortBy( blocksInBeaker, block => block.positionProperty.value.y );
      blocksAreStacked = blocksInBeaker[ 1 ].isStackedUpon( blocksInBeaker[ 0 ] );
    }

    if ( blocksAreStacked ) {

      // When the blocks are stacked, draw a single shape that encompasses both.  This is necessary because if the
      // shapes are drawn separately and they overlap, a space is created where the energy chunks are not occluded.
      const bottomBlockPositionInView = modelViewTransform.modelToViewPosition( blocksInBeaker[ 0 ].positionProperty.value );

      if ( chipAreaShapeBounds.containsPoint( bottomBlockPositionInView ) ) {
        clipAreaShape.moveTo(
          bottomBlockPositionInView.x - this.blockWidthInView / 2 + this.forwardProjectionVector.x,
          bottomBlockPositionInView.y + this.forwardProjectionVector.y
        );
        clipAreaShape.lineToRelative( this.blockWidthInView, 0 );
        clipAreaShape.lineToRelative( -this.forwardProjectionVector.x * 2, -this.forwardProjectionVector.y * 2 );
        clipAreaShape.lineToRelative( 0, -this.blockHeightInView * 2 );
        clipAreaShape.lineToRelative( -this.blockWidthInView, 0 );
        clipAreaShape.lineToRelative( this.forwardProjectionVector.x * 2, this.forwardProjectionVector.y * 2 );
        clipAreaShape.lineToRelative( 0, this.blockHeightInView * 2 );
      }
    }
    else {

      // C-style loop for best performance
      for ( let i = 0; i < blocksInBeaker.length; i++ ) {
        block = blocksInBeaker[ i ];
        const blockPositionInView = modelViewTransform.modelToViewPosition( block.positionProperty.value );

        // The following code makes some assumptions that are known to be true for the EFAC simulation but which
        // wouldn't necessarily true for a generalized version of this.  Those assumptions are that the provided shape
        // is rectangular and that the position of the block is the bottom center.
        if ( chipAreaShapeBounds.containsPoint( blockPositionInView ) ) {
          clipAreaShape.moveTo(
            blockPositionInView.x - this.blockWidthInView / 2 + this.forwardProjectionVector.x,
            blockPositionInView.y + this.forwardProjectionVector.y
          );
          clipAreaShape.lineToRelative( this.blockWidthInView, 0 );
          clipAreaShape.lineToRelative( -this.forwardProjectionVector.x * 2, -this.forwardProjectionVector.y * 2 );
          clipAreaShape.lineToRelative( 0, -this.blockHeightInView );
          clipAreaShape.lineToRelative( -this.blockWidthInView, 0 );
          clipAreaShape.lineToRelative( this.forwardProjectionVector.x * 2, this.forwardProjectionVector.y * 2 );
          clipAreaShape.lineToRelative( 0, this.blockHeightInView );
        }
      }
    }
  }
}

energyFormsAndChanges.register( 'BeakerContainerView', BeakerContainerView );
export default BeakerContainerView;