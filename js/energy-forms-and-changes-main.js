//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Main entry point for the 'Energy Forms And Changes' sim.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyFormsAndChangesIntroScreen = require( 'ENERGY_FORMS_AND_CHANGES/intro/EnergyFormsAndChangesIntroScreen' );
  var EnergyFormsAndChangesEnergySystemsScreen = require( 'ENERGY_FORMS_AND_CHANGES/energysystems/EnergyFormsAndChangesEnergySystemsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );

  // strings
  var simTitle = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.name' );

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky',
      softwareDevelopment: 'John Blanco',
      team: 'Ariel Paul, Emily Moore, Katherine Perkins, Trish Loeblein',
      qualityAssurance: '',
      interviews: 'Noah Podolefsky',
      graphicArts: 'Noah Podolefsky',
      thanks: ''
    }
  };

  // Appending '?dev' to the URL will enable developer-only features.
  if ( phet.phetcommon.getQueryParameter( 'dev' ) ) {
    simOptions = _.extend( {
      // add dev-specific options here
      showHomeScreen: false,
      screenIndex: 0
    }, simOptions );
  }

  SimLauncher.launch( function() {

    var sim = new Sim( simTitle, [ new EnergyFormsAndChangesIntroScreen(), new EnergyFormsAndChangesEnergySystemsScreen() ], simOptions );
    sim.start();
  } );
} );