// Copyright 2018-2019, University of Colorado Boulder

/**
 * query parameters supported by this simulation
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  const EFACQueryParameters = QueryStringMachine.getAll( {

    // show the 2D bounds of the block, which is what is actually modeled
    show2DBlockBounds: { type: 'flag' },

    // show the bounds of the air
    showAirBounds: { type: 'flag' },

    // show some shapes that are helpful for debugging, such as the container slices
    showHelperShapes: { type: 'flag' },

    // show the 2D bounds of the beaker
    show2DBeakerBounds: { type: 'flag' },

    // show the normal/fast forward buttons on the first screen
    showSpeedControls: { type: 'flag' },

    // make the first screen burners sticky
    stickyBurners: { type: 'flag' },

    // force the energy chunk distributor to use a particular algorithm
    ecDistribution: {
      type: 'string',
      defaultValue: null,
      validValues: [
        null, // use the default
        'repulsive', // always use the repulsive algorithm
        'spiral', // use the spiral algorithm, which is after than repulsive but doesn't generally look as good
        'simple' // use the simple algorithm, which just puts all chunks in the center of the slice
      ]
    }

  } );

  return energyFormsAndChanges.register( 'EFACQueryParameters', EFACQueryParameters );
} );
