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
  var Line = require( 'SCENERY/nodes/Line' );
  var Node = require( 'REPO/path/to/Node' );
  var Ray2 = require( 'DOT/Ray2' );
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

    this.updateLineSegments();
  }

  energyFormsAndChanges.register( 'LightRayNode', LightRayNode );

  return inherit( Node, LightRayNode, {

    /**
     * [addLightAbsorbingShape description]
     * @param {LightAbsorbingShape} lightAbsorbingShape [description]
     * @public
     */
    addLightAbsorbingShape: function( lightAbsorbingShape ) {
      lightAbsorbingShape.absorptionCoefficientProperty.link( function() {
        this.updateLineSegments();
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
      this.updateLineSegments();
    },

    /**
     * @private
     */
    updateLineSegments: function() {
      this.removeAllChildren();
      this.pointAndFadeValues.length = 0;

      this.pointAndFadeValues.push( new PointAndFadeValue( this.origin, FADE_COEFFICIENT_IN_AIR ) );
      this.pointAndFadeValues.push( new PointAndFadeValue( this.endpoint, 0 ) );

      var self = this;
      this.lightAbsorbingShapes.foreach( function( absorbingShape ) {
        if ( self.lineIntersectsShapeIntersects( self.origin, self.endpoint, absorbingShape.shape ) ) {
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


      // // Sort the list by distance from the origin.
      // Collections.sort( pointAndFadeCoefficientList, new Comparator < PointAndFadeCoefficient > () {
      //   public int compare( PointAndFadeCoefficient p1, PointAndFadeCoefficient p2 ) {
      //     return Double.compare( p1.point.distance( origin ), p2.point.distance( origin ) );
      //   }
      // } );

      // // Add the segments that comprise the line.
      // int opacity = 255;
      // for ( int i = 0; i < pointAndFadeCoefficientList.size() - 1; i++ ) {
      //   final FadingLineNode fadingLineNode = new FadingLineNode( pointAndFadeCoefficientList.get( i ).point,
      //     pointAndFadeCoefficientList.get( i + 1 ).point,
      //     new Color( color.getRed(), color.getGreen(), color.getBlue(), opacity ),
      //     pointAndFadeCoefficientList.get( i ).fadeCoefficient,
      //     STROKE_THICKNESS );
      //   addChild( fadingLineNode );
      //   opacity = fadingLineNode.getOpacityAtEndpoint();
      // }

    },

    /**
     * [lineIntersectsShapeIntersects description]
     * @param  {Vector2} startPoint [description]
     * @param  {Vector2} endPoint   [description]
     * @param  {Shape} shape      [description]
     * @return {Boolean}            [description]
     * @private
     */
    lineIntersectsShapeIntersects: function( startPoint, endPoint, shape ) {
      var direction = endPoint.minus( startPoint ).normalized();
      var ray = new Ray2( startPoint, direction );
      return shape.windingIntersection( ray );
      // Warning: This only checks the bounding rect, not the full shape.
      // This was adequate in this case, but take care if reusing.
      // return shape.bounds.intersectsLine( startPoint.x, startPoint.y, endPoint.x, endPoint.y );
    },

    /**
     * [getLineIntersection description]
     * @param  {Line} line1 [description]
     * @param  {Line} line2 [description]
     * @return {Vector2}       [description]
     * @private
     */
    getLineIntersection: function( line1, line2 ) {
      var denominator = ( ( line1.p2.x - line1.p1.x ) * ( line2.p2.y - line2.p1.y ) ) -
        ( ( line1.p2.y - line1.p1.y ) * ( line2.p2.x - line2.p1.x ) );

      // Check if the lines are parallel, and thus don't intersect.
      if ( denominator === 0 ) {
        return null;
      }

      var numerator = ( ( line1.p1.y - line2.p1.y ) * ( line2.p2.x - line2.p1.x ) ) -
        ( ( line1.p1.x - line2.p1.x ) * ( line2.p2.y - line2.p1.y ) );
      var r = numerator / denominator;

      var numerator2 = ( ( line1.p1.y - line2.p1.y ) * ( line1.p2.x - line1.p1.x ) ) -
        ( ( line1.p1.x - line2.p1.x ) * ( line1.p2.y - line1.p1.y ) );
      var s = numerator2 / denominator;

      if ( ( r < 0 || r > 1 ) || ( s < 0 || s > 1 ) ) {
        return null;
      }

      // Find intersection point
      return new Vector2( line1.p1.x + ( r * ( line1.p2.x - line1.p1.x ) ),
        line1.p1.y + ( r * ( line1.p2.y - line1.p1.y ) ) );
    },

    /**
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Shape} shape    [description]
     * @return {Vector2}
     * @private
     */
    getShapeEntryPoint: function( origin, endpoint, shape ) {
      var shapeRect = shape.bounds;
      var entryPoint = null;
      var ray = new Ray2( origin, endpoint.minus( origin ).normalized() );
      if ( shapeRect.windingIntersection( ray ) ) {
        var boundsEntryPoint = this.getRectangleEntryPoint( origin, endpoint, shapeRect );
        if ( boundsEntryPoint === null ) {
          return null;
        }
        var boundsExitPoint = this.getRectangleExitPoint( origin, endpoint, shapeRect );
        var searchEndPoint = boundsExitPoint === null ? endpoint : boundsExitPoint;


        // Search linearly for edge of the shape.  BIG HAIRY NOTE - This
        // will not work in all cases.  It worked for the coarse shapes
        // and rough bounds needed for this simulation.  Don't reuse if you
        // need good general edge finding.
        var angle = endpoint.minus( origin ).angle;
        var incrementalDistance = boundsEntryPoint.distance( searchEndPoint ) / SEARCH_ITERATIONS;
        for ( var i = 0; i < SEARCH_ITERATIONS; i++ ) {
          var testPoint = boundsEntryPoint.plus( new Vector2( incrementalDistance * i, 0 ).rotated( angle ) );
          if ( shape.contains( testPoint ) ) {
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

      if ( shape.contains( endpoint ) ) {
        // Line ends inside shape, return null.
        return null;
      }

      var ray = new Ray2( origin, endpoint.minus( origin ).normalized() );
      if ( !shape.contains( endpoint ) && shapeRect.intersectsLine( ray ) ) {
        // Phase I - Do a binary search to locate the edge of the
        // rectangle that encloses the shape.
        var angle = endpoint.minus( origin ).angle;
        var length = origin.distance( endpoint );
        var lengthChange = length / 2;
        for ( var i = 0; i < SEARCH_ITERATIONS; i++ ) {
          var start = origin.plus( new Vector2( length, 0 ).rotated( angle ) );
          var testLine = new Line( start.x, start.y, endpoint.x, endpoint.y );
          length += lengthChange * ( testLine.intersects( shapeRect ) ? 1 : -1 );
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
      var intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new Line( origin, endpoint ) );

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
      var intersectingPoints = this.getRectangleLineIntersectionPoints( rect, new Line( origin, endpoint ) );

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
      var lines = []; // Lines that make up rectangle
      lines.push( new Line( rect.minX, rect.minY, rect.minX, rect.maxY ) );
      lines.push( new Line( rect.minX, rect.maxY, rect.maxX, rect.maxY ) );
      lines.push( new Line( rect.maxX, rect.maxY, rect.maxX, rect.minY ) );
      lines.push( new Line( rect.maxX, rect.minY, rect.minX, rect.minY ) );

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

