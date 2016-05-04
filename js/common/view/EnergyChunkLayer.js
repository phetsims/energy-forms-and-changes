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
   * @param {ObservableArray} energyChunkList
   * @param {Property.<Vector2>} parentPositionProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkLayer( energyChunkList, parentPositionProperty, modelViewTransform ) {
    Node.call( this );

    var self = this;

    // This "itemAddedListener" callback adds EnergyChunkNodes to the layer
    // when chunks are produced in the model. It includes listeners for when
    // chunks are removed from the model.
    function chunkListObserver( chunk ) {
      var energyChunkNode = new EnergyChunkNode( chunk, modelViewTransform );
      self.addChild( energyChunkNode );

      // When chunk is removed from the model, remove its node from the view
      var itemRemovedListener = function( removedChunk ) {
        if ( removedChunk === chunk ) {
          self.removeChild( energyChunkNode );

          // Remove this listener to reclaim memory
          energyChunkList.removeItemRemovedListener( itemRemovedListener );
        }
      };

      // Link itemRemovedListener to the waterDrops ObservableArray
      energyChunkList.addItemRemovedListener( itemRemovedListener );
    }

    // Add the named observer function
    energyChunkList.addItemAddedListener( chunkListObserver );

    // Since the energy chunk positions are in model coordinates, this node
    // must maintain a position that is offset from the parent in order to
    // compensate.
    parentPositionProperty.link( function( position ) {
      self.translate( -modelViewTransform.modelToViewX( position.x ), -modelViewTransform.modelToViewY( position.y ) );
    } );
  }

  return inherit( Node, EnergyChunkLayer );
} );

