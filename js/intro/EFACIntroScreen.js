// Copyright 2014-2018, University of Colorado Boulder

/**
 * the 'Intro' screen in the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EFACIntroModel' );
  var EFACIntroScreenView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EFACIntroScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var introString = require( 'string!ENERGY_FORMS_AND_CHANGES/intro' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function EFACIntroScreen( tandem ) {

    var options = {
      name: introString,
      backgroundColorProperty: new Property( EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR ),
      //TODO add homeScreenIcon
      tandem: tandem
    };

    Screen.call( this,
      function() {
        return new EFACIntroModel();
      },
      function( model ) {
        return new EFACIntroScreenView( model );
      },
      options );
  }

  energyFormsAndChanges.register( 'EFACIntroScreen', EFACIntroScreen );
  return inherit( Screen, EFACIntroScreen );
} );
