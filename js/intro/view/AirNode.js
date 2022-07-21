// Copyright 2014-2022, University of Colorado Boulder

/**
 * view representation of the air, which is basically just a parent node through which energy chunks can move
 *
 * @author John Blanco
 */

import { Node, Rectangle } from '../../../../scenery/js/imports.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class AirNode extends Node {

  /**
   * @param {Air} air - model of the air
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( air, modelViewTransform ) {
    super();

    if ( EFACQueryParameters.showAirBounds ) {
      this.addChild( new Rectangle( modelViewTransform.modelToViewBounds( air.thermalContactArea ), {
        fill: 'rgba( 255, 0, 0, 0.5 )',
        lineWidth: 1
      } ) );
    }

    // watch for energy chunks coming and going and add/remove nodes accordingly
    air.energyChunkList.addItemAddedListener( addedEnergyChunk => {
      const energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      this.addChild( energyChunkNode );
      const removalListener = removedEnergyChunk => {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          this.removeChild( energyChunkNode );
          energyChunkNode.dispose();
          air.energyChunkList.removeItemRemovedListener( removalListener );
        }
      };
      air.energyChunkList.addItemRemovedListener( removalListener );
    } );
  }
}

energyFormsAndChanges.register( 'AirNode', AirNode );
export default AirNode;