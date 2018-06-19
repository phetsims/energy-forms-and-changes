// Copyright 2018, University of Colorado Boulder

/**
 * enum for sim speed settings
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  // @public
  var SimSpeed = {
    NORMAL: 'NORMAL',
    FAST_FORWARD: 'FAST_FORWARD'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( SimSpeed ); }

  energyFormsAndChanges.register( 'SimSpeed', SimSpeed );

  return SimSpeed;
} );
