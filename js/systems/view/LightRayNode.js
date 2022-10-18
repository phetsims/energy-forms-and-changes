// Copyright 2016-2022, University of Colorado Boulder

/**
 * A Scenery Node that represents a ray of light in the view.  Rays of light can have shapes that reduce or block the
 * amount of light passing through.
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Line as KiteLine, Shape } from '../../../../kite/js/imports.js';
import { Line, LinearGradient, Node, Path } from '../../../../scenery/js/imports.js';
import EFACConstants from '../../common/EFACConstants.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const STROKE_THICKNESS = 2;
const SEARCH_ITERATIONS = 10;

class LightRayNode extends Node {

  /**
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Color} color
   */
  constructor( origin, endpoint, color ) {
    super();

    // @private - data that defines this ray
    this.lightAbsorbingShapes = [];
    this.pointAndFadeValues = [];
    this.origin = origin;
    this.endpoint = endpoint;
    this.color = color;

    this.updateRay();

    // @private - A version of the updateRay function that is bound to this instance, used for adding to and removing
    // from light absorbing shapes.
    this.rayUpdater = this.updateRay.bind( this );
  }

  /**
   * add a shape that will potentially interact with this light ray
   * @param {LightAbsorbingShape} lightAbsorbingShape
   * @public
   */
  addLightAbsorbingShape( lightAbsorbingShape ) {
    this.lightAbsorbingShapes.push( lightAbsorbingShape );
    lightAbsorbingShape.absorptionCoefficientProperty.link( this.rayUpdater );
  }

  /**
   * @param  {LightAbsorbingShape} lightAbsorbingShape
   * @public
   */
  removeLightAbsorbingShape( lightAbsorbingShape ) {
    lightAbsorbingShape.absorptionCoefficientProperty.unlink( this.rayUpdater );
    _.pull( this.lightAbsorbingShapes, lightAbsorbingShape );
    this.updateRay();
  }

  /**
   * @private
   */
  updateRay() {
    this.removeAllChildren();
    this.pointAndFadeValues.length = 0;

    this.pointAndFadeValues.push( new PointAndFadeValue( this.origin, EFACConstants.FADE_COEFFICIENT_IN_AIR ) );
    this.pointAndFadeValues.push( new PointAndFadeValue( this.endpoint, 0 ) );

    this.lightAbsorbingShapes.forEach( absorbingShape => {

      const entryPoint = this.getShapeEntryPoint( this.origin, this.endpoint, absorbingShape.shape );

      if ( entryPoint !== null ) {
        const fade = absorbingShape.absorptionCoefficientProperty.get();
        this.pointAndFadeValues.push( new PointAndFadeValue( entryPoint, fade ) );
        const exitPoint = this.getShapeExitPoint( this.origin, this.endpoint, absorbingShape.shape );
        if ( exitPoint !== null ) {
          this.pointAndFadeValues.push( new PointAndFadeValue( exitPoint, EFACConstants.FADE_COEFFICIENT_IN_AIR ) );
        }
      }
    } );

    // sort the list of PointAndFadeValues by their distance from the origin, closest first
    const sortedPointAndFadeValues = _.sortBy( this.pointAndFadeValues, p => {
      return p.point.distance( this.origin );
    } );

    const rayLength = this.origin.distance( this.endpoint );

    const rayGradient = new LinearGradient( this.origin.x, this.origin.y, this.endpoint.x, this.endpoint.y )
      .addColorStop( 0, this.color );

    let prevIntensity = this.color.alpha;
    for ( let i = 0; i < sortedPointAndFadeValues.length - 1; i++ ) {
      const distanceFromOrigin = this.origin.distance( sortedPointAndFadeValues[ i + 1 ].point );
      const distanceFromPreviousPoint = sortedPointAndFadeValues[ i ].point.distance( sortedPointAndFadeValues[ i + 1 ].point );

      let intensityAtEndPoint = prevIntensity * Math.pow( Math.E, -sortedPointAndFadeValues[ i ].fadeValue * distanceFromPreviousPoint );
      intensityAtEndPoint = Utils.roundSymmetric( intensityAtEndPoint * 100 ) / 100; // round to nearest tenth

      const endPointColor = this.color.copy().setAlpha( intensityAtEndPoint );
      rayGradient.addColorStop( distanceFromOrigin / rayLength, endPointColor );

      prevIntensity = intensityAtEndPoint;
    }
    rayGradient.addColorStop( 1, this.color.copy().setAlpha( 0 ) );

    const fadingRay = new Line( this.origin, this.endpoint, {
      stroke: rayGradient,
      lineWidth: STROKE_THICKNESS
    } );
    this.addChild( fadingRay );
  }

  /**
   * finds the point at which this light ray enters a light absorbing shape
   *
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Shape} shape
   * @returns {Vector2|null}
   * @private
   */
  getShapeEntryPoint( origin, endpoint, shape ) {
    const b = shape.bounds;
    const shapeRect = Shape.rect( b.minX, b.minY, b.getWidth(), b.getHeight() );
    let entryPoint = null;

    if ( shape.interiorIntersectsLineSegment( origin, endpoint ) ) {
      const boundsEntryPoint = this.getRectangleEntryPoint( origin, endpoint, shapeRect );
      if ( boundsEntryPoint === null ) {

        // DEBUG
        const l = new Line( origin, endpoint, {
          stroke: 'lime',
          lineWidth: 3
        } );
        this.addChild( l );

        const p = new Path( shape, {
          stroke: 'red',
          lineWidth: 3
        } );
        this.addChild( p );
        return null;
      }
      const boundsExitPoint = this.getRectangleExitPoint( origin, endpoint, shapeRect );
      const searchEndPoint = boundsExitPoint === null ? endpoint : boundsExitPoint;

      // Search linearly for edge of the shape.  BIG HAIRY NOTE - This will not work in all cases.  It worked for the
      // coarse shapes and rough bounds needed for this simulation.  Don't reuse if you need good general edge
      // finding.
      const angle = endpoint.minus( origin ).angle;
      const incrementalDistance = boundsEntryPoint.distance( searchEndPoint ) / SEARCH_ITERATIONS;
      for ( let i = 0; i < SEARCH_ITERATIONS; i++ ) {
        const testPoint = boundsEntryPoint.plus( new Vector2( incrementalDistance * i, 0 ).rotated( angle ) );
        if ( shape.bounds.containsPoint( testPoint ) ) {
          entryPoint = testPoint;
          break;
        }
      }
    }
    return entryPoint;
  }

  /**
   * finds the point at which this light ray exits a light absorbing shape
   *
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Shape} shape
   * @returns {Vector2}
   * @private
   */
  getShapeExitPoint( origin, endpoint, shape ) {
    let exitPoint = null;

    if ( shape.bounds.containsPoint( endpoint ) ) {

      // line ends inside shape, return null
      return null;
    }

    if ( !shape.bounds.containsPoint( endpoint ) && shape.interiorIntersectsLineSegment( origin, endpoint ) ) {

      // phase I - Do a binary search to locate the edge of the rectangle that encloses the shape
      const angle = endpoint.minus( origin ).angle;
      let length = origin.distance( endpoint );
      let lengthChange = length / 2;
      for ( let i = 0; i < SEARCH_ITERATIONS; i++ ) {
        const start = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
        length += lengthChange * ( shape.interiorIntersectsLineSegment( start, endpoint ) ? 1 : -1 );
        lengthChange = lengthChange / 2;
      }
      exitPoint = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
    }
    return exitPoint;
  }

  /**
   * finds the point at which this light ray enters a rectangular shape
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Rectangle} rect
   * @returns {Vector2}
   * @private
   */
  getRectangleEntryPoint( origin, endpoint, rect ) {
    const intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );
    let closestIntersectionPoint = null;
    intersectingPoints.forEach( point => {
      if ( closestIntersectionPoint === null ||
           closestIntersectionPoint.distance( origin ) > point.distance( origin ) ) {
        closestIntersectionPoint = point;
      }
    } );

    return closestIntersectionPoint;
  }

  /**
   * finds the point at which this light ray exits a rectangular shape
   * @param  {Vector2} origin
   * @param  {Vector2} endpoint
   * @param  {Rectangle} rect
   * @returns {Vector2}
   * @private
   */
  getRectangleExitPoint( origin, endpoint, rect ) {
    const intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );

    if ( intersectingPoints.length < 2 ) {

      // line either doesn't intersect or ends inside the rectangle
      return null;
    }

    let furthestIntersectionPoint = null;
    intersectingPoints.forEach( point => {
      if ( furthestIntersectionPoint === null ||
           furthestIntersectionPoint.distance( origin ) < point.distance( origin ) ) {
        furthestIntersectionPoint = point;
      }
    } );

    return furthestIntersectionPoint;
  }

  /**
   * @param {Rectangle} rect
   * @param {Line} line
   * @returns {Vector2[]}
   * @private
   */
  getRectangleLineIntersectionPoints( rect, line ) {

    // corners of rect
    const p = [
      new Vector2( rect.bounds.minX, rect.bounds.minY ),
      new Vector2( rect.bounds.minX, rect.bounds.maxY ),
      new Vector2( rect.bounds.maxX, rect.bounds.maxY ),
      new Vector2( rect.bounds.maxX, rect.bounds.minY )
    ];

    // perimeter lines of rect
    const lines = [];
    lines.push( new KiteLine( p[ 0 ], p[ 1 ] ) );
    lines.push( new KiteLine( p[ 1 ], p[ 2 ] ) );
    lines.push( new KiteLine( p[ 2 ], p[ 3 ] ) );
    lines.push( new KiteLine( p[ 3 ], p[ 0 ] ) );

    const intersectingPoints = [];
    lines.forEach( rectLine => {
      const intersectingPoint = getLineIntersection( rectLine, line );
      if ( intersectingPoint !== null ) {
        intersectingPoints.push( intersectingPoint );
      }
    } );

    return intersectingPoints;
  }
}

