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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var energySystemsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySystems' );


  // TODO: include icon for screen
  // images
//  var energySystemsIcon = require( 'image!ENERGY_FORMS_AND_CHANGES/energy-systems-icon.png' );


  /**
   * @constructor
   */
  function EnergyFormsAndChangesEnergySystemsScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.

    var icon = new Rectangle( 0, 0, 147, 100, 0, 0, { fill: 'white' } );

    Screen.call( this, energySystemsString,
      icon,
      function() { return new EnergyFormsAndChangesEnergySystemsModel(); },
      function( model ) { return new EnergyFormsAndChangesEnergySystemsScreenView( model ); },
      { backgroundColor: 'white' }
    );
  }

  return inherit( Screen, EnergyFormsAndChangesEnergySystemsScreen );
} );