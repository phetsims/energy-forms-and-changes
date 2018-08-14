// Copyright 2018, University of Colorado Boulder

/**
 * A node for the column of steam that appears when the temperature is high enough.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var CanvasNode = require( 'SCENERY/nodes/CanvasNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Range = require( 'DOT/Range' );
  var Util = require( 'DOT/Util' );

  // constants
  var STEAMING_RANGE = 10; // number of degrees Kelvin over which steam is visible
  var STEAM_BUBBLE_SPEED_RANGE = new Range( 100, 125 ); // in screen coords (~ pixels) / second
  var STEAM_BUBBLE_DIAMETER_RANGE = new Range( 20, 50 ); // in screen coords (~ pixels)
  var MAX_STEAM_BUBBLE_HEIGHT = 300;
  var STEAM_BUBBLE_RATE_RANGE = new Range( 20, 40 ); // bubbles per second
  var STEAM_BUBBLE_GROWTH_RATE = 0.2; // proportion per second
  var MAX_STEAM_BUBBLE_OPACITY = 0.7; // proportion, 0 to 1

  /**
   * @param {Property<number>} fluidLevelProperty - the proportion of fluid in its container
   * @param {Property<number>} temperatureProperty - the temperature of the liquid
   * @param {Rectangle} containerOutlineRect - the outline of the container
   * @param {Object} [options] that can be passed on to the underlying node
   * @constructor
   */
  function SteamCanvasNode( fluidLevelProperty, temperatureProperty, containerOutlineRect, options ) {

    var self = this;
    CanvasNode.call( this, options );

    // @private
    this.fluidLevelProperty = fluidLevelProperty;
    this.temperatureProperty = temperatureProperty;

    // @private
    this.bubbleProductionRemainder = 0;
    this.containerOutlineRect = containerOutlineRect;
    this.dt = 0;
    this.steamOrigin = 0;
    this.steamBubbles = [];

    // update the appearance of the water as the level changes
    this.fluidLevelProperty.link( function( fluidLevel ) {
      self.steamOrigin = self.containerOutlineRect.minY * fluidLevel;
    } );

    this.mutate( options );
  }

  energyFormsAndChanges.register( 'SteamCanvasNode', SteamCanvasNode );

  return inherit( CanvasNode, SteamCanvasNode, {

    /**
     * Renders the steam bubbles on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @private
     */
    renderSteam: function( context ) {
      var self = this; // extend scope for nested callbacks.

      var steamingProportion = 0;
      if ( EFACConstants.BOILING_POINT_TEMPERATURE - self.temperatureProperty.value < STEAMING_RANGE ) {

        // the water is emitting some amount of steam - set the proportionate amount
        steamingProportion = 1 - ( ( EFACConstants.BOILING_POINT_TEMPERATURE - self.temperatureProperty.value ) / STEAMING_RANGE );
        steamingProportion = Util.clamp( steamingProportion, 0, 1 );
      }

      // add any new steam bubbles
      if ( steamingProportion > 0 ) {
        var bubblesToProduceCalc =
          ( STEAM_BUBBLE_RATE_RANGE.min + STEAM_BUBBLE_RATE_RANGE.getLength() * steamingProportion ) * this.dt;
        var bubblesToProduce = Math.floor( bubblesToProduceCalc );

        this.bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;

        if ( this.bubbleProductionRemainder >= 1 ) {
          bubblesToProduce += Math.floor( this.bubbleProductionRemainder );
          this.bubbleProductionRemainder -= Math.floor( this.bubbleProductionRemainder );
        }
        for ( var i = 0; i < bubblesToProduce; i++ ) {
          var steamBubbleDiameter = STEAM_BUBBLE_DIAMETER_RANGE.min +
                                    phet.joist.random.nextDouble() * STEAM_BUBBLE_DIAMETER_RANGE.getLength();
          var steamBubbleCenterXPos = this.containerOutlineRect.centerX +
                                      ( phet.joist.random.nextDouble() - 0.5 ) *
                                      ( this.containerOutlineRect.width - steamBubbleDiameter );

          // bubbles are invisible to start; they will fade in
          var steamBubble = {
            x: steamBubbleCenterXPos,
            y: this.steamOrigin,
            radius: steamBubbleDiameter / 2,
            opacity: 0
          };
          this.steamBubbles.push( steamBubble );
        }
      }

      // update the position and appearance of the existing steam bubbles
      var steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();
      var unfilledBeakerHeight = this.containerOutlineRect.height + this.steamOrigin;

      this.steamBubbles.forEach( function( steamBubble ) {

        // float the bubbles upward from the beaker
        steamBubble.y += -self.dt * steamBubbleSpeed;

        // // remove bubbles that have floated out of view
        if ( self.containerOutlineRect.minY - steamBubble.y > MAX_STEAM_BUBBLE_HEIGHT ) {
          var index = self.steamBubbles.indexOf( steamBubble );

          if ( index !== -1 ) {
            self.steamBubbles.splice( index, 1 );
          }
        }

        // update position of floating bubbles
        else if ( steamBubble.y < self.containerOutlineRect.minY ) {
          steamBubble.radius = steamBubble.radius * 2 * ( 1 + ( STEAM_BUBBLE_GROWTH_RATE * self.dt ) ) / 2;
          var distanceFromCenterX = steamBubble.x;

          // give bubbles some lateral drift motion
          steamBubble.x += distanceFromCenterX * 0.2 * self.dt;

          // fade the bubble as it reaches the end of its range
          var heightFraction = ( self.steamOrigin - steamBubble.y ) / MAX_STEAM_BUBBLE_HEIGHT;
          steamBubble.opacity = ( 1 - heightFraction ) * MAX_STEAM_BUBBLE_OPACITY;
        }

        // fade new bubbles in
        else {
          var distanceFromWater = self.steamOrigin - steamBubble.y;
          var opacityFraction = Util.clamp( distanceFromWater / ( unfilledBeakerHeight / 4 ), 0, 1 );
          steamBubble.opacity = opacityFraction * MAX_STEAM_BUBBLE_OPACITY;
        }
        self.drawSteamBubble( context, steamBubble );
      } );
    },

    /*
     * Draws a steam bubble.
     * @param {CanvasRenderingContext2D} context
     * @param {Object} steamBubble
     * @private
     */
    drawSteamBubble: function( context, steamBubble ) {
      context.beginPath();
      context.arc( steamBubble.x, steamBubble.y, steamBubble.radius, 0, Math.PI * 2, true );
      context.fillStyle = 'rgba(255, 255, 255, ' + steamBubble.opacity + ' )';
      context.fill();
    },


    /**
     * Paints the steam on the canvas node.
     * @param {CanvasRenderingContext2D} context
     * @public
     */
    paintCanvas: function( context ) {
      this.renderSteam( context );
    },

    /**
     * @public
     * @param {number} dt - the change in time
     */
    step: function( dt ) {
      this.dt = dt;
      this.invalidatePaint();
    }
  } );
} );