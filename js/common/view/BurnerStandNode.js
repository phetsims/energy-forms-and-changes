// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scenery node that represents a burner stand in the view.  A burner stand is a faux-3D representation of an object
 * upon which other objects may be placed in order to be heated or cooled.  The burner is not included.
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { LineStyles, Shape } from '../../../../kite/js/imports.js';
import { Node, Path } from '../../../../scenery/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const BURNER_STAND_STROKE_LINE_WIDTH = 2;
const BURNER_STAND_STROKE_COLOR = 'black';
const PERSPECTIVE_ANGLE = Math.PI / 4; // positive is counterclockwise, a value of 0 produces a non-skewed rectangle

class BurnerStandNode extends Node {

  /**
   * @param {Rectangle} rect
   * @param {number} projectedEdgeLength
   */
  constructor( rect, projectedEdgeLength ) {
    super();

    // add the left and right sides of the stand
    this.addChild( this.createBurnerStandSide( new Vector2( rect.x, rect.y ), rect.height, projectedEdgeLength ) );
    this.addChild( this.createBurnerStandSide( new Vector2( rect.maxX, rect.y ), rect.height, projectedEdgeLength ) );

    // add the top of the burner stand
    this.addChild( this.createBurnerStandTop( new Vector2( rect.x, rect.y ), rect.width, projectedEdgeLength ) );
  }

  /**
   * factory function for creating the sides of the stand
   * @param {number} topCenter
   * @param {number} height
   * @param {number} edgeLength
   * @returns {Path}
   * @private
   */
  createBurnerStandSide( topCenter, height, edgeLength ) {

    // draw the side as a parallelogram
    const upperLeftCorner = topCenter.plus( new Vector2( -edgeLength / 2, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
    const lowerLeftCorner = upperLeftCorner.plus( new Vector2( 0, height ) );
    const lowerRightCorner = lowerLeftCorner.plus( new Vector2( edgeLength, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
    const upperRightCorner = lowerRightCorner.plus( new Vector2( 0, -height ) );

    let shape = new Shape();
    shape.moveToPoint( topCenter )
      .lineToPoint( upperLeftCorner )
      .lineToPoint( lowerLeftCorner )
      .lineToPoint( lowerRightCorner )
      .lineToPoint( upperRightCorner )
      .close();

    const strokeStyles = new LineStyles( {
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
   * @returns {Path}
   * @private
   */
  createBurnerStandTop( leftCenter, width, edgeLength ) {

    // create the points for the outline of the perspective rectangle
    const upperLeftCorner = leftCenter.plus( new Vector2( edgeLength / 2, 0 ).rotated( -PERSPECTIVE_ANGLE ) );
    const upperRightCorner = upperLeftCorner.plus( new Vector2( width, 0 ) );
    const lowerRightCorner = upperRightCorner.plus( new Vector2( -edgeLength, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
    const lowerLeftCorner = lowerRightCorner.plus( new Vector2( -width, 0 ) );

    // create the points for the circular opening in the top
    const upperLeftCircularOpeningCorner = upperLeftCorner.plus( new Vector2( width * 0.25, 0 ) );
    const upperRightCircularOpeningCorner = upperLeftCorner.plus( new Vector2( width * 0.75, 0 ) );
    const lowerLeftCircularOpeningCorner = lowerLeftCorner.plus( new Vector2( width * 0.25, 0 ) );
    const lowerRightCircularOpeningCorner = lowerLeftCorner.plus( new Vector2( width * 0.75, 0 ) );

    // create the control points for the circular opening in the top
    const circularOpeningPerspectiveVector = new Vector2( edgeLength * 0.5, 0 ).rotate( -PERSPECTIVE_ANGLE );
    let shape = new Shape();
    shape.moveToPoint( upperLeftCorner )
      .lineToPoint( upperLeftCircularOpeningCorner )
      .cubicCurveToPoint( upperLeftCircularOpeningCorner.plus( circularOpeningPerspectiveVector ), upperRightCircularOpeningCorner.plus( circularOpeningPerspectiveVector ), upperRightCircularOpeningCorner )
      .lineToPoint( upperRightCorner )
      .lineToPoint( lowerRightCorner )
      .lineToPoint( lowerRightCircularOpeningCorner )
      .cubicCurveToPoint( lowerRightCircularOpeningCorner.minus( circularOpeningPerspectiveVector ), lowerLeftCircularOpeningCorner.minus( circularOpeningPerspectiveVector ), lowerLeftCircularOpeningCorner )
      .lineToPoint( lowerLeftCorner )
      .close();

    const strokeStyles = new LineStyles( {
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
}

energyFormsAndChanges.register( 'BurnerStandNode', BurnerStandNode );
export default BurnerStandNode;