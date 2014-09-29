//  Copyright 2002-2014, University of Colorado Boulder

/**
 *  The 'Energy Systems' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyFormsAndChangesEnergySystemsModel = require( 'ENERGY_FORMS_AND_CHANGES/energysystems/model/EnergyFormsAndChangesEnergySystemsModel' );
  var EnergyFormsAndChangesEnergySystemsScreenView = require( 'ENERGY_FORMS_AND_CHANGES/energysystems/view/EnergyFormsAndChangesEnergySystemsScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var energyFormsAndChangesSimString = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.name' );

  /**
   * @constructor
   */
  function EnergyFormsAndChangesEnergySystemsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, energyFormsAndChangesSimString, icon,
      function() { return new EnergyFormsAndChangesEnergySystemsModel(); },
      function( model ) { return new EnergyFormsAndChangesEnergySystemsScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, EnergyFormsAndChangesEnergySystemsScreen );
} );