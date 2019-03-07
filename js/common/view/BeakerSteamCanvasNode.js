// Copyright 2018-2019, University of Colorado Boulder

/**
 * A node for the column of steam that appears when the temperature is high enough.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Range = require( 'DOT/Range' );
  const Util = require( 'DOT/Util' );

  // constants
  const STEAMING_RANGE = 10; // number of degrees Kelvin over which steam is visible
  const STEAM_BUBBLE_SPEED_RANGE = new Range( 100, 125 ); // in screen coords (~ pixels) / second
  const STEAM_BUBBLE_DIAMETER_RANGE = new Range( 20, 50 ); // in screen coords (~ pixels)
  const MAX_STEAM_BUBBLE_HEIGHT = 300;
  const STEAM_BUBBLE_RATE_RANGE = new Range( 20, 40 ); // bubbles per second
  const STEAM_BUBBLE_GROWTH_RATE = 0.2; // proportion per second
  const MAX_STEAM_BUBBLE_OPACITY = 0.7; // proportion, 0 to 1

  class BeakerSteamCanvasNode extends CanvasNode {

    /**
     * @param {Rectangle} containerOutlineRect - the outline of the container
     * @param {Property<number>} fluidLevelProperty - the proportion of fluid in its container
     * @param {Property<number>} temperatureProperty - the temperature of the liquid
     * @param {number} fluidBoilingPoint
     * @param {Color} steamColor
     * @param {Object} [options]
     */
    constructor( containerOutlineRect, fluidLevelProperty, temperatureProperty, fluidBoilingPoint, steamColor, options ) {
      super( options );

      // @private
      this.containerOutlineRect = containerOutlineRect;
      this.fluidLevelProperty = fluidLevelProperty;
      this.temperatureProperty = temperatureProperty;
      this.fluidBoilingPoint = fluidBoilingPoint;
      this.steamColor = steamColor;

      // @private
      this.bubbleProductionRemainder = 0;
      this.dt = 0;
      this.steamOrigin = 0;
      this.steamBubbles = [];

      // @private
      // canvas where the steam bubble image resides
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
      this.fluidLevelProperty.link( fluidLevel => {
        this.steamOrigin = this.containerOutlineRect.minY * fluidLevel;
      } );

      this.mutate( options );
    }

    /**
     * Renders the steam bubbles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    renderSteam( context ) {
      let steamingProportion = 0;
      if ( this.fluidBoilingPoint - this.temperatureProperty.value < STEAMING_RANGE ) {

        // the water is emitting some amount of steam - set the proportionate amount
        steamingProportion = 1 - ( ( this.fluidBoilingPoint - this.temperatureProperty.value ) / STEAMING_RANGE );
        steamingProportion = Util.clamp( steamingProportion, 0, 1 );
      }

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

        for ( let i = 0; i < bubblesToProduce; i++ ) {
          const steamBubbleDiameter = STEAM_BUBBLE_DIAMETER_RANGE.min +
                                      phet.joist.random.nextDouble() * STEAM_BUBBLE_DIAMETER_RANGE.getLength();
          const steamBubbleCenterXPos = this.containerOutlineRect.centerX +
                                        ( phet.joist.random.nextDouble() - 0.5 ) *
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

      // update the position and appearance of the existing steam bubbles
      const steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();
      const unfilledBeakerHeight = this.containerOutlineRect.height + this.steamOrigin;

      // create a clone to iterate over so we can splice the original when removing bubbles
      const steamBubblesCopy = [ ...this.steamBubbles ];

      for ( let i = 0; i < steamBubblesCopy.length; i++ ) {

        // float the bubbles upward from the beaker
        steamBubblesCopy[ i ].y += -this.dt * steamBubbleSpeed;

        if ( steamBubblesCopy[ i ].y < this.containerOutlineRect.minY ) {

          // increase radius
          steamBubblesCopy[ i ].radius = steamBubblesCopy[ i ].radius * 2 * ( 1 + ( STEAM_BUBBLE_GROWTH_RATE * this.dt ) ) / 2;

          // give bubble some lateral drift motion
          const distanceFromCenterX = steamBubblesCopy[ i ].x;
          steamBubblesCopy[ i ].x += distanceFromCenterX * 0.2 * this.dt;

          // fade the bubble as it reaches the end of its range
          const heightFraction = Util.clamp( ( this.containerOutlineRect.minY - steamBubblesCopy[ i ].y ) / MAX_STEAM_BUBBLE_HEIGHT, 0, 1 );
          steamBubblesCopy[ i ].opacity = ( 1 - heightFraction ) * MAX_STEAM_BUBBLE_OPACITY;
        }

        // fade new bubble in
        else {
          const distanceFromWater = this.steamOrigin - steamBubblesCopy[ i ].y;
          const opacityFraction = Util.clamp( distanceFromWater / ( unfilledBeakerHeight / 4 ), 0, 1 );
          steamBubblesCopy[ i ].opacity = opacityFraction * MAX_STEAM_BUBBLE_OPACITY;
        }

        this.drawSteamBubble( context, steamBubblesCopy[ i ] );

        // remove bubble that has floated out of view
        if ( this.containerOutlineRect.minY - steamBubblesCopy[ i ].y > MAX_STEAM_BUBBLE_HEIGHT ) {
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

  return energyFormsAndChanges.register( 'BeakerSteamCanvasNode', BeakerSteamCanvasNode );
} );