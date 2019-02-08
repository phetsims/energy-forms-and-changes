// Copyright 2014-2019, University of Colorado Boulder

/**
 * convenience type that combines values for temperature and color, used primarily by the thermometer to obtain
 * information from the model
 *
 * TODO: make this poolable and use a pool to reduce memory allocations
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  class TemperatureAndColor {

    /**
     * @param {number} temperature
     * @param {Color} color
     */
    constructor( temperature, color ) {
      this.temperature = temperature;
      this.color = color;
    }
  }

  return energyFormsAndChanges.register( 'TemperatureAndColor', TemperatureAndColor );
} );
