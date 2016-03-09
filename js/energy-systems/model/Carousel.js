// Copyright 2016, University of Colorado Boulder

/**
 * This class implements a container of sorts for positionable model elements.
 * The model elements are positioned by this class, and an API is provided
 * that allows clients to move elements to the "selected" position.  Changes
 * to the selected element are animated.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // Modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  // var TRANSITION_DURATION = 0.5; // Comment until used

  /**
   * Carousel class
   * Container for positionable model elements
   *
   * @param {Vector2} selectedElementPosition Location of currently selected element
   * @param {Vector2} offsetBetweenElements   Offset between elements in the carousel
   * @constructor
   */
  function Carousel( selectedElementPosition, offsetBetweenElements ) {

    PropertySet.call( this, {
      // Target selected element.  Will be the same as the current selection
      // except when animating to a new selection.  This property is the API for
      // selecting elements in the carousel.
      targetIndex: 0,

      // Indicator for when animations are in progress, meant to be monitored by
      // clients that need to be aware of this.
      animationInProgress: false
    } );

    // The position in model space where the currently selected element should be.
    this.selectedElementPosition = selectedElementPosition;

    // Offset between elements in the carousel.
    this.offsetBetweenElements = offsetBetweenElements;

    // List of the elements whose position is managed by this carousel.
    this.managedElements = new Array();

    this.elapsedTransitionTime = 0;

    this.currentCarouselOffset = new Vector2( 0, 0 );

    this.carouselOffsetWhenTransitionStarted = new Vector2( 0, 0 );

    // Monitor our own target setting and set up the variables needed for
    // animation each time the target changes.
    var thisCarousel = this;
    this.targetIndexProperty.link( function() {
      // Check bounds
      var i = thisCarousel.targetIndexProperty.get();
      assert && assert( i === 0 || i < thisCarousel.managedElements.size() );

      thisCarousel.elapsedTransitionTime = 0;
      thisCarousel.carouselOffsetWhenTransitionStarted = this.currentCarouselOffset;
      this.animationInProgressProperty.set( true );
    } );

  }

  return inherit( PropertySet, Carousel, {
    /**
     * Add element to list of managed elements
     *
     * @param {EnergySystemElement} element Element to be added to carousel
     */
    add: function( element ) {

      // Set the element's position to be at the end of the carousel.
      if ( this.managedElements.length === 0 ) {
        element.setPosition( this.selectedElementPosition );
      } else {
        var lastElement = this.managedElements[ this.managedElements.length - 1 ];
        element.setPosition( lastElement.getPosition().plus( this.offsetBetweenElements ) );
      }

      // Add element to the list of managed elements.
      this.managedElements.add( element );

      // Update opacities.
      this.updateManagedElementOpacities();
    },

    /**
     * Get element from carousel by index.
     *
     * @param  {Number} index Requested position in array of EnergySystemElements
     *
     * @return {EnergySystemElement}
     */
    getElement: function( index ) {
      if ( index <= this.managedElements.length ) {
        return this.managedElements[ index ];
      } else {
        console.error( 'Requesting out of range element from carousel, index = ' + index );
        return null;
      }
    },

    getSelectedElement: function() {
      var i = this.targetIndexProperty.get();
      if ( i < this.managedElements.length ) {
        return this.managedElements[ i ];
      }
      return null;
    },

    stepInTime: function( dt ) {
      // TODO
    },

    updateManagedElementPositions: function() {
      // TODO
    },

    updateManagedElementOpacities: function() {
      // TODO
    },

    atTargetPosition: function() {
      // TODO
    },

    computeSlowInSlowOut: function( zeroToOne ) {
      // TODO
    }
  } );
} );
