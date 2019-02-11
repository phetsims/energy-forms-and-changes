// Copyright 2016-2019, University of Colorado Boulder

/**
 * base type for energy converters, i.e. model elements that take energy from a source and convert it to something else
 * (such as mechanical to electrical) and then supply it to an energy user
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySystemElement' );

  class EnergyConverter extends EnergySystemElement {

    /**
     * @param {Image} iconImage Image to identify source on carousel menu
     */
    constructor( iconImage ) {
      super( iconImage );
      this.incomingEnergyChunks = [];
      this.outgoingEnergyChunks = [];
    }

    /**
     * get the energy chunks that this source wants to transfer to the next energy system element, reading clears the
     * list
     * @returns {EnergyChunk[]}
     * @public
     */
    extractOutgoingEnergyChunks() {
      this.energyChunkList.removeAll( this.outgoingEnergyChunks );
      return this.outgoingEnergyChunks.splice( 0 );
    }

    /**
     * Inject a list of energy chunks into this energy system element.  Once injected, it is the system's responsibility
     * to move, convert, and otherwise manage them.
     * @parameter {EnergyChunk[]} energyChunks
     * @public
     */
    injectEnergyChunks( energyChunks ) {
      this.incomingEnergyChunks = _.union( this.incomingEnergyChunks, energyChunks );
    }

    /**
     * clear internal list of energy chunks and outgoing energy chunks
     * @public
     */
    clearEnergyChunks() {
      super.clearEnergyChunks();
      this.incomingEnergyChunks.length = 0;
      this.outgoingEnergyChunks.length = 0;
    }
  }

  return energyFormsAndChanges.register( 'EnergyConverter', EnergyConverter );
} );

