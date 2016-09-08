// Copyright 2014-2015, University of Colorado Boulder

/**
 *  The 'Energy Systems' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySystemsModel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemsModel' );
  var EnergySystemsScreenView = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EnergySystemsScreenView' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var energySystemsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySystems' );


  // TODO: include icon for screen
  // images
  //  var energySystemsIcon = require( 'image!ENERGY_FORMS_AND_CHANGES/energy-systems-icon.png' );


  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function EnergySystemsScreen( tandem ) {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.

    var icon = new Rectangle( 0, 0, Screen.HOME_SCREEN_ICON_SIZE.width, Screen.HOME_SCREEN_ICON_SIZE.height, {
      fill: 'white'
    } );

    Screen.call( this, energySystemsString,
      icon,
      function() {
        return new EnergySystemsModel();
      },
      function( model ) {
        return new EnergySystemsScreenView( model );
      }, {
        backgroundColor: 'white',
        tandem: tandem
      }
    );
  }

  energyFormsAndChanges.register( 'EnergySystemsScreen', EnergySystemsScreen );

  return inherit( Screen, EnergySystemsScreen );
} );

