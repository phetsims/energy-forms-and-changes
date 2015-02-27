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
  var Property = require( 'AXON/Property' );
  var PropertySet = require( 'AXON/PropertySet' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Range = require( 'DOT/Range' );
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
        if ( locationBeingFollowed != null ) {
          locationBeingFollowed.link( this.followerFunction );
        }
        var offset = this.follower.minus( locationToFollow.get() );
        locationToFollow.unlink( this.followerFunction );
        locationBeingFollowed = locationToFollow;
      },
      stopFollowing: function() {
        if ( locationBeingFollowed != null ) {
          locationBeingFollowed.unlink( this.followerFunction );
          locationBeingFollowed = null;
        }
      },
      isFollowing: function() {
        return locationBeingFollowed != null;
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
//        if ( !elementFollower.isFollowing() && model.getBeaker().getThermalContactArea().getBounds().contains( position ) ) {
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


//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.energyformsandchanges.common.model.Thermometer;
//
///**
// * Class that represents a thermometer that can stick to other elements as
// * they move.
// *
// * @author John Blanco
// */
//public class ElementFollowingThermometer extends Thermometer {
//
//  private final ElementFollower elementFollower = new ElementFollower( this.position );
//
//  public ElementFollowingThermometer( final EFACIntroModel model, Vector2D initialPosition, boolean initiallyActive ) {
//    super( model.getClock(), model, initialPosition, initiallyActive );
//
//    // Monitor 'userControlled' in order to see when the user drops this
//    // thermometer and determine whether or not it was dropped over
//    // anything that it should stick to.
//    userControlled.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean userControlled ) {
//        if ( userControlled ) {
//          // Stop following anything.
//          elementFollower.stopFollowing();
//        }
//        else {
//          // The user has dropped this thermometer.  See if it was
//          // dropped over something that it should follow.
//          for ( Block block : model.getBlockList() ) {
//            if ( block.getProjectedShape().contains( position ) ) {
//              // Stick to this block.
//              elementFollower.follow( block.position );
//            }
//          }
//          if ( !elementFollower.isFollowing() && model.getBeaker().getThermalContactArea().getBounds().contains( position ) ) {
//            // Stick to the beaker.
//            elementFollower.follow( model.getBeaker().position );
//          }
//        }
//      }
//    } );
//  }
//
//  @Override public void reset() {
//    elementFollower.stopFollowing();
//    super.reset();
//  }
//
//  // Convenience class for sticking to model elements.
//  private static class ElementFollower {
//    private final Property<Vector2D> follower;
//    private Property<Vector2D> locationBeingFollowed = null;
//    private Vector2D offset = new Vector2D( 0, 0 );
//    private final VoidFunction1<Vector2D> followerFunction = new VoidFunction1<Vector2D>() {
//      public void apply( Vector2D location ) {
//        follower.set( location.plus( offset ) );
//      }
//    };
//
//    private ElementFollower( Property<Vector2D> follower ) {
//      this.follower = follower;
//    }
//
//    public void follow( Property<Vector2D> locationToFollow ) {
//      if ( locationBeingFollowed != null ) {
//        locationBeingFollowed.removeObserver( followerFunction );
//      }
//      offset = follower.get().minus( locationToFollow.get() );
//      locationToFollow.addObserver( followerFunction );
//      locationBeingFollowed = locationToFollow;
//    }
//
//    public void stopFollowing() {
//      if ( locationBeingFollowed != null ) {
//        locationBeingFollowed.removeObserver( followerFunction );
//        locationBeingFollowed = null;
//      }
//    }
//
//    public boolean isFollowing() {
//      return locationBeingFollowed != null;
//    }
//  }
//}