class PointAndFadeValue {

  /**
   * helper type that consolidates a point and a fade value
   * @param {Vector2} point - position
   * @param {number} fadeValue - Fade coefficient
   * @private
   */
  constructor( point, fadeValue ) {
    this.point = point;
    this.fadeValue = fadeValue;
  }
}

/**
 * @param {KiteLine} line1
 * @param {KiteLine} line2
 * @returns {Vector2}
 * @private
 */
const getLineIntersection = ( line1, line2 ) => {

  const start1 = line1.start;
  const start2 = line2.start;
  const end1 = line1.end;
  const end2 = line2.end;

  const denominator = ( ( end1.x - start1.x ) * ( end2.y - start2.y ) ) -
                      ( ( end1.y - start1.y ) * ( end2.x - start2.x ) );

  // Check if the lines are parallel, and thus don't intersect.
  if ( denominator === 0 ) {
    return null;
  }

  const numerator = ( ( start1.y - start2.y ) * ( end2.x - start2.x ) ) -
                    ( ( start1.x - start2.x ) * ( end2.y - start2.y ) );
  const r = numerator / denominator;

  const numerator2 = ( ( start1.y - start2.y ) * ( end1.x - start1.x ) ) -
                     ( ( start1.x - start2.x ) * ( end1.y - start1.y ) );
  const s = numerator2 / denominator;

  if ( ( r < 0 || r > 1 ) || ( s < 0 || s > 1 ) ) {
    return null;
  }

  // find intersection point
  return new Vector2(
    start1.x + ( r * ( end1.x - start1.x ) ),
    start1.y + ( r * ( end1.y - start1.y ) )
  );
};

energyFormsAndChanges.register( 'LightRayNode', LightRayNode );
export default LightRayNode;