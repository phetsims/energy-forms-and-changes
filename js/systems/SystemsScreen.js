// Copyright 2016-2018, University of Colorado Boulder

/**
 *  The 'Systems' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );
  var SystemsModel = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/SystemsModel' );
  var SystemsScreenView = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/SystemsScreenView' );

  // strings
  var systemsString = require( 'string!ENERGY_FORMS_AND_CHANGES/systems' );

  // images
  var systemsScreenIcon = require( 'image!ENERGY_FORMS_AND_CHANGES/systems_screen_icon.png' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function SystemsScreen( tandem ) {

    var options = {
      name: systemsString,
      backgroundColorProperty: new Property( EFACConstants.SECOND_SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: new Image( systemsScreenIcon ),
      tandem: tandem
    };

    Screen.call( this,
      function() {
        return new SystemsModel();
      },
      function( model ) {
        return new SystemsScreenView( model );
      },
      options );
  }

  energyFormsAndChanges.register( 'SystemsScreen', SystemsScreen );

  return inherit( Screen, SystemsScreen );
} );

