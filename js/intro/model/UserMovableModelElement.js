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

  /**
   * {Vector2} initialPosition
   * @constructor
   */
  function UserMovableModelElement( initialPosition ) {

    var self = this;

    ModelElement.call( this, initialPosition );

    // @public {BooleanProperty}
    this.userControlledProperty = new BooleanProperty( false );

    // @protected {HorizontalSurface|null} - The surface upon which this model element is resting.  This is null if the
    // element is not resting on a movable surface.  This should only be set through the getter/setter methods below.
    this.supportingSurface = null;

    // @public {Property.<number>}
    this.verticalVelocityProperty = new Property( 0 );

    // update internal state when the user picks up this model element
    this.userControlledProperty.link( function( userControlled ) {
      if ( userControlled ) {

        // the user has picked up this model element, so it is no longer sitting on any surface
        self.clearSupportingSurface();
      }
    } );

    // @private - observer that moves this model element if and when the surface that is supporting it moves
    this.surfaceMotionObserver = function( position ) {
      self.positionProperty.value = position;
    };
  }

  energyFormsAndChanges.register( 'UserMovableModelElement', UserMovableModelElement );

  return inherit( ModelElement, UserMovableModelElement, {

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      this.clearSupportingSurface();
      this.userControlledProperty.reset();
      this.verticalVelocityProperty.reset();
      ModelElement.prototype.reset.call( this );
    },

    /**
     * Set the supporting surface of this model element
     * @param {HorizontalSurface} supportingSurface
     * @override
     * @public
     */
    setSupportingSurface: function( supportingSurface ) {

      // state and parameter checking
      assert && assert(
        supportingSurface !== null,
        'this method should not be used to clear the supporting surface'
      );
      assert && assert(
        this.supportingSurface === null,
        'a supporting surface was already set'
      );

      supportingSurface.positionProperty.link( this.surfaceMotionObserver );
      this.supportingSurface = supportingSurface;
    },

    /**
     * clear the supporting surface so that this model element is no longer sitting on a surface
     * @public TODO: Check this visibility when sim dev is closer to completion
     */
    clearSupportingSurface: function() {

      // only do something if the supporting surface was set
      if ( this.supportingSurface !== null ) {
        this.supportingSurface.positionProperty.unlink( this.surfaceMotionObserver );
        this.supportingSurface.clearSurface();
        this.supportingSurface = null;
      }
    },

    /**
     * get a value that indicates whether this element is stacked upon the given model element
     * @param {ModelElement} element - model element to be checked
     * @returns {boolean} - true if this model element is stacked anywhere on top of the provided element, which
     * includes cases where one or more elements are in between.
     * @public
     * @override
     */
    isStackedUpon: function( element ) {
      var surface = this.supportingSurface ? this.supportingSurface : null;
      return ( surface !== null ) && ( surface.getOwner() === element || surface.getOwner().isStackedUpon( element ) );
    }

  } );
} );

