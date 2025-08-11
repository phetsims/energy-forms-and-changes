// Copyright 2018-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * A node for the column of steam that rises out of a beaker when the temperature of the contained liquid is high enough.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Utils from '../../../../dot/js/Utils.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import CanvasNode, { CanvasNodeOptions } from '../../../../scenery/js/nodes/CanvasNode.js';
import Color from '../../../../scenery/js/util/Color.js';
import phetioStateSetEmitter from '../../../../tandem/js/phetioStateSetEmitter.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';

// constants
const STEAMING_RANGE = 10; // number of degrees Kelvin over which steam is visible
const STEAM_BUBBLE_SPEED_RANGE = new Range( 100, 125 ); // in screen coords (~ pixels) / second
const STEAM_BUBBLE_DIAMETER_RANGE = new Range( 20, 50 ); // in screen coords (~ pixels)
const MAX_STEAM_BUBBLE_HEIGHT = 300;
const STEAM_BUBBLE_RATE_RANGE = new Range( 20, 40 ); // bubbles per second
const STEAM_BUBBLE_GROWTH_RATE = 0.2; // proportion per second
const MAX_STEAM_BUBBLE_OPACITY = 0.7; // proportion, 0 to 1

type SelfOptions = EmptySelfOptions;

type BeakerSteamCanvasNodeOptions = SelfOptions & CanvasNodeOptions;

class BeakerSteamCanvasNode extends CanvasNode {

  // The outline of the container
  private readonly containerOutlineRect: Rectangle;

  // The proportion of fluid in its container
  private readonly fluidProportionProperty: Property<number>;

  // The temperature of the liquid
  private readonly temperatureProperty: Property<number>;

  // The boiling point of the fluid
  private readonly fluidBoilingPoint: number;

  // The color of the steam
  private readonly steamColor: Color;

  private preloadComplete: boolean;
  private bubbleProductionRemainder: number;
  private steamOrigin: number;
  private steamBubbles: Object[];

  // Canvas where the steam bubble image resides
  private readonly steamBubbleImageCanvas: HTMLCanvasElement;

  /**
   * @param containerOutlineRect - the outline of the container
   * @param fluidProportionProperty - the proportion of fluid in its container
   * @param temperatureProperty - the temperature of the liquid
   * @param fluidBoilingPoint
   * @param steamColor
   * @param [providedOptions]
   */
  public constructor( containerOutlineRect: Rectangle, fluidProportionProperty: Property<number>, temperatureProperty: Property<number>, fluidBoilingPoint: number, steamColor: Color, providedOptions?: BeakerSteamCanvasNodeOptions ) {
    
    const options = optionize<BeakerSteamCanvasNodeOptions, SelfOptions, CanvasNodeOptions>()( {}, providedOptions );
    
    super( options );

    this.containerOutlineRect = containerOutlineRect;
    this.fluidProportionProperty = fluidProportionProperty;
    this.temperatureProperty = temperatureProperty;
    this.fluidBoilingPoint = fluidBoilingPoint;
    this.steamColor = steamColor;
    this.preloadComplete = true;

    this.bubbleProductionRemainder = 0;
    this.steamOrigin = 0;
    this.steamBubbles = [];

    this.steamBubbleImageCanvas = document.createElement( 'canvas' );
    this.steamBubbleImageCanvas.width = STEAM_BUBBLE_DIAMETER_RANGE.max;
    this.steamBubbleImageCanvas.height = STEAM_BUBBLE_DIAMETER_RANGE.max;
    const context = this.steamBubbleImageCanvas.getContext( '2d' );

    // draw a steam bubble centered in the steam bubble image canvas
    context.fillStyle = this.steamColor.toCSS();
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

    // update the appearance of the water as the level changes
    this.fluidProportionProperty.link( fluidProportion => {
      this.steamOrigin = this.containerOutlineRect.minY * fluidProportion;
    } );

    this.mutate( options );

    // Preload steam animation after state has been set
    phetioStateSetEmitter.addListener( () => {
      this.preloadSteam();
    } );
  }

