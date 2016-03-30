// Copyright 2016, University of Colorado Boulder

/**
 * Scenery Node representing a belt that connects two circular items, like a fan
 * belt in an automobile.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Color = require( 'SCENERY/util/Color' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  // Constants
  // var BELT_STROKE = new BasicStroke( 5, BasicStroke.CAP_BUTT, BasicStroke.JOIN_ROUND );
  var BELT_COLOR = Color.BLACK;

  /**
   * @param {Belt} belt
   * @param {modelViewTransform2} modelViewTransform
   */
  function BeltNode( belt, modelViewTransform ) {

    Node.call( this );

    // Create the wheel shapes.
    var wheel1Radius = modelViewTransform.modelToViewDeltaX( belt.wheel1Radius );
    var wheel1Center = modelViewTransform.modelToViewPosition( belt.wheel1Center );
    var wheel2Radius = modelViewTransform.modelToViewDeltaX( belt.wheel2Radius );
    var wheel2Center = modelViewTransform.modelToViewPosition( belt.wheel2Center );

    // var wheel1Shape = Shape.ellipse( wheel1Center.x, wheel1Center.y, wheel1Radius, wheel1Radius );
    // var wheel2Shape = Shape.ellipse( wheel2Center.x, wheel2Center.y, wheel2Radius, wheel2Radius );

    var wheel1CenterToWheelTwoCenter = wheel2Center.minus( wheel1Center );
    var wheel1ToOneEdge = wheel1CenterToWheelTwoCenter.perpendicular().withMagnitude( wheel1Radius );
    var wheel2ToOneEdge = wheel1CenterToWheelTwoCenter.perpendicular().withMagnitude( wheel2Radius );

    // Create a shape that will connect the two circles in a belt-like shape.
    var points = [];
    points.push( wheel1Center.plus( wheel1ToOneEdge ) );
    points.push( wheel1Center.minus( wheel1ToOneEdge ) );
    points.push( wheel2Center.minus( wheel2ToOneEdge ) );
    points.push( wheel2Center.plus( wheel2ToOneEdge ) );

    var overallShape = new Shape();
    overallShape.moveToPoint(points[0]);
    overallShape.lineToPoint(points[1]);
    overallShape.lineToPoint(points[2]);
    overallShape.lineToPoint(points[3]);
    overallShape.close();

    var overallPath = new Path(overallShape, {
      stroke: BELT_COLOR,
      lineWidth: 5,
      lineCap: 'butt',
      lineJoin: 'round'
    });
    this.addChild(overallPath);
    //     // Create a shape that will connect the two circles in a belt-like shape.
    // List<Vector2D> points = new ArrayList<Vector2D>() {{
    //     Vector2D wheel1CenterToWheelTwoCenter = wheel2Center.minus( wheel1Center );
    //     Vector2D wheel1ToOneEdge = wheel1CenterToWheelTwoCenter.getPerpendicularVector().getInstanceOfMagnitude( wheel1Radius );
    //     add( wheel1Center.plus( wheel1ToOneEdge ) );
    //     add( wheel1Center.minus( wheel1ToOneEdge ) );
    //     Vector2D wheel2ToOneEdge = wheel1CenterToWheelTwoCenter.getPerpendicularVector().getInstanceOfMagnitude( wheel2Radius );
    //     add( wheel2Center.minus( wheel2ToOneEdge ) );
    //     add( wheel2Center.plus( wheel2ToOneEdge ) );
    // }};

    // var sunPath = new Path( sunShape, {
    //   fill: Color.YELLOW,
    //   lineWidth: 1,
    //   stroke: Color.YELLOW
    // } );

    // sunPath.setTranslation( modelViewTransform.modelToViewDelta( SunEnergySource.OFFSET_TO_CENTER_OF_SUN ) );

  }

  energyFormsAndChanges.register( 'BeltNode', BeltNode );

  return inherit( Node, BeltNode );
} );
