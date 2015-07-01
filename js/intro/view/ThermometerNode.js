// Copyright 2002-2015, University of Colorado

/**
 *  Function that represents a thermometer in the view.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Dimension2 = require( 'DOT/Dimension2' );
  //var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants that define the size and relative position of the triangle.
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
    this.centerOfBulb = new Vector2( thermometerBack.centerX, thermometerBack.bounds.maxY - thermometerBack.height * 0.1 );
    // Add the liquid shaft, the shape of which will indicate the temperature.


    // There are some tweak factors in here for setting the shape of the thermometer liquid.
    this.liquidShaftWidth = thermometerBack.getImageWidth() * 0.45;
    // Tweak multiplier to align with desired tick mark at 100 degrees C.
    var boilingPointLiquidHeight = (this.centerOfBulb.y - thermometerBack.bounds.minY) * 0.84;
    // Tweak multiplier to align with desired tick mark at 0 degrees C.
    var freezingPointLiquidHeight = thermometerBack.getImageHeight() * 0.21;
    this.liquidHeightMapFunction = new LinearFunction( EFACConstants.FREEZING_POINT_TEMPERATURE, EFACConstants.BOILING_POINT_TEMPERATURE, freezingPointLiquidHeight, boilingPointLiquidHeight, true );

    // manually coordinated with the image used for the thermometer.
    var clipShape = new Shape();

    var thermometerTopY = thermometerBack.bounds.minY;
    var curveStartOffset = thermometerBack.getImageHeight() * 0.05;
    var clipWidth = this.liquidShaftWidth * 1.1;
    var centerX = thermometerBack.bounds.centerX;

    clipShape.moveTo( centerX - clipWidth / 2, this.centerOfBulb.y )
      .lineTo( centerX - clipWidth / 2, thermometerTopY + curveStartOffset )
      .cubicCurveTo( centerX - clipWidth / 4, thermometerTopY - curveStartOffset / 4, centerX + clipWidth / 4, thermometerTopY - curveStartOffset / 4, centerX + clipWidth / 2, thermometerTopY + curveStartOffset )
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
    var tickMarkSpacing = ((tickMarkMinY - thermometerBack.bounds.minY) / NUM_TICK_MARKS) * 0.945;
    for ( var i = 0; i < NUM_TICK_MARKS; i++ ) {
      // Tick marks are set to have a longer one at freezing, boiling, and half way between.
      var tickMarkShape = new Shape();
      tickMarkShape.moveTo( 0, 0 ).lineTo( (i - 1) % 5 === 0 ? longTickMarkWidth : shortTickMarkWidth, 0 );
      var tickMark = new Path( tickMarkShape, {
        stroke: 'black',
        lineWidth: TICK_MARK_STROKE_LINEWIDTH
      } );
      tickMark.translation = { x: tickMarkXOffset, y: tickMarkMinY - i * tickMarkSpacing };

      frontLayer.addChild( tickMark );
    }

    // on the left side of this triangle.
    this.triangleTipOffset = new Dimension2( -thermometerBack.getImageWidth() / 2 - TRIANGLE_SIDE_SIZE * Math.cos( Math.PI / 6 ) - 2, thermometerBack.getImageHeight() / 2 - thermometerBack.getImageWidth() / 2 );
    var triangleLeftmostPoint = new Vector2( backLayer.centerX + this.triangleTipOffset.width, backLayer.centerY + this.triangleTipOffset.height );
    var triangleUpperRightPoint = triangleLeftmostPoint.plus( new Vector2( TRIANGLE_SIDE_SIZE, 0 ).rotate( Math.PI / 5 ) );
    var triangleLowerRightPoint = triangleLeftmostPoint.plus( new Vector2( TRIANGLE_SIDE_SIZE, 0 ).rotate( -Math.PI / 5 ) );
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
// be at point (0, 0).

    this.addChild( rootNode );

  }

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
      this.liquidShaft.shape = Shape.rectangle( this.centerOfBulb.x - this.liquidShaftWidth / 2 + 0.75, this.centerOfBulb.y - liquidShaftHeight, this.liquidShaftWidth, liquidShaftHeight );
    }
  } );
} )
;
//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.*;
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Line2D;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.math.Function;
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath;
//import edu.colorado.phet.common.piccolophet.event.CursorHandler;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.common.piccolophet.nodes.kit.ZeroOffsetNode;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesResources;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.nodes.PImage;
//import edu.umd.cs.piccolo.nodes.PPath;
//import edu.umd.cs.piccolo.util.PDimension;
//import edu.umd.cs.piccolox.nodes.PClip;
//import edu.umd.cs.piccolox.nodes.PComposite;
//
///**
// * Base class for a Piccolo node that represents a thermometer in the view.
// *
// * @author John Blanco
// */
//public class ThermometerNode extends PComposite {
//
//  //-------------------------------------------------------------------------
//  // Class Data
//  //-------------------------------------------------------------------------
//
//  // Constants that define the size and relative position of the triangle.
//  // These values will need tweaking if the images used for the thermometer
//  // are changed.
//  private static final double TRIANGLE_SIDE_SIZE = 15; // In screen coordinates, which is close to pixels.
//
//  private static final int NUM_TICK_MARKS = 13;
//  private static final Stroke TICK_MARK_STROKE = new BasicStroke( 2 );
//
//  //-------------------------------------------------------------------------
//  // Instance Data
//  //-------------------------------------------------------------------------
//
//  private final Function.LinearFunction liquidHeightMapFunction;
//  private final PPath triangle;
//  private final double liquidShaftWidth;
//  private final PPath liquidShaft;
//  private final Point2D centerOfBulb;
//  protected final Dimension2D triangleTipOffset;
//
//  //-------------------------------------------------------------------------
//  // Constructor(s)
//  //-------------------------------------------------------------------------
//
//  /*
//   * Constructor.
//   *
//   * @param thermometer
//   * @param modelViewTransform
//   */
//  public ThermometerNode() {
//
//    // Root node, all children should be added to this.
//    PNode rootNode = new PNode();
//
//    // Create and add nodes that will act as layers.
//    final PNode backLayer = new PNode();
//    rootNode.addChild( backLayer );
//    PNode middleLayer = new PNode();
//    rootNode.addChild( middleLayer );
//    PNode frontLayer = new PNode();
//    rootNode.addChild( frontLayer );
//
//    // Add the back of the thermometer.
//    final PImage thermometerBack = new PImage( EnergyFormsAndChangesResources.Images.THERMOMETER_MEDIUM_BACK );
//    backLayer.addChild( thermometerBack );
//
//    // Add the clipping node that will contain the liquid shaft node.  The
//    // clip will prevent the liquid from ever appearing to pop out the top.
//    PClip liquidShaftClipNode = new PClip();
//    liquidShaftClipNode.setStroke( null );
//    backLayer.addChild( liquidShaftClipNode );
//
//    // Set up reference values for layout.
//    centerOfBulb = new Point2D.Double( thermometerBack.getFullBoundsReference().getCenterX(),
//        thermometerBack.getFullBoundsReference().getMaxY() - thermometerBack.getFullBoundsReference().height * 0.1 );
//
//    // Add the liquid shaft, the shape of which will indicate the temperature.
//    {
//      liquidShaft = new PhetPPath( new Color( 237, 28, 36 ) );
//      liquidShaftClipNode.addChild( liquidShaft );
//      // There are some tweak factors in here for setting the shape of the thermometer liquid.
//      liquidShaftWidth = thermometerBack.getFullBoundsReference().getWidth() * 0.45;
//      final double boilingPointLiquidHeight = ( centerOfBulb.getY() - thermometerBack.getFullBoundsReference().getMinY() ) * 0.84; // Tweak multiplier to align with desired tick mark at 100 degrees C.
//      final double freezingPointLiquidHeight = thermometerBack.getFullBoundsReference().height * 0.21; // Tweak multiplier to align with desired tick mark at 0 degrees C.
//      liquidHeightMapFunction = new Function.LinearFunction( EFACConstants.FREEZING_POINT_TEMPERATURE,
//        EFACConstants.BOILING_POINT_TEMPERATURE,
//        freezingPointLiquidHeight,
//        boilingPointLiquidHeight );
//
//      // Set the clipping region to prevent any portion of the liquid
//      // from pushing out the top.  This is a bit tweaky, and must be
//      // manually coordinated with the image used for the thermometer.
//      DoubleGeneralPath clipPath = new DoubleGeneralPath() {{
//      double thermometerTopY = thermometerBack.getFullBoundsReference().getMinY();
//      double curveStartOffset = thermometerBack.getFullBoundsReference().getHeight() * 0.05;
//      double clipWidth = liquidShaftWidth * 1.1;
//      double centerX = thermometerBack.getFullBoundsReference().getCenterX();
//      moveTo( centerX - clipWidth / 2, centerOfBulb.getY() );
//      lineTo( centerX - clipWidth / 2, thermometerTopY + curveStartOffset );
//      curveTo( centerX - clipWidth / 4,
//          thermometerTopY - curveStartOffset / 4,
//          centerX + clipWidth / 4,
//          thermometerTopY - curveStartOffset / 4,
//          centerX + clipWidth / 2,
//          thermometerTopY + curveStartOffset
//      );
//      lineTo( centerX + clipWidth / 2, centerOfBulb.getY() );
//      closePath();
//    }};
//      liquidShaftClipNode.setPathTo( clipPath.getGeneralPath() );
//    }
//
//    // Add the image for the front of the thermometer.
//    frontLayer.addChild( new PImage( EnergyFormsAndChangesResources.Images.THERMOMETER_MEDIUM_FRONT ) );
//
//    // Add the tick marks.  There are some tweak factors here.
//    double tickMarkXOffset = thermometerBack.getFullBoundsReference().width * 0.3;
//    double shortTickMarkWidth = thermometerBack.getFullBoundsReference().width * 0.1;
//    double longTickMarkWidth = shortTickMarkWidth * 2;
//    double tickMarkMinY = centerOfBulb.getY() - thermometerBack.getFullBoundsReference().getHeight() * 0.15;
//    double tickMarkSpacing = ( ( tickMarkMinY - thermometerBack.getFullBoundsReference().getMinY() ) / NUM_TICK_MARKS ) * 0.945;
//    for ( int i = 0; i < NUM_TICK_MARKS; i++ ) {
//      // Tick marks are set to have a longer one at freezing, boiling, and half way between.
//      Line2D tickMarkShape = new Line2D.Double( 0, 0, ( i - 1 ) % 5 === 0 ?  longTickMarkWidth : shortTickMarkWidth, 0 );
//      PNode tickMark = new PhetPPath( tickMarkShape, TICK_MARK_STROKE, Color.BLACK );
//      tickMark.setOffset( tickMarkXOffset, tickMarkMinY - i * tickMarkSpacing );
//      frontLayer.addChild( tickMark );
//    }
//
//    // Add the triangle that represents the point where the thermometer
//    // touches the element whose temperature is being measured.  The
//    // position of the thermometer in model space corresponds to the point
//    // on the left side of this triangle.
//    triangleTipOffset = new PDimension( -thermometerBack.getWidth() / 2 - TRIANGLE_SIDE_SIZE * Math.cos( Math.PI / 6 ) - 2,
//        thermometerBack.getHeight() / 2 - thermometerBack.getWidth() / 2 );
//    Vector2D triangleLeftmostPoint = new Vector2D( backLayer.getFullBoundsReference().getCenterX() + triangleTipOffset.getWidth(),
//        backLayer.getFullBoundsReference().getCenterY() + triangleTipOffset.getHeight() );
//    final Vector2D triangleUpperRightPoint = triangleLeftmostPoint.plus( new Vector2D( TRIANGLE_SIDE_SIZE, 0 ).getRotatedInstance( Math.PI / 5 ) );
//    final Vector2D triangleLowerRightPoint = triangleLeftmostPoint.plus( new Vector2D( TRIANGLE_SIDE_SIZE, 0 ).getRotatedInstance( -Math.PI / 5 ) );
//    DoubleGeneralPath trianglePath = new DoubleGeneralPath( triangleLeftmostPoint ) {{
//      lineTo( triangleUpperRightPoint );
//      lineTo( triangleLowerRightPoint );
//      closePath();
//    }};
//    triangle = new PhetPPath( trianglePath.getGeneralPath(), new Color( 0, 0, 0, 0 ), new BasicStroke( 2 ), Color.BLACK );
//    middleLayer.addChild( triangle );
//
//    // Add the root node, but enclose it in a ZeroOffsetNode, so that the
//    // whole node follows the Piccolo convention of having the upper left
//    // be at point (0, 0).
//    addChild( new ZeroOffsetNode( rootNode ) );
//
//    // Add the cursor handler.
//    addInputEventListener( new CursorHandler( CursorHandler.HAND ) );
//  }
//
//  //-------------------------------------------------------------------------
//  // Methods
//  //-------------------------------------------------------------------------
//
//  public Vector2D getOffsetCenterShaftToTriangleTip() {
//    return new Vector2D( -getFullBoundsReference().getWidth() + liquidShaft.getFullBoundsReference().getCenterX(), getFullBoundsReference().getHeight() / 2 );
//  }
//
//  protected void setSensedColor( Color sensedColor ) {
//    triangle.setPaint( sensedColor );
//  }
//
//  protected void setSensedTemperature( double temperature ) {
//    double liquidShaftHeight = liquidHeightMapFunction.evaluate( temperature );
//    liquidShaft.setPathTo( new Rectangle2D.Double( centerOfBulb.getX() - liquidShaftWidth / 2 + 0.75,
//        centerOfBulb.getY() - liquidShaftHeight,
//      liquidShaftWidth,
//      liquidShaftHeight ) );
//  }
//}
