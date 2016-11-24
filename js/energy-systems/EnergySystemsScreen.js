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
  var inherit = require( 'PHET_CORE/inherit' );
  var Screen = require( 'JOIST/Screen' );
  var Property = require( 'AXON/Property' );
  var Color = require( 'SCENERY/util/Color' );

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

    var options = {
      name: energySystemsString,
      backgroundColorProperty: new Property( Color.toColor( 'white' ) ),
      //TODO add homeScreenIcon
      tandem: tandem
    };

    Screen.call( this,
      function() {
        return new EnergySystemsModel();
      },
      function( model ) {
        return new EnergySystemsScreenView( model );
      },
      options );
  }

  energyFormsAndChanges.register( 'EnergySystemsScreen', EnergySystemsScreen );

  return inherit( Screen, EnergySystemsScreen );
} );

