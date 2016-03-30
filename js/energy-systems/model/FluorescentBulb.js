// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var Vector2 = require( 'DOT/Vector2' );

  var FLUORESCENT_BACK_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_back_2.png' );
  var FLUORESCENT_FRONT_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_front_2.png' );
  var FLUORESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_icon.png' );
  var FLUORESCENT_ON_BACK_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_on_back_2.png' );
  var FLUORESCENT_ON_FRONT_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_on_front_2.png' );

  var IMAGE_OFFSET = new Vector2( 0, 0.04 );
  var BACK_OFF = new EFACModelImage( FLUORESCENT_BACK_2, IMAGE_OFFSET );
  var BACK_ON = new EFACModelImage( FLUORESCENT_ON_BACK_2, IMAGE_OFFSET );
  var FRONT_OFF = new EFACModelImage( FLUORESCENT_FRONT_2, IMAGE_OFFSET );
  var FRONT_ON = new EFACModelImage( FLUORESCENT_ON_FRONT_2, IMAGE_OFFSET );

  /**
   * @param {Property<Boolean>} energyChunksVisible
   * @constructor
   */
  function IncandescentBulb( energyChunksVisible ) {

    LightBulb.call( this, new Image( FLUORESCENT_ICON ), false, energyChunksVisible );
  }

  return inherit( LightBulb, IncandescentBulb, {}, {
    // Exported for static access
    BACK_OFF: BACK_OFF,
    BACK_ON: BACK_ON,
    FRONT_OFF: FRONT_OFF,
    FRONT_ON: FRONT_ON
  } );
} );