// Copyright 2002-2015, University of Colorado Boulder

/**
 * Base class for model elements that can be moved around by the user.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ModelElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * {Vector2} initialPosition
   * @constructor
   */
  function UserMovableModelElement( initialPosition ) {

    var self = this;

    ModelElement.call( this );

    this.addProperty( 'userControlled', false );
    this.addProperty( 'position', initialPosition );// Position of the center of the bottom of the block.
    this.addProperty( 'verticalVelocity', 0 ); //Velocity in the up/down direction.

    // Observer that moves this model element if and when the surface that is
    // supporting it moves.
    this.surfaceMotionObserver = function( horizontalSurface ) {
      self.position = new Vector2( horizontalSurface.getCenterX(), horizontalSurface.yPos );
    };

    this.userControlledProperty.link( function( userControlled ) {
      if ( userControlled ) {
        // The user has grabbed this model element, so it is no
        // longer sitting on any surface.
        if ( self.supportingSurfaceProperty !== null ) {
          self.supportingSurfaceProperty.unlink( self.surfaceMotionObserver );
          //TODO change and reinstate;
          //    self.getSupportingSurfaceProperty().value.clearSurface();
          //    self.setSupportingSurfaceProperty( null );
        }
      }
    } );
  }

  return inherit( ModelElement, UserMovableModelElement, {

    reset: function() {
      if ( this.supportingSurfaceProperty !== null ) {
        this.supportingSurfaceProperty.unlink( this.surfaceMotionObserver );
      }
      this.userControlledProperty.reset();
      this.positionProperty.reset();
      this.verticalVelocityProperty.reset();
      //TODO reached for prototype
      this.modelElement.reset();

    },

    /**
     *
     * @param {Property.<HorizontalSurface>} surfaceProperty
     */
    setSupportingSurfaceProperty: function( surfaceProperty ) {
      this.setSupportingSurfaceProperty( surfaceProperty );
      if ( surfaceProperty !== null ) {
        surfaceProperty.link( this.surfaceMotionObserver );
      }
    },

    /**
     *
     * @param {number} x
     */
    setX: function( x ) {
      this.position = new Vector2( x, this.position.y );
    }
  } );
} );


//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//import edu.colorado.phet.common.phetcommon.simsharing.messages.IUserComponent;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//
///**
// * Base class for model elements that can be moved around by the user.
// *
// * @author John Blanco
// */
//public abstract class UserMovableModelElement extends ModelElement {
//
//  public final BooleanProperty userControlled = new BooleanProperty( false );
//
//  // Position of the center of the bottom of the block.
//  public final Property<Vector2D> position;
//
//  // Velocity in the up/down direction.
//  public final Property<Double> verticalVelocity = new Property<Double>( 0.0 );
//
//  // Observer that moves this model element if an when the surface that is
//  // supporting it moves.
//  private final VoidFunction1<HorizontalSurface> surfaceMotionObserver = new VoidFunction1<HorizontalSurface>() {
//    public void apply( final HorizontalSurface horizontalSurface ) {
//      final Vector2D value = new Vector2D( horizontalSurface.getCenterX(), horizontalSurface.yPos );
//      position.set( value );
//    }
//  };
//
//  /**
//   * Constructor.
//   */
//  protected UserMovableModelElement( Vector2D initialPosition ) {
//    position = new Property<Vector2D>( initialPosition );
//    userControlled.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean userControlled ) {
//        if ( userControlled ) {
//          // The user has grabbed this model element, so it is no
//          // longer sitting on any surface.
//          if ( getSupportingSurface() != null ) {
//            getSupportingSurface().removeObserver( surfaceMotionObserver );
//            getSupportingSurface().get().clearSurface();
//            setSupportingSurface( null );
//          }
//        }
//      }
//    } );
//  }
//
//  @Override public void setSupportingSurface( Property<HorizontalSurface> surfaceProperty ) {
//    super.setSupportingSurface( surfaceProperty );
//    if ( surfaceProperty != null ) {
//      surfaceProperty.addObserver( surfaceMotionObserver );
//    }
//  }
//
//  @Override public void reset() {
//    if ( getSupportingSurface() != null ) {
//      getSupportingSurface().removeObserver( surfaceMotionObserver );
//    }
//    userControlled.reset();
//    position.reset();
//    verticalVelocity.reset();
//    super.reset();
//  }
//
//  /**
//   * Get the "user component" identifier.  This supports the sim sharing
//   * feature.
//   *
//   * @return user component identifier.
//   */
//  public abstract IUserComponent getUserComponent();
//
//  public abstract Property<HorizontalSurface> getBottomSurfaceProperty();
//
//  public void setX( final double x ) {
//    position.set( new Vector2D( x, position.y ) );
//  }
//}
