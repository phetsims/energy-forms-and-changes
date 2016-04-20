// Copyright 2016, University of Colorado Boulder


/**
 * Class that represents a ray of light in the view.  Rays of light can have
 * shapes that reduce or block the amount of light passing through.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var KiteLine = require( 'KITE/segments/Line' );
  var Line = require( 'SCENERY/nodes/Line' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  var STROKE_THICKNESS = 2;
  var SEARCH_ITERATIONS = 10;
  var FADE_COEFFICIENT_IN_AIR = 0.005;

  /**
   * @param {Vector2} point     position
   * @param {Number} fadeValue Fade coefficient
   * @constructor
   * @private
   */
  function PointAndFadeValue( point, fadeValue ) {
    this.point = point;
    this.fadeValue = fadeValue;
  }

  /**
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Color} color
   * @constructor
   */
  function LightRayNode( origin, endpoint, color ) {

    this.lightAbsorbingShapes = [];
    this.pointAndFadeValues = [];
    this.origin = origin;
    this.endpoint = endpoint;
    this.color = color;

    Node.call( this );

    this.updateRays();
  }

  energyFormsAndChanges.register( 'LightRayNode', LightRayNode );

  return inherit( Node, LightRayNode, {

    /**
     * [addLightAbsorbingShape description]
     * @param {LightAbsorbingShape} lightAbsorbingShape [description]
     * @public
     */
    addLightAbsorbingShape: function( lightAbsorbingShape ) {
      var self = this;
      lightAbsorbingShape.absorptionCoefficientProperty.link( function() {
        self.updateRays();
      } );
      this.lightAbsorbingShapes.push( lightAbsorbingShape );
    },

    /**
     * [removeLightAbsorbingShape description]
     * @param  {LightAbsorbingShape} lightAbsorbingShape [description]
     * @return {[type]}
     * @public
     */
    removeLightAbsorbingShape: function( lightAbsorbingShape ) {
      lightAbsorbingShape.absorptionCoefficientProperty.unlinkAll();
      _.remove( this.lightAbsorbingShapes, lightAbsorbingShape );
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
        if ( self.lineIntersectsShape( self.origin, self.endpoint, absorbingShape.shape ) ) {

          var entryPoint = self.getShapeEntryPoint( self.origin, self.endpoint, absorbingShape.shape );

          // It's conceivable that we could handle a case where the line originates
          // in a shape, but we don't for now
          assert && assert( entryPoint !== null, 'entryPoint is null' );

          var fade = absorbingShape.absorptionCoefficientProperty.get();
          self.pointAndFadeValues.push( new PointAndFadeValue( entryPoint, fade ) );

          var exitPoint = self.getShapeExitPoint( self.origin, self.endpoint, absorbingShape.shape );
          if ( exitPoint !== null ) {
            self.pointAndFadeValues.push( new PointAndFadeValue( exitPoint, FADE_COEFFICIENT_IN_AIR ) );
          }
        }
      } );

      // Sort the list of PointAndFadeValues by their distance from the origin, closest first.
      var sorted = _.sortBy( this.pointAndFadeValues, function( p ) {
        return p.point.distance( self.origin );
      } );

      // Add the segments that comprise the line.
      // var opacity = 1;
      var transparent = 'rgba(255,255,255,0)';
      for ( var i = 0; i < sorted.length - 1; i++ ) {

        var start = sorted[ i ].point;
        var end = sorted[ i + 1 ].point;

        var rayLength = start.distance( end );

        var rayGradient = new LinearGradient( start.x, start.y, end.x, end.y )
          .addColorStop( 0, this.color )
          .addColorStop( 1, transparent );

        var fadingLine = new Line( start, end, {
          stroke: rayGradient,
          lineWidth: STROKE_THICKNESS
        } );

        this.addChild( fadingLine );
      }
    },

    /**
     * [lineIntersectsShape description]
     * @param  {Vector2} startPoint [description]
     * @param  {Vector2} endPoint   [description]
     * @param  {Shape} shape      [description]
     * @return {Boolean}            [description]
     * @private
     */
    lineIntersectsShape: function( startPoint, endPoint, shape ) {
      var line = new Line( startPoint, endPoint );
      var kiteLine = new KiteLine( startPoint, endPoint );
      var path = new Path( line, {} );
      var strokedLineShape = path.getStrokedShape();

      var b = shape.bounds;
      var shapeRect = Shape.rect( b.minX, b.minY, b.getWidth(), b.getHeight() );

      var ips = this.getRectangleLineIntersectionPoints( shapeRect, kiteLine );
      if ( ips.length === 0 ) {
        return false;
      }

      // Warning: This only checks the bounding rect, not the full shape.
      // This was adequate in this case, but take care if reusing.
      return strokedLineShape.intersectsBounds( shape.bounds );
    },

    /**
     * [getLineIntersection description]
     * @param  {KiteLine} line1 [description]
     * @param  {KiteLine} line2 [description]
     * @return {Vector2}       [description]
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

      // Find intersection point
      return new Vector2( start1.x + ( r * ( end1.x - start1.x ) ),
        start1.y + ( r * ( end1.y - start1.y ) ) );
    },

    /**
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Shape} shape    [description]
     * @return {Vector2}
     * @private
     */
    getShapeEntryPoint: function( origin, endpoint, shape ) {
      var b = shape.bounds;
      var shapeRect = Shape.rect( b.minX, b.minY, b.getWidth(), b.getHeight() );
      var entryPoint = null;

      if ( this.lineIntersectsShape( origin, endpoint, shape ) ) {
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

        // Search linearly for edge of the shape.  BIG HAIRY NOTE - This
        // will not work in all cases.  It worked for the coarse shapes
        // and rough bounds needed for this simulation.  Don't reuse if you
        // need good general edge finding.
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
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Shape} shape    [description]
     * @return {Vector2}
     * @private
     */
    getShapeExitPoint: function( origin, endpoint, shape ) {
      var shapeRect = shape.bounds;
      var exitPoint = null;

      if ( shape.bounds.containsPoint( endpoint ) ) {
        // Line ends inside shape, return null.
        return null;
      }

      if ( !shape.bounds.containsPoint( endpoint ) && this.lineIntersectsShape( origin, endpoint, shape ) ) {
        // Phase I - Do a binary search to locate the edge of the
        // rectangle that encloses the shape.
        var angle = endpoint.minus( origin ).angle();
        var length = origin.distance( endpoint );
        var lengthChange = length / 2;
        for ( var i = 0; i < SEARCH_ITERATIONS; i++ ) {
          var start = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
          // var testLine = new Line( start.x, start.y, endpoint.x, endpoint.y );
          // length += lengthChange * ( testLine.intersects( shapeRect ) ? 1 : -1 );
          length += lengthChange * ( this.lineIntersectsShape( start, endpoint, shape ) ? 1 : -1 );
          lengthChange = lengthChange / 2;
        }
        exitPoint = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
      }
      return exitPoint;
    },


    /**
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Rectangle} shape    [description]
     * @return {Vector2}
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
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Rectangle} shape    [description]
     * @return {Vector2}
     * @private
     */
    getRectangleExitPoint: function( origin, endpoint, rect ) {
      var intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new KiteLine( origin, endpoint ) );

      if ( intersectingPoints.length < 2 ) {
        // Line either doesn't intersect or ends inside the rectangle.
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
     * [getRectangleLineIntersectionPoints description]
     * @param  {Rectangle} rect [description]
     * @param  {Line} line [description]
     * @return {Array<Vector2>}      [description]
     */
    getRectangleLineIntersectionPoints: function( rect, line ) {

      // Corners of rect
      var p = [
        new Vector2( rect.bounds.minX, rect.bounds.minY ),
        new Vector2( rect.bounds.minX, rect.bounds.maxY ),
        new Vector2( rect.bounds.maxX, rect.bounds.maxY ),
        new Vector2( rect.bounds.maxX, rect.bounds.minY )
      ];

      // Perimeter lines of rect
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

