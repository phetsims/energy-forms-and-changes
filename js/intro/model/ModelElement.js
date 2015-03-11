// Copyright 2002-2015, University of Colorado Boulder

/**
 * Base class for all model elements in this module.  At the time of this
 * writing, this includes blocks, beakers, burners, and thermometers.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   *
   * @constructor
   */
  function ModelElement() {

    PropertySet.call( this, {
      // Surface upon which this model element is resting.  Null if the element
      // is floating in the air (which is perfectly legitimate for some Model Element)
      supportingSurface: null, // {HorizontalSurface}
      topSurface: null, //  {HorizontalSurface}
      bottomSurface: null // {HorizontalSurface}
    } );
  }

  return inherit( PropertySet, ModelElement, {

    /**
     * Set the surface upon which this model element is resting.
     * @public
     * @param {HorizontalSurface} surfaceProperty
     */
    setSupportingSurfaceProperty: function( surfaceProperty ) {
      this.supportingSurfaceProperty = surfaceProperty;
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
     * @public
     * @param {ModelElement} element -  Model element to be checked.
     * @returns {boolean}  true if the given element is stacked anywhere on top of this one, which includes
     * cases where one or more elements are in between.
     */
    isStackedUpon: function( element ) {
      return (this.supportingSurfaceProperty !== null) &&
             ( this.supportingSurface.getOwner() === element ||
               this.supportingSurface.getOwner().isStackedUpon( element ) );
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
        this.supportingSurface.clearSurface();
        this.supportingSurfaceProperty.reset();
      }
    }
  } );


} );


//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import edu.colorado.phet.common.phetcommon.model.property.ObservableProperty;
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//
///**
// * Base class for all model elements in this module.  At the time of this
// * writing, this includes blocks, beakers, burners, and thermometers.
// *
// * @author John Blanco
// */
//public abstract class ModelElement {
//
//  // Surface upon which this model element is resting.  Null if the element
//  // is floating in the air (which is perfectly legitimate for some
//  private Property<HorizontalSurface> supportingSurface = null;
//
//  /**
//   * Get the top surface of this model element.  Only model elements that can
//   * support other elements on top of them have top surfaces.
//   *
//   * @return The top surface of this model element, null if this element can
//   *         not have other elements on top of it.
//   */
//  public Property<HorizontalSurface> getTopSurfaceProperty() {
//    // Defaults to null, override as needed.
//    return null;
//  }
//
//  /**
//   * Get the bottom surface of this model element.  Only model elements that
//   * can rest on top of other model elements have bottom surfaces.
//   *
//   * @return The bottom surface of this model element, null if this element
//   *         never rests upon other model elements.
//   */
//  public Property<HorizontalSurface> getBottomSurfaceProperty() {
//    // Defaults to null, override as needed.
//    return null;
//  }
//
//  /**
//   * Get the surface upon which this model element is resting, if there is
//   * one.
//   *
//   * @return Surface upon which this element is resting, null if there is
//   *         none.
//   */
//  public ObservableProperty<HorizontalSurface> getSupportingSurface() {
//    return supportingSurface;
//  }
//
//  /*
//   * Set the surface upon which this model element is resting.
//   */
//  public void setSupportingSurface( Property<HorizontalSurface> surfaceProperty ) {
//    supportingSurface = surfaceProperty;
//  }
//
//  /**
//   * @param element Model element to be checked.
//   * @return true if the given element is stacked anywhere on top of this
//   *         one, which includes cases where one or more elements are in between.
//   */
//  public boolean isStackedUpon( ModelElement element ) {
//    return getSupportingSurface() != null && ( getSupportingSurface().get().getOwner() == element || getSupportingSurface().get().getOwner().isStackedUpon( element ) );
//  }
//
//  /**
//   * Reset the model element to its original state.  Subclasses must add
//   * reset functionality for any state that they add.
//   */
//  public void reset() {
//    if ( supportingSurface != null ) {
//      supportingSurface.removeAllObservers();
//      supportingSurface.get().clearSurface();
//      supportingSurface = null;
//    }
//  }
//}
