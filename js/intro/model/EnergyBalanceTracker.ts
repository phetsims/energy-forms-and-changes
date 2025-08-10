// Copyright 2019-2020, University of Colorado Boulder

/**
 * An object that is used to track energy that is exchanged between pairs of entities and accumulate the total balance.
 *
 * @author John Blanco
 */

import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyBalanceRecord from './EnergyBalanceRecord.js';

class EnergyBalanceTracker {

  constructor() {

    // @private - array where the energy exchange records are kept
    this.energyBalanceRecords = [];
  }

  /**
   * log an amount of energy that was exchanged between to entities with the provided IDs
   * @param {string} fromID
   * @param {string} toID
   * @param {number} energyAmount
   * @public
   */
  logEnergyExchange( fromID, toID, energyAmount ) {

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
   * @param {number} threshold - amount of energy
   * @param {boolean} recentlyUpdatedOnly - indicates whether only recently updated records should be included
   * @param {Array} resultsArray - array where results are returned, this is done to reduce memory allocations
   * @returns {EnergyBalanceRecord[]}
   * @public
   */
  getBalancesOverThreshold( threshold, recentlyUpdatedOnly, resultsArray ) {

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
   * @param {string} id - ID of the entity whose balances are requested
   * @param {boolean} recentlyUpdateOnly
   * @returns {EnergyBalanceRecord[]}
   * @public
   */
  getBalancesForID( id, recentlyUpdateOnly ) {

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
   * @public
   */
  clearAllBalances() {
    this.energyBalanceRecords.forEach( energyBalanceRecord => {
      energyBalanceRecord.energyBalance = 0;
    } );
  }

  /**
   * clear the flags that are used to determine whether energy was recently transferred
   * @public
   */
  clearRecentlyUpdatedFlags() {
    this.energyBalanceRecords.forEach( energyBalanceRecord => {
      energyBalanceRecord.recentlyUpdated = false;
    } );
  }
}

energyFormsAndChanges.register( 'EnergyBalanceTracker', EnergyBalanceTracker );
export default EnergyBalanceTracker;