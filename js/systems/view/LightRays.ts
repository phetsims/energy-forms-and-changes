// Copyright 2016-2025, University of Colorado Boulder

/**
 * a Scenery Node that represents a collection of light rays emanating from a circular or point source
 * @author Andrew Adare
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Color from '../../../../scenery/js/util/Color.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import LightRayNode from './LightRayNode.js';

class LightRays extends Node {

  private readonly lightRayNodes: LightRayNode[];

  /**
   * @param center - Center position of radial rays
   * @param innerRadius - Start point
   * @param outerRadius - End point
   * @param numberOfRays - How many rays around the sun
   * @param color - Ray color
   */
  public constructor( center: Vector2, innerRadius: number, outerRadius: number, numberOfRays: number, color: Color ) {
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
   */
  public addLightAbsorbingShape( lightAbsorbingShape: IntentionalAny ): void {
    this.lightRayNodes.forEach( lightRayNode => {
      lightRayNode.addLightAbsorbingShape( lightAbsorbingShape );
    } );
  }

  /**
   * removes a light absorbing shape from this set of rays
   */
  public removeLightAbsorbingShape( lightAbsorbingShape: IntentionalAny ): void {
    this.lightRayNodes.forEach( lightRayNode => {
      lightRayNode.removeLightAbsorbingShape( lightAbsorbingShape );
    } );
  }
}

energyFormsAndChanges.register( 'LightRays', LightRays );
export default LightRays;