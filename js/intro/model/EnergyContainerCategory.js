// Copyright 2014-2017, University of Colorado Boulder

/**
 * An Enum that defines the types of thermal energy containers, primarily used for determining the rate at which heat is
 * transferred between different items.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  var EnergyContainerCategory = {
    IRON: 'iron',
    BRICK: 'brick',
    WATER: 'water',
    AIR: 'air'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( EnergyContainerCategory ); }

  energyFormsAndChanges.register( 'EnergyContainerCategory', EnergyContainerCategory );

  return EnergyContainerCategory;
} );