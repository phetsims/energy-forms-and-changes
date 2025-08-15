// Copyright 2019-2020, University of Colorado Boulder

/**
 * an object that is used to keep a record of energy that is exchanged between two model elements
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class EnergyBalanceRecord {

  // ID of the entity from which the energy was transferred
  public readonly fromID: string;

  // ID of the entity to which the energy was transferred
  public readonly toID: string;

  // Amount of energy transferred, negative values indicate reverse direction
  public energyBalance: number;

  // Flag that is used to mark whether energy was recently transferred
  public recentlyUpdated: boolean;

  /**
   * inner type which defines the structure where energy exchanges are tracked
   * @param fromID
   * @param toID
   * @param energyAmount - in joules
   */
  public constructor( fromID: string, toID: string, energyAmount: number ) {

    // objects can't exchange energy with themselves
    assert && assert( fromID !== toID );

    // For ease of locating the exchange records, they are set up so that the 'from' ID precedes the 'to' ID in lexical
    // order.  That is checked here.
    assert && assert( fromID < toID, 'fromID must precede toID in lexical order' );

    this.fromID = fromID;

    this.toID = toID;

    this.energyBalance = energyAmount;

    this.recentlyUpdated = true;
  }

  /**
   * get the other ID in this record
   */
  public getOtherID( id: string ): string {
    assert && assert( id === this.fromID || id === this.toID, 'provided ID not in record' );
    return id === this.fromID ? this.toID : this.fromID;
  }
}

energyFormsAndChanges.register( 'EnergyBalanceRecord', EnergyBalanceRecord );
export default EnergyBalanceRecord;