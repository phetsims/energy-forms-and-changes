// Copyright 2016-2018, University of Colorado Boulder

// Note: This file is a mashup of two ported Java files: Carousel and
// EnergySystemElementCarousel. Carousel.java was not ported to avoid confusion
// with the PhET Sun Carousel.js UI component.

/**
 * This type implements a model-based carousel for positionable model elements. Model elements are positioned based
 * on the current selection, and an API is provided that allows clients to change those selection. Changes to the
 * selected element are animated.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var Easing = require( 'TWIXT/Easing' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var TRANSITION_DURATION = 0.75;

  /**
   * @param {Vector2} selectedElementPosition - location were the selected model element should
   * @param {Vector2} offsetBetweenElements   Offset between elements in the carousel
   * @constructor
   */
  function EnergySystemElementCarousel( selectedElementPosition, offsetBetweenElements ) {

    var self = this;

    // @public (read-only) {NumberProperty} - indicates which element on the carousel is currently selected
    this.targetIndexProperty = new NumberProperty( 0 );

    // @public (read-only) {BooleanProperty} - a flag indicating whether or not an animation from one carousel position
    // to another is in progress
    this.animationInProgressProperty = new BooleanProperty( false );

    // @public (read-only) {Vector2} - the position in model space where the currently selected element should be
    this.selectedElementPosition = selectedElementPosition;

    // @private {Vector2} - the offset between elements whose position is managed by this carousel
    this.offsetBetweenElements = offsetBetweenElements;

    // @public (read-only) {EnergySystemElement[]} - list of the elements whose position is managed by this carousel
    this.managedElements = [];

    // @private - variables needed to manage carousel transitions
    this.elapsedTransitionTime = 0;
    this.currentCarouselOffset = new Vector2( 0, 0 );
    this.initialCarouselOffset = new Vector2( 0, 0 );

    // monitor the target setting and set up the variables needed for animation each time the target changes
    this.targetIndexProperty.lazyLink( function() {

      // check bounds
      var target = self.targetIndexProperty.value;
      assert && assert( target === 0 || target < self.managedElements.length, 'targetIndex out of range:' + target );

      // set vars for the transition
      self.elapsedTransitionTime = 0;
      self.initialCarouselOffset = self.currentCarouselOffset;
      self.animationInProgressProperty.set( true );
    } );

    // activate and deactivate energy system elements as they come into the center location
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
     * add element to list of managed elements
     * @param {EnergySystemElement} element - energy system element to be added to carousel
     * @publid
     */
    add: function( element ) {

      // set the element's position to be at the end of the carousel
      if ( this.managedElements.length === 0 ) {
        element.positionProperty.set( this.selectedElementPosition );
      }
      else {
        var lastElement = this.managedElements[ this.managedElements.length - 1 ];
        element.positionProperty.set( lastElement.positionProperty.value.plus( this.offsetBetweenElements ) );
      }

      // add element to the list of managed elements
      this.managedElements.push( element );

      // update opacities
      this.updateManagedElementOpacities();
    },

    /**
     * get an element from carousel by index
     * @param  {number} index Requested position in array of EnergySystemElements
     * @returns {EnergySystemElement}
     * @public
     */
    getElement: function( index ) {
      assert && assert( index < this.managedElements.length, 'carousel index out of range: ' + index );
      return this.managedElements[ index ];
    },

    /**
     * get the currently selected element from carousel
     * @returns {EnergySystemElement|null}
     * @public
     */
    getSelectedElement: function() {
      var i = this.targetIndexProperty.get();
      if ( i < this.managedElements.length ) {
        return this.managedElements[ i ];
      }
      return null;
    },

    /**
     * step this model element
     * @param {number} dt - time step, in seconds
     */
    step: function( dt ) {
      if ( !this.atTargetPosition() ) {
        this.elapsedTransitionTime += dt;
        var targetCarouselOffset = this.offsetBetweenElements.times( -this.targetIndexProperty.get() );
        var totalTravelVector = targetCarouselOffset.minus( this.initialCarouselOffset );
        var transitionProportion = Util.clamp( this.elapsedTransitionTime / TRANSITION_DURATION, 0, 1 );
        this.currentCarouselOffset =
          this.initialCarouselOffset.plus( totalTravelVector.times( Easing.CUBIC_IN_OUT.value( transitionProportion ) ) );
        this.updateManagedElementPositions();

        if ( transitionProportion === 1 ) {
          this.currentCarouselOffset = targetCarouselOffset;
        }

        if ( this.currentCarouselOffset === targetCarouselOffset ) {
          this.animationInProgressProperty.set( false );
        }
        this.updateManagedElementOpacities();
      }
    },

    /**
     * @private
     */
    updateManagedElementPositions: function() {
      for ( var i = 0; i < this.managedElements.length; i++ ) {
        var position = this.selectedElementPosition.plus( this.offsetBetweenElements.times( i ) );
        position = position.plus( this.currentCarouselOffset );
        this.managedElements[ i ].positionProperty.set( position );
      }
    },

    /**
     * @private
     */
    updateManagedElementOpacities: function() {
      var self = this;
      this.managedElements.forEach( function( managedElement ) {
        var distanceToSelection = managedElement.positionProperty.value.distance( self.selectedElementPosition );
        var opacity = Util.clamp( 1 - ( distanceToSelection / self.offsetBetweenElements.magnitude() ), 0, 1 );
        managedElement.opacityProperty.set( opacity );
      } );
    },

    /**
     * @private
     */
    atTargetPosition: function() {
      var targetCarouselOffset = this.offsetBetweenElements.times( -this.targetIndexProperty.value );
      return this.currentCarouselOffset.equals( targetCarouselOffset );
    },

    /**
     * @public
     */
    reset: function() {
      this.targetIndexProperty.reset();
      this.animationInProgressProperty.reset();
    }
  } );
} );
