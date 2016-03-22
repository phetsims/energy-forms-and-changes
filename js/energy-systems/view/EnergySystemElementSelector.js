// Copyright 2016, University of Colorado Boulder

/**
 * Node that allows the user to select the various elements contained within
 * a carousel by presenting a set of radio-style push buttons, each with an
 * icon image of the selection that it represents.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // Modules
  // var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Panel = require( 'SUN/Panel' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // Constants
  var BUTTON_IMAGE_HEIGHT_OR_WIDTH = 50; // In screen coordinates, which is close to pixels.

  /**
   * @param {EnergySystemElementCarousel} carousel
   * @constructor
   */
  function EnergySystemElementSelector( carousel ) {

    var buttonElementList = [];

    for ( var i = 0; i < carousel.managedElements.length; i++ ) {
      var element = carousel.managedElements[ i ];
      var iconImage = element.iconImage;
      var width = iconImage.getBounds().getWidth();
      var height = iconImage.getBounds().getHeight();
      var denominator = ( width > height ) ? width : height;

      assert && assert( denominator > 0, 'Largest image dimension = 0 --> division by 0' );

      iconImage.setScaleMagnitude( BUTTON_IMAGE_HEIGHT_OR_WIDTH / denominator );

      var imageBounds = iconImage.bounds.dilated( 5 );
      var buttonRect = new Rectangle( imageBounds, 4, 4, {
        fill: 'white',
        stroke: 'black'
      } );

      buttonRect.addChild( iconImage );

      buttonElementList.push( {
        value: i,
        node: buttonRect
      } );
    }

    var buttonGroup = new RadioButtonGroup( carousel.targetIndexProperty, buttonElementList, {
      baseColor: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      orientation: 'horizontal',
      selectedStroke: 'none',
      deselectedStroke: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR
    } );

    Panel.call( this, buttonGroup, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR
    } );

  }

  return inherit( Panel, EnergySystemElementSelector );
} );