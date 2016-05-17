// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
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
  var NON_ENERGIZED_BULB = new EFACModelImage( INCANDESCENT_2, IMAGE_OFFSET );
  var ENERGIZED_BULB = new EFACModelImage( INCANDESCENT_ON_3, IMAGE_OFFSET );

  /**
   * @param {Property.<boolean>} energyChunksVisible
   * @constructor
   */
  function IncandescentBulb( energyChunksVisible ) {
    LightBulb.call( this, new Image( INCANDESCENT_ICON ), true, energyChunksVisible );
  }

  energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );

  return inherit( LightBulb, IncandescentBulb, {}, {
    // Exported for static access
    NON_ENERGIZED_BULB: NON_ENERGIZED_BULB,
    ENERGIZED_BULB: ENERGIZED_BULB
  } );
} );

