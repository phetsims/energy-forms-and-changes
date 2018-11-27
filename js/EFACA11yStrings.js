// Copyright 2018, University of Colorado Boulder

/**
 * Single location of all accessibility strings.  These strings are not meant to be translatable yet.  Rosetta needs
 * some work to provide translators with context for these strings, and we want to receive some community feedback
 * before these strings are submitted for translation.
 *
 * @author Jesse Greenberg
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );

  var EFACA11yStrings = {
    systemsScreenSummaryDescription: {
      value: 'This is an interactive sim. It changes as you play with it. It has a Play Area and a ' +
             'Control Panel. In the play area, construct an energy system with an energy producer, ' +
             'converter and consumer. Adjust the energy production and observe the flow of energy in the ' +
             'system. Inspect the energy forms and changes with energy symbols. In the control panel, ' +
             'use the play, pause and step buttons or reset the sim.'
    },
    systemsScreenInteractionHint: {
      value: 'Adjust the energy producer to begin observations.'
    },
    energySystem: {
      value: 'Energy System'
    },
    energySystemHelpText: {
      value: 'Energy system contains a {{producer}}, {{converter}}, and {{user}}.'
    },
    waterFaucet: {
      value: 'water faucet'
    },
    sun: {
      value: 'sun'
    },
    teaKettle: {
      value: 'tea kettle'
    },
    cyclist: {
      value: 'cyclist'
    },
    electricalGenerator: {
      value: 'wheel generator'
    },
    solarPanel: {
      value: 'solar panel'
    },
    beakerOfWater: {
      value: 'beaker of water on heating element'
    },
    incandescentLightBulb: {
      value: 'incandescent light bulb'
    },
    fluorescentLightBulb: {
      value: 'fluorescent light bulb'
    }
  };

  if ( phet.chipper.queryParameters.stringTest === 'xss' ) {
    for ( var key in EFACA11yStrings ) {
      EFACA11yStrings[ key ].value += '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIW2NkYGD4DwABCQEBtxmN7wAAAABJRU5ErkJggg==" onload="window.location.href=atob(\'aHR0cHM6Ly93d3cueW91dHViZS5jb20vd2F0Y2g/dj1kUXc0dzlXZ1hjUQ==\')" />';
    }
  }

  // verify that object is immutable, without the runtime penalty in production code
  if ( assert ) { Object.freeze( EFACA11yStrings ); }

  energyFormsAndChanges.register( 'EFACA11yStrings', EFACA11yStrings );

  return EFACA11yStrings;
} );