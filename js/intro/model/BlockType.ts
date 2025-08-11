// Copyright 2018-2022, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

const BlockType = EnumerationDeprecated.byKeys( [ 'IRON', 'BRICK' ], {
  beforeFreeze: BlockType => {
    BlockType.getTandemName = blockType => {
      return `${blockType.toString().toLowerCase()}Block`;
    };
  }
} ) as IntentionalAny;

energyFormsAndChanges.register( 'BlockType', BlockType );
export default BlockType;