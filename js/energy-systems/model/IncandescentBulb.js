// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var INCANDESCENT_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_2.png' );
  var INCANDESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_icon.png' );
  var INCANDESCENT_ON_3 = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_on_3.png' );

  // Constants
  var IMAGE_OFFSET = new Vector2( 0, 0.055 );
  var NON_ENERGIZED_BULB = new EFACModelImage( INCANDESCENT_2, INCANDESCENT_2.width, IMAGE_OFFSET );
  var ENERGIZED_BULB = new EFACModelImage( INCANDESCENT_ON_3, INCANDESCENT_ON_3.width, IMAGE_OFFSET );

  /**
   * @param {Property<Boolean>} energyChunksVisible
   * @constructor
   */
  function IncandescentBulb( energyChunksVisible ) {

    LightBulb.call( this, new Image( INCANDESCENT_ICON ), true, energyChunksVisible );
    
  }

  return inherit( LightBulb, IncandescentBulb, {}, {
    // Exported for static access
    NON_ENERGIZED_BULB: NON_ENERGIZED_BULB,
    ENERGIZED_BULB: ENERGIZED_BULB
  } );
} );