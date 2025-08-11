// Copyright 2016-2025, University of Colorado Boulder

/**
 * A Scenery Node that represents a ray of light in the view.  Rays of light can have shapes that reduce or block the
 * amount of light passing through.
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import { Line as KiteLine } from '../../../../kite/js/segments/Segment.js';
import Shape from '../../../../kite/js/Shape.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Line from '../../../../scenery/js/nodes/Line.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Color from '../../../../scenery/js/util/Color.js';
import LinearGradient from '../../../../scenery/js/util/LinearGradient.js';
import EFACConstants from '../../common/EFACConstants.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const STROKE_THICKNESS = 2;
const SEARCH_ITERATIONS = 10;

class LightRayNode extends Node {

  // Data that defines this ray
  private readonly lightAbsorbingShapes: IntentionalAny[];
  private readonly pointAndFadeValues: PointAndFadeValue[];
  private readonly origin: Vector2;
  private readonly endpoint: Vector2;
  private readonly color: Color;

  // A version of the updateRay function that is bound to this instance, used for adding to and removing from light absorbing shapes
  private readonly rayUpdater: () => void;

  public constructor( origin: Vector2, endpoint: Vector2, color: Color ) {
    super();

    this.lightAbsorbingShapes = [];
    this.pointAndFadeValues = [];
    this.origin = origin;
    this.endpoint = endpoint;
    this.color = color;
    this.rayUpdater = this.updateRay.bind( this );

    this.updateRay();
  }

  /**
   * add a shape that will potentially interact with this light ray
   */
  public addLightAbsorbingShape( lightAbsorbingShape: IntentionalAny ): void {
    this.lightAbsorbingShapes.push( lightAbsorbingShape );
    lightAbsorbingShape.absorptionCoefficientProperty.link( this.rayUpdater );
  }

  public removeLightAbsorbingShape( lightAbsorbingShape: IntentionalAny ): void {
    lightAbsorbingShape.absorptionCoefficientProperty.unlink( this.rayUpdater );
    _.pull( this.lightAbsorbingShapes, lightAbsorbingShape );
    this.updateRay();
  }

  private updateRay(): void {
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
   */
  private getShapeEntryPoint( origin: Vector2, endpoint: Vector2, shape: Shape ): Vector2 | null {
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
   */
  private getShapeExitPoint( origin: Vector2, endpoint: Vector2, shape: Shape ): Vector2 | null {
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
   */
  private getRectangleEntryPoint( origin: Vector2, endpoint: Vector2, rect: Shape ): Vector2 | null {
    const intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );
    let closestIntersectionPoint: Vector2 | null = null;
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
   */
  private getRectangleExitPoint( origin: Vector2, endpoint: Vector2, rect: Shape ): Vector2 | null {
    const intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );

    if ( intersectingPoints.length < 2 ) {

      // line either doesn't intersect or ends inside the rectangle
      return null;
    }

    let furthestIntersectionPoint: Vector2 | null = null;
    intersectingPoints.forEach( point => {
      if ( furthestIntersectionPoint === null ||
           furthestIntersectionPoint.distance( origin ) < point.distance( origin ) ) {
        furthestIntersectionPoint = point;
      }
    } );

    return furthestIntersectionPoint;
  }

  private getRectangleLineIntersectionPoints( rect: Shape, line: KiteLine ): Vector2[] {

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

    const intersectingPoints: Vector2[] = [];
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

  public readonly point: Vector2;
  public readonly fadeValue: number;

  /**
   * helper type that consolidates a point and a fade value
   * @param point - position
   * @param fadeValue - Fade coefficient
   */
  public constructor( point: Vector2, fadeValue: number ) {
    this.point = point;
    this.fadeValue = fadeValue;
  }
}

const getLineIntersection = ( line1: KiteLine, line2: KiteLine ): Vector2 | null => {

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