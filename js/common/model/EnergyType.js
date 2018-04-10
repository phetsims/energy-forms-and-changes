// Copyright 2014-2017, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  var EnergyType = {
    THERMAL: 'THERMAL',
    ELECTRICAL: 'ELECTRICAL',
    MECHANICAL: 'MECHANICAL',
    LIGHT: 'LIGHT',
    CHEMICAL: 'CHEMICAL',
    HIDDEN: 'HIDDEN'
  };

  energyFormsAndChanges.register( 'EnergyType', EnergyType );

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( EnergyType ); }

  return EnergyType;
} );

