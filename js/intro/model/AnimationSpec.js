// Copyright 2018, University of Colorado Boulder

/**
 * type that specifies the attributes of a translation animation
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Vector2} startPosition - the location from which the animation begins
   * @param {Vector2} endPosition - the location at which the animation ends
   * @param {number} totalDuration - in seconds, amount of time that the animation should take
   * @constructor
   */
  function AnimationSpec( startPosition, endPosition, totalDuration ) {

    // @public (read-only) {Vector2}
    this.startPosition = startPosition;

    // @public (read-only) {Vector2}
    this.endPosition = endPosition;

    // @public (read-only) {Vector2}
    this.travelVector = this.endPosition.minus( this.startPosition );

    // @public (read-only) {number}
    this.totalDuration = totalDuration;

    // @public (read-only) {number} - time that has passed since the animation was initiated
    this.timeSoFar = 0;
  }

  energyFormsAndChanges.register( 'AnimationSpec', AnimationSpec );

  return inherit( Object, AnimationSpec );
} );