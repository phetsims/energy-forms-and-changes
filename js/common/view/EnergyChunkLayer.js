// Copyright 2014-2015, University of Colorado Boulder

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
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
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
    var self = this;

    energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      self.addChild( energyChunkNode );

      // Remove the energy chunk nodes as they are removed from the model.
      // energyChunkList.removeItemAddedListener( function( removedEnergyChunk ) {
      //   if ( removedEnergyChunk === addedEnergyChunk ) {
      //     self.removeChild( energyChunkNode );
      //   }
      // } );

    } );

    // Since the energy chunk positions are in model coordinates, this node
    // must maintain a position that is offset from the parent in order to
    // compensate.
    parentPositionProperty.link( function( position ) {
      var offset = modelViewTransform.modelToViewDelta( position ).negated();
      self.setTranslation( offset.x, offset.y );
    } );
  }

  return inherit( Node, EnergyChunkLayer );
} );

