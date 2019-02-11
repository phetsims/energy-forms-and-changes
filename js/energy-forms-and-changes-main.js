// Copyright 2014-2019, University of Colorado Boulder

/**
 * Main entry point for the 'Energy Forms and Changes' sim.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const EFACIntroScreen = require( 'ENERGY_FORMS_AND_CHANGES/intro/EFACIntroScreen' );
  const SystemsScreen = require( 'ENERGY_FORMS_AND_CHANGES/systems/SystemsScreen' );
  const Sim = require( 'JOIST/Sim' );
  const SimLauncher = require( 'JOIST/SimLauncher' );
  const Tandem = require( 'TANDEM/Tandem' );

  // strings
  const energyFormsAndChangesTitleString = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.title' );

  // constants
  const tandem = Tandem.rootTandem;

  const simOptions = {
    credits: {
      leadDesign: 'Noah Podolefsky, Amy Rouinfar',
      softwareDevelopment: 'Andrew Adare, John Blanco, Chris Klusendorf',
      team: 'Trish Loeblein, Emily Moore, Ariel Paul, Kathy Perkins, and in cooperation with the Next-Lab project',
      qualityAssurance: 'Steele Dalton, Megan Lai, Liam Mulhall, Laura Rea, Jacob Romero, Katie Woessner, Kelly Wurtz, Bryan Yoelin',
      graphicArts: 'Cheryl McCutchan, Mariah Hermsmeyer, Megan Lai',
      thanks: ''
    }
  };

  SimLauncher.launch( () => {

    const sim = new Sim( energyFormsAndChangesTitleString, [
      new EFACIntroScreen( tandem.createTandem( 'introScreen' ) ),
      new SystemsScreen( tandem.createTandem( 'systemsScreen' ) )
    ], simOptions );

    sim.start();
  } );
} );
