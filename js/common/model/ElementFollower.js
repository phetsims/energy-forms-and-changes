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
  var Property = require( 'AXON/Property' );

  /**
   * Convenience class for sticking to model elements.
   *
   * @param {Vector2 || null} initialPositionToTrack
   * @constructor
   */
  function ElementFollower( initialPositionToTrack ) {

    this.followerProperty = new Property( initialPositionToTrack === null ? Vector2.ZERO : initialPositionToTrack );
    this.locationBeingFollowedProperty = new Property( null );

    this.offset = Vector2.ZERO;

    var self = this;
    // @private - function that gets linked/unlinked when the thermometer is following/unfollwing.
    this.followerFunction = function( location ) {
      // self.followerProperty.set( location.plus( self.offset ) );
      self.followerProperty.set( location );
      console.log(location, self.followerProperty.get());
    };
  }

  energyFormsAndChanges.register( 'ElementFollower', ElementFollower );

  return inherit( Object, ElementFollower, {

    follow: function( locationToFollowProperty ) {
      if ( this.locationBeingFollowedProperty.get() !== null ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
      }
      this.offset = this.followerProperty.get().minus( locationToFollowProperty.get() );
      console.log(this.offset);
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
    },

    reset: function() {
      this.followerProperty.reset();
      this.locationBeingFollowedProperty.reset();
    }

  } );
} );

