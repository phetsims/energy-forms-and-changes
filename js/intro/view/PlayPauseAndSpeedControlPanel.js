// Copyright 2014-2018, University of Colorado Boulder

/**
 * Clock control panel that shows "Normal Speed" and "Fast Forward" as radio buttons with a play/pause and step button.
 *
 * @author Sam Reid
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var AquaRadioButton = require( 'SUN/AquaRadioButton' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var SimSpeed = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/SimSpeed' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  // strings
  var fastForwardString = require( 'string!ENERGY_FORMS_AND_CHANGES/fastForward' );
  var normalString = require( 'string!ENERGY_FORMS_AND_CHANGES/normal' );

  // static data
  var RADIO_BUTTON_FONT = new PhetFont( 16 );

  /**
   * @param {EFACIntroModel} model
   * @constructor
   */
  function PlayPauseAndSpeedControlPanel( model ) {

    // create the play/pause button
    var playPauseButton = new PlayPauseButton( model.isPlayingProperty, {
      radius: EFACConstants.PLAY_PAUSE_BUTTON_RADIUS
    } );

    // create the step button, which is used to manually step the simulation
    var stepButton = new StepForwardButton( {
      isPlayingProperty: model.isPlayingProperty,
      listener: function() { model.manualStep(); },
      radius: EFACConstants.STEP_FORWARD_BUTTON_RADIUS
    } );

    // group the play and pause buttons into their own HBox
    var playPauseStepButtonGroup = new HBox( {
      children: [ playPauseButton, stepButton ],
      spacing: 10
    } );

    // create the text nodes for normal and fast forward buttons
    var normalText = new Text( normalString, { font: RADIO_BUTTON_FONT } );
    var fastForwardText = new Text( fastForwardString, { font: RADIO_BUTTON_FONT } );

    // create the normal and fast forward radio buttons
    var normalButton = new AquaRadioButton( model.normalSimSpeedProperty, SimSpeed.NORMAL, normalText );
    var fastForwardButton = new AquaRadioButton( model.normalSimSpeedProperty, SimSpeed.FAST_FORWARD, fastForwardText );

    // group the normal and fast forward buttons into their own HBox
    var normalFastForwardButtonGroup = new HBox( {
      children: [ normalButton, fastForwardButton ],
      spacing: 10
    } );

    HBox.call( this, {
      children: [ normalFastForwardButtonGroup, playPauseStepButtonGroup ],
      spacing: 25
    } );
  }

  energyFormsAndChanges.register( 'PlayPauseAndSpeedControlPanel', PlayPauseAndSpeedControlPanel );

  return inherit( HBox, PlayPauseAndSpeedControlPanel );
} );

