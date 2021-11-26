// Copyright 2018-2021, University of Colorado Boulder

/**
 * A node for water droplets falling out of the faucet. This canvas node exists because the water drops can be rendered
 * faster as canvas images than as individual nodes.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import { CanvasNode } from '../../../../scenery/js/imports.js';
import EFACConstants from '../../common/EFACConstants.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import FaucetAndWater from '../model/FaucetAndWater.js';

class FallingWaterCanvasNode extends CanvasNode {

  /**
   * @param {WaterDrop[]} waterDrops - the falling water drops to be rendered
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options] that can be passed on to the underlying node
   */
  constructor( waterDrops, modelViewTransform, options ) {
    super( options );

    // @private
    this.waterDrops = waterDrops;
    this.modelViewTransform = modelViewTransform;

    // @private
    // canvas where the water drop image is drawn
    this.waterDropImageCanvas = document.createElement( 'canvas' );

    // initial drop image is a circle of size MAX_WATER_WIDTH for width and height
    const waterDropImageCanvasWidthHeight = modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH );
    const waterDropImageCanvasRadius = modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH / 2 );
    this.waterDropImageCanvas.width = waterDropImageCanvasWidthHeight;
    this.waterDropImageCanvas.height = waterDropImageCanvasWidthHeight;
    const context = this.waterDropImageCanvas.getContext( '2d' );

    // draw a water drop centered in the water drop image canvas
    context.fillStyle = EFACConstants.WATER_COLOR_OPAQUE.toCSS();
    context.globalAlpha = 0.25;
    context.beginPath();
    context.arc(
      waterDropImageCanvasRadius,
      waterDropImageCanvasRadius,
      waterDropImageCanvasRadius,
      0,
      Math.PI * 2,
      true
    );
    context.fill();

    this.mutate( options );
  }

  /**
   * Renders water drops on the canvas node.
   * @param {CanvasRenderingContext2D} context
   * @private
   */
  renderFallingWater( context ) {
    const numberOfWaterDrops = this.waterDrops.length;
    for ( let i = 0; i < numberOfWaterDrops; i++ ) {
      this.drawWaterDrop( context, this.waterDrops[ i ] );
    }
  }

  /*
   * Draws a water drop.
   * @param {CanvasRenderingContext2D} context
   * @param {WaterDrop} drop
   * @private
   */
  drawWaterDrop( context, drop ) {
    context.drawImage(
      this.waterDropImageCanvas,
      this.modelViewTransform.modelToViewDeltaX( drop.position.x - drop.size.width / 2 ),
      this.modelViewTransform.modelToViewDeltaY( drop.position.y + drop.size.height / 2 ),
      this.modelViewTransform.modelToViewDeltaX( drop.size.width ),
      -this.modelViewTransform.modelToViewDeltaY( drop.size.height )
    );
  }

  /**
   * Paints the water drops on the canvas node.
   * @param {CanvasRenderingContext2D} context
   * @override
   * @public
   */
  paintCanvas( context ) {
    this.renderFallingWater( context );
  }

  /**
   * @public
   * @param {number} dt - the change in time
   */
  step( dt ) {
    this.invalidatePaint();
  }
}

energyFormsAndChanges.register( 'FallingWaterCanvasNode', FallingWaterCanvasNode );
export default FallingWaterCanvasNode;