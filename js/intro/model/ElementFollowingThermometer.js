// Copyright 2014-2018, University of Colorado Boulder

/**
 * A type that represents a thermometer model that can stick to other elements as they move.  This is a derived type
 * that added the "element following" functionality, see the parent type(s) for information on the thermometer model
 * specifics.
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
  var Thermometer = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Thermometer' );

  /**
   * @param {EFACIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @constructor
   */
  function ElementFollowingThermometer( model, initialPosition, initiallyActive ) {

    var self = this;
    Thermometer.call( this, model, initialPosition, initiallyActive );

    // @private
    this.elementFollower = new ElementFollower( this.positionProperty );

    // Monitor the state of the 'userControlled' property in order to see when the user drops this thermometer and
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

  energyFormsAndChanges.register( 'ElementFollowingThermometer', ElementFollowingThermometer );

  return inherit( Thermometer, ElementFollowingThermometer, {

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      this.elementFollower.stopFollowing();
      Thermometer.prototype.reset.call( this );
    }
  } );
} );
