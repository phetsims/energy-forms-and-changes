// Copyright 2018-2019, University of Colorado Boulder

/**
 * Beaker types for EFAC
 *
 * @author Chris Klusendorf
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const BeakerType = Enumeration.byKeys( [ 'WATER', 'OLIVE_OIL' ], {
  beforeFreeze: BeakerType => {
    BeakerType.getTandemName = beakerType => {
      return _.camelCase( beakerType.toString() ) + 'Beaker';
    };
  }
} );

energyFormsAndChanges.register( 'BeakerType', BeakerType );
export default BeakerType;