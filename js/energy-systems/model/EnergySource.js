// Copyright 2016-2018, University of Colorado Boulder

/**
 * base class for energy sources, i.e. model elements that produce energy and can supply it to other energy system
 * components, such as energy converters or energy users
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElement' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Image} iconImage Image to identify source on carousel menu
   * @constructor
   */
  function EnergySource( iconImage ) {
    EnergySystemElement.call( this, iconImage );
    this.outgoingEnergyChunks = [];
  }

  energyFormsAndChanges.register( 'EnergySource', EnergySource );

  return inherit( EnergySystemElement, EnergySource, {

    /**
     * Get the energy chunks that this source wants to transfer to the next energy system element. This is a mutating
     * operation: it removes all outgoing chunks from both this.energyChunkList and this.outgoingEnergyChunks.
     * @returns {EnergyChunk[]} List of energy chunks to transfer
     * @public
     */
    extractOutgoingEnergyChunks: function() {

      // remove all outgoing chunks from this.energyChunkList
      this.energyChunkList.removeAll( this.outgoingEnergyChunks );

      // return a copy of the outgoing chunk list and clear it in one fell swoop
      return this.outgoingEnergyChunks.splice( 0 );
    },

    /**
     * clear internal list of energy chunks and outgoing energy chunks
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySystemElement.prototype.clearEnergyChunks.call( this );
      this.outgoingEnergyChunks.length = 0;
    }
  } );
} );

