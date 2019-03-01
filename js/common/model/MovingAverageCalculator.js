// Copyright 2019, University of Colorado Boulder

/**
 * simple moving average calculator
 *
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  class MovingAverageCalculator {

    /**
     * @param {number} size
     * @param {Object} [options]
     */
    constructor( size, options ) {

      options = _.extend( {
        initialValue: 0
      }, options );

      // @public (read-only) {number} - window size
      this.size = size;

      // @public (read-only) {number} - the calculated average
      this.average = options.initialValue;

      // @private
      this.initialValue = options.initialValue;
      this.array = new Array( size );
      this.total = 0;

      // set up initial values
      this.reset();
    }

    addValue( newValue ) {
      const replacedValue = this.array[ this.currentIndex ];
      this.array[ this.currentIndex ] = newValue;
      this.currentIndex = ( this.currentIndex + 1 ) % this.size;
      this.total = ( this.total - replacedValue ) + newValue;
      this.average = this.total / this.size;
    }

    reset() {
      for ( let i = 0; i < this.size; i++ ) {
        this.array[ i ] = this.initialValue;
      }
      this.total = this.initialValue * this.size;
      this.average = this.total / this.size;
      this.currentIndex = 0;
    }
  }

  return energyFormsAndChanges.register( 'MovingAverageCalculator', MovingAverageCalculator );
} );