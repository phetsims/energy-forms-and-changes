// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var INCANDESCENT_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_2.png' );
  var INCANDESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_icon.png' );
  var INCANDESCENT_ON_3 = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_on_3.png' );

  // constants
  var IMAGE_OFFSET = new Vector2( 0, 0.055 );
  var NON_ENERGIZED_BULB = new EFACModelImage( INCANDESCENT_2, IMAGE_OFFSET );
  var ENERGIZED_BULB = new EFACModelImage( INCANDESCENT_ON_3, IMAGE_OFFSET );

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function IncandescentBulb( energyChunksVisibleProperty ) {
    LightBulb.call( this, new Image( INCANDESCENT_ICON ), true, energyChunksVisibleProperty );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.incandescentLightBulb.value;
  }

  energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );

  return inherit( LightBulb, IncandescentBulb, {}, {

    // statics
    NON_ENERGIZED_BULB: NON_ENERGIZED_BULB,
    ENERGIZED_BULB: ENERGIZED_BULB
  } );
} );

