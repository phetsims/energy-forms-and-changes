// Copyright 2018, University of Colorado Boulder

/**
 * query parameters supported by this simulation
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  var EFACQueryParameters = QueryStringMachine.getAll( {

    // show the 2D bounds of the block, which is what is actually modeled
    show2DBlockBounds: { type: 'flag' },

    // show the bounds of the air
    showAirBounds: { type: 'flag' },

    // show the energy chunk container slice outlines
    showContainerSlices: { type: 'flag' },

    // show the 2D bounds of the beaker
    show2DBeakerBounds: { type: 'flag' }
  } );

  energyFormsAndChanges.register( 'EFACQueryParameters', EFACQueryParameters );

  return EFACQueryParameters;
} );