  /**
   * Updates the number of steam bubbles and the position, size, and opacity of each one.
   * @param dt
   */
  public step( dt: number ): void {
    let steamingProportion = 0;

    // add any new steam bubbles
    if ( this.fluidBoilingPoint - this.temperatureProperty.value < STEAMING_RANGE ) {

      // the water is emitting some amount of steam - set the proportionate amount
      steamingProportion = 1 - ( ( this.fluidBoilingPoint - this.temperatureProperty.value ) / STEAMING_RANGE );
      steamingProportion = Utils.clamp( steamingProportion, 0, 1 );

      const bubblesToProduceCalc =
        ( STEAM_BUBBLE_RATE_RANGE.min + STEAM_BUBBLE_RATE_RANGE.getLength() * steamingProportion ) * dt;
      let bubblesToProduce = Math.floor( bubblesToProduceCalc );

      this.bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;

      if ( this.bubbleProductionRemainder >= 1 ) {
        bubblesToProduce += Math.floor( this.bubbleProductionRemainder );
        this.bubbleProductionRemainder -= Math.floor( this.bubbleProductionRemainder );
      }

      for ( let i = 0; i < bubblesToProduce; i++ ) {
        const steamBubbleDiameter = STEAM_BUBBLE_DIAMETER_RANGE.min +
                                    dotRandom.nextDouble() * STEAM_BUBBLE_DIAMETER_RANGE.getLength();
        const steamBubbleCenterXPos = this.containerOutlineRect.centerX +
                                      ( dotRandom.nextDouble() - 0.5 ) *
                                      ( this.containerOutlineRect.width - steamBubbleDiameter );

        // bubbles are invisible to start; they will fade in
        const steamBubble = {
          x: steamBubbleCenterXPos,
          y: this.steamOrigin,
          radius: steamBubbleDiameter / 2,
          opacity: 0
        };
        this.steamBubbles.push( steamBubble );
      }
    }
    else {
      this.preloadComplete = true;
    }

    // update the position and appearance of the existing steam bubbles
    const steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();
    const unfilledBeakerHeight = this.containerOutlineRect.height + this.steamOrigin;

    // create a clone to iterate over so we can splice the original when removing bubbles
    const steamBubblesCopy = [ ...this.steamBubbles ];

    for ( let i = 0; i < steamBubblesCopy.length; i++ ) {

      // float the bubbles upward from the beaker
      steamBubblesCopy[ i ].y += -dt * steamBubbleSpeed;

      if ( steamBubblesCopy[ i ].y < this.containerOutlineRect.minY ) {

        // increase radius
        steamBubblesCopy[ i ].radius = steamBubblesCopy[ i ].radius * 2 * ( 1 + ( STEAM_BUBBLE_GROWTH_RATE * dt ) ) / 2;

        // give bubble some lateral drift motion
        const distanceFromCenterX = steamBubblesCopy[ i ].x;
        steamBubblesCopy[ i ].x += distanceFromCenterX * 0.2 * dt;

        // fade the bubble as it reaches the end of its range
        const heightFraction = Utils.clamp( ( this.containerOutlineRect.minY - steamBubblesCopy[ i ].y ) / MAX_STEAM_BUBBLE_HEIGHT, 0, 1 );
        steamBubblesCopy[ i ].opacity = ( 1 - heightFraction ) * MAX_STEAM_BUBBLE_OPACITY;
      }

      // fade new bubble in
      else {
        const distanceFromWater = this.steamOrigin - steamBubblesCopy[ i ].y;
        const opacityFraction = Utils.clamp( distanceFromWater / ( unfilledBeakerHeight / 4 ), 0, 1 );
        steamBubblesCopy[ i ].opacity = opacityFraction * MAX_STEAM_BUBBLE_OPACITY;
      }

      // remove bubble that has floated out of view
      if ( this.containerOutlineRect.minY - steamBubblesCopy[ i ].y > MAX_STEAM_BUBBLE_HEIGHT ) {
        this.steamBubbles.splice( i, 1 );
        this.preloadComplete = true;
      }
    }

    this.preloadComplete && this.steamBubbles.length && this.invalidatePaint();
  }

  /**
   * Draws a steam bubble.
   * @param context
   * @param steamBubble
   */
  private drawSteamBubble( context: CanvasRenderingContext2D, steamBubble: Object ): void {
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
   * @param context
   */
  public paintCanvas( context: CanvasRenderingContext2D ): void {
    for ( let i = 0; i < this.steamBubbles.length; i++ ) {
      this.drawSteamBubble( context, this.steamBubbles[ i ] );
    }
  }

  public reset(): void {
    this.steamBubbles.length = 0;
    this.invalidatePaint();
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

energyFormsAndChanges.register( 'BeakerSteamCanvasNode', BeakerSteamCanvasNode );
export default BeakerSteamCanvasNode;