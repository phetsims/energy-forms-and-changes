// Copyright 2018, University of Colorado Boulder

/**
 * a scenery node that looks like water in a cylindrical container as seen from slightly above the horizon
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var SteamCanvasNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/SteamCanvasNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;

  // constants for the PerspectiveWaterNode
  var LIQUID_WATER_OUTLINE_COLOR = EFACConstants.WATER_COLOR_IN_BEAKER.colorUtilsDarker( 0.2 );
  var WATER_LINE_WIDTH = 2;

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

    // @private - a rectangle that defines the size of the fluid within the beaker
    this.fluidBounds = Bounds2.NOTHING.copy();

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

    this.steamCanvasNode = new SteamCanvasNode(
      waterLevelProperty,
      temperatureProperty,
      this.beakerOutlineRect, {
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
    this.waterLevelProperty.link( function( waterLevel ) {
      var waterHeight = beakerOutlineRect.height * waterLevel;
      self.fluidBounds.setMinMax(
        beakerOutlineRect.minX,
        beakerOutlineRect.maxY - waterHeight,
        beakerOutlineRect.maxX,
        0
      );
      self.updateWaterAppearance();
    } );
  }

  energyFormsAndChanges.register( 'PerspectiveWaterNode', PerspectiveWaterNode );

  return inherit( Node, PerspectiveWaterNode, {

    /**
     * @public
     */
    reset: function() {
      this.steamNode.removeAllChildren();
      this.steamBubbleNodes.clear();
    },

    /**
     * time step function for the water
     * @param {number} dt - the change in time
     * @public
     */
    step: function( dt ) {
      this.steamCanvasNode.step( dt );
    },

    /**
     * update the appearance of the water
     * @private
     */
    updateWaterAppearance: function() {
      var ellipseWidth = this.fluidBounds.width;
      var ellipseHeight = PERSPECTIVE_PROPORTION * ellipseWidth;
      var liquidWaterTopEllipse = Shape.ellipse(
        this.fluidBounds.centerX,
        this.fluidBounds.minY,
        ellipseWidth / 2,
        ellipseHeight / 2,
        0,
        0,
        Math.PI / 2,
        false
      );

      var halfWidth = this.fluidBounds.width / 2;
      var halfHeight = ellipseHeight / 2;
      var liquidWaterBodyShape = new Shape()
        .moveTo( this.fluidBounds.minX, this.fluidBounds.minY ) // Top left of the beaker body.
        .ellipticalArc( this.fluidBounds.centerX, this.fluidBounds.minY, halfWidth, halfHeight, 0, Math.PI, 0, false )
        .lineTo( this.fluidBounds.maxX, this.fluidBounds.maxY ) // Bottom right of the beaker body.
        .ellipticalArc( this.fluidBounds.centerX, this.fluidBounds.maxY, halfWidth, halfHeight, 0, 0, Math.PI, false )
        .close();

      this.liquidWaterBodyNode.setShape( liquidWaterBodyShape );
      this.liquidWaterTopNode.setShape( liquidWaterTopEllipse );
    }
  } );
} );