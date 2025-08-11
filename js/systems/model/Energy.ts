// Copyright 2016-2021, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * a convenience type that collects together several things often needed about a unit of energy that is being produced
 * or consumed by one of the elements in an energy system
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */

import merge from '../../../../phet-core/js/merge.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

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
   * @param [options]
   */
  public constructor( type: EnergyType, amount: number, direction: number, options: IntentionalAny ) {

    options = merge( {
      creationTime: null
    }, options );

    this.type = type;

    this.amount = amount;

    this.direction = direction;

    this.creationTime = options.creationTime;
  }
}

energyFormsAndChanges.register( 'Energy', Energy );
export default Energy;