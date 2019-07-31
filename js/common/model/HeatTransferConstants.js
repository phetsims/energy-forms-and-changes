// Copyright 2015-2019, University of Colorado Boulder

/**
 * Static object containing the constants that control the rate of heat transfer between the various model elements that
 * can contain heat, as well as methods for obtaining the heat transfer value for any two model elements that are
 * capable of exchanging heat with one another.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  // constants
  const BRICK_IRON_HEAT_TRANSFER_FACTOR = 1000.0;
  const BRICK_WATER_HEAT_TRANSFER_FACTOR = 1000.0;
  const BRICK_OLIVE_OIL_HEAT_TRANSFER_FACTOR = 1000.0;
  const BRICK_AIR_HEAT_TRANSFER_FACTOR = 30.0;
  const IRON_WATER_HEAT_TRANSFER_FACTOR = 1000.0;
  const IRON_OLIVE_OIL_HEAT_TRANSFER_FACTOR = 1000.0;
  const IRON_AIR_HEAT_TRANSFER_FACTOR = 30.0;
  const WATER_OLIVE_OIL_HEAT_TRANSFER_FACTOR = 1000.0;
  const WATER_AIR_HEAT_TRANSFER_FACTOR = 30.0;
  const OLIVE_OIL_AIR_HEAT_TRANSFER_FACTOR = 30.0;
  const AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR = 10000.0;

  // map of inter-object heat transfer constants
  const heatTransferConstantsMap = {
    'iron': {
      'brick': BRICK_IRON_HEAT_TRANSFER_FACTOR,
      'water': IRON_WATER_HEAT_TRANSFER_FACTOR,
      'olive_oil': IRON_OLIVE_OIL_HEAT_TRANSFER_FACTOR,
      'air': IRON_AIR_HEAT_TRANSFER_FACTOR
    },
    'brick': {
      'iron': BRICK_IRON_HEAT_TRANSFER_FACTOR,
      'air': BRICK_AIR_HEAT_TRANSFER_FACTOR,
      'water': BRICK_WATER_HEAT_TRANSFER_FACTOR,
      'olive_oil': BRICK_OLIVE_OIL_HEAT_TRANSFER_FACTOR
    },
    'water': {
      'olive_oil': WATER_OLIVE_OIL_HEAT_TRANSFER_FACTOR,
      'brick': BRICK_WATER_HEAT_TRANSFER_FACTOR,
      'air': WATER_AIR_HEAT_TRANSFER_FACTOR,
      'iron': IRON_WATER_HEAT_TRANSFER_FACTOR
    },
    'olive-oil': {
      'brick': BRICK_OLIVE_OIL_HEAT_TRANSFER_FACTOR,
      'air': OLIVE_OIL_AIR_HEAT_TRANSFER_FACTOR,
      'iron': IRON_OLIVE_OIL_HEAT_TRANSFER_FACTOR,
      'water': WATER_OLIVE_OIL_HEAT_TRANSFER_FACTOR
    },
    'air': {
      'brick': BRICK_AIR_HEAT_TRANSFER_FACTOR,
      'water': WATER_AIR_HEAT_TRANSFER_FACTOR,
      'olive_oil': OLIVE_OIL_AIR_HEAT_TRANSFER_FACTOR,
      'iron': IRON_AIR_HEAT_TRANSFER_FACTOR
    }
  };

  const HeatTransferConstants = {

    //REVIEW #247 missing visibility annotation
    /**
     * get the heat transfer constants for two model elements that can contain heat
     * @param {string} element1
     * @param {string} element2
     * @returns {number}
     */
    getHeatTransferFactor( element1, element2 ) {
      return heatTransferConstantsMap[ element1 ][ element2 ];
    },

    //REVIEW #247 missing visibility annotation
    //REVIEW #247 document
    /**
     * @returns {number}
     */
    getAirToSurroundingAirHeatTransferFactor() {
      return AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR;
    }
  };

  return energyFormsAndChanges.register( 'HeatTransferConstants', HeatTransferConstants );
} );

