// Copyright 2014-2019, University of Colorado Boulder

/**
 * view representation of the air, which is basically just a parent node through which energy chunks can move
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  const EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );

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

  return energyFormsAndChanges.register( 'AirNode', AirNode );
} );

