// Copyright 2014-2018, University of Colorado Boulder

/**
 * Clock control panel that shows "Normal Speed" and "Fast Forward" as radio buttons with a play/pause and step button.
 *
 * @author Sam Reid
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
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
  function NormalAndFastForwardTimeControlPanel( model ) {

    // add play/pause button
    var playPauseButton = new PlayPauseButton( model.isPlayingProperty, {
      radius: EFACConstants.PLAY_PAUSE_BUTTON_RADIUS
    } );

    // add the step button, used to manually step the simulation
    var stepButton = new StepForwardButton( {
      isPlayingProperty: model.isPlayingProperty,
      listener: function() { model.manualStep(); },
      radius: EFACConstants.STEP_FORWARD_BUTTON_RADIUS
    } );

    // group the play and pause buttons into their own panel for correct layout in the HBox
    var playPauseButtonGroup = new HBox( {
      children: [ playPauseButton, stepButton ],
      spacing: 10
    } );

    var radioButtonContent = [
      { value: SimSpeed.NORMAL, node: new Text( normalString, { font: RADIO_BUTTON_FONT } ) },
      { value: SimSpeed.FAST_FORWARD, node: new Text( fastForwardString, { font: RADIO_BUTTON_FONT } ) }
    ];
    var radioButtonGroup = new RadioButtonGroup( model.normalSimSpeedProperty, radioButtonContent, {
      orientation: 'horizontal',
      selectedLineWidth: 4
    } );

    HBox.call( this, {
      children: [ radioButtonGroup, playPauseButtonGroup ],
      spacing: 35
    } );
  }

  energyFormsAndChanges.register( 'NormalAndFastForwardTimeControlPanel', NormalAndFastForwardTimeControlPanel );

  return inherit( HBox, NormalAndFastForwardTimeControlPanel );
} );

