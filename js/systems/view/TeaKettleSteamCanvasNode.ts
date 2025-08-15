// Copyright 2019-2025, University of Colorado Boulder

/**
 * A node for a concentrated column of steam.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import { clamp } from '../../../../dot/js/util/clamp.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize from '../../../../phet-core/js/optionize.js';
import CanvasNode, { CanvasNodeOptions } from '../../../../scenery/js/nodes/CanvasNode.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import EFACConstants from '../../common/EFACConstants.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import TeaKettle from '../model/TeaKettle.js';

// constants
const STEAM_BUBBLE_SPEED_RANGE = new Range( 120, 150 ); // in screen coordinates / second
const STEAM_BUBBLE_DIAMETER_RANGE = new Range( 12, 50 ); // in screen coordinates
const STEAM_BUBBLE_HEIGHT_RANGE = new Range( 10, 160 ); // in screen coordinates
const STEAM_BUBBLE_RATE_RANGE = new Range( 14, 20 ); // bubbles per second
const STEAM_BUBBLE_GROWTH_RATE = 3; // proportion per second
const STEAM_BUBBLE_MAX_OPACITY = 0.7; // proportion, 0 to 1

type SelfOptions = {
  steamAngle?: number; // angle of the steam
  steamFill?: string; // color of the steam
};

type TeaKettleSteamCanvasNodeOptions = SelfOptions & CanvasNodeOptions;

type SteamBubble = {
  x: number; // x position of the bubble
  y: number; // y position of the bubble
  radius: number; // radius of the bubble
  angle: number; // angle of the bubble's trajectory
  opacity: number; // opacity of the bubble
};

class TeaKettleSteamCanvasNode extends CanvasNode {

  private readonly steamOrigin: Vector2;
  private readonly energyOutputProperty: NumberProperty;
  private readonly maxEnergyOutput: number;
  private readonly steamAngle: number;
  private lastSteamAngle: number;
  private readonly steamAngleRange: Range;
  private preloadComplete: boolean;
  private bubbleProductionRemainder: number;
  private readonly steamBubbles: SteamBubble[];

  // canvas where the steam bubble image resides
  private readonly steamBubbleImageCanvas: HTMLCanvasElement;

  public constructor( steamOrigin: Vector2, energyOutputProperty: NumberProperty, maxEnergyOutput: number, providedOptions?: TeaKettleSteamCanvasNodeOptions ) {

    const options = optionize<TeaKettleSteamCanvasNodeOptions, SelfOptions, CanvasNodeOptions>()( {
      steamAngle: TeaKettle.SPOUT_EXIT_ANGLE, // {number}
      steamFill: 'rgb(255,255,255)' // {string} - white
    }, providedOptions );

    super( options );

    this.steamOrigin = steamOrigin;
    this.energyOutputProperty = energyOutputProperty;
    this.maxEnergyOutput = maxEnergyOutput;
    this.steamAngle = options.steamAngle;
    this.lastSteamAngle = this.steamAngle;
    this.steamAngleRange = new Range( this.steamAngle * 0.85, this.steamAngle * 1.1 ); // room for random variation
    this.preloadComplete = true;

    this.bubbleProductionRemainder = 0;
    this.steamBubbles = [];

    this.steamBubbleImageCanvas = document.createElement( 'canvas' );
    this.steamBubbleImageCanvas.width = STEAM_BUBBLE_DIAMETER_RANGE.max;
    this.steamBubbleImageCanvas.height = STEAM_BUBBLE_DIAMETER_RANGE.max;
    const context = this.steamBubbleImageCanvas.getContext( '2d' )!;

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

    // Preload steam animation after state has been set
    phetioStateSetEmitter.addListener( () => {
      this.preloadSteam();
    } );
  }

  /**
   * Updates the number of steam bubbles and the position, size, and opacity of each one.
   */
  public step( dt: number ): void {
    const steamingProportion = this.energyOutputProperty.value / this.maxEnergyOutput;

    // add any new steam bubbles
    if ( steamingProportion > 0 ) {
      const bubblesToProduceCalc =
        ( STEAM_BUBBLE_RATE_RANGE.min + STEAM_BUBBLE_RATE_RANGE.getLength() * steamingProportion ) * dt;
      let bubblesToProduce = Math.floor( bubblesToProduceCalc );

      this.bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;

      if ( this.bubbleProductionRemainder >= 1 ) {
        bubblesToProduce += Math.floor( this.bubbleProductionRemainder );
        this.bubbleProductionRemainder -= Math.floor( this.bubbleProductionRemainder );
      }

      // allow for a small variation from the previous angle, as long as it's within the valid angle range
      let bubbleAngle = this.lastSteamAngle * ( dotRandom.nextDouble() * ( 1.015 - 0.985 ) + 0.985 );
      bubbleAngle = clamp( bubbleAngle, this.steamAngleRange.min, this.steamAngleRange.max );
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
    else {
      this.preloadComplete = true;
    }

    // update the position and appearance of the existing steam bubbles
    const steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();

    // create a copy to iterate over so we can splice the original when removing bubbles
    const steamBubblesCopy = [ ...this.steamBubbles ];

    for ( let i = 0; i < steamBubblesCopy.length; i++ ) {

      // update position
      const dy = -dt * steamBubbleSpeed;
      const dx = -dy / Math.tan( steamBubblesCopy[ i ].angle );
      steamBubblesCopy[ i ].y += dy;
      steamBubblesCopy[ i ].x += dx;

      // increase radius
      steamBubblesCopy[ i ].radius = steamBubblesCopy[ i ].radius * ( 1 + ( STEAM_BUBBLE_GROWTH_RATE * dt ) );

      // fade out the bubble as it reaches the end of its range
      const steamBubbleMaxHeight = STEAM_BUBBLE_HEIGHT_RANGE.min + steamingProportion * STEAM_BUBBLE_HEIGHT_RANGE.getLength();
      const heightFraction = clamp( ( this.steamOrigin.y - steamBubblesCopy[ i ].y ) / steamBubbleMaxHeight, 0, 1 );
      steamBubblesCopy[ i ].opacity = ( 1 - heightFraction ) * STEAM_BUBBLE_MAX_OPACITY;

      // remove bubbles that are out of the current height range
      if ( this.steamOrigin.y - steamBubblesCopy[ i ].y > steamBubbleMaxHeight ) {
        this.steamBubbles.splice( i, 1 );
        this.preloadComplete = true;
      }
    }

    this.preloadComplete && this.steamBubbles.length && this.invalidatePaint();
  }

  /**
   * Draws a steam bubble.
   */
  private drawSteamBubble( context: CanvasRenderingContext2D, steamBubble: SteamBubble ): void {
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
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    for ( let i = 0; i < this.steamBubbles.length; i++ ) {
      this.drawSteamBubble( context, this.steamBubbles[ i ] );
    }
  }

  public reset(): void {
    this.steamBubbles.length = 0;
  }

  /**
   * Preloads the steam animation.
   */
  private preloadSteam(): void {
    this.preloadComplete = false;
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;

    while ( !this.preloadComplete ) {
      this.step( dt );
    }
  }
}

energyFormsAndChanges.register( 'TeaKettleSteamCanvasNode', TeaKettleSteamCanvasNode );
export default TeaKettleSteamCanvasNode;