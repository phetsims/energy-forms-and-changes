// Copyright 2018-2019, University of Colorado Boulder

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  // @public
  const BlockType = new Enumeration( [ 'IRON', 'BRICK' ], {
    beforeFreeze: BlockType => {
      BlockType.getTandemName = blockType => {
        return blockType.toString().toLowerCase() + 'Block';
      };
    }
  } );

  return energyFormsAndChanges.register( 'BlockType', BlockType );
} );