// Copyright 2014-2018, University of Colorado Boulder

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
define( function( require ) {
  'use strict';

  // modules
  var BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Shape = require( 'KITE/Shape' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BLOCK_PERSPECTIVE_ANGLE = EFACConstants.BLOCK_PERSPECTIVE_ANGLE;
  var BLOCK_PERSPECTIVE_EDGE_PROPORTION = EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION;

  /**
   * @param {Beaker} beaker
   * @param {EFACIntroModel} model
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} constrainPosition
   * @param {Object} [options]
   */
  function BeakerContainerView( beaker, model, modelViewTransform, constrainPosition, options ) {

    var self = this;
    BeakerView.call( this, beaker, model.energyChunksVisibleProperty, modelViewTransform, options );

    // @private
    this.beaker = beaker;

    // variables for creating reusable shapes for doing the updates to the clipping areas
    var beakerRectangleWidthInView = -modelViewTransform.modelToViewDeltaY( beaker.width );
    var beakerRectangleHeightInView = -modelViewTransform.modelToViewDeltaY( beaker.height );

    // @private {Shape} - A shape that corresponds to the untransformed beaker content shape, used for the energy chunk
    // clip area.  It is extended a bit up and down for chunks that go to the rim of the beaker and for those that
    // go between the beaker and the heater/cooler.
    this.untransformedBeakerClipShape = new Shape.rect(
      -beakerRectangleWidthInView / 2,
      -beakerRectangleHeightInView * 1.5,
      beakerRectangleWidthInView,
      beakerRectangleHeightInView * 2
    );

    // @private - These values are used for calculating the clipping caused by the presence of blocks in the beaker.
    // They are computed once here so that they don't have to be recomputed every time the clipping shape is updated.
    // This assumes the blocks are all the same size and do not change size.
    this.blockWidthInView = modelViewTransform.modelToViewDeltaX( model.brick.width );
    this.blockHeightInView = -modelViewTransform.modelToViewDeltaY( model.brick.height );
    var perspectiveEdgeSize = this.blockWidthInView * BLOCK_PERSPECTIVE_EDGE_PROPORTION;
    this.forwardProjectionVector = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotated( -BLOCK_PERSPECTIVE_ANGLE );

    // For each block that can go in the beaker we need to add a listener that will update the clipping area when that
    // block is moved.  The clipping area hides energy chunks that overlap with blocks, making it look much less
    // visually distracting, as though the energy chunks in the beaker are behind the blocks.
    model.blocks.forEach( function( block ) {
      block.positionProperty.link( function() {
        self.updateEnergyChunkClipArea( beaker, model.blocks, modelViewTransform );
      } );
    } );

    // update the clipping mask when the position of the beaker moves
    beaker.positionProperty.link( function() {
      self.updateEnergyChunkClipArea( beaker, model.blocks, modelViewTransform );
    } );

    this.grabNode.addInputListener( new ThermalElementDragHandler(
      beaker,
      this.grabNode,
      modelViewTransform,
      constrainPosition
    ) );
  }

  energyFormsAndChanges.register( 'BeakerContainerView', BeakerContainerView );

  return inherit( BeakerView, BeakerContainerView, {

    /**
     * Update the clipping area that is used to hide energy chunks that are in the beaker but occluded by blocks that
     * are ALSO in the beaker.
     * @param {Beaker} beaker
     * @param {Block[]} blocks
     * @param {ModelViewTransform2} modelViewTransform
     * @private
     */
    updateEnergyChunkClipArea: function( beaker, blocks, modelViewTransform ) {

      // The clip area is defined by an outer rectangle that is basically the entire beaker area and then some inner
      // rectangles for the blocks if they overlap with the beaker.  The inner pieces have to be drawn with the opposite
      // winding order from the outer ones in order to create the "hole" effect.  The outer shape extends above and
      // below the basic beaker model rectangle in order to prevent clipping of energy chunks that are positioned at
      // the upper and lower rim of the beaker and energy chunks moving between the beaker and the heater/cooler.
      var clipArea = this.untransformedBeakerClipShape.transformed(
        Matrix3.translationFromVector( modelViewTransform.modelToViewPosition( beaker.positionProperty.get() ) )
      );

      // add the "holes" in the clip mask that correspond to the blocks
      this.addProjectedBlocksToClipArea( blocks, clipArea, modelViewTransform );

      // set the updated clip area
      this.energyChunkRootNode.clipArea = clipArea;
    },

    /**
     * Add shapes corresponded to the provided blocks to the provide clip area shape, accounting for any 3D projection
     * used for the blocks.  This essentially creates "holes" in the clip mask preventing anything in the parent node
     * (generally energy chunks) from being rendered in the same place as the blocks.
     * @param {Block[]} blocks
     * @param {Shape} clipAreaShape
     * @param {ModelViewTransform2} modelViewTransform
     * @private
     */
    addProjectedBlocksToClipArea: function( blocks, clipAreaShape, modelViewTransform ) {

      // Make sure there aren't more blocks than this method can deal with.  There are some assumptions built in that
      // would not work for more than two blocks, see the code and comments below for details.
      assert && assert( blocks.length <= 2, 'number of blocks exceeds what this method is designed to handle' );

      // index for C-style loops, which are used to maximize performance
      var i;

      // hoisted block variable
      var block;

      // if neither of the blocks is in the beaker then there are no "holes" to add
      var blocksInBeaker = [];
      for ( i = 0; i < blocks.length; i++ ) {
        block = blocks[ i ];
        if ( this.beaker.beakerBounds.containsPoint( block.positionProperty.value ) ||
             this.beaker.topSurface.elementOnSurfaceProperty.value === block ) {
          blocksInBeaker.push( block );
          break;
        }
      }
      if ( !blocksInBeaker.length === 0 ) {

        // nothing to do, bail
        return;
      }

      // use the bounds of the shape for faster tests, assumes that it is rectangular
      var chipAreaShapeBounds = clipAreaShape.bounds;

      // determine whether the blocks are stacked upon each other
      var blocksAreStacked = false;
      if ( blocksInBeaker.length === 2 ) {
        blocksAreStacked = blocksInBeaker[ 0 ].isStackedUpon( blocksInBeaker[ 1 ] ) ||
                           blocksInBeaker[ 1 ].isStackedUpon( blocksInBeaker[ 0 ] );
      }

      if ( blocksAreStacked ) {

        // When the blocks are stacked, draw a single shape the encompasses both.  This is necessary because if the
        // shapes are drawn separately and the overlap in the clipping area, a space is created where the energy chunks
        // aren't occluded.
        var bottomBlock;
        if ( blocksInBeaker[ 0 ].isStackedUpon( blocksInBeaker[ 1 ] ) ) {
          bottomBlock = blocksInBeaker[ 1 ];
        }
        else {
          bottomBlock = blocksInBeaker[ 0 ];
        }

        var bottomBlockPositionInView = modelViewTransform.modelToViewPosition( bottomBlock.positionProperty.value );

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
        for ( i = 0; i < blocksInBeaker.length; i++ ) {
          block = blocksInBeaker[ i ];
          var blockPositionInView = modelViewTransform.modelToViewPosition( block.positionProperty.value );

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
  } );
} );

