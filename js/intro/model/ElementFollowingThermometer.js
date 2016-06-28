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

    // extend the scope of this
    var thisElementFollowingThermometer = this;

    this.elementFollower = new ElementFollower( this.position );

    // Monitor 'userControlled' in order to see when the user drops this thermometer and determine whether or not it was dropped over anything that
    // it should stick to.
    this.userControlledProperty.link( function( userControlled ) {
      if ( userControlled ) {
        // stop following anything.
        thisElementFollowingThermometer.elementFollower.stopFollowing();
      } else {
        // The user has dropped this thermometer. See if it was dropped over something that it should follow.
        for ( var block in model.getBlockList() ) {
          if ( model.getBlockList.hasOwnProperty( block ) ) {
            if ( block.getProjectedShape().containsPoint( thisElementFollowingThermometer.position ) ) {
              // stick to this block.
              thisElementFollowingThermometer.elementFollower.follow( block.positionProperty );
            }
          }
        }
        if ( !thisElementFollowingThermometer.elementFollower.isFollowing() && model.beaker.getThermalContactArea().containsPoint( thisElementFollowingThermometer.position ) ) {
          // Stick to the beaker.
          thisElementFollowingThermometer.elementFollower.follow( model.beaker.positionProperty );
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

