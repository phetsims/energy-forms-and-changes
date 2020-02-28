// Copyright 2014-2020, University of Colorado Boulder

/**
 * Main entry point for the 'Energy Forms and Changes' sim.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 */

import Sim from '../../joist/js/Sim.js';
import SimLauncher from '../../joist/js/SimLauncher.js';
import Tandem from '../../tandem/js/Tandem.js';
import energyFormsAndChangesStrings from './energy-forms-and-changes-strings.js';
import EFACIntroScreen from './intro/EFACIntroScreen.js';
import SystemsScreen from './systems/SystemsScreen.js';

const energyFormsAndChangesTitleString = energyFormsAndChangesStrings[ 'energy-forms-and-changes' ].title;

// constants
const tandem = Tandem.ROOT;

const simOptions = {
  credits: {
    leadDesign: 'Noah Podolefsky, Amy Rouinfar',
    softwareDevelopment: 'Andrew Adare, John Blanco, Chris Klusendorf',
    team: 'Trish Loeblein, Emily B. Moore, Ariel Paul, Kathy Perkins, and in cooperation with the Next-Lab project',
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