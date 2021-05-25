// Copyright 2016-2021, University of Colorado Boulder

/**
 * An object that makes it easy for one model element to follow another one around.  This was originally created to
 * allow the thermometer to stick to the blocks and beaker when they are dragged, though it may have other uses.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class ElementFollower {

  /**
   * @param {Property.<Vector2>} trackedPositionProperty
   */
  constructor( trackedPositionProperty ) {

    // @private {Property.<Vector2>} - position Property of element that will follow another
    this.followerProperty = trackedPositionProperty;

    // @private {Property.<Vector2>|null} - position of the thing being followed, null if not following anything
    this.positionBeingFollowedProperty = null;

    // @private {Vector2} - offset from following position
    this.offset = Vector2.ZERO;

    // @private {function} - function that gets linked/unlinked when the thermometer is following/unfollowing.
    this.followerFunction = position => {
      this.followerProperty.set( position.plus( this.offset ) );
    };
  }

  /**
   * start following the provided Property
   * @param {Property.<Vector2>} positionToFollowProperty - position Property to follow
   * @public
   */
  startFollowing( positionToFollowProperty ) {

    // if this was previously following something else, un-follow it
    if ( this.positionBeingFollowedProperty ) {
      this.positionBeingFollowedProperty.unlink( this.followerFunction );
    }

    // keep track of the offset based on where the following started, allows following from anywhere on element
    this.offset = this.followerProperty.get().minus( positionToFollowProperty.get() );

    // hook up the listener
    positionToFollowProperty.link( this.followerFunction );
    this.positionBeingFollowedProperty = positionToFollowProperty;
  }

  /**
   * @public
   */
  stopFollowing() {
    if ( this.positionBeingFollowedProperty ) {
      this.positionBeingFollowedProperty.unlink( this.followerFunction );
      this.positionBeingFollowedProperty = null;
    }
  }

  /**
   * @public
   * @returns {boolean}
   */
  isFollowing() {
    return this.positionBeingFollowedProperty !== null;
  }

  /**
   * @public
   */
  reset() {
    this.followerProperty.reset();
    this.positionBeingFollowedProperty.reset();
  }
}

energyFormsAndChanges.register( 'ElementFollower', ElementFollower );
export default ElementFollower;
