// Copyright 2018-2020, University of Colorado Boulder

/**
 * query parameters supported by this simulation
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import energyFormsAndChanges from '../energyFormsAndChanges.js';
import EFACConstants from './EFACConstants.js';

// constants
const defaultElements = [ EFACConstants.IRON_KEY, EFACConstants.BRICK_KEY, EFACConstants.WATER_KEY, EFACConstants.OLIVE_OIL_KEY ];

const EFACQueryParameters = QueryStringMachine.getAll( {

  // show the 2D bounds of the block, which is what is actually modeled
  // For internal use only, not public facing.
  show2DBlockBounds: { type: 'flag' },

  // show the bounds of the air
  // For internal use only, not public facing.
  showAirBounds: { type: 'flag' },

  // show some shapes that are helpful for debugging, such as the container slices
  // For internal use only, not public facing.
  showHelperShapes: { type: 'flag' },

  // show the 2D bounds of the beaker
  // For internal use only, not public facing.
  show2DBeakerBounds: { type: 'flag' },

  // show the normal/fast forward buttons on the first screen
  // For internal use only, not public facing.
  showSpeedControls: { type: 'flag' },

  // make the first screen burners sticky
  // @public, see https://github.com/phetsims/energy-forms-and-changes/issues/232
  stickyBurners: {
    type: 'flag',
    public: true
  },

  // force the energy chunk distributor to use a particular algorithm
  // For internal use only, not public facing.
  ecDistribution: {
    type: 'string',
    defaultValue: null,
    validValues: [
      null, // use the default
      'repulsive', // always use the repulsive algorithm
      'spiral', // use the spiral algorithm, which is after than repulsive but doesn't generally look as good
      'simple' // use the simple algorithm, which just puts all chunks in the center of the slice
    ]
  },

  // number of burners to create on startup
  // @public, for phet-io clients
  burners: {
    type: 'number',
    defaultValue: EFACConstants.MAX_NUMBER_OF_INTRO_BURNERS,

    // create an array with integer values 1-N, where N is the max number of burners on the intro screen
    validValues: [ ...Array( EFACConstants.MAX_NUMBER_OF_INTRO_BURNERS ) ].map( ( n, i ) => ++i ),
    public: true
  },

  // select the startup block configuration
  // @public, for phet-io clients
  elements: {
    type: 'array',
    defaultValue: defaultElements,
    elementSchema: { type: 'string' },
    isValidValue: values => {
      const beakers = _.filter( values, value => value === EFACConstants.WATER_KEY || value === EFACConstants.OLIVE_OIL_KEY );

      return _.difference( values, defaultElements ).length === 0 &&
             values.length <= EFACConstants.MAX_NUMBER_OF_INTRO_ELEMENTS &&
             beakers.length <= EFACConstants.MAX_NUMBER_OF_INTRO_BEAKERS;
    },
    public: true
  }

} );

energyFormsAndChanges.register( 'EFACQueryParameters', EFACQueryParameters );
export default EFACQueryParameters;