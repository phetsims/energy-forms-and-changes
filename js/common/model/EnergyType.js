// Copyright 2014-2019, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  const EnergyType = {
    THERMAL: 'THERMAL',
    ELECTRICAL: 'ELECTRICAL',
    MECHANICAL: 'MECHANICAL',
    LIGHT: 'LIGHT',
    CHEMICAL: 'CHEMICAL',
    HIDDEN: 'HIDDEN'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( EnergyType ); }

  return energyFormsAndChanges.register( 'EnergyType', EnergyType );
} );

