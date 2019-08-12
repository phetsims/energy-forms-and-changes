// Copyright 2014-2019, University of Colorado Boulder

/**
 * enum that defines the types of thermal energy containers, primarily used for determining the rate at which heat is
 * transferred between different items
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  const EnergyContainerCategory = {
    IRON: 'iron',
    BRICK: 'brick',
    WATER: 'water',
    OLIVE_OIL: 'olive_oil',
    AIR: 'air'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( EnergyContainerCategory ); }

  return energyFormsAndChanges.register( 'EnergyContainerCategory', EnergyContainerCategory );
} );