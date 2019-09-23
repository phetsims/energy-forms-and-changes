// Copyright 2019, University of Colorado Boulder

/**
 * Beaker types for EFAC
 *
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  // @public
  const BeakerType = new Enumeration( [ 'WATER', 'OLIVE_OIL' ] );

  return energyFormsAndChanges.register( 'BeakerType', BeakerType );
} );