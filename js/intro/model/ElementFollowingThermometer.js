// Copyright 2014-2015, University of Colorado Boulder

/**
 * Class that represents a thermometer that can stick to other elements as they move.
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
   * Constructor for the ElementFollowingThermometer.
   *
   * @param {EnergyFormsAndChangesIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @constructor
   */
  function ElementFollowingThermometer( model, initialPosition, initiallyActive ) {

    // call the supertype
    Thermometer.call( this, model, initialPosition, initiallyActive );

    var self = this;

    this.elementFollower = new ElementFollower( this.positionProperty );

    // Monitor 'userControlled' in order to see when the user drops this
    // thermometer and determine whether or not it was dropped over anything
    // that it should stick to.
    this.userControlledProperty.link( function( userControlled ) {

      // If being dragged, stop following any objects
      if ( userControlled ) {
        self.elementFollower.stopFollowing();
      }

      // If thermometer was dropped, see if it was dropped over something that it should follow.
      else {
        model.getBlockList().forEach( function( block ) {

          // Stick to this block
          if ( block.getProjectedShape().containsPoint( self.positionProperty.value ) ) {
            self.elementFollower.startFollowing( block.positionProperty );
          }
        } );

        // Stick to the beaker
        if ( model.beaker.getThermalContactArea().containsPoint( self.positionProperty.value ) ) {
          self.elementFollower.startFollowing( model.beaker.positionProperty );
        }
      }
    } );
  }

  energyFormsAndChanges.register( 'ElementFollowingThermometer', ElementFollowingThermometer );

  return inherit( Thermometer, ElementFollowingThermometer, {

    reset: function() {
      this.elementFollower.stopFollowing();
      Thermometer.prototype.reset.call( this );
    }
  } );
} );
