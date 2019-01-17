// Copyright 2019, University of Colorado Boulder

/**
 * Button group that contains a play/pause and step button.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );

  /**
   * @param {EFACIntroModel|SystemsModel} model
   * @constructor
   */
  function PlayPauseStepButtonGroup( model ) {

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

    HBox.call( this, {
      children: [ playPauseButton, stepButton ],
      spacing: 10
    } );
  }

  energyFormsAndChanges.register( 'PlayPauseStepButtonGroup', PlayPauseStepButtonGroup );

  return inherit( HBox, PlayPauseStepButtonGroup );
} );

