// Copyright 2016-2019, University of Colorado Boulder

/**
 * base type for energy users, i.e. model elements that take energy from an energy converter and do something with it,
 * such as producing light or heat
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergySystemElement = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySystemElement' );

  class EnergyUser extends EnergySystemElement {

    /**
     * @param {Image} iconImage
     */
    constructor( iconImage ) {
      super( iconImage );

      // @private {EnergyChunk[]}
      this.incomingEnergyChunks = [];
    }

    /**
     * Inject a list of energy chunks into this energy system element.  Once injected, it is the system's responsibility
     * to move, convert, and otherwise manage them.
     * @param {Array{EnergyChunk}} energyChunks - list of energy chunks to inject
     * @public
     */
    injectEnergyChunks( energyChunks ) {
      this.incomingEnergyChunks = _.union( this.incomingEnergyChunks, energyChunks );
    }

    //REVIEW #247 this was @protected in the superclass, is @public accurate?
    /**
     * @public
     * @override
     */
    clearEnergyChunks() {
      super.clearEnergyChunks();
      this.incomingEnergyChunks.length = 0;
    }
  }

  return energyFormsAndChanges.register( 'EnergyUser', EnergyUser );
} );

