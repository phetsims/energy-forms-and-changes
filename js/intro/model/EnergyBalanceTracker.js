// Copyright 2019, University of Colorado Boulder

/**
 * An object that is used to track energy that is exchanged between pairs of entities and accumulate the total balance.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyBalanceRecord = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyBalanceRecord' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @constructor
   */
  function EnergyBalanceTracker() {

    // @private - array where the energy exchange records are kept
    this.energyBalanceRecords = [];
  }

  energyFormsAndChanges.register( 'EnergyBalanceTracker', EnergyBalanceTracker );

  return inherit( Object, EnergyBalanceTracker, {

    /**
     * log an amount of energy that was exchanged between to entities with the provided IDs
     * @param {string} fromID
     * @param {string} toID
     * @param {number} energyAmount
     * @public
     */
    logEnergyExchange: function( fromID, toID, energyAmount ) {

      // for efficiency, bail out right away if the energy amount is zero, since it won't have any effect
      if ( energyAmount === 0 ) {
        return;
      }

      var fromIDForEntry;
      var toIDForEntry;
      var energyAmountToLog;

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
      var energyBalanceRecord = null;
      for ( var i = 0; i < this.energyBalanceRecords.length; i++ ) {
        var tempRecord = this.energyBalanceRecords[ i ];
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
    },

    /**
     * get all records whose energy balance magnitude exceeds the provided threshold
     * @param {number} threshold - amount of energy
     * @param {boolean} recentlyUpdatedOnly - indicates whether only recently updated records should be included
     * @param {Array} resultsArray - array where results are returned, this is done to reduce memory allocations
     * @returns {EnergyBalanceRecord[]}
     */
    getBalancesOverThreshold: function( threshold, recentlyUpdatedOnly, resultsArray ) {

      var currentRecord;

      // c-style loop for best performance
      for ( var i = 0; i < this.energyBalanceRecords.length; i++ ) {
        currentRecord = this.energyBalanceRecords[ i ];
        if ( Math.abs( currentRecord.energyBalance ) > threshold && ( currentRecord.recentlyUpdated || !recentlyUpdatedOnly ) ) {
          resultsArray.push( currentRecord );
        }
      }
      return resultsArray;
    },

    /**
     * clear the energy balance for all records
     * @public
     */
    clearAllBalances: function() {
      this.energyBalanceRecords.forEach( function( energyBalanceRecord ) {
        energyBalanceRecord.energyBalance = 0;
      } );
    },

    /**
     * clear the flags that are used to determine whether energy was recently transferred
     * @public
     */
    clearRecentlyUpdatedFlags: function() {
      this.energyBalanceRecords.forEach( function( energyBalanceRecord ) {
        energyBalanceRecord.recentlyUpdated = false;
      } );
    }

  } );
} );