// Copyright 2018-2019, University of Colorado Boulder

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  // @public
  var BlockType = {
    IRON: 'IRON',
    BRICK: 'BRICK'
  };

  // verify that enum is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( BlockType ); }

  return energyFormsAndChanges.register( 'BlockType', BlockType );
} );