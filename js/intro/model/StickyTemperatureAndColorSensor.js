// Copyright 2014-2019, University of Colorado Boulder

/**
 * a temperature and color sensor that sticks to movable objects
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const ElementFollower = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ElementFollower' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const TemperatureAndColorSensor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/TemperatureAndColorSensor' );

  class StickyTemperatureAndColorSensor extends TemperatureAndColorSensor {

    /**
     * @param {EFACIntroModel} model
     * @param {Vector2} initialPosition
     * @param {boolean} initiallyActive
     */
    constructor( model, initialPosition, initiallyActive ) {
      super( model, initialPosition, initiallyActive );

      // @private
      this.elementFollower = new ElementFollower( this.positionProperty );

      // Monitor the state of the 'userControlled' Property in order to detect when the user drops this thermometer and
      // determine whether or not it was dropped over anything to which it should stick.
      this.userControlledProperty.link( userControlled => {

        // if being dragged, stop following any objects
        if ( userControlled ) {
          this.elementFollower.stopFollowing();
        }

        // if the thermometer was dropped, see if it was dropped over something that it should follow
        else {
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

  return energyFormsAndChanges.register( 'StickyTemperatureAndColorSensor', StickyTemperatureAndColorSensor );
} );
