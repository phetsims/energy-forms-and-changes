//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyFormsAndChangesModel = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/model/EnergyFormsAndChangesModel' );
  var EnergyFormsAndChangesScreenView = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/view/EnergyFormsAndChangesScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var energyFormsAndChangesSimString = require( 'string!ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes.name' );

  /**
   * @constructor
   */
  function EnergyFormsAndChangesScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = null;

    Screen.call( this, energyFormsAndChangesSimString, icon,
      function() { return new EnergyFormsAndChangesModel(); },
      function( model ) { return new EnergyFormsAndChangesScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, EnergyFormsAndChangesScreen );
} );