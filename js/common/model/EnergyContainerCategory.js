// Copyright 2014-2019, University of Colorado Boulder

/**
 * enum that defines the types of thermal energy containers, primarily used for determining the rate at which heat is
 * transferred between different items
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  const EnergyContainerCategory = Enumeration.byKeys( [ 'IRON', 'BRICK', 'WATER', 'OLIVE_OIL', 'AIR' ] );

  return energyFormsAndChanges.register( 'EnergyContainerCategory', EnergyContainerCategory );
} );