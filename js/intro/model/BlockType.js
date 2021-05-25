// Copyright 2018-2021, University of Colorado Boulder

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const BlockType = Enumeration.byKeys( [ 'IRON', 'BRICK' ], {
  beforeFreeze: BlockType => {
    BlockType.getTandemName = blockType => {
      return `${blockType.toString().toLowerCase()}Block`;
    };
  }
} );

energyFormsAndChanges.register( 'BlockType', BlockType );
export default BlockType;