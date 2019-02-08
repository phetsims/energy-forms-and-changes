// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node that represents a collection of light rays emanating from a circular or point source
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const LightRayNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/LightRayNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Vector2 = require( 'DOT/Vector2' );

  class LightRays extends Node {

    /**
     * @param {Vector2} center - Center position of radial rays
     * @param {number} innerRadius - Start point
     * @param {number} outerRadius - End point
     * @param {number} numRays - How many rays around the sun
     * @param {Color} color - Ray color
     */
    constructor( center, innerRadius, outerRadius, numRays, color ) {
      super();

      this.lightRayNodes = [];
      let angle;
      let startPoint;
      let endPoint;
      for ( let i = 0; i < numRays; i++ ) {
        angle = ( 2 * Math.PI / numRays ) * i;
        startPoint = center.plus( new Vector2( innerRadius, 0 ).rotated( angle ) );
        endPoint = center.plus( new Vector2( outerRadius, 0 ).rotated( angle ) );

        const lightRayNode = new LightRayNode( startPoint, endPoint, color );
        this.lightRayNodes.push( lightRayNode );
        this.addChild( lightRayNode );
      }
    }

    /**
     * @param {LightAbsorbingShape} lightAbsorbingShape
     * @public
     */
    addLightAbsorbingShape( lightAbsorbingShape ) {
      this.lightRayNodes.forEach( lightRayNode => {
        lightRayNode.addLightAbsorbingShape( lightAbsorbingShape );
      } );
    }

    /**
     * @param {LightAbsorbingShape} lightAbsorbingShape
     * @public
     */
    removeLightAbsorbingShape( lightAbsorbingShape ) {
      this.lightRayNodes.forEach( lightRayNode => {
        lightRayNode.removeLightAbsorbingShape( lightAbsorbingShape );
      } );
    }
  }

  return energyFormsAndChanges.register( 'LightRays', LightRays );
} );

