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
  var SystemsScreen = require( 'ENERGY_FORMS_AND_CHANGES/systems/SystemsScreen' );
  var Sim = require( 'JOIST/Sim' );
  var SimLauncher = require( 'JOIST/SimLauncher' );
  var Tandem = require( 'TANDEM/Tandem' );

  // strings
  var energyFormsAndChangesTitleString = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.title' );

  // constants
  var tandem = Tandem.rootTandem;

  var simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky, Amy Rouinfar',
      softwareDevelopment: 'Andrew Adare, John Blanco, Chris Klusendorf',
      team: 'Trish Loeblein, Emily Moore, Ariel Paul, Kathy Perkins, and in cooperation with the Next-Lab project',
      qualityAssurance: 'Steele Dalton, Jacob Romero, Kathryn Woessner, Bryan Yoelin',
      graphicArts: 'Mariah Hermsmeyer, Megan Lai',
      thanks: ''
    }
  };

  SimLauncher.launch( function() {

    var sim = new Sim( energyFormsAndChangesTitleString, [
      new EFACIntroScreen( tandem.createTandem( 'introScreen' ) ),
      new SystemsScreen( tandem.createTandem( 'systemsScreen' ) )
    ], simOptions );

    sim.start();
  } );
} );
