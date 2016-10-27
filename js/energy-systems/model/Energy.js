// Copyright 2016, University of Colorado Boulder

/**
 * Module representing an amount and type of energy as well as other
 * attributes that are specific to the energy type.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {EnergyType} type      Energy type.
   * @param {Number}     amount    Amount of energy, in joules.
   * @param {Number}     direction Direction of energy, in radians.  Not meaningful for
   *                               all energy types.  Zero indicates to the right, PI/2
   *                               is up, and so forth.
   */
  function Energy( type, amount, direction ) {
    this.type = type;
    this.amount = amount;
    this.direction = direction;
  }

  energyFormsAndChanges.register( 'Energy', Energy );
  return inherit( Object, Energy );
} );
