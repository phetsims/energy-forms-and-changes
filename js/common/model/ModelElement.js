// Copyright 2014-2018, University of Colorado Boulder

/**
 * Base class for all model elements in the Energy Forms and Changes simulation that can be moved around by the user.
 * At the time of this writing, this includes blocks, beakers, burners, and thermometers.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {Vector2} initialPosition
   * @constructor
   */
  function ModelElement( initialPosition ) {

    // @public {Property.<Vector2>} - position of the center bottom of this model element
    this.positionProperty = new Property( initialPosition );

    // @public {Property<HorizontalSurface>|null} - The top surface of this model element, the enclosed value will be
    // null if other elements can't rest upon the surface.  This is updated when the model element is moved.
    this.topSurfaceProperty = new Property( null );

    // @protected {Property<HorizontalSurface|null>} - The bottom surface of this model element, the value will be null if
    // this model element can't rest on another surface.
    this.bottomSurfaceProperty = new Property( null );

    // @public {Shape} - shape used for checking if this model element can be moved into a given position, must be set
    // in subtypes
    this.positionValidationShape = null;
  }

  energyFormsAndChanges.register( 'ModelElement', ModelElement );

  return inherit( Object, ModelElement, {

    get position() {
      return this.positionProperty.get();
    },
    set position( newPosition ) {
      this.positionProperty.set( newPosition );
    },

    // TODO: Consider making these properties set directly instead of through methods when the port is nearly complete.

    /**
     * Get the bottom surface of this model element.  Only model elements that can rest on top of other model elements
     * have bottom surfaces.
     * @public read-only
     * @returns {Property.<HorizontalSurface|null>} The bottom surface of this model element, null if this element never
     * rests upon other model elements.
     */
    getBottomSurfaceProperty: function() {
      return this.bottomSurfaceProperty;
    },

    /**
     * @returns {Property.<HorizontalSurface|null>} Surface upon which this element is resting, null if there is none.
     * @public
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * method to test whether this element is stacked upon another, always false for non-movable model elements,
     * override as needed in descendant types
     * @param {ModelElement} element - model element to be checked
     * @return {boolean}
     * @public
     */
    isStackedUpon: function( element ) {
      return false;
    },

    /**
     * Reset the model element to its original state.  Subclasses must add reset functionality for any state that they
     * add.
     * @public
     */
    reset: function() {
      if ( this.supportingSurfaceProperty !== null ) {
        // TODO: the next line was in the java code but I (jbphet) am not sure what if anything is needed here
        //        this.supportingSurfaceProperty.removeAllObservers();
        // TODO: Re-test this once supporting surfaces have been added to the model elements!
        //this.supportingSurface.clearSurface();
        this.supportingSurfaceProperty.reset();
      }
      if ( this.topSurfaceProperty !== null ) {
        this.topSurfaceProperty.reset();
      }
      if ( this.bottomSurfaceProperty !== null ) {
        this.bottomSurfaceProperty.reset();
      }
    }
  } );
} );
