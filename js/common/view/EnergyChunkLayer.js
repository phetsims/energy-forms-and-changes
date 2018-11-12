// Copyright 2014-2018, University of Colorado Boulder

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
define( function( require ) {
  'use strict';

  // modules
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {ObservableArray} energyChunkList
   * @param {Property.<Vector2>} parentPositionProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkLayer( energyChunkList, parentPositionProperty, modelViewTransform ) {
    Node.call( this );

    var self = this;

    // This function adds EnergyChunkNodes to the layer when chunks are produced in the model. It includes listeners for
    // when chunks are removed from the model.
    function chunkAddedListener( energyChunk ) {

      // create and add a node to represent the energy chunk
      var energyChunkNode = new EnergyChunkNode( energyChunk, modelViewTransform );
      self.addChild( energyChunkNode );

      // when chunk is removed from the model, remove its node from the view
      var itemRemovedListener = function( removedChunk ) {
        if ( removedChunk === energyChunk ) {
          self.removeChild( energyChunkNode );
          energyChunkNode.dispose();

          // remove this listener to avoid leaking memory
          energyChunkList.removeItemRemovedListener( itemRemovedListener );
        }
      };

      // link itemRemovedListener to the provided ObservableArray
      energyChunkList.addItemRemovedListener( itemRemovedListener );
    }

    // add the named observer function
    energyChunkList.addItemAddedListener( chunkAddedListener );

    // Since the energy chunk positions are in uncompensated model coordinates, this node must maintain a position that
    // is offset from the parent in order to be in the correct location in the view.
    parentPositionProperty.link( function( position ) {
      self.x = -modelViewTransform.modelToViewX( position.x );
      self.y = -modelViewTransform.modelToViewY( position.y );
    } );
  }

  energyFormsAndChanges.register( 'EnergyChunkLayer', EnergyChunkLayer );

  return inherit( Node, EnergyChunkLayer );
} );