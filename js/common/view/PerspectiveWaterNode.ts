// Copyright 2018-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * a scenery node that looks like water in a cylindrical container as seen from slightly above the horizon
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Shape from '../../../../kite/js/Shape.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Rectangle from '../../../../scenery/js/nodes/Rectangle.js';
import Color from '../../../../scenery/js/util/Color.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import BeakerSteamCanvasNode from './BeakerSteamCanvasNode.js';

// constants
const PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;

// constants for the PerspectiveWaterNode
const FLUID_LINE_WIDTH = 2;

class PerspectiveWaterNode extends Node {

  public constructor( beakerOutlineRect: Rectangle, fluidProportionProperty: Property<number>, temperatureProperty: Property<number>, fluidBoilingPoint: number, fluidColor: Color, steamColor: Color ) {
    super();

    // @private
    this.beakerOutlineRect = beakerOutlineRect;
    this.fluidProportionProperty = fluidProportionProperty;
    this.temperatureProperty = temperatureProperty;
    this.fluidBoilingPoint = fluidBoilingPoint;
    this.fluidColor = fluidColor;
    this.steamColor = steamColor;

    // @private - a rectangle that defines the size of the fluid within the beaker
    this.fluidBounds = Bounds2.NOTHING.copy();

    // @private - nodes that represent the top and body of the water
    this.liquidWaterTopNode = new Path( null, {
      fill: this.fluidColor.colorUtilsBrighter( 0.25 ),
      lineWidth: FLUID_LINE_WIDTH,
      stroke: this.fluidColor.colorUtilsDarker( 0.2 )
    } );
    this.liquidWaterBodyNode = new Path( null, {
      fill: this.fluidColor,
      lineWidth: FLUID_LINE_WIDTH,
      stroke: this.fluidColor.colorUtilsDarker( 0.2 )
    } );

    // @private
    this.steamCanvasNode = new BeakerSteamCanvasNode(
      this.beakerOutlineRect,
      this.fluidProportionProperty,
      this.temperatureProperty,
      this.fluidBoilingPoint,
      this.steamColor, {
        canvasBounds: new Bounds2(
          -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2,
          -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY,
          EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2,
          EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY
        )
      } );
    this.addChild( this.liquidWaterBodyNode );
    this.addChild( this.liquidWaterTopNode );
    this.addChild( this.steamCanvasNode );

    // update the appearance of the water as the level changes
    this.fluidProportionProperty.link( fluidProportion => {
      const fluidHeight = beakerOutlineRect.height * fluidProportion;
      this.fluidBounds.setMinMax(
        beakerOutlineRect.minX,
        beakerOutlineRect.maxY - fluidHeight,
        beakerOutlineRect.maxX,
        0
      );
      this.updateWaterAppearance();
    } );
  }

  public reset(): void {
    this.steamCanvasNode.reset();
  }

  /**
   * time step function for the water
   * @param dt - the change in time
   */
  public step( dt: number ): void {
    this.steamCanvasNode.step( dt );
  }

  /**
   * update the appearance of the water
   */
  private updateWaterAppearance(): void {
    const ellipseWidth = this.fluidBounds.width;
    const ellipseHeight = PERSPECTIVE_PROPORTION * ellipseWidth;
    const liquidWaterTopEllipse = Shape.ellipse(
      this.fluidBounds.centerX,
      this.fluidBounds.minY,
      ellipseWidth / 2,
      ellipseHeight / 2,
      0,
      0,
      Math.PI / 2,
      false
    );

    const halfWidth = this.fluidBounds.width / 2;
    const halfHeight = ellipseHeight / 2;
    const liquidWaterBodyShape = new Shape()
      .moveTo( this.fluidBounds.minX, this.fluidBounds.minY ) // Top left of the beaker body.
      .ellipticalArc( this.fluidBounds.centerX, this.fluidBounds.minY, halfWidth, halfHeight, 0, Math.PI, 0, false )
      .lineTo( this.fluidBounds.maxX, this.fluidBounds.maxY ) // Bottom right of the beaker body.
      .ellipticalArc( this.fluidBounds.centerX, this.fluidBounds.maxY, halfWidth, halfHeight, 0, 0, Math.PI, false )
      .close();

    this.liquidWaterBodyNode.setShape( liquidWaterBodyShape );
    this.liquidWaterTopNode.setShape( liquidWaterTopEllipse );
  }
}

energyFormsAndChanges.register( 'PerspectiveWaterNode', PerspectiveWaterNode );
export default PerspectiveWaterNode;