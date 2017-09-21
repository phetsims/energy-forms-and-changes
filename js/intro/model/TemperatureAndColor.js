// Copyright 2014-2016, University of Colorado Boulder

/**
 * Convenience model that combines values for temperature and color.  Used primarily by the thermometer to obtain information from the model.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  /**
   * @param {number} temperature
   * @param {Color} color
   * @constructor
   */
  function TemperatureAndColor( temperature, color ) {
    this.temperature = temperature;
    this.color = color;
  }

  energyFormsAndChanges.register( 'TemperatureAndColor', TemperatureAndColor );

  return TemperatureAndColor;
} );

