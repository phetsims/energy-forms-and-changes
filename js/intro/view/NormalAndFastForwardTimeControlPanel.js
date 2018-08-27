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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
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
    var playPauseButton = new PlayPauseButton( model.playProperty, { radius: 20 } );

    // add the step button, used to manually step the simulation
    var stepButton = new StepForwardButton( {
      isPlayingProperty: model.playProperty,
      listener: function() { model.manualStep(); },
      radius: 15,
      centerX: playPauseButton.centerX
    } );

    // group the play and pause buttons into their own panel for correct layout in the LayoutBox
    var playPauseButtonGroup = new LayoutBox( {
      children: [ playPauseButton, stepButton ],
      spacing: 10,
      orientation: 'horizontal'
    } );

    var radioButtonContent = [
      { value: SimSpeed.NORMAL, node: new Text( normalString, { font: RADIO_BUTTON_FONT } ) },
      { value: SimSpeed.FAST_FORWARD, node: new Text( fastForwardString, { font: RADIO_BUTTON_FONT } ) }
    ];
    var radioButtonGroup = new RadioButtonGroup( model.normalSimSpeedProperty, radioButtonContent, {
      orientation: 'horizontal',
      selectedLineWidth: 4
    } );

    LayoutBox.call( this, {
      children: [ radioButtonGroup, playPauseButtonGroup ],
      orientation: 'horizontal',
      spacing: 35
    } );
  }

  energyFormsAndChanges.register( 'NormalAndFastForwardTimeControlPanel', NormalAndFastForwardTimeControlPanel );

  return inherit( LayoutBox, NormalAndFastForwardTimeControlPanel );
} );

