// Copyright 2016-2020, University of Colorado Boulder

/**
 * a model of a drop of water, generally used to create a stream of water coming from, say, a faucet
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// the following constant is used to adjust the way in which the drop elongates as its velocity increases
const WIDTH_CHANGE_TWEAK_FACTOR = 0.05;

class WaterDrop {

  /**
   * @param {Vector2} initialPosition - (x,y) position in model space
   * @param {Vector2} initialVelocity - 2D velocity at initialization
   * @param {Dimension2} size - droplet dimensions
   */
  constructor( initialPosition, initialVelocity, size ) {

    // @public {Vector2} - after being transformed to view coordinates, this position is the distance from the faucet head
    this.position = initialPosition;

    // @public
    this.velocityProperty = new Vector2Property( initialVelocity );

    // @public (read-only) {Dimension2}
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