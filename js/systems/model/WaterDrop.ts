// Copyright 2016-2025, University of Colorado Boulder

/**
 * a model of a drop of water, generally used to create a stream of water coming from, say, a faucet
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// the following constant is used to adjust the way in which the drop elongates as its velocity increases
const WIDTH_CHANGE_TWEAK_FACTOR = 0.05;

class WaterDrop {

  // after being transformed to view coordinates, this position is the distance from the faucet head
  public position: Vector2;
  public readonly velocityProperty: Vector2Property;
  public readonly size: Dimension2;

  /**
   * @param initialPosition - (x,y) position in model space
   * @param initialVelocity - 2D velocity at initialization
   * @param size - droplet dimensions
   */
  public constructor( initialPosition: Vector2, initialVelocity: Vector2, size: Dimension2 ) {

    this.position = initialPosition;

    this.velocityProperty = new Vector2Property( initialVelocity, { valueComparisonStrategy: 'equalsFunction' } );

    this.size = size;

    // adjust the size as the velocity changes, mimicking how water drops thin out as they fall through air
    // doesn't need to be unlinked because the water drop owns its velocityProperty
    this.velocityProperty.link( velocity => {
      const newWidth = ( 1 / ( 1 + velocity.magnitude * WIDTH_CHANGE_TWEAK_FACTOR ) ) * this.size.width;
      const newHeight = ( this.size.height * this.size.width ) / newWidth;
      this.size.set( new Dimension2( newWidth, newHeight ) );
    } );
  }
}

energyFormsAndChanges.register( 'WaterDrop', WaterDrop );
export default WaterDrop;