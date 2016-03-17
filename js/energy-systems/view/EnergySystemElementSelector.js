// Copyright 2016, University of Colorado Boulder

/**
 * Node that allows the user to select the various elements contained within
 * a carousel by presenting a set of radio-style push buttons, each with an
 * icon image of the selection that it represents.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  // var RadioButtonGroup = require( 'SUN/buttons/RadioButtonGroup' );

  // Constants
  var BUTTON_IMAGE_HEIGHT_OR_WIDTH = 50; // In screen coordinates, which is close to pixels.

  /**
   * @param {EnergySystemElementCarousel} carousel
   * @constructor
   */
  function EnergySystemElementSelector( carousel ) {
    Node.call( this );

    var buttonElementList = [];

    for ( var i = 0; i < carousel.managedElements.length; i++ ) {
      var element = carousel.managedElements[ i ];
      var buttonImageNode = new Image( element.iconImage );
      var width = buttonImageNode.getBounds().getWidth();
      var height = buttonImageNode.getBounds().getHeight();
      var denominator = ( width > height ) ? width : height;
      buttonImageNode.setScale( BUTTON_IMAGE_HEIGHT_OR_WIDTH / denominator );

      // TODO: null -> RadioButton??
      buttonElementList.push( null );
      // add( new RadioButtonStripControlPanelNode.Element < Integer > ( buttonImageNode, i, carousel.getElement( i ).getUserComponent() ) );
    }

    // TODO
    // addChild( new RadioButtonStripControlPanelNode < Integer > ( carousel.targetIndex,
    //   buttonElementList,
    //   5,
    //   EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
    //   EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
    //   EFACConstants.CONTROL_PANEL_OUTLINE_COLOR,
    //   4 ) );

  }

  return inherit( Node, EnergySystemElementSelector );
} );
