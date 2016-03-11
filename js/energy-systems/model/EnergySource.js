// Copyright 2016, University of Colorado Boulder

/**
 * Base class for energy converters, i.e. model elements that take energy from
 * a source and convert it to something else (such as mechanical to electrical)
 * and then supply it to an energy user.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElement' );

  /**
   * EnergySource constructor
   *
   * @param {Image} iconImage Image to identify source on carousel menu
   * @constructor
   */
  function EnergySource( iconImage ) {

    EnergySystemElement.call( this, iconImage );

    this.outgoingEnergyChunks = new Array();
  }

  return inherit( EnergySystemElement, EnergySource, {

    /**
     * TODO: untested
     * Get the energy chunks that this source wants to transfer to the next
     * energy system element. This is a mutating operation: it removes all
     * outgoing chunks from both this.energyChunkList and
     * this.outgoingEnergyChunks.
     *
     * @return {Array<EnergyChunk>} List of energy chunks to transfer
     */
    extractOutgoingEnergyChunks: function() {

      var thisSource = this;

      // Create a copy to iterate over while deleting from the original
      var energyChunksCopy = this.energyChunkList.slice( 0 );

      // Remove all outgoing chunks from this.energyChunkList
      energyChunksCopy.forEach( function( chunk ) {
        thisSource.outgoingEnergyChunks.forEach( function( outgoingChunk ) {
          if ( chunk === outgoingChunk ) {
            var i = thisSource.energyChunkList.indexOf( chunk );
            if ( i > -1 ) {
              thisSource.energyChunkList.splice( i, 1 );
            }
          }
        } );
      } );

      return this.outgoingEnergyChunks.splice( 0 );
    },

    /**
     * Clear internal list of energy chunks and outgoing energy chunks
     */
    clearEnergyChunks: function() {
      this.clearEnergyChunks(); // Inherited
      this.outgoingEnergyChunks.clear();
    }

  } );
} );
