//  Copyright 2002-2014, University of Colorado Boulder

/**
 * The 'Intro' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyFormsAndChangesIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyFormsAndChangesIntroModel' );
  var EnergyFormsAndChangesIntroScreenView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EnergyFormsAndChangesIntroScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var energyFormsAndChangesSimString = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.name' );

  /**
   * @constructor
   */
  function EnergyFormsAndChangesIntroScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, energyFormsAndChangesSimString, icon,
      function() { return new EnergyFormsAndChangesIntroModel(); },
      function( model ) { return new EnergyFormsAndChangesIntroScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, EnergyFormsAndChangesIntroScreen );
} );