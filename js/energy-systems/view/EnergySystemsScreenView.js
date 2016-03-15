// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the 'Energy Systems' screen of the Energy Forms And Changes simulation.
 *
 * @author  John Blanco
 * @author  Martin Veillette (Berea College)
 * @author  Jesse Greenberg
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var EnergyChunkLegend = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EnergyChunkLegend' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var mockupImage = require( 'image!ENERGY_FORMS_AND_CHANGES/mockup_energy_systems.png' );

  /**
   * @param {EnergySystemsModel} model
   * @constructor
   */
  function EnergySystemsScreenView( model ) {

    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 768, 504 )
    } );

    //Show the mock-up and a slider to change its transparency
    var mockupOpacityProperty = new Property( 0.8 );
    var image = new Image( mockupImage, {
      pickable: false
    } );
    image.scale( this.layoutBounds.width / image.width );
    mockupOpacityProperty.linkAttribute( image, 'opacity' );
    this.addChild( image );
    this.addChild( new HSlider( mockupOpacityProperty, {
      min: 0,
      max: 1
    }, {
      top: 10,
      left: 10
    } ) );

    // Create the legend for energy chunks.
    var energyChunkLegend = new EnergyChunkLegend();
    energyChunkLegend.center = new Vector2( 0.9*this.layoutBounds.width , 0.5*this.layoutBounds.height );
    this.addChild( energyChunkLegend );

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );

  }

  return inherit( ScreenView, EnergySystemsScreenView );
} );
