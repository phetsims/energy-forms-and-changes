// Copyright 2002-2015, University of Colorado

/**
 * Clock control panel that shows "Normal Speed" and "Fast Forward" as radio buttons with a play/pause and step button.
 *
 * @author Sam Reid
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PlayPauseButton = require( 'SCENERY_PHET/buttons/PlayPauseButton' );
  var StepButton = require( 'SCENERY_PHET/buttons/StepButton' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Text = require( 'SCENERY/nodes/Text' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );

  // strings
  var normalString = require( 'string!ENERGY_FORMS_AND_CHANGES/normal' );
  var fastForwardString = require( 'string!ENERGY_FORMS_AND_CHANGES/fastForward' );

  // static data
  var RADIO_BUTTON_FONT = new PhetFont( 16 );

  /**
   * Constructor for the NormalAndFastForwardTimeControlPanel.
   *
   * @param {EnergyFormsAndChangesIntroModel} model
   * @constructor
   */
  function NormalAndFastForwardTimeControlPanel( model ) {

    // Add play/pause button.
    var playPauseButton = new PlayPauseButton( model.playProperty, { radius: 20 } );

    // Add the step button to manually step animation.
    var stepButton = new StepButton( function() { model.manualStep(); }, model.playProperty,
      {
        radius: 15,
        centerX: playPauseButton.centerX
      } );

    // Group the play and pause buttons into their own panel for correct layout in the LayoutBox.
    var playPauseButtonGroup = new LayoutBox( {
      children: [playPauseButton, stepButton],
      spacing: 10,
      orientation: 'horizontal'
    });

    // TODO: Scale the text to make it translatable.
    var radioButtonContent = [
      { value: true, node: new Text( normalString, { font: RADIO_BUTTON_FONT } ) },
      { value: false, node: new Text( fastForwardString, { font: RADIO_BUTTON_FONT } ) }
    ];
    var radioButtonGroup = new RadioButtonGroup( model.normalSimSpeedProperty, radioButtonContent, {
      orientation: 'horizontal',
      selectedLineWidth: 4
    });
    //this.addChild( radioButtonGroup );

    LayoutBox.call( this, {
      children: [radioButtonGroup, playPauseButtonGroup ],
      orientation: 'horizontal',
      spacing: 35
    } );

  }

  return inherit( LayoutBox, NormalAndFastForwardTimeControlPanel );

} );