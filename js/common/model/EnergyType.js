// Copyright 2014-2017, University of Colorado Boulder

/**
 * The various types of energy used in this simulation.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  var EnergyType = Object.freeze( {
    THERMAL: 'THERMAL',
    ELECTRICAL: 'ELECTRICAL',
    MECHANICAL: 'MECHANICAL',
    LIGHT: 'LIGHT',
    CHEMICAL: 'CHEMICAL',
    HIDDEN: 'HIDDEN'
  } );

  energyFormsAndChanges.register( 'EnergyType', EnergyType );

  return EnergyType;
} );

