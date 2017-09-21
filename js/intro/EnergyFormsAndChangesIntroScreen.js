// Copyright 2014-2017, University of Colorado Boulder

/**
 * The 'Intro' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyFormsAndChangesIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyFormsAndChangesIntroModel' );
  var EnergyFormsAndChangesIntroScreenView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EnergyFormsAndChangesIntroScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Screen = require( 'JOIST/Screen' );

  // strings
  var introString = require( 'string!ENERGY_FORMS_AND_CHANGES/intro' );

  /**
   * @param {Tandem} tandem
   * @constructor
   */
  function EnergyFormsAndChangesIntroScreen( tandem ) {

    var options = {
      name: introString,
      backgroundColorProperty: new Property( EFACConstants.FIRST_TAB_BACKGROUND_COLOR ),
      //TODO add homeScreenIcon
      tandem: tandem
    };

    Screen.call( this,
      function() {
        return new EnergyFormsAndChangesIntroModel();
      },
      function( model ) {
        return new EnergyFormsAndChangesIntroScreenView( model );
      },
      options );
  }

  energyFormsAndChanges.register( 'EnergyFormsAndChangesIntroScreen', EnergyFormsAndChangesIntroScreen );
  return inherit( Screen, EnergyFormsAndChangesIntroScreen );
} );

