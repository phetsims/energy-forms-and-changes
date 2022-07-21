// Copyright 2019-2022, University of Colorado Boulder

/**
 * A scenery node that represents a floating "sky" layer that fades in and out
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import { LinearGradient, Node, Rectangle } from '../../../../scenery/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const FADE_HEIGHT = 200; // height of the gradient regions of this node, in view coordinates

// colors
const TRANSPARENT_FILL = 'rgba( 255, 255, 255, 0 )';
const OPAQUE_FILL = 'white';

class SkyNode extends Node {

  /**
   * @param {Bounds2} layoutBounds - the layout bounds of the parent screen
   * @param {number} fullOpaqueYPosition - the y position at which this node should become completely opaque, in view coordinates
   * @param {Object} [options]
   */
  constructor( layoutBounds, fullOpaqueYPosition, options ) {
    super( options );

    const transparentToOpaque = new LinearGradient( 0, 0, 0, FADE_HEIGHT )
      .addColorStop( 0, OPAQUE_FILL )
      .addColorStop( 1, TRANSPARENT_FILL );
    const opaqueToTransparent = new LinearGradient( 0, 0, 0, FADE_HEIGHT )
      .addColorStop( 0, TRANSPARENT_FILL )
      .addColorStop( 1, OPAQUE_FILL );

    // add a rectangle that fades in in the upward direction, and position it so that the top edge is right below
    // where energy chunks are removed from the screen. this gives the effect that they fade out completely before
    // they are removed
    const transparentToOpaqueRectangle = new Rectangle( 0, 0, layoutBounds.width, FADE_HEIGHT, {
        fill: transparentToOpaque,
        centerX: layoutBounds.centerX,
        top: fullOpaqueYPosition
      }
    );
    this.addChild( transparentToOpaqueRectangle );

    // add a solid rectangle
    const opaqueRectangle = new Rectangle( 0, 0, layoutBounds.width, layoutBounds.height * 3, {
        fill: OPAQUE_FILL,
        centerX: transparentToOpaqueRectangle.centerX,
        bottom: transparentToOpaqueRectangle.top
      }
    );
    this.addChild( opaqueRectangle );

    // add a rectangle that fades out
    const opaqueToTransparentRectangle = new Rectangle( 0, 0, layoutBounds.width, FADE_HEIGHT, {
        fill: opaqueToTransparent,
        centerX: opaqueRectangle.centerX,
        bottom: opaqueRectangle.top
      }
    );
    this.addChild( opaqueToTransparentRectangle );
  }
}

energyFormsAndChanges.register( 'SkyNode', SkyNode );
export default SkyNode;