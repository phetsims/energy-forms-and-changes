// Copyright 2018-2019, University of Colorado Boulder

/**
 * Beaker types for EFAC
 *
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Enumeration = require( 'PHET_CORE/Enumeration' );

  // @public
  const BeakerType = Enumeration.byKeys( [ 'WATER', 'OLIVE_OIL' ], {
    beforeFreeze: BeakerType => {
      BeakerType.getTandemName = beakerType => {
        return _.camelCase( beakerType.toString() ) + 'Beaker';
      };
    }
  } );

  return energyFormsAndChanges.register( 'BeakerType', BeakerType );
} );