// Copyright 2014-2022, University of Colorado Boulder

/**
 * A node that represents a 2D surface on which energy chunks reside. The surface contains z-dimension information,
 * and can thus be used to create an effect of layering in order to get a bit of a 3D appearance when used in
 * conjunction with other slices. The slice is generally invisible, but can be shown using when needed for debugging.
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class EnergyChunkContainerSliceNode extends Node {

  /**
   * @param {EnergyChunkContainerSlice} slice
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( slice, modelViewTransform ) {
    super();

    this.modelViewTransform = modelViewTransform;

    // define a function that will add and remove energy chunk nodes as energy come and go in the model
    const addEnergyChunkNode = addedChunk => {
      const energyChunkNode = new EnergyChunkNode( addedChunk, modelViewTransform );
      this.addChild( energyChunkNode );
      const removalListener = removedChunk => {
        if ( removedChunk === addedChunk ) {
          this.removeChild( energyChunkNode );
          energyChunkNode.dispose();
          slice.energyChunkList.removeItemRemovedListener( removalListener );
        }
      };
      slice.energyChunkList.addItemRemovedListener( removalListener );
    };

    // add the initial energy chunks
    slice.energyChunkList.forEach( addEnergyChunkNode );

    // listen for the arrival of new energy chunks and create a node for each
    slice.energyChunkList.addItemAddedListener( addEnergyChunkNode );

    if ( EFACQueryParameters.showHelperShapes ) {

      // for debug - add an outline of the slice bounds, note that this does not update if the slice's bounds change
      const outlineNode = new Rectangle( modelViewTransform.modelToViewBounds( slice.bounds ), {
        lineWidth: 1,
        stroke: 'red'
      } );
      this.addChild( outlineNode );

      // move the outlines as the slice moves
      slice.anchorPointProperty.lazyLink( ( newPosition, oldPosition ) => {
        outlineNode.translate(
          modelViewTransform.modelToViewDeltaX( newPosition.x - oldPosition.x ),
          modelViewTransform.modelToViewDeltaY( newPosition.y - oldPosition.y )
        );
      } );
    }
  }
}

energyFormsAndChanges.register( 'EnergyChunkContainerSliceNode', EnergyChunkContainerSliceNode );
export default EnergyChunkContainerSliceNode;