// Copyright 2016, University of Colorado Boulder

/**
 * a model element that represents a belt that connects two rotating wheels together, like a fan belt in an automobile
 * engine
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  /**
   * @param {number} wheel1Radius
   * @param {Vector2} wheel1Center
   * @param {number} wheel2Radius
   * @param {Vector2} wheel2Center
   * @constructor
   */
  function Belt( wheel1Radius, wheel1Center, wheel2Radius, wheel2Center ) {

    // @public (read-only) {number} - information about the nature of the belt
    this.wheel1Radius = wheel1Radius;
    this.wheel1Center = wheel1Center;
    this.wheel2Radius = wheel2Radius;
    this.wheel2Center = wheel2Center;

    // @public {BooleanProperty}
    this.isVisibleProperty = new Property( false );
  }

  energyFormsAndChanges.register( 'Belt', Belt );

  return inherit( Object, Belt );
} );
