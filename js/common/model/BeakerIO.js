// Copyright 2019, University of Colorado Boulder

/**
 * BeakerIO uses the Enumeration BeakerType for toStateObject
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import validate from '../../../../axon/js/validate.js';
import EnumerationIO from '../../../../phet-core/js/EnumerationIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerType from './BeakerType.js';

// constants
const BeakerTypeEnumerationIO = EnumerationIO( BeakerType );

class BeakerIO extends ObjectIO {

  /**
   * Return the json that BeakerIO is wrapping.  This can be overridden by subclasses, or types can use BeakerIO type
   * directly to use this implementation.
   * @param {Object} o
   * @returns {Object}
   * @public
   */
  static toStateObject( o ) {
    validate( o, this.validator );
    return {
      beakerType: BeakerTypeEnumerationIO.toStateObject( o.beakerType )
    };
  }
}

/**
 * A validator object to be used to validate the core types that IOTypes wrap.
 * @type {ValidatorDef}
 * @public
 * @override
 */
BeakerIO.validator = ObjectIO.validator;

/**
 * Documentation that appears in PhET-iO Studio, supports HTML markup.
 * @public
 */
BeakerIO.documentation = 'Uses BeakerType for toStateObject';
BeakerIO.typeName = 'BeakerIO';
ObjectIO.validateSubtype( BeakerIO );

energyFormsAndChanges.register( 'BeakerIO', BeakerIO );
export default BeakerIO;