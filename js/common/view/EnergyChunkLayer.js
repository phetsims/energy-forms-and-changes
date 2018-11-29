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
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} options
   * @param {Property.<Vector2>} parentPositionProperty
   * @constructor
   */
  function EnergyChunkLayer( energyChunkList, modelViewTransform, options ) {
    Node.call( this );

    var self = this;

    options = _.extend( {

      // Property.<Vector2> - a position property that will be used to compensate the energy chunk layer's position
      // such that it stays in untranslated screen-view coordinates.  This is often used for an energy chunk layer that
      // is the child of a node that is itself being placed in the view according to its position value.
      parentPositionProperty: null

    }, options );

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

    if ( options.parentPositionProperty ) {

      // Since the energy chunk positions are in uncompensated model coordinates, this node must maintain a position
      // that is offset from the parent in order for the energy chunks to be in the correct location in the view.
      options.parentPositionProperty.link( function( position ) {
        self.x = -modelViewTransform.modelToViewX( position.x );
        self.y = -modelViewTransform.modelToViewY( position.y );
      } );
    }
  }

  energyFormsAndChanges.register( 'EnergyChunkLayer', EnergyChunkLayer );

  return inherit( Node, EnergyChunkLayer );
} );