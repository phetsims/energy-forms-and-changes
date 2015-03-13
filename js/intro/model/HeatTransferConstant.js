// Copyright 2002-2015, University of Colorado

/**
 * Class containing the constants that control the rate of heat transfer
 * between the various model elements that can contain heat, as well as methods
 * for obtaining the heat transfer value for any two model elements that are
 * capable of exchanging heat.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * *
   * @constructor
   */
  function HeatTransferConstants() {
    var BRICK_IRON_HEAT_TRANSFER_FACTOR = 1000.0;
    var BRICK_WATER_HEAT_TRANSFER_FACTOR = 1000.0;
    var BRICK_AIR_HEAT_TRANSFER_FACTOR = 50.0;
    var IRON_WATER_HEAT_TRANSFER_FACTOR = 1000.0;
    var IRON_AIR_HEAT_TRANSFER_FACTOR = 50.0;
    var WATER_AIR_HEAT_TRANSFER_FACTOR = 50.0;
    this.AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR = 10000.0;

    this.heatTransferConstantsMap = {};
    this.heatTransferConstantsMap[ 'iron' ][ 'brick' ] = BRICK_IRON_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'brick' ][ 'iron' ] = BRICK_IRON_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'water' ][ 'brick' ] = BRICK_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'brick' ][ 'water' ] = BRICK_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'air' ][ 'brick' ] = BRICK_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'brick' ][ 'air' ] = BRICK_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'water' ][ 'air' ] = WATER_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'air' ][ 'water' ] = WATER_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'water' ][ 'iron' ] = IRON_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'iron' ][ 'water' ] = IRON_WATER_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'iron' ][ 'air' ] = IRON_AIR_HEAT_TRANSFER_FACTOR;
    this.heatTransferConstantsMap[ 'air' ][ 'iron' ] = IRON_AIR_HEAT_TRANSFER_FACTOR;
  }

  return inherit( Object, HeatTransferConstants, {
    /**
     * *
     * @param element1
     * @param element2
     * @returns {*}
     */
    getHeatTransferFactor: function( element1, element2 ) {
      return this.heatTransferConstantsMap[ element1 ][ element2 ];
    },

    /**
     * *
     * @returns {number}
     */
    getAirToSurroundingAirHeatTransferFactor: function() {
      return this.AIR_TO_SURROUNDING_AIR_HEAT_TRANSFER_FACTOR;
    }
  } );
} );
