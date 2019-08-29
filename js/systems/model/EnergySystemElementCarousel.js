// Copyright 2016-2019, University of Colorado Boulder

// Note: This file is a mashup of two ported Java files: Carousel and
// EnergySystemElementCarousel. Carousel.java was not ported to avoid confusion
// with the PhET Sun Carousel.js UI component.

/**
 * This type implements a model-based carousel for positionable model elements. Model elements are positioned based
 * on the current selection, and an API is provided that allows clients to change those selection. Changes to the
 * selected element are animated.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Easing = require( 'TWIXT/Easing' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const TRANSITION_DURATION = 0.75; //REVIEW #247 units?

  class EnergySystemElementCarousel {

    /**
     * @param {EnergySystemElement[]} - array of elements to add to this carousel
     * @param {Vector2} selectedElementPosition - location where the selected model element should be
     * @param {Vector2} offsetBetweenElements - offset between elements in the carousel
     */
    constructor( elements, selectedElementPosition, offsetBetweenElements ) {

      // @public (read-only) {Vector2} - the position in model space where the currently selected element should be
      this.selectedElementPosition = selectedElementPosition;

      // @private {Vector2} - the offset between elements whose position is managed by this carousel
      this.offsetBetweenElements = offsetBetweenElements;

      // @public (read-only) {EnergySystemElement[]} - list of the elements whose position is managed by this carousel
      this.managedElements = [];

      // add each element to the array of managed elements
      elements.forEach( element => this.add( element ) );

      // @public (read-only) {NumberProperty} - indicates which element on the carousel is currently selected
      this.targetIndexProperty = new NumberProperty( 0, {
        range: new Range( 0, this.managedElements.length - 1 )
      } );

      // @public (read-only) {BooleanProperty} - a flag indicating whether or not an animation from one carousel position
      // to another is in progress
      this.animationInProgressProperty = new BooleanProperty( false );

      // @private - variables needed to manage carousel transitions
      this.elapsedTransitionTime = 0; //REVIEW #247 units?
      this.currentCarouselOffset = new Vector2( 0, 0 );
      this.initialCarouselOffset = new Vector2( 0, 0 );

      // set up the variables needed for animation each time the target changes
      this.targetIndexProperty.lazyLink( () => {

        // set vars for the transition
        this.elapsedTransitionTime = 0;
        this.initialCarouselOffset = this.currentCarouselOffset;
        this.animationInProgressProperty.set( true );
      } );

      // activate and deactivate energy system elements as they come into the center location
      this.animationInProgressProperty.lazyLink( animationInProgress => {
        if ( animationInProgress ) {
          this.managedElements.forEach( element => {
            element.deactivate();
          } );
        }
        else {
          this.getElement( this.targetIndexProperty.value ).activate();
        }
      } );
    }

    /**
     * add element to list of managed elements
     * @param {EnergySystemElement} element - energy system element to be added to carousel
     * @private
     */
    add( element ) {

      // set the element's position to be at the end of the carousel
      if ( this.managedElements.length === 0 ) {
        element.positionProperty.set( this.selectedElementPosition );
      }
      else {
        const lastElement = this.managedElements[ this.managedElements.length - 1 ];
        element.positionProperty.set( lastElement.positionProperty.value.plus( this.offsetBetweenElements ) );
      }

      // add element to the list of managed elements
      this.managedElements.push( element );

      // update opacities
      this.updateManagedElementOpacities();
    }

    /**
     * get an element from carousel by index
     * @param  {number} index Requested position in array of EnergySystemElements
     * @returns {EnergySystemElement}
     * @public
     */
    getElement( index ) {
      assert && assert( index < this.managedElements.length, `carousel index out of range: ${index}` );
      return this.managedElements[ index ];
    }

    /**
     * get the currently selected element from carousel
     * @returns {EnergySystemElement|null}
     * @public
     */
    getSelectedElement() {
      const i = this.targetIndexProperty.get();
      if ( i < this.managedElements.length ) {
        return this.managedElements[ i ];
      }
      return null;
    }

    //REVIEW #247 missing visibility annotation
    /**
     * step this model element
     * @param {number} dt - time step, in seconds
     */
    step( dt ) {
      if ( !this.atTargetPosition() ) {
        this.elapsedTransitionTime += dt;
        const targetCarouselOffset = this.offsetBetweenElements.times( -this.targetIndexProperty.get() );
        const totalTravelVector = targetCarouselOffset.minus( this.initialCarouselOffset );
        const transitionProportion = Util.clamp( this.elapsedTransitionTime / TRANSITION_DURATION, 0, 1 );
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
    }

    //REVIEW #247 document
    /**
     * @private
     */
    updateManagedElementPositions() {
      for ( let i = 0; i < this.managedElements.length; i++ ) {
        let position = this.selectedElementPosition.plus( this.offsetBetweenElements.times( i ) );
        position = position.plus( this.currentCarouselOffset );
        this.managedElements[ i ].positionProperty.set( position );
      }
    }

    //REVIEW #247 document
    /**
     * @private
     */
    updateManagedElementOpacities() {
      this.managedElements.forEach( managedElement => {
        const distanceToSelection = managedElement.positionProperty.value.distance( this.selectedElementPosition );
        const opacity = Util.clamp( 1 - ( distanceToSelection / this.offsetBetweenElements.magnitude ), 0, 1 );
        managedElement.opacityProperty.set( opacity );
      } );
    }

    //REVIEW #247 document
    /**
     * @private
     */
    atTargetPosition() {
      const targetCarouselOffset = this.offsetBetweenElements.times( -this.targetIndexProperty.value );
      return this.currentCarouselOffset.equals( targetCarouselOffset );
    }
  }

  return energyFormsAndChanges.register( 'EnergySystemElementCarousel', EnergySystemElementCarousel );
} );
