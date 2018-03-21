// Copyright 2016-2017, University of Colorado Boulder

/**
 * An object that makes it easy for one model element to follow another one around.  This was originally created to
 * allow the thermometer to stick to the blocks and beaker when they are dragged, though it may have other uses.
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
   * @param {Property<Vector2>} trackedPositionProperty
   * @constructor
   */
  function ElementFollower( trackedPositionProperty ) {

    var self = this;

    // @private {Property<Vector2>} - position property of element that will follow another
    this.followerProperty = trackedPositionProperty;

    // @private {Property<Vector2>|null} - location of the thing being followed
    this.locationBeingFollowedProperty = null;

    // @private {Vector2} - offset from following position
    this.offset = Vector2.ZERO;

    // @private {function} - function that gets linked/unlinked when the thermometer is following/unfollowing.
    this.followerFunction = function( location ) {
      self.followerProperty.set( location.plus( self.offset ) );
    };
  }

  energyFormsAndChanges.register( 'ElementFollower', ElementFollower );

  return inherit( Object, ElementFollower, {

    /**
     * @param {Property<Vector2>} - locationToFollowProperty
     * @public
     */
    startFollowing: function( locationToFollowProperty ) {
      if ( this.locationBeingFollowedProperty && this.locationBeingFollowedProperty.hasListener( this.followerFunction ) ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
      }
      this.offset = this.followerProperty.get().minus( locationToFollowProperty.get() );
      locationToFollowProperty.link( this.followerFunction );
      this.locationBeingFollowedProperty = locationToFollowProperty;
    },

    /**
     * @public
     */
    stopFollowing: function() {
      if ( this.locationBeingFollowedProperty ) {
        if ( this.locationBeingFollowedProperty.hasListener( this.followerFunction ) ) {
          this.locationBeingFollowedProperty.unlink( this.followerFunction );
        }
        this.locationBeingFollowed = null;
      }
    },

    /**
     * @public
     * @return {boolean}
     */
    isFollowing: function() {
      return this.locationBeingFollowed !== null;
    },

    /**
     * @public
     */
    reset: function() {
      this.followerProperty.reset();
      this.locationBeingFollowedProperty.reset();
    }

  } );
} );

