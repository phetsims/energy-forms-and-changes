// Copyright 2019, University of Colorado Boulder

/**
 * Button group that controls the sim speed with "Normal" and "Fast Forward" radio buttons. It is only used as a helper
 * for development and QA testing - it is not part of the public sim and is protected by a query parameter.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AquaRadioButton = require( 'SUN/AquaRadioButton' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const SimSpeed = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/SimSpeed' );
  const Text = require( 'SCENERY/nodes/Text' );

  // strings
  const fastForwardString = require( 'string!ENERGY_FORMS_AND_CHANGES/fastForward' );
  const normalString = require( 'string!ENERGY_FORMS_AND_CHANGES/normal' );

  // static data
  const RADIO_BUTTON_FONT = new PhetFont( 16 );
  const SPEED_BUTTON_MAX_WIDTH = 200; // empirically determined

  class SimSpeedButtonGroup extends HBox {

    /**
     * @param {Property.<SimSpeed>} simSpeedProperty
     */
    constructor( simSpeedProperty ) {

      // create the text nodes for normal and fast forward buttons
      const normalText = new Text( normalString, {
        font: RADIO_BUTTON_FONT,
        maxWidth: SPEED_BUTTON_MAX_WIDTH
      } );
      const fastForwardText = new Text( fastForwardString, {
        font: RADIO_BUTTON_FONT,
        maxWidth: SPEED_BUTTON_MAX_WIDTH
      } );

      // create the normal and fast forward radio buttons
      const normalButton = new AquaRadioButton( simSpeedProperty, SimSpeed.NORMAL, normalText );
      const fastForwardButton = new AquaRadioButton( simSpeedProperty, SimSpeed.FAST_FORWARD, fastForwardText );

      super( {
        children: [ normalButton, fastForwardButton ],
        spacing: 10
      } );
    }
  }

  return energyFormsAndChanges.register( 'SimSpeedButtonGroup', SimSpeedButtonGroup );
} );

