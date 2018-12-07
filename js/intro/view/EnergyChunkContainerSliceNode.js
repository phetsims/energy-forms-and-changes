// Copyright 2014-2018, University of Colorado Boulder

/**
 * A node that represents a 2D surface on which energy chunks reside.  The surface contains z-dimension information,
 * and can thus be used to create an effect of layering in order to get a bit of a 3D appearance when used in
 * conjunction with other slices.  The slice itself is generally invisible, but can be shown using when needed for
 * debugging.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  /**
   * @param {EnergyChunkContainerSlice} slice
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkContainerSliceNode( slice, modelViewTransform ) {

    var self = this;
    this.modelViewTransform = modelViewTransform;
    Node.call( this );

    // define a function that will add and remove energy chunk nodes as energy come and go in the model
    function addEnergyChunkNode( addedChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedChunk, modelViewTransform );
      self.addChild( energyChunkNode );
      slice.energyChunkList.addItemRemovedListener( function removalListener( removedChunk ) {
        if ( removedChunk === addedChunk ) {
          self.removeChild( energyChunkNode );
          energyChunkNode.dispose();
          slice.energyChunkList.removeItemRemovedListener( removalListener );
        }
      } );
    }

    // add the initial energy chunks
    slice.energyChunkList.forEach( addEnergyChunkNode );

    // listen for the arrival of new energy chunks and create a node for each
    slice.energyChunkList.addItemAddedListener( addEnergyChunkNode );

    if ( EFACQueryParameters.showHelperShapes ) {

      // for debug - add an outline of the slice bounds, note that this does not update if the slice's bounds change
      var outlineNode = new Rectangle( modelViewTransform.modelToViewBounds( slice.bounds ), {
        lineWidth: 1,
        stroke: 'red'
      } );
      this.addChild( outlineNode );

      // move the outlines as the slice moves
      slice.anchorPointProperty.lazyLink( function( newPosition, oldPosition ) {
        outlineNode.translate(
          modelViewTransform.modelToViewDeltaX( newPosition.x - oldPosition.x ),
          modelViewTransform.modelToViewDeltaY( newPosition.y - oldPosition.y )
        );
      } );
    }
  }

  energyFormsAndChanges.register( 'EnergyChunkContainerSliceNode', EnergyChunkContainerSliceNode );

  return inherit( Node, EnergyChunkContainerSliceNode );
} );
