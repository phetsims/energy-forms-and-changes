// Copyright 2018, University of Colorado Boulder

/**
 * a scenery node that looks like water in a container as seen from slightly above the horizon
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DotRectangle = require( 'DOT/Rectangle' ); // eslint-disable-line require-statement-match
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Random = require( 'DOT/Random' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Shape = require( 'KITE/Shape' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var RAND = new Random();
  var PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;

  // constants for the PerspectiveWaterNode
  var LIQUID_WATER_OUTLINE_COLOR = EFACConstants.WATER_COLOR_IN_BEAKER.colorUtilsDarker( 0.2 );
  var WATER_LINE_WIDTH = 2;
  var STEAMING_RANGE = 10; // number of degrees Kelvin over which steam is visible
  var STEAM_BUBBLE_SPEED_RANGE = new RangeWithValue( 100, 125 ); // in screen coords (~ pixels) / second
  var STEAM_BUBBLE_DIAMETER_RANGE = new RangeWithValue( 20, 50 ); // in screen coords (~ pixels)
  var MAX_STEAM_BUBBLE_HEIGHT = 300;
  var STEAM_BUBBLE_RATE_RANGE = new RangeWithValue( 20, 40 ); // bubbles per second
  var STEAM_BUBBLE_GROWTH_RATE = 0.2; // proportion per second
  var MAX_STEAM_BUBBLE_OPACITY = 0.7; // proportion, 0 to 1

  /**
   * @param {Rectangle} beakerOutlineRect
   * @param {Property.<number>} waterLevelProperty
   * @param {Property.<number>} temperatureProperty
   */
  function PerspectiveWaterNode( beakerOutlineRect, waterLevelProperty, temperatureProperty ) {

    Node.call( this );
    var self = this;

    // @private
    this.beakerOutlineRect = beakerOutlineRect;
    this.waterLevelProperty = waterLevelProperty;
    this.temperatureProperty = temperatureProperty;

    // @private - nodes that represent the top and body of the water
    this.liquidWaterTopNode = new Path( null, {
      fill: EFACConstants.WATER_COLOR_IN_BEAKER.colorUtilsBrighter( 0.25 ),
      lineWidth: WATER_LINE_WIDTH,
      stroke: LIQUID_WATER_OUTLINE_COLOR
    } );
    this.liquidWaterBodyNode = new Path( null, {
      fill: EFACConstants.WATER_COLOR_IN_BEAKER,
      lineWidth: WATER_LINE_WIDTH,
      stroke: LIQUID_WATER_OUTLINE_COLOR
    } );

    // @private - nodes that represent the steam
    this.steamBubbleNodes = new ObservableArray();
    this.steamNode = new Node();

    // @private
    this.bubbleProductionRemainder = 0; //@private

    this.addChild( this.liquidWaterBodyNode );
    this.addChild( this.liquidWaterTopNode );
    this.addChild( this.steamNode );

    // update the appearance of the water as the level changes
    this.waterLevelProperty.link( function( waterLevel ) {
      var temperature = self.temperatureProperty.get();
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      self.updateAppearance( waterLevel, beakerOutlineRect, temperature, dt );
    } );
  }

  energyFormsAndChanges.register( 'PerspectiveWaterNode', PerspectiveWaterNode );

  return inherit( Node, PerspectiveWaterNode, {

    /**
     * @public
     */
    reset: function() {
      this.steamBubbleNodes.clear();
      this.steamNode.removeAllChildren();
    },

    /**
     * time step function for the water
     * @param {number} dt - the change in time
     */
    step: function( dt ) {
      this.updateAppearance( this.waterLevelProperty.value, this.beakerOutlineRect, this.temperatureProperty.value, dt );
    },

    /**
     * update the appearance of the water
     * @param {number} fluidLevel
     * @param {Rectangle} beakerOutlineRect
     * @param {number} temperature
     * @param {number} dt
     * @private
     */
    updateAppearance: function( fluidLevel, beakerOutlineRect, temperature, dt ) {

      var self = this; // extend scope for nested callbacks.

      var waterHeight = beakerOutlineRect.height * fluidLevel;

      var liquidWaterRect = new DotRectangle(
        beakerOutlineRect.minX,
        beakerOutlineRect.maxY - waterHeight,
        beakerOutlineRect.width,
        waterHeight
      );
      var ellipseWidth = beakerOutlineRect.width;
      var ellipseHeight = PERSPECTIVE_PROPORTION * ellipseWidth;
      var liquidWaterTopEllipse = Shape.ellipse(
        liquidWaterRect.centerX,
        liquidWaterRect.minY,
        ellipseWidth / 2,
        ellipseHeight / 2,
        0,
        0,
        Math.PI / 2,
        false
      );

      //----------------------------------------------------------------
      // update the liquid water
      //----------------------------------------------------------------

      var halfWidth = liquidWaterRect.width / 2;
      var halfHeight = ellipseHeight / 2;
      var liquidWaterBodyShape = new Shape()
        .moveTo( liquidWaterRect.minX, liquidWaterRect.minY ) // Top left of the beaker body.
        .ellipticalArc( liquidWaterRect.centerX, liquidWaterRect.minY, halfWidth, halfHeight, 0, Math.PI, 0, false )
        .lineTo( liquidWaterRect.maxX, liquidWaterRect.maxY ) // Bottom right of the beaker body.
        .ellipticalArc( liquidWaterRect.centerX, liquidWaterRect.maxY, halfWidth, halfHeight, 0, 0, Math.PI, false )
        .close();

      this.liquidWaterBodyNode.setShape( liquidWaterBodyShape );
      this.liquidWaterTopNode.setShape( liquidWaterTopEllipse );

      //----------------------------------------------------------------
      // update the steam
      //----------------------------------------------------------------

      var steamingProportion = 0;
      if ( EFACConstants.BOILING_POINT_TEMPERATURE - temperature < STEAMING_RANGE ) {

        // the water is emitting some amount of steam - set the proportionate amount
        steamingProportion = 1 - ((EFACConstants.BOILING_POINT_TEMPERATURE - temperature) / STEAMING_RANGE);
        steamingProportion = Util.clamp( steamingProportion, 0, 1 );
      }

      // add any new steam bubbles
      if ( steamingProportion > 0 ) {
        var bubblesToProduceCalc =
          (STEAM_BUBBLE_RATE_RANGE.min + STEAM_BUBBLE_RATE_RANGE.getLength() * steamingProportion) * dt;
        var bubblesToProduce = Math.floor( bubblesToProduceCalc );

        this.bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;

        if ( this.bubbleProductionRemainder >= 1 ) {
          bubblesToProduce += Math.floor( this.bubbleProductionRemainder );
          this.bubbleProductionRemainder -= Math.floor( this.bubbleProductionRemainder );
        }

        for ( var i = 0; i < bubblesToProduce; i++ ) {
          var steamBubbleDiameter = STEAM_BUBBLE_DIAMETER_RANGE.min +
                                    RAND.nextDouble() * STEAM_BUBBLE_DIAMETER_RANGE.getLength();
          var steamBubbleCenterXPos = beakerOutlineRect.centerX +
                                      (RAND.nextDouble() - 0.5) * (beakerOutlineRect.width - steamBubbleDiameter);

          var steamBubble = new Circle( steamBubbleDiameter / 2, {
            fill: 'white',
            opacity: steamingProportion
          } );

          // bubbles are invisible to start; they will fade in
          steamBubble.center = new Vector2( steamBubbleCenterXPos, liquidWaterRect.getMinY() );
          steamBubble.opacity = 0;
          this.steamBubbleNodes.push( steamBubble );
          this.steamNode.addChild( steamBubble );
        }
      }

      // update the position and appearance of the existing steam bubbles
      var steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();
      var unfilledBeakerHeight = beakerOutlineRect.height - waterHeight;

      this.steamBubbleNodes.forEach( function( steamBubble ) {

        // float the bubbles upward from the beaker
        steamBubble.translate( 0, -dt * steamBubbleSpeed );

        // remove bubbles that have floated out of view
        if ( beakerOutlineRect.minY - steamBubble.y > MAX_STEAM_BUBBLE_HEIGHT ) {
          self.steamBubbleNodes.remove( steamBubble );
          self.steamNode.removeChild( steamBubble );
        }

        // update position of floating bubbles
        else if ( steamBubble.y < beakerOutlineRect.minY ) {
          steamBubble.setRadius( steamBubble.bounds.width * (1 + (STEAM_BUBBLE_GROWTH_RATE * dt)) / 2 );
          var distanceFromCenterX = steamBubble.x - beakerOutlineRect.centerX;

          // give bubbles some lateral drift motion
          steamBubble.translate( distanceFromCenterX * 0.2 * dt, 0 );

          // fade the bubble as it reaches the end of its range
          var heightFraction = (beakerOutlineRect.minY - steamBubble.y) / MAX_STEAM_BUBBLE_HEIGHT;
          steamBubble.opacity = (1 - heightFraction) * MAX_STEAM_BUBBLE_OPACITY;
        }

        // fade new bubbles in
        else {
          var distanceFromWater = liquidWaterRect.y - steamBubble.y;
          var opacityFraction = Util.clamp( distanceFromWater / (unfilledBeakerHeight / 4), 0, 1 );
          steamBubble.opacity = opacityFraction * MAX_STEAM_BUBBLE_OPACITY;
        }
      } );
    }
  } );
} );