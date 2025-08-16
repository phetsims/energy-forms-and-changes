// Copyright 2019-2025, University of Colorado Boulder

/**
 * An object that is used to track energy that is exchanged between pairs of entities and accumulate the total balance.
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyBalanceRecord from './EnergyBalanceRecord.js';

class EnergyBalanceTracker {

  // Array where the energy exchange records are kept
  private readonly energyBalanceRecords: EnergyBalanceRecord[];

  public constructor() {

    this.energyBalanceRecords = [];
  }

  /**
   * log an amount of energy that was exchanged between to entities with the provided IDs
   */
  public logEnergyExchange( fromID: string, toID: string, energyAmount: number ): void {

    // for efficiency, bail out right away if the energy amount is zero, since it won't have any effect
    if ( energyAmount === 0 ) {
      return;
    }

    let fromIDForEntry;
    let toIDForEntry;
    let energyAmountToLog;

    // So that we don't end up with multiple records for exchanges between a single pair of entities, reorder the
    // provided IDs and reverse the order of energy if necessary.
    if ( fromID < toID ) {
      fromIDForEntry = fromID;
      toIDForEntry = toID;
      energyAmountToLog = energyAmount;
    }
    else {
      fromIDForEntry = toID;
      toIDForEntry = fromID;
      energyAmountToLog = -energyAmount;
    }

    // look through the records for one that matches, use C-style loops for best performance
    let energyBalanceRecord = null;
    for ( let i = 0; i < this.energyBalanceRecords.length; i++ ) {
      const tempRecord = this.energyBalanceRecords[ i ];
      if ( tempRecord.fromID === fromIDForEntry && tempRecord.toID === toIDForEntry ) {
        energyBalanceRecord = tempRecord;
        break;
      }
    }

    if ( !energyBalanceRecord ) {

      // create and add a new record
      this.energyBalanceRecords.push( new EnergyBalanceRecord( fromIDForEntry, toIDForEntry, energyAmountToLog ) );
    }
    else {

      // this pair has an entry already, adjust it by the provided amount
      energyBalanceRecord.energyBalance += energyAmountToLog;
      energyBalanceRecord.recentlyUpdated = true;
    }
  }

  /**
   * get all records whose energy balance magnitude exceeds the provided threshold
   * @param threshold - amount of energy
   * @param recentlyUpdatedOnly - indicates whether only recently updated records should be included
   * @param resultsArray - array where results are returned, this is done to reduce memory allocations
   */
  public getBalancesOverThreshold( threshold: number, recentlyUpdatedOnly: boolean, resultsArray: EnergyBalanceRecord[] ): EnergyBalanceRecord[] {

    let currentRecord;

    // c-style loop for best performance
    for ( let i = 0; i < this.energyBalanceRecords.length; i++ ) {
      currentRecord = this.energyBalanceRecords[ i ];
      if ( Math.abs( currentRecord.energyBalance ) > threshold && ( currentRecord.recentlyUpdated || !recentlyUpdatedOnly ) ) {
        resultsArray.push( currentRecord );
      }
    }
    return resultsArray;
  }

  /**
   * get the balances between the provided ID and all other entities with whom balances are being tracked
   * @param id - ID of the entity whose balances are requested
   * @param recentlyUpdateOnly
   */
  public getBalancesForID( id: string, recentlyUpdateOnly: boolean ): EnergyBalanceRecord[] {

    const resultsArray = [];

    // c-style loop for best performance
    for ( let i = 0; i < this.energyBalanceRecords.length; i++ ) {
      const currentRecord = this.energyBalanceRecords[ i ];
      if ( ( currentRecord.fromID === id || currentRecord.toID === id ) &&
           ( !recentlyUpdateOnly || currentRecord.recentlyUpdated ) ) {
        resultsArray.push( currentRecord );
      }
    }
    return resultsArray;
  }

  /**
   * clear the energy balance for all records
   */
  public clearAllBalances(): void {
    this.energyBalanceRecords.forEach( energyBalanceRecord => {
      energyBalanceRecord.energyBalance = 0;
    } );
  }

  /**
   * clear the flags that are used to determine whether energy was recently transferred
   */
  public clearRecentlyUpdatedFlags(): void {
    this.energyBalanceRecords.forEach( energyBalanceRecord => {
      energyBalanceRecord.recentlyUpdated = false;
    } );
  }
}

energyFormsAndChanges.register( 'EnergyBalanceTracker', EnergyBalanceTracker );
export default EnergyBalanceTracker;