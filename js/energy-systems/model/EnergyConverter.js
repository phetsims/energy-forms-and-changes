// Copyright 2016-2018, University of Colorado Boulder

/**
 * Base class for energy converters, i.e. model elements that take energy from
 * a source and convert it to something else (such as mechanical to electrical)
 * and then supply it to an energy user.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElement' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Image} iconImage Image to identify source on carousel menu
   * @constructor
   */
  function EnergyConverter( iconImage ) {
    this.incomingEnergyChunks = [];
    this.outgoingEnergyChunks = [];

    EnergySystemElement.call( this, iconImage );
  }

  energyFormsAndChanges.register( 'EnergyConverter', EnergyConverter );

  return inherit( EnergySystemElement, EnergyConverter, {

    /**
     * Get the energy chunks that this source wants to transfer to the next
     * energy system element.  Reading clears the list.
     *
     * @return list of energy chunks to transfer.
     */
    extractOutgoingEnergyChunks: function() {
      this.energyChunkList.removeAll( this.outgoingEnergyChunks );

      return this.outgoingEnergyChunks.splice( 0 );
    },

    /**
     * Inject a list of energy chunks into this energy system element.  Once
     * injected, it is the system's responsibility to move, convert, and
     * otherwise manage them.
     *
     * @parameter {EnergyChunk[]} Array of energy chunks to inject
     */
    injectEnergyChunks: function( energyChunks ) {
      this.incomingEnergyChunks = _.union( this.incomingEnergyChunks, energyChunks );
    },

    /**
     * Clear internal list of energy chunks and outgoing energy chunks
     */
    clearEnergyChunks: function() {
      EnergySystemElement.prototype.clearEnergyChunks.call( this );
      this.incomingEnergyChunks.length = 0;
      this.outgoingEnergyChunks.length = 0;
    }
  } );
} );

