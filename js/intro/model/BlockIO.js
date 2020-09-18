// Copyright 2019-2020, University of Colorado Boulder

/**
 * BlockIO uses the Enumeration BlockType for toStateObject
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import EnumerationIO from '../../../../phet-core/js/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BlockType from './BlockType.js';

// constants
const BlockTypeEnumerationIO = EnumerationIO( BlockType );

const BlockIO = new IOType( 'BlockIO', {
  isValidValue: v => v instanceof phet.energyFormsAndChanges.Block,
  toStateObject( o ) {
    return {
      blockType: BlockTypeEnumerationIO.toStateObject( o.blockType )
    };
  }
} );

energyFormsAndChanges.register( 'BlockIO', BlockIO );
export default BlockIO;