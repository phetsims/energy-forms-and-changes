// Copyright 2018-2019, University of Colorado Boulder

/**
 * enum for sim speed settings
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  // @public
  const SimSpeed = new Enumeration( [ 'NORMAL', 'FAST_FORWARD' ] );

  return energyFormsAndChanges.register( 'SimSpeed', SimSpeed );
} );
