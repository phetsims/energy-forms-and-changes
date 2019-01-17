// Copyright 2019, University of Colorado Boulder

/**
 * Button group that controls the sim speed with "Normal" and "Fast Forward" radio buttons.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var SimSpeed = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/SimSpeed' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var fastForwardString = require( 'string!ENERGY_FORMS_AND_CHANGES/fastForward' );
  var normalString = require( 'string!ENERGY_FORMS_AND_CHANGES/normal' );

  // static data
  var RADIO_BUTTON_FONT = new PhetFont( 16 );
  var SPEED_BUTTON_MAX_WIDTH = 200; // empirically determined

  /**
   * @param {Property.<SimSpeed>} simSpeedProperty
   * @constructor
   */
  function SimSpeedButtonGroup( simSpeedProperty ) {

    // create the text nodes for normal and fast forward buttons
    var normalText = new Text( normalString, {
      font: RADIO_BUTTON_FONT,
      maxWidth: SPEED_BUTTON_MAX_WIDTH
    } );
    var fastForwardText = new Text( fastForwardString, {
      font: RADIO_BUTTON_FONT,
      maxWidth: SPEED_BUTTON_MAX_WIDTH
    } );

    // create the normal and fast forward radio buttons
    var normalButton = new AquaRadioButton( simSpeedProperty, SimSpeed.NORMAL, normalText );
    var fastForwardButton = new AquaRadioButton( simSpeedProperty, SimSpeed.FAST_FORWARD, fastForwardText );

    HBox.call( this, {
      children: [ normalButton, fastForwardButton ],
      spacing: 10
    } );
  }

  energyFormsAndChanges.register( 'SimSpeedButtonGroup', SimSpeedButtonGroup );

  return inherit( HBox, SimSpeedButtonGroup );
} );

