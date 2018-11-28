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
  var Shape = require( 'KITE/Shape' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BLOCK_PERSPECTIVE_ANGLE = EFACConstants.BLOCK_PERSPECTIVE_ANGLE;


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

      var beakerPosition = beaker.positionProperty.get();

      var beakerUpperLeftInViewCoords = modelViewTransform.modelToViewXY(
        beakerPosition.x - beaker.width / 2,
        beakerPosition.y + beaker.height
      );

      // The clip area is defined by an outer rectangle that is basically the entire beaker area and then some inner
      // rectangles for the blocks if they overlap with the beaker.  The inner pieces have to be drawn with the opposite
      // winding order from the outer ones in order to create the "hole" effect.  The outer shape extends above and
      // below the basic beaker model rectangle in order to prevent clipping of energy chunks that are positioned at
      // the upper and lower rim of the beaker and energy chunks moving between the beaker and the heater/cooler.
      var beakerRectangleHeightInView = -modelViewTransform.modelToViewDeltaY( beaker.height );
      var clipArea = new Shape.rect(
        beakerUpperLeftInViewCoords.x,
        beakerUpperLeftInViewCoords.y - beakerRectangleHeightInView * 0.5,
        modelViewTransform.modelToViewDeltaX( beaker.width ),
        beakerRectangleHeightInView * 2
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
     * @param {Shape} shape
     * @param {ModelViewTransform2} modelViewTransform
     * @private
     */
    addProjectedBlocksToClipArea: function( blocks, shape, modelViewTransform ) {

      // Make sure there aren't more blocks than this method can deal with.  There are some assumptions built in that
      // would not work for more than two blocks, see the code and comments below for details.
      assert && assert( blocks.length <= 2, 'number of blocks exceeds what this method is designed to handle' );

      // use the bounds of the shape for faster tests, assumes that it is rectangular
      var shapeBounds = shape.bounds;

      // vars used for projections, only calculated if needed
      var perspectiveEdgeSize;
      var forwardProjectionVector;
      var blockWidthInView;
      var blockHeightInView;

      // determine whether the blocks are stacked upon each other
      var blocksAreStacked = blocks[ 0 ].isStackedUpon( blocks[ 1 ] ) || blocks[ 1 ].isStackedUpon( blocks[ 0 ] );

      if ( blocksAreStacked ) {

        // When the blocks are stacked, draw a single shape the encompasses both.  This is necessary because if the
        // shapes overlap in the clipping area, a space is created where the energy chunks aren't occluded.
        var bottomBlock;
        if ( blocks[ 0 ].isStackedUpon( blocks[ 1 ] ) ) {
          bottomBlock = blocks[ 1 ];
        }
        else {
          bottomBlock = blocks[ 0 ];
        }

        var bottomBlockPositionInView = modelViewTransform.modelToViewPosition( bottomBlock.positionProperty.value );
        blockWidthInView = modelViewTransform.modelToViewDeltaX( bottomBlock.width );
        blockHeightInView = -modelViewTransform.modelToViewDeltaY( bottomBlock.height );
        perspectiveEdgeSize = blockWidthInView * EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION;
        forwardProjectionVector = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotated( -BLOCK_PERSPECTIVE_ANGLE );

        if ( shapeBounds.containsPoint( bottomBlockPositionInView ) ) {
          shape.moveTo(
            bottomBlockPositionInView.x - blockWidthInView / 2 + forwardProjectionVector.x,
            bottomBlockPositionInView.y + forwardProjectionVector.y
          );
          shape.lineToRelative( blockWidthInView, 0 );
          shape.lineToRelative( -forwardProjectionVector.x * 2, -forwardProjectionVector.y * 2 );
          shape.lineToRelative( 0, -blockHeightInView * 2 );
          shape.lineToRelative( -blockWidthInView, 0 );
          shape.lineToRelative( forwardProjectionVector.x * 2, forwardProjectionVector.y * 2 );
          shape.lineToRelative( 0, blockHeightInView * 2 );
        }
      }
      else {

        // C-style loop for best performance
        for ( var i = 0; i < blocks.length; i++ ) {
          var block = blocks[ i ];
          var blockPositionInView = modelViewTransform.modelToViewPosition( block.positionProperty.value );
          blockWidthInView = modelViewTransform.modelToViewDeltaX( block.width );
          blockHeightInView = -modelViewTransform.modelToViewDeltaY( block.height );
          perspectiveEdgeSize = blockWidthInView * EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION;
          forwardProjectionVector = new Vector2( -perspectiveEdgeSize / 2, 0 ).rotated( -BLOCK_PERSPECTIVE_ANGLE );

          // The following code makes some assumptions that are known to be true for the EFAC simulation but which wouldn't
          // necessarily true for a generalized version of this.  Those assumptions are that the provided shape is
          // rectangular and that the position of the block is the bottom center.
          if ( shapeBounds.containsPoint( blockPositionInView ) ) {
            shape.moveTo(
              blockPositionInView.x - blockWidthInView / 2 + forwardProjectionVector.x,
              blockPositionInView.y + forwardProjectionVector.y
            );
            shape.lineToRelative( blockWidthInView, 0 );
            shape.lineToRelative( -forwardProjectionVector.x * 2, -forwardProjectionVector.y * 2 );
            shape.lineToRelative( 0, -blockHeightInView );
            shape.lineToRelative( -blockWidthInView, 0 );
            shape.lineToRelative( forwardProjectionVector.x * 2, forwardProjectionVector.y * 2 );
            shape.lineToRelative( 0, blockHeightInView );
          }
        }
      }
    }
  } );
} );

