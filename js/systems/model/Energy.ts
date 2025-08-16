// Copyright 2016-2025, University of Colorado Boulder

/**
 * a convenience type that collects together several things often needed about a unit of energy that is being produced
 * or consumed by one of the elements in an energy system
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */

import optionize from '../../../../phet-core/js/optionize.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

type SelfOptions = {
  creationTime?: number | null;
};

export type EnergyOptions = SelfOptions;

class Energy {

  // Energy type
  public readonly type: EnergyType;

  // Amount of energy, in joules
  public readonly amount: number;

  // Direction of energy, in radians. Not meaningful for all energy types. Zero indicates to the right, PI/2 is up, and so forth.
  public readonly direction: number;

  // Creation time
  public readonly creationTime: number | null;

  /**
   * @param type - energy type
   * @param amount - amount of energy, in joules
   * @param direction - direction of energy, in radians.  Not meaningful for all energy types.  Zero indicates
   * to the right, PI/2 is up, and so forth.
   * @param [providedOptions]
   */
  public constructor( type: EnergyType, amount: number, direction: number, providedOptions?: EnergyOptions ) {

    const options = optionize<EnergyOptions, SelfOptions>()( {
      creationTime: null
    }, providedOptions );

    this.type = type;

    this.amount = amount;

    this.direction = direction;

    this.creationTime = options.creationTime;
  }
}

energyFormsAndChanges.register( 'Energy', Energy );
export default Energy;