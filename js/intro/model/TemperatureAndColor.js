// Copyright 2002-2015, University of Colorado Boulder

/**
 * Model that combines values for temperature and color.  Used
 * primarily by the thermometer to obtain information from the model.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  /**
   * @param {number} temperature
   * @param {Color} color
   * @constructor
   */
  function TemperatureAndColor( temperature, color ) {
    this.temperature = temperature;
    this.color = color;
  }

  return TemperatureAndColor;

} );
