// Copyright 2002-2015, University of Colorado Boulder

/**
 * This node monitors the comings and goings of energy
 * chunks on a observable list and adds/removes them from this node.  This is
 * intended to be used in other Nodes that represent model elements that
 * contain energy chunks.
 * <p/>
 * This was done as a separate class so that it could be used in composition
 * rather than inheritance, because composition allows better control over the
 * layering within the parent PNode.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );


  /**
   * *
   * @param energyChunkList
   * @param {Property.<Vector2>} parentPositionProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkLayer( energyChunkList, parentPositionProperty, modelViewTransform ) {
    Node.call( this );

    // existence in the model.
    var energyChunkLayer = this;

    energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      energyChunkLayer.addChild( energyChunkNode );

      // Remove the energy chunk nodes as they are removed from the model.
      energyChunkList.removeItemAddedListener( function( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          energyChunkLayer.removeChild( energyChunkNode );
        }
      } );
    } );

    // compensate.
    parentPositionProperty.link( function( position ) {
      energyChunkLayer.setOffset( -modelViewTransform.modelToViewX( position.x ), -modelViewTransform.modelToViewY( position.y ) );
    } );
  }

  return inherit( Node, EnergyChunkLayer );
} );
