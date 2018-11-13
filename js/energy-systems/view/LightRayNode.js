// Copyright 2016-2018, University of Colorado Boulder


/**
 * A Scenery Node that represents a ray of light in the view.  Rays of light can have shapes that reduce or block the
 * amount of light passing through.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KiteLine = require( 'KITE/segments/Line' ); // eslint-disable-line require-statement-match
  var Line = require( 'SCENERY/nodes/Line' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var STROKE_THICKNESS = 2;
  var SEARCH_ITERATIONS = 10;
  var FADE_COEFFICIENT_IN_AIR = 0.005;

  /**
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Color} color
   * @constructor
   */
  function LightRayNode( origin, endpoint, color ) {

    // @private - data that defines this ray
    this.lightAbsorbingShapes = [];
    this.pointAndFadeValues = [];
    this.origin = origin;
    this.endpoint = endpoint;
    this.color = color;

    Node.call( this );

    this.updateRays();
  }

  /**
   * helper type that consolidates a point and a fade value
   * @param {Vector2} point - position
   * @param {number} fadeValue - Fade coefficient
   * @constructor
   * @private
   */
  function PointAndFadeValue( point, fadeValue ) {
    this.point = point;
    this.fadeValue = fadeValue;
  }

  energyFormsAndChanges.register( 'LightRayNode', LightRayNode );

  return inherit( Node, LightRayNode, {

    /**
     * add a shape that will potentially interact with this light ray
     * @param {LightAbsorbingShape} lightAbsorbingShape
     * @public
     */
    addLightAbsorbingShape: function( lightAbsorbingShape ) {
      var self = this;
      this.lightAbsorbingShapes.push( lightAbsorbingShape );
      lightAbsorbingShape.absorptionCoefficientProperty.link( function() {
        self.updateRays();
      } );
    },

    /**
     * @param  {LightAbsorbingShape} lightAbsorbingShape
     * @public
     */
    removeLightAbsorbingShape: function( lightAbsorbingShape ) {
      // TODO: This probably works, but is not quite correct, since it should really be unlinking the added listener, not everything.
      lightAbsorbingShape.absorptionCoefficientProperty.unlinkAll();
      _.pull( this.lightAbsorbingShapes, lightAbsorbingShape );
      this.updateRays();
    },

    /**
     * @private
     */
    updateRays: function() {
      this.removeAllChildren();
      this.pointAndFadeValues.length = 0;

      this.pointAndFadeValues.push( new PointAndFadeValue( this.origin, FADE_COEFFICIENT_IN_AIR ) );
      this.pointAndFadeValues.push( new PointAndFadeValue( this.endpoint, 0 ) );

      var self = this;
      this.lightAbsorbingShapes.forEach( function( absorbingShape ) {

        var entryPoint = self.getShapeEntryPoint( self.origin, self.endpoint, absorbingShape.shape );

        if ( entryPoint !== null ) {
          var fade = absorbingShape.absorptionCoefficientProperty.get();
          self.pointAndFadeValues.push( new PointAndFadeValue( entryPoint, fade ) );
          var exitPoint = self.getShapeExitPoint( self.origin, self.endpoint, absorbingShape.shape );
          if ( exitPoint !== null ) {
            self.pointAndFadeValues.push( new PointAndFadeValue( exitPoint, FADE_COEFFICIENT_IN_AIR ) );
          }
        }
      } );

      // sort the list of PointAndFadeValues by their distance from the origin, closest first
      var sorted = _.sortBy( this.pointAndFadeValues, function( p ) {
        return p.point.distance( self.origin );
      } );

      var rayLength = this.origin.distance( this.endpoint );

      var rayGradient = new LinearGradient( this.origin.x, this.origin.y, this.endpoint.x, this.endpoint.y )
        .addColorStop( 0, this.color );

      var prevIntensity = 255;
      for ( var i = 0; i < sorted.length - 1; i++ ) {
        var distance = this.origin.distance( sorted[ i + 1 ].point );
        var fractionalLength = distance / rayLength;

        // var opacity = Math.floor( 255 * ( 1 - fractionalLength ) );
        // var opacity = Math.floor( 255 * ( 1 - sorted[ i + 1 ].fadeValue ) );
        // var opacity = Math.floor( 255 * sorted[ i + 1 ].fadeValue );

        var intensity = Math.round( prevIntensity * Math.pow( Math.E, -sorted[ i ].fadeValue * distance ) );

        rayGradient.addColorStop( fractionalLength, 'rgba(255,255,0,' + intensity + ')' );

        prevIntensity = intensity;
      }
      rayGradient.addColorStop( 1, 'rgba(255,255,255,0)' );

      var fadingLine = new Line( this.origin, this.endpoint, {
        stroke: rayGradient,
        lineWidth: STROKE_THICKNESS
      } );
      this.addChild( fadingLine );
    },

    /**
     * @param  {KiteLine} line1
     * @param  {KiteLine} line2
     * @returns {Vector2}
     * @private
     */
    getLineIntersection: function( line1, line2 ) {

      var start1 = line1.start;
      var start2 = line2.start;
      var end1 = line1.end;
      var end2 = line2.end;

      var denominator = ( ( end1.x - start1.x ) * ( end2.y - start2.y ) ) -
                        ( ( end1.y - start1.y ) * ( end2.x - start2.x ) );

      // Check if the lines are parallel, and thus don't intersect.
      if ( denominator === 0 ) {
        return null;
      }

      var numerator = ( ( start1.y - start2.y ) * ( end2.x - start2.x ) ) -
                      ( ( start1.x - start2.x ) * ( end2.y - start2.y ) );
      var r = numerator / denominator;

      var numerator2 = ( ( start1.y - start2.y ) * ( end1.x - start1.x ) ) -
                       ( ( start1.x - start2.x ) * ( end1.y - start1.y ) );
      var s = numerator2 / denominator;

      if ( ( r < 0 || r > 1 ) || ( s < 0 || s > 1 ) ) {
        return null;
      }

      // find intersection point
      return new Vector2(
        start1.x + ( r * ( end1.x - start1.x ) ),
        start1.y + ( r * ( end1.y - start1.y ) )
      );
    },

    /**
     * @param  {Vector2} origin
     * @param  {Vector2} endpoint
     * @param  {Shape} shape
     * @returns {Vector2|null}
     * @private
     */
    getShapeEntryPoint: function( origin, endpoint, shape ) {
      var b = shape.bounds;
      var shapeRect = Shape.rect( b.minX, b.minY, b.getWidth(), b.getHeight() );
      var entryPoint = null;

      if ( shape.interiorIntersectsLineSegment( origin, endpoint ) ) {
        var boundsEntryPoint = this.getRectangleEntryPoint( origin, endpoint, shapeRect );
        if ( boundsEntryPoint === null ) {

          // DEBUG
          var l = new Line( origin, endpoint, {
            stroke: 'lime',
            lineWidth: 3
          } );
          this.addChild( l );

          var p = new Path( shape, {
            stroke: 'red',
            lineWidth: 3
          } );
          this.addChild( p );
          return null;
        }
        var boundsExitPoint = this.getRectangleExitPoint( origin, endpoint, shapeRect );
        var searchEndPoint = boundsExitPoint === null ? endpoint : boundsExitPoint;

        // Search linearly for edge of the shape.  BIG HAIRY NOTE - This will not work in all cases.  It worked for the
        // coarse shapes and rough bounds needed for this simulation.  Don't reuse if you need good general edge
        // finding.
        var angle = endpoint.minus( origin ).angle();
        var incrementalDistance = boundsEntryPoint.distance( searchEndPoint ) / SEARCH_ITERATIONS;
        for ( var i = 0; i < SEARCH_ITERATIONS; i++ ) {
          var testPoint = boundsEntryPoint.plus( new Vector2( incrementalDistance * i, 0 ).rotated( angle ) );
          if ( shape.bounds.containsPoint( testPoint ) ) {
            entryPoint = testPoint;
            break;
          }
        }
      }
      return entryPoint;
    },

    /**
     * @param  {Vector2} origin
     * @param  {Vector2} endpoint
     * @param  {Shape} shape
     * @returns {Vector2}
     * @private
     */
    getShapeExitPoint: function( origin, endpoint, shape ) {

      var exitPoint = null;

      if ( shape.bounds.containsPoint( endpoint ) ) {

        // line ends inside shape, return null
        return null;
      }

      if ( !shape.bounds.containsPoint( endpoint ) && shape.interiorIntersectsLineSegment( origin, endpoint ) ) {

        // phase I - Do a binary search to locate the edge of the rectangle that encloses the shape
        var angle = endpoint.minus( origin ).angle();
        var length = origin.distance( endpoint );
        var lengthChange = length / 2;
        for ( var i = 0; i < SEARCH_ITERATIONS; i++ ) {
          var start = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
          length += lengthChange * ( shape.interiorIntersectsLineSegment( start, endpoint ) ? 1 : -1 );
          lengthChange = lengthChange / 2;
        }
        exitPoint = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
      }
      return exitPoint;
    },

    /**
     * @param  {Vector2} origin
     * @param  {Vector2} endpoint
     * @param  {Rectangle} rect
     * @returns {Vector2}
     * @private
     */
    getRectangleEntryPoint: function( origin, endpoint, rect ) {
      var intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );
      var closestIntersectionPoint = null;
      intersectingPoints.forEach( function( point ) {
        if ( closestIntersectionPoint === null ||
             closestIntersectionPoint.distance( origin ) > point.distance( origin ) ) {
          closestIntersectionPoint = point;
        }
      } );

      return closestIntersectionPoint;
    },

    /**
     * @param  {Vector2} origin
     * @param  {Vector2} endpoint
     * @param  {Rectangle} rect
     * @returns {Vector2}
     * @private
     */
    getRectangleExitPoint: function( origin, endpoint, rect ) {
      var intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );

      if ( intersectingPoints.length < 2 ) {

        // line either doesn't intersect or ends inside the rectangle
        return null;
      }

      var furthestIntersectionPoint = null;
      intersectingPoints.forEach( function( point ) {
        if ( furthestIntersectionPoint === null ||
             furthestIntersectionPoint.distance( origin ) < point.distance( origin ) ) {
          furthestIntersectionPoint = point;
        }
      } );

      return furthestIntersectionPoint;
    },

    /**
     * @param  {Rectangle} rect
     * @param  {Line} line
     * @returns {Vector2[]}
     */
    getRectangleLineIntersectionPoints: function( rect, line ) {

      // corners of rect
      var p = [
        new Vector2( rect.bounds.minX, rect.bounds.minY ),
        new Vector2( rect.bounds.minX, rect.bounds.maxY ),
        new Vector2( rect.bounds.maxX, rect.bounds.maxY ),
        new Vector2( rect.bounds.maxX, rect.bounds.minY )
      ];

      // perimeter lines of rect
      var lines = [];
      lines.push( new KiteLine( p[ 0 ], p[ 1 ] ) );
      lines.push( new KiteLine( p[ 1 ], p[ 2 ] ) );
      lines.push( new KiteLine( p[ 2 ], p[ 3 ] ) );
      lines.push( new KiteLine( p[ 3 ], p[ 0 ] ) );

      var intersectingPoints = [];
      var self = this;
      lines.forEach( function( rectLine ) {
        var intersectingPoint = self.getLineIntersection( rectLine, line );
        if ( intersectingPoint !== null ) {
          intersectingPoints.push( intersectingPoint );
        }
      } );

      return intersectingPoints;
    }

  } );
} );

