// Copyright 2014-2015, University of Colorado Boulder

/**
 * Node that represents a "beaker container" in the view.  A beaker container
 * is a beaker that contains fluid, and in which other objects can be placed,
 * generally displacing the fluid.
 *
 * See the header comments in the parent class for some important information
 * about how this class is used on the canvas.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );

  /**
   * Constructor for a BeakerContainerView.
   *
   * @param {EnergyFormsAndChangesIntroModel} model
   * @param {Bounds2} stageBounds
   * @param {ModelViewTransform2} modelViewTransform
   */
  function BeakerContainerView( model, stageBounds, modelViewTransform ) {

    var self = this; // Extend scope for nested callbacks.
    BeakerView.call( this, model.beaker, model.energyChunksVisibleProperty, modelViewTransform );

    // Update the clipping mask when any of the blocks move.  The clipping
    // mask hides energy chunks that overlap with blocks.
    model.getBlockList().forEach( function( block ) {
      block.positionProperty.link( function() {
        self.updateEnergyChunkClipMask( model, self.energyChunkClipNode );
      } );
    } );

    // Update the clipping mask when the position of the beaker moves.
    model.beaker.positionProperty.link( function( position ) {
      self.updateEnergyChunkClipMask( model, self.energyChunkClipNode );
    } );

    this.grabNode.addInputListener( new ThermalElementDragHandler( model.beaker, this.grabNode, modelViewTransform ) );

    // Add the drag handler.
    this.addInputListener( new ThermalElementDragHandler( model.beaker, this, modelViewTransform ) );
  }

  energyFormsAndChanges.register( 'BeakerContainerView', BeakerContainerView );

  return inherit( BeakerView, BeakerContainerView, {

    // Update the clipping mask that hides energy chunks behind blocks that are in the beaker.
    updateEnergyChunkClipMask: function( model, clip ) {

      // TODO: Come up with an alternative clipping solution.

      //var forwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      //var backwardPerspectiveOffset = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( -EFACConstants.BLOCK_SURFACE_WIDTH / 2 );

      //var clippingMask

    }
  } );
} );

