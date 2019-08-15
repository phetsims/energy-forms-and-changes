// Copyright 2014-2019, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  // @public
  const EnergyType = new Enumeration( [ 'THERMAL', 'ELECTRICAL', 'MECHANICAL', 'LIGHT', 'CHEMICAL', 'HIDDEN' ] );

  return energyFormsAndChanges.register( 'EnergyType', EnergyType );
} );

