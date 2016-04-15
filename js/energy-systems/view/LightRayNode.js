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
  // Replace with correct path
  var Node = require( 'REPO/path/to/Node' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Vector2} origin
   * @param {Vector2} endpoint
   * @param {Color} color
   * @constructor
   */
  function LightRayNode( origin, endpoint, color ) {
    this.origin = origin;
    this.endpoint = endpoint;
    this.color = color;

    // Add args to constructor as needed
    Node.call( this );
  }

  energyFormsAndChanges.register( 'LightRayNode', LightRayNode );

  return inherit( Node, LightRayNode, {

    /**
     * [addLightAbsorbingShape description]
     * @param {LightAbsorbingShape} lightAbsorbingShape [description]
     * @public
     */
    addLightAbsorbingShape: function( lightAbsorbingShape ) {},

    /**
     * [removeLightAbsorbingShape description]
     * @param  {LightAbsorbingShape} lightAbsorbingShape [description]
     * @return {[type]}
     * @public
     */
    removeLightAbsorbingShape: function( lightAbsorbingShape ) {},

    /**
     * @private
     */
    updateLineSegments: function() {},

    /**
     * [lineIntersectsShapeIntersects description]
     * @param  {Vector2} startPoint [description]
     * @param  {Vector2} endPoint   [description]
     * @param  {Shape} shape      [description]
     * @return {Boolean}            [description]
     * @private
     */
    lineIntersectsShapeIntersects: function( startPoint, endPoint, shape ) {},

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
    getShapeEntryPoint: function( origin, endpoint, shape ) {},

    /**
     * @param  {Vector2} origin   [description]
     * @param  {Vector2} endpoint [description]
     * @param  {Shape} shape    [description]
     * @return {Vector2}
     * @private
     */
    getShapeExitPoint: function( origin, endpoint, shape ) {},


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

