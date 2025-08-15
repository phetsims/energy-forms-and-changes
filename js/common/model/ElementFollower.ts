// Copyright 2016-2024, University of Colorado Boulder

/**
 * An object that makes it easy for one model element to follow another one around.  This was originally created to
 * allow the thermometer to stick to the blocks and beaker when they are dragged, though it may have other uses.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class ElementFollower {

  // Position Property of element that will follow another
  private readonly followerProperty: Property<Vector2>;

  // Position of the thing being followed, null if not following anything
  private positionBeingFollowedProperty: Property<Vector2> | null;

  // Offset from following position
  private offset: Vector2;

  // Function that gets linked/unlinked when the thermometer is following/unfollowing
  private readonly followerFunction: ( position: Vector2 ) => void;

  public constructor( trackedPositionProperty: Property<Vector2> ) {

    this.followerProperty = trackedPositionProperty;

    this.positionBeingFollowedProperty = null;

    this.offset = Vector2.ZERO;

    this.followerFunction = position => {
      this.followerProperty.set( position.plus( this.offset ) );
    };
  }

  /**
   * start following the provided Property
   * @param positionToFollowProperty - position Property to follow
   */
  public startFollowing( positionToFollowProperty: Property<Vector2> ): void {

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

  public stopFollowing(): void {
    if ( this.positionBeingFollowedProperty ) {
      this.positionBeingFollowedProperty.unlink( this.followerFunction );
      this.positionBeingFollowedProperty = null;
    }
  }

  public isFollowing(): boolean {
    return this.positionBeingFollowedProperty !== null;
  }

  public reset(): void {
    this.followerProperty.reset();
    this.positionBeingFollowedProperty!.reset();
  }
}

energyFormsAndChanges.register( 'ElementFollower', ElementFollower );
export default ElementFollower;