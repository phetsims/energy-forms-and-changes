// Copyright 2019-2020, University of Colorado Boulder

/**
 * BlockIO uses the Enumeration BlockType for toStateObject
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 * @author Sam Reid (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import EnumerationIO from '../../../../phet-core/js/EnumerationIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BlockType from './BlockType.js';

// constants
const BlockTypeEnumerationIO = EnumerationIO( BlockType );

class BlockIO extends ObjectIO {

  /**
   * Return the json that BlockIO is wrapping.  This can be overridden by subclasses, or types can use BlockIO type
   * directly to use this implementation.
   * @param {Object} o
   * @returns {Object}
   * @public
   */
  static toStateObject( o ) {
    validate( o, this.validator );
    return {
      blockType: BlockTypeEnumerationIO.toStateObject( o.blockType )
    };
  }
}

/**
 * A validator object to be used to validate the core types that IOTypes wrap.
 * @type {ValidatorDef}
 * @public
 * @override
 */
BlockIO.validator = ObjectIO.validator;

/**
 * Documentation that appears in PhET-iO Studio, supports HTML markup.
 * @public
 */
BlockIO.documentation = 'Uses BlockType for toStateObject';
BlockIO.typeName = 'BlockIO';
ObjectIO.validateSubtype( BlockIO );

energyFormsAndChanges.register( 'BlockIO', BlockIO );
export default BlockIO;