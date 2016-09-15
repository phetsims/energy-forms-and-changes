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
  var ALWAYS_SHOW_OUTLINE = false; // DEBUG

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
    // this.addInitialEnergyChunks(); // AA: No!

    energyChunkContainerSlice.energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      // console.log( 'ECCSN: Adding energyChunkNode' );
      self.addChild( energyChunkNode );
      energyChunkContainerSlice.energyChunkList.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          // console.log( 'ECCSN: Removing energyChunkNode' );
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

    // Note (AA): this function does not belong here. See #23. Leaving intact until more progress
    // is made on that issue.
    addInitialEnergyChunks: function() {
      var self = this;
      this.energyChunkContainerSlice.energyChunkList.forEach( function( energyChunk ) {
        self.addChild( new EnergyChunkNode( energyChunk, self.modelViewTransform ) );
      } );
    }
  } );

} );

