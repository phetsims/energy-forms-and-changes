/*
 * Copyright 2002-2014, University of Colorado Boulder
 */

/**
 * View for the 'Intro' screen of the Energy Forms And Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );

  // images
  var mockupImage = require( 'image!ENERGY_FORMS_AND_CHANGES/mockup_intro.png' );


  /**
   * @param {EnergyFormsAndChangesIntroModel} energyFormsAndChangesIntroModel
   * @constructor
   */
  function EnergyFormsAndChangesIntroScreenView( energyFormsAndChangesIntroModel ) {

    ScreenView.call( this );


    //Show the mock-up and a slider to change its transparency
    var mockupOpacityProperty = new Property( 0.8 );
    var image = new Image( mockupImage, {pickable: false} );
    image.scale( this.layoutBounds.width / image.width );
    mockupOpacityProperty.linkAttribute( image, 'opacity' );
    this.addChild( image );
    this.addChild( new HSlider( mockupOpacityProperty, {min: 0, max: 1}, {top: 10, left: 10} ) );


    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        energyFormsAndChangesIntroModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );

    this.addChild( resetAllButton );

  }

  return inherit( ScreenView, EnergyFormsAndChangesIntroScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );