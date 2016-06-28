// Copyright 2016, University of Colorado Boulder

/**
 * Convenience class for sticking to model elements.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * Convenience class for sticking to model elements.
   *
   * @param {Vector2 || null} follower
   * @constructor
   */
  function ElementFollower( follower ) {

    PropertySet.call( this, {
      follower: follower === null ? new Vector2( 0, 0 ) : follower,
      locationBeingFollowed: null
    } );
    this.offset = new Vector2( 0, 0 );

    var thisThermometer = this;
    // @private - function that gets linked/unlinked when the thermometer is following/unfollwing.
    this.followerFunction = function( location ) {
      thisThermometer.follower = location.plus( thisThermometer.offset );
    };
  }

  energyFormsAndChanges.register( 'ElementFollower', ElementFollower );

  return inherit( PropertySet, ElementFollower, {

    follow: function( locationToFollowProperty ) {
      var thisThermometer = this;
      if ( this.locationBeingFollowed !== null ) {
        this.locationBeingFollowed.unlink( thisThermometer.followerFunction );
      }
      this.offset = this.follower.minus( locationToFollowProperty.get() );
      locationToFollowProperty.link( thisThermometer.followerFunction );
      this.locationBeingFollowed = locationToFollowProperty.get();
    },

    stopFollowing: function() {
      var thisThermometer = this;
      if ( this.locationBeingFollowed !== null ) {
        this.locationBeingFollowedProperty.unlink( thisThermometer.followerFunction );
        this.locationBeingFollowed = null;
      }
    },

    isFollowing: function() {
      return this.locationBeingFollowed !== null;
    }

  } );
} );

