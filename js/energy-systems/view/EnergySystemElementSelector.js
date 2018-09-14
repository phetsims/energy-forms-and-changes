// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node that allows the user to select the various elements contained within a carousel by presenting a set of
 * radio-style push buttons, each with an icon image of the selection that it represents
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Panel = require( 'SUN/Panel' );
  var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );

  // constants
  var BUTTON_IMAGE_HEIGHT_AND_WIDTH = 44; // In screen coordinates, which is close to pixels.

  /**
   * @param {EnergySystemElementCarousel} carousel
   * @constructor
   */
  function EnergySystemElementSelector( carousel, options ) {

    options = _.extend( {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      xMargin: 10,
      yMargin: 10,
      stroke: Color.LIGHT_GRAY,
      lineWidth: 2
    }, options );

    var buttonElementList = [];

    for ( var i = 0; i < carousel.managedElements.length; i++ ) {
      var element = carousel.managedElements[ i ];
      var iconImage = element.iconImage;
      var width = iconImage.getBounds().getWidth();
      var height = iconImage.getBounds().getHeight();
      var denominator = ( width > height ) ? width : height;

      assert && assert( denominator > 0, 'Largest image dimension = 0 --> division by 0' );

      iconImage.setScaleMagnitude( BUTTON_IMAGE_HEIGHT_AND_WIDTH / denominator );
      buttonElementList.push( {
        value: i,
        node: iconImage
      } );
    }

    var buttonGroup = new RadioButtonGroup( carousel.targetIndexProperty, buttonElementList, {
      baseColor: Color.WHITE,
      orientation: 'horizontal',
      spacing: 15
    } );

    Panel.call( this, buttonGroup, options );
  }

  energyFormsAndChanges.register( 'EnergySystemElementSelector', EnergySystemElementSelector );

  return inherit( Panel, EnergySystemElementSelector );
} );

