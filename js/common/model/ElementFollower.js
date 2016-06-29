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
   * @param {Vector2 || null} initialPositionToTrack
   * @constructor
   */
  function ElementFollower( initialPositionToTrack ) {

    PropertySet.call( this, {
      follower: initialPositionToTrack === null ? new Vector2( 0, 0 ) : initialPositionToTrack,
      locationBeingFollowed: null
    } );
    this.offset = new Vector2( 0, 0 );

    var self = this;
    // @private - function that gets linked/unlinked when the thermometer is following/unfollwing.
    this.followerFunction = function( location ) {
      // self.followerProperty.set( location.plus( self.offset ) );
      self.followerProperty.set( location );
      console.log(location, self.followerProperty.get());
    };
  }

  energyFormsAndChanges.register( 'ElementFollower', ElementFollower );

  return inherit( PropertySet, ElementFollower, {

    follow: function( locationToFollowProperty ) {
      if ( this.locationBeingFollowedProperty.get() !== null ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
      }
      this.offset = this.followerProperty.get().minus( locationToFollowProperty.get() );
      locationToFollowProperty.link( this.followerFunction );
      this.locationBeingFollowedProperty.set( locationToFollowProperty.get() );
    },

    stopFollowing: function() {
      if ( this.locationBeingFollowedProperty.get() !== null ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
        this.locationBeingFollowedProperty.set( null );
      }
    },

    isFollowing: function() {
      return this.locationBeingFollowedProperty.get() !== null;
    }

  } );
} );

