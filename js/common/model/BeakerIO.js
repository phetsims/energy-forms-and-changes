// Copyright 2019-2020, University of Colorado Boulder

/**
 * BeakerIO uses the Enumeration BeakerType for toStateObject
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import EnumerationIO from '../../../../phet-core/js/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerType from './BeakerType.js';

// constants
const BeakerTypeEnumerationIO = EnumerationIO( BeakerType );

const BeakerIO = new IOType( 'BeakerIO', {
  isValidValue: v => v instanceof phet.energyFormsAndChanges.Beaker,
  toStateObject( o ) {
    return {
      beakerType: BeakerTypeEnumerationIO.toStateObject( o.beakerType )
    };
  }
} );

energyFormsAndChanges.register( 'BeakerIO', BeakerIO );
export default BeakerIO;