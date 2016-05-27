// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRayNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRayNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * Light rays from the sun and from the light bulb
   *
   * @param {Vector2} center - Center position of radial rays
   * @param {Number} innerRadius - Start point
   * @param {Number} outerRadius - End point
   * @param {Number} numRays - How many rays around the sun
   * @param {Color} color - Ray color
   * @constructor
   */
  function LightRays( center, innerRadius, outerRadius, numRays, color ) {
    Node.call( this );

    this.lightRayNodes = [];
    var angle;
    var startPoint;
    var endPoint;
    for ( var i = 0; i < numRays; i++ ) {
      angle = ( 2 * Math.PI / numRays ) * i;
      startPoint = center.plus( new Vector2( innerRadius, 0 ).rotated( angle ) );
      endPoint = center.plus( new Vector2( outerRadius, 0 ).rotated( angle ) );
      // var transparent = 'rgba(255,255,255,0)';

      // var rayGradient = new LinearGradient( start.x, start.y, end.x, end.y )
      //   .addColorStop( 0, color )
      //   .addColorStop( 1, transparent );

      // var line = new Line( start.x, start.y, end.x, end.y, {
      //   stroke: rayGradient,
      //   linewidth: 3
      // } );

      // this.addChild( line );

      var lightRayNode = new LightRayNode( startPoint, endPoint, color );
      this.lightRayNodes.push( lightRayNode );
      this.addChild( lightRayNode );
    }
  }

  energyFormsAndChanges.register( 'LightRays', LightRays );

  return inherit( Node, LightRays, {

    /**
     * @param {LightAbsorbingShape} lightAbsorbingShape
     * @public
     */
    addLightAbsorbingShape: function( lightAbsorbingShape ) {
      this.lightRayNodes.forEach( function( lightRayNode ) {
        lightRayNode.addLightAbsorbingShape( lightAbsorbingShape );
      } );
    },

    /**
     * @param {LightAbsorbingShape} lightAbsorbingShape
     * @public
     */
    removeLightAbsorbingShape: function( lightAbsorbingShape ) {
      this.lightRayNodes.forEach( function( lightRayNode ) {
        lightRayNode.removeLightAbsorbingShape( lightAbsorbingShape );
      } );
    }

  } );
} );

