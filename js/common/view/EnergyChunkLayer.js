// Copyright 2014-2021, University of Colorado Boulder

/**
 * This node monitors the comings and goings of energy chunks on a observable list and adds/removes nodes that
 * correspond to each.  This is intended to be used in other view nodes that represent model elements that contain
 * energy chunks.
 *
 * This was done as a separate class so that it could be used in composition rather than inheritance, because
 * composition allows better control over the layering within the parent view node.
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import { Node } from '../../../../scenery/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkNode from './EnergyChunkNode.js';

class EnergyChunkLayer extends Node {

  /**
   * @param {ObservableArrayDef} energyChunkList
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( energyChunkList, modelViewTransform, options ) {
    super();

    options = merge( {

      // Property.<Vector2> - a position Property that will be used to compensate the energy chunk layer's position
      // such that it stays in untranslated screen-view coordinates. This is often used for an energy chunk layer that
      // is the child of a node that is being placed in the view according to its position value.
      parentPositionProperty: null
    }, options );

    // This function adds EnergyChunkNodes to the layer when chunks are produced in the model. It includes listeners for
    // when chunks are removed from the model.
    const chunkAddedListener = energyChunk => {

      // create and add a node to represent the energy chunk
      const energyChunkNode = new EnergyChunkNode( energyChunk, modelViewTransform );
      this.addChild( energyChunkNode );

      // when chunk is removed from the model, remove its node from the view
      const itemRemovedListener = removedChunk => {
        if ( removedChunk === energyChunk ) {
          this.removeChild( energyChunkNode );
          energyChunkNode.dispose();

          // remove this listener to avoid leaking memory
          energyChunkList.removeItemRemovedListener( itemRemovedListener );
        }
      };

      // link itemRemovedListener
      energyChunkList.addItemRemovedListener( itemRemovedListener );
    };

    // add the named observer function for existing chunks and new chunks
    energyChunkList.forEach( chunkAddedListener );
    energyChunkList.addItemAddedListener( chunkAddedListener );

    if ( options.parentPositionProperty ) {

      // Since the energy chunk positions are in uncompensated model coordinates, this node must maintain a position
      // that is offset from the parent in order for the energy chunks to be in the correct position in the view.
      options.parentPositionProperty.link( position => {
        this.x = -modelViewTransform.modelToViewX( position.x );
        this.y = -modelViewTransform.modelToViewY( position.y );
      } );
    }
  }
}

energyFormsAndChanges.register( 'EnergyChunkLayer', EnergyChunkLayer );
export default EnergyChunkLayer;
