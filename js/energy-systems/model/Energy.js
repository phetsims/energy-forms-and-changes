// Copyright 2016, University of Colorado Boulder

/**
 * a convenience type that collects together several things often needed about a unit of energy that is being produced
 * or consumed by one of the elements in an energy system
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {EnergyType} type - energy type
   * @param {number} amount - amount of energy, in joules
   * @param {number} direction - direction of energy, in radians.  Not meaningful for all energy types.  Zero indicates
   * to the right, PI/2 is up, and so forth.
   */
  function Energy( type, amount, direction, creationTime ) {

    // @public (read-only) {EnergyType}
    this.type = type;

    // @public (read-only) {number}
    this.amount = amount;

    // @public (read-only) {number}
    this.direction = direction;

    // @public (read-only) {number}
    this.creationTime = creationTime;
  }

  energyFormsAndChanges.register( 'Energy', Energy );

  return inherit( Object, Energy );
} );
