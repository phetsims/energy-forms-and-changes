// Copyright 2002-2015, University of Colorado

/**
 * The various types of energy used in this simulation.
 *
 * @author John Blanco
 */

define( function() {
  'use strict';

  var EnergyType = Object.freeze( {
    THERMAL: 0,
    ELECTRICAL: 1,
    MECHANICAL: 2,
    LIGHT: 3,
    CHEMICAL: 4,
    HIDDEN: 5
  } );

  return EnergyType;
} );
