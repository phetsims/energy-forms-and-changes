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
  var EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElement' );
  var inherit = require( 'PHET_CORE/inherit' );

  function EnergyUser() {

    EnergySystemElement.call( this, iconImage );

    this.incomingEnergyChunks = [];
  }

  return inherit( EnergySystemElement, EnergyUser, {

    /**
     * Inject a list of energy chunks into this energy system element.  Once
     * injected, it is the system's responsibility to move, convert, and
     * otherwise manage them.
     *
     * @param {Array{EnergyChunkk}} energyChunks List of energy chunks to inject.
     */
    injectEnergyChunks: function( energyChunks ) {
      // incomingEnergyChunks.addAll( energyChunks );
    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      this.clearEnergyChunks();
      this.incomingEnergyChunks.clear();
    }

  } );
} );