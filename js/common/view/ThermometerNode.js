// Copyright 2014-2017, University of Colorado Boulder

/**
 *  Function that represents a thermometer in the view.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var Color = require( 'SCENERY/util/Color' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants that define the size and relative position of the triangle.
  // These values will need tweaking if the images used for the thermometer
  // are changed.
  var TRIANGLE_SIDE_SIZE = 15; // In screen coordinates, which is close to pixels.
  var NUM_TICK_MARKS = 13;
  var TICK_MARK_STROKE_LINEWIDTH = 2;

  // images
  var thermometerMediumBackImage = require( 'image!ENERGY_FORMS_AND_CHANGES/thermometer_medium_back.png' );
  var thermometerMediumFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/thermometer_medium_front.png' );

  /*
   * Constructor.
   *
   * @param thermometer
   * @param modelViewTransform
   */
  function ThermometerNode() {
    Node.call( this, { cursor: 'pointer' } );
    // Root node, all children should be added to this.
    var rootNode = new Node();
    // Create and add nodes that will act as layers.
    var backLayer = new Node();
    rootNode.addChild( backLayer );
    var middleLayer = new Node();
    rootNode.addChild( middleLayer );
    var frontLayer = new Node();
    rootNode.addChild( frontLayer );

    // Add the back of the thermometer.
    var thermometerBack = new Image( thermometerMediumBackImage );
    backLayer.addChild( thermometerBack );

    // clip will prevent the liquid from ever appearing to pop out the top.
    var liquidShaftClipNode = new Node();
    //    liquidShaftClipNode.setStroke( null );
    backLayer.addChild( liquidShaftClipNode );

    // Set up reference values for layout.
    this.centerOfBulb = new Vector2(
      thermometerBack.centerX,
      thermometerBack.bounds.maxY - thermometerBack.height * 0.1 );

    // Add the liquid shaft, the shape of which will indicate the temperature.
    // There are some tweak factors in here for setting the shape of the thermometer liquid.
    this.liquidShaftWidth = thermometerBack.getImageWidth() * 0.45;
    // Tweak multiplier to align with desired tick mark at 100 degrees C.
    var boilingPointLiquidHeight = ( this.centerOfBulb.y - thermometerBack.bounds.minY ) * 0.84;
    // Tweak multiplier to align with desired tick mark at 0 degrees C.
    var freezingPointLiquidHeight = thermometerBack.getImageHeight() * 0.21;
    this.liquidHeightMapFunction = new LinearFunction(
      EFACConstants.FREEZING_POINT_TEMPERATURE,
      EFACConstants.BOILING_POINT_TEMPERATURE,
      freezingPointLiquidHeight,
      boilingPointLiquidHeight,
      true );

    // manually coordinated with the image used for the thermometer.
    var clipShape = new Shape();

    var thermometerTopY = thermometerBack.bounds.minY;
    var curveStartOffset = thermometerBack.getImageHeight() * 0.05;
    var clipWidth = this.liquidShaftWidth * 1.1;
    var centerX = thermometerBack.bounds.centerX;

    clipShape.moveTo( centerX - clipWidth / 2, this.centerOfBulb.y )
      .lineTo( centerX - clipWidth / 2, thermometerTopY + curveStartOffset )
      .cubicCurveTo(
        centerX - clipWidth / 4,
        thermometerTopY - curveStartOffset / 4,
        centerX + clipWidth / 4,
        thermometerTopY - curveStartOffset / 4,
        centerX + clipWidth / 2,
        thermometerTopY + curveStartOffset )
      .lineTo( centerX + clipWidth / 2, this.centerOfBulb.y )
      .close();

    this.liquidShaft = new Path( clipShape, { 'fill': new Color( 237, 28, 36 ) } );
    liquidShaftClipNode.addChild( this.liquidShaft );

    // Add the image for the front of the thermometer.
    frontLayer.addChild( new Image( thermometerMediumFrontImage ) );

    // Add the tick marks.  There are some tweak factors here.
    var tickMarkXOffset = thermometerBack.width * 0.3;
    var shortTickMarkWidth = thermometerBack.width * 0.1;
    var longTickMarkWidth = shortTickMarkWidth * 2;
    var tickMarkMinY = this.centerOfBulb.y - thermometerBack.getImageHeight() * 0.15;
    var tickMarkSpacing = ( ( tickMarkMinY - thermometerBack.bounds.minY ) / NUM_TICK_MARKS ) * 0.945;
    for ( var i = 0; i < NUM_TICK_MARKS; i++ ) {
      // Tick marks are set to have a longer one at freezing, boiling, and half way between.
      var tickMarkShape = new Shape();
      tickMarkShape.moveTo( 0, 0 ).lineTo( ( i - 1 ) % 5 === 0 ? longTickMarkWidth : shortTickMarkWidth, 0 );
      var tickMark = new Path( tickMarkShape, {
        stroke: 'black',
        lineWidth: TICK_MARK_STROKE_LINEWIDTH
      } );
      tickMark.translation = new Vector2( tickMarkXOffset, tickMarkMinY - i * tickMarkSpacing );

      frontLayer.addChild( tickMark );
    }

    // on the left side of this triangle.
    this.triangleTipOffset = new Dimension2( //
      -thermometerBack.getImageWidth() / 2 - TRIANGLE_SIDE_SIZE * Math.cos( Math.PI / 6 ) - 2,
      thermometerBack.getImageHeight() / 2 - thermometerBack.getImageWidth() / 2 );

    var triangleLeftmostPoint = new Vector2(
      backLayer.centerX + this.triangleTipOffset.width,
      backLayer.centerY + this.triangleTipOffset.height );

    var triangleUpperRightPoint = triangleLeftmostPoint
      .plus( new Vector2( TRIANGLE_SIDE_SIZE, 0 ).rotate( Math.PI / 5 ) );

    var triangleLowerRightPoint = triangleLeftmostPoint
      .plus( new Vector2( TRIANGLE_SIDE_SIZE, 0 ).rotate( -Math.PI / 5 ) );

    var triangleShape = new Shape();
    triangleShape.moveToPoint( triangleLeftmostPoint )
      .lineToPoint( triangleUpperRightPoint )
      .lineToPoint( triangleLowerRightPoint )
      .close();

    this.triangle = new Path( triangleShape, {
      fill: new Color( 0, 0, 0, 0 ),
      lineWidth: 2,
      stroke: 'black'
    } );
    middleLayer.addChild( this.triangle );

    this.addChild( rootNode );

  }

  energyFormsAndChanges.register( 'ThermometerNode', ThermometerNode );

  return inherit( Node, ThermometerNode, {

    /**
     *
     * @returns {Vector2}
     */
    getOffsetCenterShaftToTriangleTip: function() {
      return new Vector2( -this.width + this.liquidShaft.centerX, this.height / 2 );
    },

    /**
     *
     * @param sensedColor
     */
    setSensedColor: function( sensedColor ) {
      this.triangle.fill = sensedColor;
    },

    /**
     *
     * @param {number} temperature
     */
    setSensedTemperature: function( temperature ) {

      var liquidShaftHeight = this.liquidHeightMapFunction( temperature );
      this.liquidShaft.shape = Shape.rectangle(
        this.centerOfBulb.x - this.liquidShaftWidth / 2 + 0.75,
        this.centerOfBulb.y - liquidShaftHeight,
        this.liquidShaftWidth,
        liquidShaftHeight );
    }
  } );
} );

