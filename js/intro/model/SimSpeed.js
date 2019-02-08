// Copyright 2018-2019, University of Colorado Boulder

/**
 * enum for sim speed settings
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  // @public
  const SimSpeed = {
    NORMAL: 'NORMAL',
    FAST_FORWARD: 'FAST_FORWARD'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( SimSpeed ); }

  return energyFormsAndChanges.register( 'SimSpeed', SimSpeed );
} );
