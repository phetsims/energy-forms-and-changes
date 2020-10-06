// Copyright 2014-2020, University of Colorado Boulder

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

    // closure to test whether this is over a thermal model element and, if so, attach to it
    const followElements = () => {

      // sort blocks by zIndex so sensors stick to the highest one that the sensor is over
      const blocks = _.sortBy( model.blockGroup.getArrayCopy(), block => block.zIndex );

      blocks.forEach( block => {
        if ( block.getProjectedShape().containsPoint( this.positionProperty.value ) ) {

          // stick to this block
          this.elementFollower.startFollowing( block.positionProperty );
        }
      } );

      if ( !this.elementFollower.isFollowing() ) {
        model.beakerGroup.forEach( beaker => {
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
        model.beakerGroup.forEach( beaker => {
          if ( beaker.bounds.containsPoint( this.positionProperty.value ) &&
               !beaker.thermalContactArea.containsPoint( this.positionProperty.value ) ) {

            // stop following this beaker
            this.elementFollower.stopFollowing();
          }
        } );
      }
    } );

    // Make sure that the following state is set properly when state is set via phet-io.
    phet.joist.sim.isSettingPhetioStateProperty.lazyLink( settingPhetIoState => {

      if ( settingPhetIoState ) {

        if ( this.elementFollower.isFollowing() ) {

          // If this is following a model element at the beginning of state setting, unfollow so that it doesn't prevent
          // the model element from moving.  The conditions will be reevaluated at the end of state setting, and the
          // follower will be turned back on if appropriate.
          this.elementFollower.stopFollowing();
        }
      }
      else {

        // Figure out if this should be following another element.
        if ( this.activeProperty.value && !this.userControlledProperty.value ) {
          followElements();
        }
      }
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