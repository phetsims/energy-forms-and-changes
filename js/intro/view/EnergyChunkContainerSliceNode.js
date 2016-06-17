// Copyright 2014-2015, University of Colorado Boulder

/**
 * A node that represents a 2D surface on which energy chunks reside.  The
 * surface contains z-dimension information, and can thus be used to create an
 * effect of layering in order to get a bit of a 3D appearance.
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
  var Path = require( 'SCENERY/nodes/Path' );

  // constants
  var ALWAYS_SHOW_OUTLINE = true; // DEBUG

  /**
   * *
   * @param {EnergyChunkContainerSlice} energyChunkContainerSlice
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkContainerSliceNode( energyChunkContainerSlice, modelViewTransform ) {

    var self = this;
    this.modelViewTransform = modelViewTransform;
    this.energyChunkContainerSlice = energyChunkContainerSlice;
    Node.call( this );

    // Add the initial energy chunks.
    this.addInitialEnergyChunks();

    energyChunkContainerSlice.energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      self.addChild( energyChunkNode );
      energyChunkContainerSlice.energyChunkList.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          self.removeChild( energyChunkNode );
          energyChunkContainerSlice.energyChunkList.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // For debug.
    if ( ALWAYS_SHOW_OUTLINE ) {
      this.addChild( new Path( modelViewTransform.modelToViewShape( energyChunkContainerSlice.shape ), {
        lineWidth: 1,
        stroke: 'red'
      } ) );
    }
  }

  energyFormsAndChanges.register( 'EnergyChunkContainerSliceNode', EnergyChunkContainerSliceNode );

  return inherit( Node, EnergyChunkContainerSliceNode, {

    addInitialEnergyChunks: function() {
      var thisNode = this;
      this.energyChunkContainerSlice.energyChunkList.forEach( function( energyChunk ) {
        thisNode.addChild( new EnergyChunkNode( energyChunk, thisNode.modelViewTransform ) );
      } );
    }
  } );

} );
