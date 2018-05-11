// Copyright 2014-2018, University of Colorado Boulder

/**
 * base class for model elements that can be moved around by the user
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ModelElement' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * {Vector2} initialPosition
   * @constructor
   */
  function UserMovableModelElement( initialPosition ) {

    var self = this;

    ModelElement.call( this );

    // @public {BooleanProperty}
    this.userControlledProperty = new BooleanProperty( false );

    // @public {Property.<Vector2>}
    this.positionProperty = new Property( initialPosition ); // Position of the center of the bottom of the block.

    // @public {Property.<number>}
    this.verticalVelocityProperty = new Property( 0 );

    // @private - observer that moves this model element if and when the surface that is supporting it moves
    this.surfaceMotionObserver = function( horizontalSurface ) {
      self.positionProperty.value = new Vector2( horizontalSurface.getCenterX(), horizontalSurface.yPos );
    };

    this.userControlledProperty.link( function( userControlled ) {
      if ( userControlled ) {

        // the user has grabbed this model element, so it is no longer sitting on any surface
        if ( self.supportingSurfaceProperty.value !== null ) {
          if ( self.supportingSurfaceProperty.hasListener( self.surfaceMotionObserver ) ) {
            self.supportingSurfaceProperty.unlink( self.surfaceMotionObserver );
          }
          self.getSupportingSurfaceProperty().value.clearSurface();
          self.setSupportingSurface( null );
        }
      }
    } );
  }

  energyFormsAndChanges.register( 'UserMovableModelElement', UserMovableModelElement );

  return inherit( ModelElement, UserMovableModelElement, {

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      if ( this.supportingSurfaceProperty !== null &&
           this.supportingSurfaceProperty.hasListener( this.surfaceMotionObserver ) ) {
        this.supportingSurfaceProperty.unlink( this.surfaceMotionObserver );
      }
      this.userControlledProperty.reset();
      this.positionProperty.reset();
      this.verticalVelocityProperty.reset();
      ModelElement.prototype.reset.call( this );
    },

    /**
     * assign the surface property
     * @param {HorizontalSurface} supportingSurface
     */
    setSupportingSurface: function( supportingSurface ) {

      // TODO: This seems suspicious, since there is no unlink of the supporting surface, but I (jbphet) tried adding
      // one on 5/11/2018 and it didn't work, so I need to revisit after code cleanup is complete.
      this.supportingSurfaceProperty.set( supportingSurface );
      if ( supportingSurface !== null ) {
        supportingSurface.link( this.surfaceMotionObserver );
      }
    }
  } );
} );

