// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node that represents a collection of light rays emanating from a circular or point source
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRayNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/LightRayNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Vector2} center - Center position of radial rays
   * @param {number} innerRadius - Start point
   * @param {number} outerRadius - End point
   * @param {number} numRays - How many rays around the sun
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

