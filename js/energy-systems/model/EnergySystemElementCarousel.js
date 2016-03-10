// Copyright 2016, University of Colorado Boulder

/**
 * Carousel for containing and managing the position of energy system elements.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Carousel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Carousel' );

  /**
   * EnergySystemElementCarousel
   *
   * @param {Vector2} selectedElementPosition Location of currently selected element
   * @param {Vector2} offsetBetweenElements   Offset between elements in the carousel
   * @constructor
   */
  function EnergySystemElementCarousel( selectedElementPosition, offsetBetweenElements ) {

    Carousel.call( this, selectedElementPosition, offsetBetweenElements );

    // Activate and deactivate energy system elements as they come into
    // the center location.
    var thisCarousel = this;
    this.animationInProgressProperty.link( function( animationInProgress ) {
      if ( animationInProgress ) {
        thisCarousel.managedElements.forEach( function( element ) {
          element.deactivate();
        } );
      } else {
        thisCarousel.getElement( thisCarousel.targetIndexProperty.get() ).activate();
      }
    } );
  }

  return inherit( Carousel, EnergySystemElementCarousel );
} );
