// Copyright 2019, University of Colorado Boulder

//REVIEW #247 this duplicates SCENERY_PHET/TimeControlNode
/**
 * Button group that contains a play/pause and step button.
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  const StepForwardButton = require( 'SCENERY_PHET/buttons/StepForwardButton' );

  class PlayPauseStepButtonGroup extends HBox {

    //REVIEW #247 passing in the entire model is undesirable
    /**
     * @param {EFACIntroModel|SystemsModel} model
     */
    constructor( model ) {

      // create the play/pause button
      const playPauseButton = new PlayPauseButton( model.isPlayingProperty, {
        radius: EFACConstants.PLAY_PAUSE_BUTTON_RADIUS
      } );

      // create the step button, which is used to manually step the simulation
      const stepButton = new StepForwardButton( {
        isPlayingProperty: model.isPlayingProperty,
        listener: () => model.manualStep(),
        radius: EFACConstants.STEP_FORWARD_BUTTON_RADIUS
      } );

      super( {
        children: [ playPauseButton, stepButton ],
        spacing: 10
      } );
    }
  }

  return energyFormsAndChanges.register( 'PlayPauseStepButtonGroup', PlayPauseStepButtonGroup );
} );

