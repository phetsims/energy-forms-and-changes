// Copyright 2014-2017, University of Colorado Boulder

/**
 * Base class for all model elements in the Energy Forms and Changes simulation that can be moved around by the user.
 * At the time of this writing, this includes blocks, beakers, burners, and thermometers.
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * @constructor
   */
  function ModelElement() {

    // @public {Property<HorizontalSurface>} - The surface upon which this model element is resting.  This is null if
    // the element is floating in the air, which is perfectly legitimate in some cases for some model elements.
    this.supportingSurfaceProperty = new Property( null );

    // @protected {Property<HorizontalSurface>} - The top surface of this model element, the value will be null if other
    // elements can't rest upon the surface.  This is updated with a new value when the model element is moved.
    this.topSurfaceProperty = new Property( null );

    // @protected {Property<HorizontalSurface>} - The bottom surface of this model element, the value will be null if
    // this model element can't rest on another surface.
    this.bottomSurfaceProperty = new Property( null );
  }

  energyFormsAndChanges.register( 'ModelElement', ModelElement );

  return inherit( Object, ModelElement, {

    // TODO: Consider making these properties set directly instead of through methods when the port is nearly complete.

    /**
     * set the surface upon which this model element is resting
     * @public
     * @param {HorizontalSurface} surface
     */
    setSupportingSurface: function( surface ) {
      this.supportingSurfaceProperty.set( surface );
    },

    /**
     * @public read-only
     * @returns {Property.<HorizontalSurface>}
     */
    getSupportingSurfaceProperty: function() {
      return this.supportingSurfaceProperty;
    },

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
     * get a value that indicates whether this element is stacked upon the given model element
     * @param {ModelElement} element - model element to be checked
     * @returns {boolean} - true if this model element is stacked anywhere on top of the provided element, which
     * includes cases where one or more elements are in between.
     * @public
     */
    isStackedUpon: function( element ) {
      var surface = this.supportingSurfaceProperty.get();
      return ( surface !== null ) &&
        ( surface.getOwner() === element || surface.getOwner().isStackedUpon( element ) );
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
