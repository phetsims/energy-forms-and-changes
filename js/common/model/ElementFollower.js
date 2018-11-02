// Copyright 2016-2018, University of Colorado Boulder

/**
 * An object that makes it easy for one model element to follow another one around.  This was originally created to
 * allow the thermometer to stick to the blocks and beaker when they are dragged, though it may have other uses.
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
   * @param {Property<Vector2>} trackedPositionProperty
   * @constructor
   */
  function ElementFollower( trackedPositionProperty ) {

    var self = this;

    // @private {Property<Vector2>} - position property of element that will follow another
    this.followerProperty = trackedPositionProperty;

    // @private {Property<Vector2>|null} - location of the thing being followed, null if not following anything
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
     * start following the provided property
     * @param {Property<Vector2>} locationToFollowProperty - location Property to follow
     * @public
     */
    startFollowing: function( locationToFollowProperty ) {

      // if this was previously following something else, un-follow it
      if ( this.locationBeingFollowedProperty ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
      }

      // keep track of the offset based on where the following started, allows following from anywhere on element
      this.offset = this.followerProperty.get().minus( locationToFollowProperty.get() );

      // hook up the listener
      locationToFollowProperty.link( this.followerFunction );
      this.locationBeingFollowedProperty = locationToFollowProperty;
    },

    /**
     * @public
     */
    stopFollowing: function() {
      if ( this.locationBeingFollowedProperty ) {
        this.locationBeingFollowedProperty.unlink( this.followerFunction );
        this.locationBeingFollowedProperty = null;
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

