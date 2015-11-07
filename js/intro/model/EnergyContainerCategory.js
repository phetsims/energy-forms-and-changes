// Copyright 2014-2015, University of Colorado Boulder

/**
 * Types of thermal energy containers, primarily used for determining the rate at which heat is transferred between
 * different items.
 *
 * @author John Blanco
 */


define( function() {
  'use strict';

  var EnergyContainerCategory = {
    IRON: 'iron',
    BRICK: 'brick',
    WATER: 'water',
    AIR: 'air'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( EnergyContainerCategory ); }

  return EnergyContainerCategory;
} );

