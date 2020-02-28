// Copyright 2016-2020, University of Colorado Boulder

/**
 * base type for energy users, i.e. model elements that take energy from an energy converter and do something with it,
 * such as producing light or heat
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergySystemElement from './EnergySystemElement.js';

class EnergyUser extends EnergySystemElement {

  /**
   * @param {Image} iconImage
   * @param {Tandem} tandem
   */
  constructor( iconImage, tandem ) {
    super( iconImage, tandem );

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

  /**
   * @protected
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.incomingEnergyChunks.length = 0;
  }
}

energyFormsAndChanges.register( 'EnergyUser', EnergyUser );
export default EnergyUser;