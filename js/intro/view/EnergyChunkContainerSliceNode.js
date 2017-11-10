// Copyright 2014-2017, University of Colorado Boulder

/**
 * A node that represents a 2D surface on which energy chunks reside.  The
 * surface contains z-dimension information, and can thus be used to create an
 * effect of layering in order to get a bit of a 3D appearance.
 *
 * @author John Blanco
 * @author Andrew Adare
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
   * @param {EnergyChunkContainerSlice} slice
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkContainerSliceNode( slice, modelViewTransform ) {

    var self = this;
    this.modelViewTransform = modelViewTransform;
    this.energyChunkContainerSlice = slice;
    Node.call( this );

    var listener = function( addedChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedChunk, modelViewTransform );
      self.addChild( energyChunkNode );
      slice.energyChunkList.addItemRemovedListener( function removalListener( removedChunk ) {
        if ( removedChunk === addedChunk ) {
          self.removeChild( energyChunkNode );
          slice.energyChunkList.removeItemRemovedListener( removalListener );
        }
      } );
    };

    // Add listeners to any existing chunks in the slice
    slice.energyChunkList.forEach( listener );

    // Add listeners to future chunks when added
    slice.energyChunkList.addItemAddedListener( listener );

    // For debug.
    if ( ALWAYS_SHOW_OUTLINE ) {
      this.addChild( new Path( modelViewTransform.modelToViewShape( slice.shape ), {
        lineWidth: 1,
        stroke: 'red'
      } ) );
    }
  }

  energyFormsAndChanges.register( 'EnergyChunkContainerSliceNode', EnergyChunkContainerSliceNode );

  return inherit( Node, EnergyChunkContainerSliceNode );
} );
