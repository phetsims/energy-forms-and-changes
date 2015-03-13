// Copyright 2002-2015, University of Colorado

/**
 * Class that represents a thermometer that can stick to other elements as
 * they move.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Thermometer = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Thermometer' );
  var Vector2 = require( 'DOT/Vector2' );


  //inner class

  function ElementFollower( followerProperty ) {

    var elementFollower = this;
    this.followerProperty = followerProperty;
    this.offset = new Vector2( 0, 0 );
    this.followerFunction = function( location ) {
      elementFollower.followerProperty.set( location.plus( elementFollower.offset ) );
    };

    ElementFollower = inherit( Object, ElementFollower, {
      follow: function( locationToFollow ) {
        if ( locationBeingFollowed !== null ) {
          locationBeingFollowed.link( this.followerFunction );
        }
        var offset = this.follower.minus( locationToFollow.get() );
        locationToFollow.unlink( this.followerFunction );
        locationBeingFollowed = locationToFollow;
      },
      stopFollowing: function() {
        if ( locationBeingFollowed !== null ) {
          locationBeingFollowed.unlink( this.followerFunction );
          locationBeingFollowed = null;
        }
      },
      isFollowing: function() {
        return locationBeingFollowed !== null;
      }
    } );
  }

  /**
   *
   * @param model
   * @param {Vector2} initialPosition
   * @param initiallyActive
   * @constructor
   */
  function ElementFollowingThermometer( model, initialPosition, initiallyActive ) {
    Thermometer.call( this, model, initialPosition, initiallyActive );
    // anything that it should stick to.

    var elementFollower = new ElementFollower( this.positionProperty );

    this.elementFollower = elementFollower;

    var elementFollowingThermometer = this;

//    this.userControlledProperty.link( function( userControlled ) {
//      if ( userControlled ) {
//        // Stop following anything.
//        elementFollower.stopFollowing();
//      }
//      else {
//        // dropped over something that it should follow.
//        model.getBlockList.forEach( function( block ) {
//          if ( block.getProjectedShape().contains( elementFollowingThermometer.positionProperty.get() ) ) {
//            // Stick to this block.
//            elementFollower.follow( block.position );
//          }
//        } );
//        if ( !elementFollower.isFollowing() && model.getBeaker().getThermalContactArea().bounds.contains( position ) ) {
//          // Stick to the beaker.
//          elementFollower.follow( model.getBeaker().position );
//        }
//      }
//    } );
  }


  return inherit( Thermometer, ElementFollowingThermometer, {
    reset: function() {
      this.elementFollower.stopFollowing();
      Thermometer.prototype.reset.call( this );
    }
  } );
} );

