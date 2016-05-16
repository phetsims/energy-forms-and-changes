// Copyright 2014-2015, University of Colorado Boulder

/**
 * The various types of energy used in this simulation.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  var EnergyType = Object.freeze( {
    THERMAL: 0,
    ELECTRICAL: 1,
    MECHANICAL: 2,
    LIGHT: 3,
    CHEMICAL: 4,
    HIDDEN: 5
  } );

  energyFormsAndChanges.register( 'EnergyType', EnergyType );

  return EnergyType;
} );

