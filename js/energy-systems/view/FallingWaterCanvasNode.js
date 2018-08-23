// Copyright 2018, University of Colorado Boulder

/**
 * A node for water droplets falling out of the faucet.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FaucetAndWater' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {WaterDrop[]} waterDrops - the falling water drops to be rendered
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function FallingWaterCanvasNode( waterDrops, modelViewTransform, options ) {
    CanvasNode.call( this, options );

    // @private
    this.waterDrops = waterDrops;
    this.modelViewTransform = modelViewTransform;

    // @private
    // canvas where the water drop image is drawn
    this.waterDropImageCanvas = document.createElement( 'canvas' );
    this.waterDropImageCanvas.width = modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH );
    this.waterDropImageCanvas.height = modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH );
    var context = this.waterDropImageCanvas.getContext( '2d' );

    // draw a water drop centered in the water drop image canvas
    context.fillStyle = EFACConstants.WATER_COLOR_OPAQUE.toCSS();
    context.globalAlpha = 0.25;
    context.beginPath();
    context.arc(
      modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH / 2 ),
      modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH / 2 ),
      modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH / 2 ),
      0,
      Math.PI * 2,
      true
    );
    context.fill();

    this.mutate( options );
  }

  energyFormsAndChanges.register( 'FallingWaterCanvasNode', FallingWaterCanvasNode );

  return inherit( CanvasNode, FallingWaterCanvasNode, {

    /**
     * Renders water drops on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    renderFallingWater: function( context ) {
      var self = this;
      this.waterDrops.forEach( function( drop ) {
        self.drawWaterDrop( context, drop );
      } );
    },

    /*
     * Draws a water drop.
     * @param {CanvasRenderingContext2D} context
     * @param {WaterDrop} drop
     * @private
     */
    drawWaterDrop: function( context, drop ) {
      context.drawImage(
        this.waterDropImageCanvas,
        this.modelViewTransform.modelToViewDeltaX( drop.position.x - drop.size.width / 2 ),
        this.modelViewTransform.modelToViewDeltaY( drop.position.y - drop.size.height / 2 ),
        this.modelViewTransform.modelToViewDeltaX( drop.size.width ),
        -this.modelViewTransform.modelToViewDeltaY( drop.size.height )
      );
    },

    /**
     * Paints the water drops on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @public
     */
    paintCanvas: function( context ) {
      this.renderFallingWater( context );
    },

    /**
     * @public
     * @param {number} dt - the change in time
     */
    step: function( dt ) {
      this.invalidatePaint();
    }
  } );
} );