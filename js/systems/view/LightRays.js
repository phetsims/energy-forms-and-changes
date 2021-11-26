// Copyright 2016-2021, University of Colorado Boulder

/**
 * a Scenery Node that represents a collection of light rays emanating from a circular or point source
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { Node } from '../../../../scenery/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import LightRayNode from './LightRayNode.js';

class LightRays extends Node {

  /**
   * @param {Vector2} center - Center position of radial rays
   * @param {number} innerRadius - Start point
   * @param {number} outerRadius - End point
   * @param {number} numberOfRays - How many rays around the sun
   * @param {Color} color - Ray color
   */
  constructor( center, innerRadius, outerRadius, numberOfRays, color ) {
    super();

    this.lightRayNodes = [];
    let angle;
    let startPoint;
    let endPoint;
    for ( let i = 0; i < numberOfRays; i++ ) {
      angle = ( 2 * Math.PI / numberOfRays ) * i;
      startPoint = center.plus( new Vector2( innerRadius, 0 ).rotated( angle ) );
      endPoint = center.plus( new Vector2( outerRadius, 0 ).rotated( angle ) );

      const lightRayNode = new LightRayNode( startPoint, endPoint, color );
      this.lightRayNodes.push( lightRayNode );
      this.addChild( lightRayNode );
    }
  }

  /**
   * adds a light absorbing shape to this set of rays that they may or may not intersect with
   *
   * @param {LightAbsorbingShape} lightAbsorbingShape
   * @public
   */
  addLightAbsorbingShape( lightAbsorbingShape ) {
    this.lightRayNodes.forEach( lightRayNode => {
      lightRayNode.addLightAbsorbingShape( lightAbsorbingShape );
    } );
  }

  /**
   * removes a light absorbing shape from this set of rays
   *
   * @param {LightAbsorbingShape} lightAbsorbingShape
   * @public
   */
  removeLightAbsorbingShape( lightAbsorbingShape ) {
    this.lightRayNodes.forEach( lightRayNode => {
      lightRayNode.removeLightAbsorbingShape( lightAbsorbingShape );
    } );
  }
}

energyFormsAndChanges.register( 'LightRays', LightRays );
export default LightRays;