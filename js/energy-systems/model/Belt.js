// Copyright 2016, University of Colorado Boulder

/**
 * Class representing a belt that connects two rotating wheels together,
 * like a fan belt in an automobile engine.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * @param {Number} wheel1Radius
   * @param {Vector2} wheel1Center
   * @param {Number} wheel2Radius
   * @param {Vector2} wheel2Center
   *
   * @constructor
   */
  function Belt( wheel1Radius, wheel1Center, wheel2Radius, wheel2Center ) {
    this.wheel1Radius = wheel1Radius;
    this.wheel1Center = wheel1Center;
    this.wheel2Radius = wheel2Radius;
    this.wheel2Center = wheel2Center;

    PropertySet.call( this, {
      isVisible: false
    } );
  }

  energyFormsAndChanges.register( 'Belt', Belt );

  return inherit( PropertySet, Belt );
} );
