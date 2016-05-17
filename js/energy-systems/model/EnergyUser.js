// Copyright 2016, University of Colorado Boulder

/**
 * Base class for energy users, i.e. model elements that take energy from
 * an energy converter and do something with it, such as producing light or
 * heat.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElement' );
  var inherit = require( 'PHET_CORE/inherit' );

  function EnergyUser( iconImage ) {

    EnergySystemElement.call( this, iconImage );

    this.incomingEnergyChunks = [];
  }

  energyFormsAndChanges.register( 'EnergyUser', EnergyUser );

  return inherit( EnergySystemElement, EnergyUser, {

    /**
     * Inject a list of energy chunks into this energy system element.  Once
     * injected, it is the system's responsibility to move, convert, and
     * otherwise manage them.
     *
     * @param {Array{EnergyChunk}} energyChunks List of energy chunks to inject.
     */
    injectEnergyChunks: function( energyChunks ) {
      this.incomingEnergyChunks = _.union( this.incomingEnergyChunks, energyChunks );
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySystemElement.prototype.clearEnergyChunks.call( this );
      this.incomingEnergyChunks.length = 0;
    }

  } );
} );

