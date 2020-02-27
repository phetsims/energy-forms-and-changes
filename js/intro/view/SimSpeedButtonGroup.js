// Copyright 2019, University of Colorado Boulder

/**
 * Button group that controls the sim speed with "Normal" and "Fast Forward" radio buttons. It is only used as a helper
 * for development and QA testing - it is not part of the public sim and is protected by a query parameter.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/nodes/HBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import AquaRadioButton from '../../../../sun/js/AquaRadioButton.js';
import energyFormsAndChangesStrings from '../../energy-forms-and-changes-strings.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import SimSpeed from '../model/SimSpeed.js';

const fastForwardString = energyFormsAndChangesStrings.fastForward;
const normalString = energyFormsAndChangesStrings.normal;

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

energyFormsAndChanges.register( 'SimSpeedButtonGroup', SimSpeedButtonGroup );
export default SimSpeedButtonGroup;