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

  /**
   * Convenience class for sticking to model elements.
   *
   * @param {Property<Vector2>} trackedPositionProperty
   * @constructor
   */
  function ElementFollower( trackedPositionProperty ) {

    // Position of element-following object
    this.followerProperty = trackedPositionProperty;
    this.locationBeingFollowedProperty = null; // Property<Vector2> when following something; otherwise null

    this.offset = Vector2.ZERO;

    var self = this;
    // @private - function that gets linked/unlinked when the thermometer is following/unfollowing.
    this.followerFunction = function( location ) {
      self.followerProperty.set( location.plus( self.offset ) );
    };
  }

  energyFormsAndChanges.register( 'ElementFollower', ElementFollower );

  return inherit( Object, ElementFollower, {

    startFollowing: function( locationToFollowProperty ) {
      if ( this.locationBeingFollowedProperty && this.locationBeingFollowedProperty.hasListener( this.followerFunction ) ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
      }
      this.offset = this.followerProperty.get().minus( locationToFollowProperty.get() );
      locationToFollowProperty.link( this.followerFunction );
      this.locationBeingFollowedProperty = locationToFollowProperty;
    },

    stopFollowing: function() {
      if ( this.locationBeingFollowedProperty ) {
        if ( this.locationBeingFollowedProperty.hasListener( this.followerFunction ) ) {
          this.locationBeingFollowedProperty.unlink( this.followerFunction );
        }
        this.locationBeingFollowed = null;
      }
    },

    isFollowing: function() {
      return this.locationBeingFollowed !== null;
    },

    reset: function() {
      this.followerProperty.reset();
      this.locationBeingFollowedProperty.reset();
    }

  } );
} );

