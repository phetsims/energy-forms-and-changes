// Copyright 2014-2025, University of Colorado Boulder

/**
 * view representation of the air, which is basically just a parent node through which energy chunks can move
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Air from '../model/Air.js';

class AirNode extends Node {

  /**
   * @param air - model of the air
   * @param modelViewTransform
   */
  public constructor( air: Air, modelViewTransform: ModelViewTransform2 ) {
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
      const removalListener = ( removedEnergyChunk: EnergyChunk ) => {
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