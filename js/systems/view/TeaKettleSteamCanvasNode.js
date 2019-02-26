// Copyright 2019, University of Colorado Boulder

/**
 * A node for a concentrated column of steam.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Range = require( 'DOT/Range' );
  const TeaKettle = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/TeaKettle' );
  const Util = require( 'DOT/Util' );

  // constants
  const STEAM_BUBBLE_SPEED_RANGE = new Range( 120, 150 ); // in screen coordinates / second
  const STEAM_BUBBLE_DIAMETER_RANGE = new Range( 12, 50 ); // in screen coordinates
  const STEAM_BUBBLE_HEIGHT_RANGE = new Range( 10, 160 ); // in screen coordinates
  const STEAM_BUBBLE_RATE_RANGE = new Range( 14, 20 ); // bubbles per second
  const STEAM_BUBBLE_GROWTH_RATE = 3; // proportion per second
  const STEAM_BUBBLE_MAX_OPACITY = 0.7; // proportion, 0 to 1

  class TeaKettleSteamCanvasNode extends CanvasNode {

    /**
     * @param {Vector2} steamOrigin
     * @param {NumberProperty} energyOutputProperty
     * @param {number} maxEnergyOutput
     * @param {Object} [options]
     * @constructor
     */
    constructor( steamOrigin, energyOutputProperty, maxEnergyOutput, options ) {

      options = _.extend( {
        steamAngle: TeaKettle.SPOUT_EXIT_ANGLE, // {number}
        steamFill: 'rgb(255,255,255)' // {string} - white
      }, options );

      super( options );

      // @private
      this.steamOrigin = steamOrigin;
      this.energyOutputProperty = energyOutputProperty;
      this.maxEnergyOutput = maxEnergyOutput;
      this.steamAngle = options.steamAngle;
      this.lastSteamAngle = this.steamAngle;
      this.steamAngleRange = new Range( this.steamAngle * 0.85, this.steamAngle * 1.1 ); // room for random variation

      // @private
      this.bubbleProductionRemainder = 0;
      this.dt = 0;
      this.steamBubbles = [];

      // @private
      // canvas where the steam bubble image resides
      this.steamBubbleImageCanvas = document.createElement( 'canvas' );
      this.steamBubbleImageCanvas.width = STEAM_BUBBLE_DIAMETER_RANGE.max;
      this.steamBubbleImageCanvas.height = STEAM_BUBBLE_DIAMETER_RANGE.max;
      const context = this.steamBubbleImageCanvas.getContext( '2d' );

      // draw a steam bubble centered in the steam bubble image canvas
      context.fillStyle = options.steamFill;
      context.beginPath();
      context.arc(
        STEAM_BUBBLE_DIAMETER_RANGE.max / 2,
        STEAM_BUBBLE_DIAMETER_RANGE.max / 2,
        STEAM_BUBBLE_DIAMETER_RANGE.max / 2,
        0,
        Math.PI * 2,
        true
      );
      context.fill();

      this.mutate( options );
    }

    /**
     * Renders the steam bubbles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    renderSteam( context ) {
      const steamingProportion = this.energyOutputProperty.get() / this.maxEnergyOutput;

      // add any new steam bubbles
      if ( steamingProportion > 0 ) {
        const bubblesToProduceCalc =
          ( STEAM_BUBBLE_RATE_RANGE.min + STEAM_BUBBLE_RATE_RANGE.getLength() * steamingProportion ) * this.dt;
        let bubblesToProduce = Math.floor( bubblesToProduceCalc );

        this.bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;

        if ( this.bubbleProductionRemainder >= 1 ) {
          bubblesToProduce += Math.floor( this.bubbleProductionRemainder );
          this.bubbleProductionRemainder -= Math.floor( this.bubbleProductionRemainder );
        }

        // allow for a small variation from the previous angle, as long as it's within the valid angle range
        let bubbleAngle = this.lastSteamAngle * ( phet.joist.random.nextDouble() * ( 1.015 - 0.985 ) + 0.985 );
        bubbleAngle = Util.clamp( bubbleAngle, this.steamAngleRange.min, this.steamAngleRange.max );
        this.lastSteamAngle = bubbleAngle;

        // add new bubbles
        for ( let i = 0; i < bubblesToProduce; i++ ) {
          const steamBubble = {
            x: this.steamOrigin.x,
            y: this.steamOrigin.y,
            radius: STEAM_BUBBLE_DIAMETER_RANGE.min / 2,
            angle: bubbleAngle,
            opacity: STEAM_BUBBLE_MAX_OPACITY
          };
          this.steamBubbles.push( steamBubble );
        }
      }

      // update the position and appearance of the existing steam bubbles
      const steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();

      // create a copy to iterate over so we can splice the original when removing bubbles
      const steamBubblesCopy = [ ...this.steamBubbles ];

      for ( let i = 0; i < steamBubblesCopy.length; i++ ) {

        // update position
        const dy = -this.dt * steamBubbleSpeed;
        const dx = -dy / Math.tan( steamBubblesCopy[ i ].angle );
        steamBubblesCopy[ i ].y += dy;
        steamBubblesCopy[ i ].x += dx;

        // increase radius
        steamBubblesCopy[ i ].radius = steamBubblesCopy[ i ].radius * ( 1 + ( STEAM_BUBBLE_GROWTH_RATE * this.dt ) );

        // fade out the bubble as it reaches the end of its range
        const steamBubbleMaxHeight = STEAM_BUBBLE_HEIGHT_RANGE.min + steamingProportion * STEAM_BUBBLE_HEIGHT_RANGE.getLength();
        const heightFraction = Util.clamp( ( this.steamOrigin.y - steamBubblesCopy[ i ].y ) / steamBubbleMaxHeight, 0, 1 );
        steamBubblesCopy[ i ].opacity = ( 1 - heightFraction ) * STEAM_BUBBLE_MAX_OPACITY;

        this.drawSteamBubble( context, steamBubblesCopy[ i ] );

        // remove bubbles that are out of the current height range
        if ( this.steamOrigin.y - steamBubblesCopy[ i ].y > steamBubbleMaxHeight ) {
          this.steamBubbles.splice( i, 1 );
        }
      }
    }

    /*
     * Draws a steam bubble.
     * @param {CanvasRenderingContext2D} context
     * @param {Object} steamBubble
     * @private
     */
    drawSteamBubble( context, steamBubble ) {
      context.globalAlpha = steamBubble.opacity;
      context.drawImage(
        this.steamBubbleImageCanvas,
        steamBubble.x - steamBubble.radius,
        steamBubble.y - steamBubble.radius,
        steamBubble.radius * 2,
        steamBubble.radius * 2
      );
    }

    /**
     * Paints the steam on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @public
     */
    paintCanvas( context ) {
      this.renderSteam( context );
    }

    /**
     * @public
     */
    reset() {
      this.steamBubbles.length = 0;
    }

    /**
     * @public
     * @param {number} dt - the change in time
     */
    step( dt ) {
      this.dt = dt;
      this.invalidatePaint();
    }
  }

  return energyFormsAndChanges.register( 'TeaKettleSteamCanvasNode', TeaKettleSteamCanvasNode );
} );