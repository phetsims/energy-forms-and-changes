// Copyright 2018-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * A node for water droplets falling out of the faucet. This canvas node exists because the water drops can be rendered
 * faster as canvas images than as individual nodes.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import CanvasNode from '../../../../scenery/js/nodes/CanvasNode.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import EFACConstants from '../../common/EFACConstants.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import FaucetAndWater from '../model/FaucetAndWater.js';
import WaterDrop from '../model/WaterDrop.js';

class FallingWaterCanvasNode extends CanvasNode {

  private readonly waterDrops: WaterDrop[];
  private readonly modelViewTransform: ModelViewTransform2;

  // Canvas where the water drop image is drawn
  private readonly waterDropImageCanvas: HTMLCanvasElement;

  /**
   * @param waterDrops - the falling water drops to be rendered
   * @param modelViewTransform
   * @param options - that can be passed on to the underlying node
   */
  public constructor( waterDrops: WaterDrop[], modelViewTransform: ModelViewTransform2, options?: Object ) {
    super( options );

    this.waterDrops = waterDrops;
    this.modelViewTransform = modelViewTransform;
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
   */
  private renderFallingWater( context: CanvasRenderingContext2D ): void {
    const numberOfWaterDrops = this.waterDrops.length;
    for ( let i = 0; i < numberOfWaterDrops; i++ ) {
      this.drawWaterDrop( context, this.waterDrops[ i ] );
    }
  }

  /*
   * Draws a water drop.
   */
  private drawWaterDrop( context: CanvasRenderingContext2D, drop: WaterDrop ): void {
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
   */
  public override paintCanvas( context: CanvasRenderingContext2D ): void {
    this.renderFallingWater( context );
  }

  /**
   * @param dt - the change in time
   */
  public step( dt: number ): void {
    this.invalidatePaint();
  }
}

energyFormsAndChanges.register( 'FallingWaterCanvasNode', FallingWaterCanvasNode );
export default FallingWaterCanvasNode;