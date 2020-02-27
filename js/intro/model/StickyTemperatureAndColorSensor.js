// Copyright 2014-2019, University of Colorado Boulder

/**
 * a temperature and color sensor that sticks to movable objects
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import ElementFollower from '../../common/model/ElementFollower.js';
import TemperatureAndColorSensor from '../../common/model/TemperatureAndColorSensor.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class StickyTemperatureAndColorSensor extends TemperatureAndColorSensor {

  /**
   * @param {EFACIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @param {Object} [options]
   */
  constructor( model, initialPosition, initiallyActive, options ) {
    super( model, initialPosition, initiallyActive, options );

    // @private
    this.elementFollower = new ElementFollower( this.positionProperty );

    // if this senor is over a block or beaker, stick to it
    const followElements = () => {
      model.blocks.forEach( block => {
        if ( block.getProjectedShape().containsPoint( this.positionProperty.value ) ) {

          // stick to this block
          this.elementFollower.startFollowing( block.positionProperty );
        }
      } );

      if ( !this.elementFollower.isFollowing() ) {
        model.beakers.forEach( beaker => {
          if ( beaker.thermalContactArea.containsPoint( this.positionProperty.value ) ) {

            // stick to this beaker
            this.elementFollower.startFollowing( beaker.positionProperty );
          }
        } );
      }
    };

    // Monitor the state of the 'userControlled' Property in order to detect when the user drops this thermometer and
    // determine whether or not it was dropped over anything to which it should stick.
    this.userControlledProperty.link( userControlled => {

      // if being dragged, stop following any objects
      if ( userControlled ) {
        this.elementFollower.stopFollowing();
      }

      // if the thermometer was dropped, see if it was dropped over something that it should follow
      else {
        followElements();
      }
    } );

    this.sensedElementColorProperty.link( () => {
      if ( this.elementFollower.isFollowing() ) {
        model.beakers.forEach( beaker => {
          if ( beaker.bounds.containsPoint( this.positionProperty.value ) &&
               !beaker.thermalContactArea.containsPoint( this.positionProperty.value ) ) {

            // stop following this beaker
            this.elementFollower.stopFollowing();
          }
        } );
      }
    } );

    // Check if any sensors should start following an element after being set by state
    _.hasIn( window, 'phet.phetIo.phetioEngine' ) && phet.phetIo.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( () => {
      followElements();
    } );
  }

  /**
   * restore initial state
   * @public
   */
  reset() {
    this.elementFollower.stopFollowing();
    super.reset();
  }
}

energyFormsAndChanges.register( 'StickyTemperatureAndColorSensor', StickyTemperatureAndColorSensor );
export default StickyTemperatureAndColorSensor;