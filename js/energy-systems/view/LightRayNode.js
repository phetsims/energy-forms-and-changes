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
  var Node = require( 'REPO/path/to/Node' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Ray2 = require( 'DOT/Ray2' );

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

    var self = this;

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
        this.updateLineSegments()
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

      this.lightAbsorbingShapes.foreach( function( absorbingShape ) {
        if ( self.lineIntersectsShapeIntersects( self.origin, self.endpoint, absorbingShape.shape ) ) {
          var entryPoint =
        }
      } );






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
      var direction = endpoint.minus( startPoint ).normalized();
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
    getLineIntersection: function( line1, line2 ) {},

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
        var searchEndPoint = boundsExitPoint == null ? endpoint : boundsExitPoint;


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
    getRectangleEntryPoint: function( origin, endpoint, rect ) {},
    /**
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Rectangle} shape    [description]
     * @return {Vector2}
     * @private
     */
    getRectangleExitPoint: function( origin, endpoint, rect ) {},

    /**
     * [getRectangleLineIntersectionPoints description]
     * @param  {Rectangle} rect [description]
     * @param  {Line} line [description]
     * @return {Array<Vector2>}      [description]
     */
    getRectangleLineIntersectionPoints: function( rect, line ) {}

  } );
} );

