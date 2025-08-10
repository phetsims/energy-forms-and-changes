// Copyright 2018-2022, University of Colorado Boulder

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const BlockType = EnumerationDeprecated.byKeys( [ 'IRON', 'BRICK' ], {
  beforeFreeze: BlockType => {
    BlockType.getTandemName = blockType => {
      return `${blockType.toString().toLowerCase()}Block`;
    };
  }
} );

energyFormsAndChanges.register( 'BlockType', BlockType );
export default BlockType;