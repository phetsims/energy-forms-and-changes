// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base class for all model elements in this module.  At the time of this
 * writing, this includes blocks, beakers, burners, and thermometers.
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
   *
   * @constructor
   */
  function ModelElement() {

    // Surface upon which this model element is resting.  Null if the element
    // is floating in the air (which is perfectly legitimate for some Model Element)

    // These properties will have a HorizontalSurface type parameter
    this.supportingSurfaceProperty = new Property( null );
    this.topSurfaceProperty = new Property( null );
    this.bottomSurfaceProperty = new Property( null );

    // PropertySet.call( this, {
    //   supportingSurface: null, // {HorizontalSurface}
    //   topSurface: null, //  {HorizontalSurface}
    //   bottomSurface: null // {HorizontalSurface}
    // } );
  }

  energyFormsAndChanges.register( 'ModelElement', ModelElement );

  return inherit( Object, ModelElement, {

    /**
     * Set the surface upon which this model element is resting.
     * @public
     * @param {HorizontalSurface} surface
     */
    setSupportingSurfaceProperty: function( surface ) {
      this.supportingSurface = surface;
    },

    /**
     * @public read-only
     * @returns {Property.<HorizontalSurface>}
     */
    getSupportingSurfaceProperty: function() {
      return this.supportingSurfaceProperty;
    },

    /**
     * Get the bottom surface of this model element.  Only model elements that
     * can rest on top of other model elements have bottom surfaces.
     *
     * @public read-only
     * @returns {Property.<HorizontalSurface>} The bottom surface of this model element, null if this element never rests upon other model elements.
     */
    getBottomSurfaceProperty: function() {
      return this.bottomSurfaceProperty;
    },

    /**
     * @public read-only
     * @returns {Property.<HorizontalSurface>} Surface upon which this element is resting, null if there is none.
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * Get a value that indicates whether this element is stacked upon the given model element.
     *
     * @public
     * @param {ModelElement} element -  Model element to be checked.
     * @returns {boolean}  true if the given element is stacked anywhere on top of this one, which includes cases where
     * one or more elements are in between.
     */
    isStackedUpon: function( element ) {
      var surface = this.supportingSurfaceProperty.value;
      return ( surface !== null ) &&
        ( surface.getOwner() === element || surface.getOwner().isStackedUpon( element ) );
    },

    /**
     * Reset the model element to its original state.  Subclasses must add
     * reset functionality for any state that they add.
     * @public
     */
    reset: function() {
      if ( this.supportingSurfaceProperty !== null ) {
        // TODO: the next line was in the java code but we dont' think it is needed (JB)
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
