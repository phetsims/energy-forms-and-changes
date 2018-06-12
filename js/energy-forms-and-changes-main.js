// Copyright 2014-2018, University of Colorado Boulder

/**
 * Main entry point for the 'Energy Forms And Changes' sim.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACIntroScreen = require( 'ENERGY_FORMS_AND_CHANGES/intro/EFACIntroScreen' );
  var EnergySystemsScreen = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/EnergySystemsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var energyFormsAndChangesTitleString = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.title' );

  // constants
  var tandem = Tandem.rootTandem;

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky',
      softwareDevelopment: 'John Blanco',
      team: 'Ariel Paul, Emily Moore, Katherine Perkins, Trish Loeblein, and in cooperation with the Next-Lab project',
      qualityAssurance: '', //TODO
      graphicArts: '', //TODO
      thanks: ''
    }
  };

  SimLauncher.launch( function() {

    var sim = new Sim( energyFormsAndChangesTitleString, [
      new EFACIntroScreen( tandem.createTandem( 'introScreen' ) ),
      new EnergySystemsScreen( tandem.createTandem( 'energySystemsScreen' ) )
    ], simOptions );

    sim.start();
  } );
} );
