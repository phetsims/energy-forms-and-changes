// Copyright 2014-2025, University of Colorado Boulder

/**
 * a temperature and color sensor that sticks to movable objects
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import ElementFollower from '../../common/model/ElementFollower.js';
import TemperatureAndColorSensor, { TemperatureAndColorSensorOptions } from '../../common/model/TemperatureAndColorSensor.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACIntroModel from './EFACIntroModel.js';

type SelfOptions = EmptySelfOptions;

// Since TemperatureAndColorSensor doesn't export an options type, we'll use Object for parent options
type StickyTemperatureAndColorSensorOptions = SelfOptions & TemperatureAndColorSensorOptions;

class StickyTemperatureAndColorSensor extends TemperatureAndColorSensor {
  private readonly elementFollower: ElementFollower;

  public constructor( model: EFACIntroModel, initialPosition: Vector2, initiallyActive: boolean, providedOptions?: StickyTemperatureAndColorSensorOptions ) {
    super( model, initialPosition, initiallyActive, providedOptions );

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
    this.userControlledProperty!.link( userControlled => {

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
    isSettingPhetioStateProperty.lazyLink( settingPhetIoState => {

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
        if ( this.activeProperty.value && !this.userControlledProperty!.value ) {
          followElements();
        }
      }
    } );
  }

  /**
   * restore initial state
   */
  public override reset(): void {
    this.elementFollower.stopFollowing();
    super.reset();
  }
}

energyFormsAndChanges.register( 'StickyTemperatureAndColorSensor', StickyTemperatureAndColorSensor );
export default StickyTemperatureAndColorSensor;