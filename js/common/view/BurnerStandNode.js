// Copyright 2014-2018, University of Colorado Boulder

/**
 * Scenery node that represents a burner stand in the view.  A burner stand is a faux-3D representation of an object
 * upon which other objects may be placed in order to be heated or cooled.  The burner is not included.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var BURNER_STAND_STROKE_LINE_WIDTH = 2;
  var BURNER_STAND_STROKE_COLOR = 'black';
  var PERSPECTIVE_ANGLE = Math.PI / 4; // positive is counterclockwise, a value of 0 produces a non-skewed rectangle

  /**
   * @param {Rectangle} rect
   * @param {number} projectedEdgeLength
   * @constructor
   */
  function BurnerStandNode( rect, projectedEdgeLength ) {

    Node.call( this );

    // add the left and right sides of the stand
    this.addChild( createBurnerStandSide( new Vector2( rect.x, rect.y ), rect.height, projectedEdgeLength ) );
    this.addChild( createBurnerStandSide( new Vector2( rect.maxX, rect.y ), rect.height, projectedEdgeLength ) );

    // add the top of the burner stand
    this.addChild( createBurnerStandTop( new Vector2( rect.x, rect.y ), rect.width, projectedEdgeLength ) );
  }

  energyFormsAndChanges.register( 'BurnerStandNode', BurnerStandNode );

  /**
   * factory function for creating the sides of the stand
   * @param {number} topCenter
   * @param {number} height
   * @param {number} edgeLength
   * @return {Path}
   * @constructor
   */
  function createBurnerStandSide( topCenter, height, edgeLength ) {

    // draw the side as a parallelogram
    var upperLeftCorner = topCenter.plus( new Vector2( -edgeLength / 2, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
    var lowerLeftCorner = upperLeftCorner.plus( new Vector2( 0, height ) );
    var lowerRightCorner = lowerLeftCorner.plus( new Vector2( edgeLength, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
    var upperRightCorner = lowerRightCorner.plus( new Vector2( 0, -height ) );

    var shape = new Shape();
    shape.moveToPoint( topCenter )
      .lineToPoint( upperLeftCorner )
      .lineToPoint( lowerLeftCorner )
      .lineToPoint( lowerRightCorner )
      .lineToPoint( upperRightCorner )
      .close();

    var strokeStyles = new LineStyles( {
      lineWidth: BURNER_STAND_STROKE_LINE_WIDTH,
      lineCap: 'butt',
      lineJoin: 'round'
    } );
    shape = shape.getStrokedShape( strokeStyles );

    return new Path( shape, {
      stroke: BURNER_STAND_STROKE_COLOR,
      lineWidth: BURNER_STAND_STROKE_LINE_WIDTH
    } );
  }

  /**
   * factory function for creating the top of the stand
   * @param {number} leftCenter
   * @param {number} width
   * @param {number} edgeLength
   * @return {Path}
   */
  function createBurnerStandTop( leftCenter, width, edgeLength ) {

    // create the points for the outline of the perspective rectangle
    var upperLeftCorner = leftCenter.plus( new Vector2( edgeLength / 2, 0 ).rotated( -PERSPECTIVE_ANGLE ) );
    var upperRightCorner = upperLeftCorner.plus( new Vector2( width, 0 ) );
    var lowerRightCorner = upperRightCorner.plus( new Vector2( -edgeLength, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
    var lowerLeftCorner = lowerRightCorner.plus( new Vector2( -width, 0 ) );

    // create the points for the circular opening in the top
    var upperLeftCircularOpeningCorner = upperLeftCorner.plus( new Vector2( width * 0.25, 0 ) );
    var upperRightCircularOpeningCorner = upperLeftCorner.plus( new Vector2( width * 0.75, 0 ) );
    var lowerLeftCircularOpeningCorner = lowerLeftCorner.plus( new Vector2( width * 0.25, 0 ) );
    var lowerRightCircularOpeningCorner = lowerLeftCorner.plus( new Vector2( width * 0.75, 0 ) );

    // create the control points for the circular opening in the top
    var circularOpeningPerspectiveVector = new Vector2( edgeLength * 0.5, 0 ).rotate( -PERSPECTIVE_ANGLE );
    var shape = new Shape();
    shape.moveToPoint( upperLeftCorner )
      .lineToPoint( upperLeftCircularOpeningCorner )
      .cubicCurveToPoint( upperLeftCircularOpeningCorner.plus( circularOpeningPerspectiveVector ), upperRightCircularOpeningCorner.plus( circularOpeningPerspectiveVector ), upperRightCircularOpeningCorner )
      .lineToPoint( upperRightCorner )
      .lineToPoint( lowerRightCorner )
      .lineToPoint( lowerRightCircularOpeningCorner )
      .cubicCurveToPoint( lowerRightCircularOpeningCorner.minus( circularOpeningPerspectiveVector ), lowerLeftCircularOpeningCorner.minus( circularOpeningPerspectiveVector ), lowerLeftCircularOpeningCorner )
      .lineToPoint( lowerLeftCorner )
      .close();

    var strokeStyles = new LineStyles( {
      lineWidth: BURNER_STAND_STROKE_LINE_WIDTH,
      lineCap: 'butt',
      lineJoin: 'bevel'
    } );
    shape = shape.getStrokedShape( strokeStyles );

    return new Path( shape, {
      stroke: BURNER_STAND_STROKE_COLOR,
      lineWidth: BURNER_STAND_STROKE_LINE_WIDTH
    } );
  }

  return inherit( Node, BurnerStandNode );
} );