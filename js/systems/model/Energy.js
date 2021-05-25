// Copyright 2016-2021, University of Colorado Boulder

/**
 * a convenience type that collects together several things often needed about a unit of energy that is being produced
 * or consumed by one of the elements in an energy system
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */

import merge from '../../../../phet-core/js/merge.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class Energy {

  /**
   * @param {EnergyType} type - energy type
   * @param {number} amount - amount of energy, in joules
   * @param {number} direction - direction of energy, in radians.  Not meaningful for all energy types.  Zero indicates
   * to the right, PI/2 is up, and so forth.
   * @param {Object} [options]
   */
  constructor( type, amount, direction, options ) {

    options = merge( {
      creationTime: null
    }, options );

    // @public (read-only) {EnergyType}
    this.type = type;

    // @public (read-only) {number}
    this.amount = amount;

    // @public (read-only) {number}
    this.direction = direction;

    // @public (read-only) {number}
    this.creationTime = options.creationTime;
  }
}

energyFormsAndChanges.register( 'Energy', Energy );
export default Energy;