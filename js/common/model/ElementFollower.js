// Copyright 2016-2019, University of Colorado Boulder

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
   * @param {Property<Vector2>} trackedPositionProperty
   */
  constructor( trackedPositionProperty ) {

    // @private {Property<Vector2>} - position Property of element that will follow another
    this.followerProperty = trackedPositionProperty;

    // @private {Property<Vector2>|null} - location of the thing being followed, null if not following anything
    this.locationBeingFollowedProperty = null;

    // @private {Vector2} - offset from following position
    this.offset = Vector2.ZERO;

    // @private {function} - function that gets linked/unlinked when the thermometer is following/unfollowing.
    this.followerFunction = location => {
      this.followerProperty.set( location.plus( this.offset ) );
    };
  }

  /**
   * start following the provided Property
   * @param {Property<Vector2>} locationToFollowProperty - location Property to follow
   * @public
   */
  startFollowing( locationToFollowProperty ) {

    // if this was previously following something else, un-follow it
    if ( this.locationBeingFollowedProperty ) {
      this.locationBeingFollowedProperty.unlink( this.followerFunction );
    }

    // keep track of the offset based on where the following started, allows following from anywhere on element
    this.offset = this.followerProperty.get().minus( locationToFollowProperty.get() );

    // hook up the listener
    locationToFollowProperty.link( this.followerFunction );
    this.locationBeingFollowedProperty = locationToFollowProperty;
  }

  /**
   * @public
   */
  stopFollowing() {
    if ( this.locationBeingFollowedProperty ) {
      this.locationBeingFollowedProperty.unlink( this.followerFunction );
      this.locationBeingFollowedProperty = null;
    }
  }

  /**
   * @public
   * @returns {boolean}
   */
  isFollowing() {
    return this.locationBeingFollowedProperty !== null;
  }

  /**
   * @public
   */
  reset() {
    this.followerProperty.reset();
    this.locationBeingFollowedProperty.reset();
  }
}

energyFormsAndChanges.register( 'ElementFollower', ElementFollower );
export default ElementFollower;