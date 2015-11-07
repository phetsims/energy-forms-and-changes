// Copyright 2014-2015, University of Colorado Boulder

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
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Screen = require( 'JOIST/Screen' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );

  // strings
  var introString = require( 'string!ENERGY_FORMS_AND_CHANGES/intro' );

  //TODO : put real icon in here
  // images
  // var introIcon = require( 'image!ENERGY_FORMS_AND_CHANGES/intro-icon.png' );

  /**
   * @constructor
   */
  function EnergyFormsAndChangesIntroScreen() {

    //If this is a single-screen sim, then no icon is necessary.
    //If there are multiple screens, then the icon must be provided here.
    var icon = new Rectangle( 0, 0, 147, 100, 0, 0, { fill: 'white' } );

    Screen.call( this, introString,
      icon,
      function() { return new EnergyFormsAndChangesIntroModel(); },
      function( model ) { return new EnergyFormsAndChangesIntroScreenView( model ); },
      { backgroundColor: EFACConstants.FIRST_TAB_BACKGROUND_COLOR }
    );
  }

  return inherit( Screen, EnergyFormsAndChangesIntroScreen );
} );