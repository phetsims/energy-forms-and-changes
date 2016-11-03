// Copyright 2016, University of Colorado Boulder

// Note: This file is a mashup of two ported Java files: Carousel and
// EnergySystemElementCarousel. Carousel.java was not ported to avoid confusion
// with the PhET Sun Carousel.js UI component.

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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );
  var Util = require( 'DOT/Util' );

  // Constants
  var TRANSITION_DURATION = 0.5;

  /**
   * Container for containing and managing the position of energy system
   * elements.
   *
   * @param {Vector2} selectedElementPosition Location of currently selected element
   * @param {Vector2} offsetBetweenElements   Offset between elements in the carousel
   * @constructor
   */
  function EnergySystemElementCarousel( selectedElementPosition, offsetBetweenElements ) {

    // Target selected element.  Will be the same as the current selection
    // except when animating to a new selection.  This property is the API for
    // selecting elements in the carousel.
    this.targetIndexProperty = new Property( 0 );

    // Indicator for when animations are in progress, meant to be monitored by
    // clients that need to be aware of this.
    this.animationInProgressProperty = new Property( false );

    // The position in model space where the currently selected element should be.
    this.selectedElementPosition = selectedElementPosition;

    // Offset between elements in the carousel.
    this.offsetBetweenElements = offsetBetweenElements;

    // List of the elements whose position is managed by this carousel.
    this.managedElements = [];

    this.elapsedTransitionTime = 0;

    this.currentCarouselOffset = new Vector2( 0, 0 );

    this.initialCarouselOffset = new Vector2( 0, 0 );

    // Create a handle for use inside callbacks
    var self = this;

    // Monitor our own target setting and set up the variables needed for
    // animation each time the target changes. Use lazyLink to avoid calling
    // this during initialization.
    this.targetIndexProperty.lazyLink( function() {
      // Check bounds
      var i = self.targetIndexProperty.value;
      assert && assert( i === 0 || i < self.managedElements.length, 'targetIndex out of range:' + i );

      self.elapsedTransitionTime = 0;
      self.initialCarouselOffset = self.currentCarouselOffset;
      self.animationInProgressProperty.set( true );
    } );

    // Activate and deactivate energy system elements as they come into
    // the center location. Use lazyLink to avoid calling this during initialization.
    this.animationInProgressProperty.lazyLink( function( animationInProgress ) {
      if ( animationInProgress ) {
        self.managedElements.forEach( function( element ) {
          element.deactivate();
        } );
      }
      else {
        self.getElement( self.targetIndexProperty.value ).activate();
      }
    } );
  }

  energyFormsAndChanges.register( 'EnergySystemElementCarousel', EnergySystemElementCarousel );

  return inherit( Object, EnergySystemElementCarousel, {
    /**
     * Add element to list of managed elements
     *
     * @param {EnergySystemElement} element Element to be added to carousel
     */
    add: function( element ) {

      // Set the element's position to be at the end of the carousel.
      if ( this.managedElements.length === 0 ) {
        element.positionProperty.set( this.selectedElementPosition );
      }
      else {
        var lastElement = this.managedElements[ this.managedElements.length - 1 ];
        element.positionProperty.set( lastElement.positionProperty.value.plus( this.offsetBetweenElements ) );
      }

      // Add element to the list of managed elements.
      this.managedElements.push( element );

      // Update opacities.
      this.updateManagedElementOpacities();
    },

    /**
     * Get element from carousel by index.
     *
     * @param  {number} index Requested position in array of EnergySystemElements
     *
     * @return {EnergySystemElement}
     */
    getElement: function( index ) {
      assert && assert( index < this.managedElements.length, 'Carousel index out of range: ' + index );
      return this.managedElements[ index ];
    },

    /**
     * Get selected element from carousel
     *
     * @return {[type]} Selected element
     */
    getSelectedElement: function() {
      var i = this.targetIndexProperty.get();
      if ( i < this.managedElements.length ) {
        return this.managedElements[ i ];
      }
      return null;
    },

    step: function( dt ) {
      if ( !this.atTargetPosition() ) {
        this.elapsedTransitionTime += dt;
        var targetCarouselOffset = this.offsetBetweenElements.times( -this.targetIndexProperty.get() );
        var totalTravelVector = targetCarouselOffset.minus( this.initialCarouselOffset );
        var elapsedFraction = Util.clamp( this.elapsedTransitionTime / TRANSITION_DURATION, 0, 1 );
        this.currentCarouselOffset =
          this.initialCarouselOffset.plus( totalTravelVector.times( this.computeSlowInSlowOut( elapsedFraction ) ) );
        this.updateManagedElementPositions();

        if ( elapsedFraction === 1 ) {
          this.currentCarouselOffset = targetCarouselOffset;
        }

        if ( this.currentCarouselOffset === targetCarouselOffset ) {
          this.animationInProgressProperty.set( false );
        }
        this.updateManagedElementOpacities();
      }
    },

    updateManagedElementPositions: function() {
      for ( var i = 0; i < this.managedElements.length; i++ ) {
        var position = this.selectedElementPosition.plus( this.offsetBetweenElements.times( i ) );
        position = position.plus( this.currentCarouselOffset );
        this.managedElements[ i ].positionProperty.set( position );
      }
    },

    updateManagedElementOpacities: function() {
      var self = this;
      this.managedElements.forEach( function( managedElement ) {
        var distanceToSelection = managedElement.positionProperty.value.distance( self.selectedElementPosition );
        var opacity = Util.clamp( 1 - ( distanceToSelection / self.offsetBetweenElements.magnitude() ), 0, 1 );
        managedElement.opacityProperty.set( opacity );
      } );
    },

    atTargetPosition: function() {
      var targetCarouselOffset = this.offsetBetweenElements.times( -this.targetIndexProperty.value );
      return this.currentCarouselOffset.equals( targetCarouselOffset );
    },

    computeSlowInSlowOut: function( zeroToOne ) {
      if ( zeroToOne < 0.5 ) {
        return 2.0 * zeroToOne * zeroToOne;
      }
      else {
        var complement = 1.0 - zeroToOne;
        return 1.0 - 2.0 * complement * complement;
      }
    },

    reset: function() {
      this.targetIndexProperty.reset();
      this.animationInProgressProperty.reset();
    }

  } );
} );
