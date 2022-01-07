// Copyright 2018-2022, University of Colorado Boulder

/**
 * Beaker types for EFAC
 *
 * @author Chris Klusendorf
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const BeakerType = EnumerationDeprecated.byKeys( [ 'WATER', 'OLIVE_OIL' ], {
  beforeFreeze: BeakerType => {
    BeakerType.getTandemName = beakerType => {
      return `${_.camelCase( beakerType.toString() )}Beaker`;
    };
  }
} );

energyFormsAndChanges.register( 'BeakerType', BeakerType );
export default BeakerType;