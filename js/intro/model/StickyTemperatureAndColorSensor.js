// Copyright 2014-2018, University of Colorado Boulder

/**
 * a temperature and color sensor that sticks to movable objects
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var ElementFollower = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ElementFollower' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var TemperatureAndColorSensor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/TemperatureAndColorSensor' );

  /**
   * @param {EFACIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @constructor
   */
  function StickyTemperatureAndColorSensor( model, initialPosition, initiallyActive ) {

    var self = this;
    TemperatureAndColorSensor.call( this, model, initialPosition, initiallyActive );

    // @private
    this.elementFollower = new ElementFollower( this.positionProperty );

    // Monitor the state of the 'userControlled' property in order to detect when the user drops this thermometer and
    // determine whether or not it was dropped over anything to which it should stick.
    this.userControlledProperty.link( function( userControlled ) {

      // if being dragged, stop following any objects
      if ( userControlled ) {
        self.elementFollower.stopFollowing();
      }

      // if the thermometer was dropped, see if it was dropped over something that it should follow
      else {
        model.getBlockList().forEach( function( block ) {

          // stick to this block
          if ( block.getProjectedShape().containsPoint( self.positionProperty.value ) ) {
            self.elementFollower.startFollowing( block.positionProperty );
          }
        } );

        // stick to the beaker
        if ( model.beaker.getThermalContactArea().containsPoint( self.positionProperty.value ) ) {
          self.elementFollower.startFollowing( model.beaker.positionProperty );
        }
      }
    } );
  }

  energyFormsAndChanges.register( 'StickyTemperatureAndColorSensor', StickyTemperatureAndColorSensor );

  return inherit( TemperatureAndColorSensor, StickyTemperatureAndColorSensor, {

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      this.elementFollower.stopFollowing();
      TemperatureAndColorSensor.prototype.reset.call( this );
    }
  } );
} );
