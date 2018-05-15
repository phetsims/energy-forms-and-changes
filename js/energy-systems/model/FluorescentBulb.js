// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type that models a fluorescent light bulb in an energy system
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

  // constants
  var IMAGE_OFFSET = new Vector2( 0, 0.04 );

  // images
  var FLUORESCENT_BACK_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_back_2.png' );
  var FLUORESCENT_FRONT_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_front_2.png' );
  var FLUORESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_icon.png' );
  var FLUORESCENT_ON_BACK_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_on_back_2.png' );
  var FLUORESCENT_ON_FRONT_2 = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_on_front_2.png' );
  var BACK_OFF = new EFACModelImage( FLUORESCENT_BACK_2, IMAGE_OFFSET );
  var BACK_ON = new EFACModelImage( FLUORESCENT_ON_BACK_2, IMAGE_OFFSET );
  var FRONT_OFF = new EFACModelImage( FLUORESCENT_FRONT_2, IMAGE_OFFSET );
  var FRONT_ON = new EFACModelImage( FLUORESCENT_ON_FRONT_2, IMAGE_OFFSET );

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function FluorescentBulb( energyChunksVisibleProperty ) {

    LightBulb.call( this, new Image( FLUORESCENT_ICON ), false, energyChunksVisibleProperty );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.fluorescentLightBulb.value;
  }

  energyFormsAndChanges.register( 'FluorescentBulb', FluorescentBulb );

  return inherit( LightBulb, FluorescentBulb, {}, {

    // statics
    BACK_OFF: BACK_OFF,
    BACK_ON: BACK_ON,
    FRONT_OFF: FRONT_OFF,
    FRONT_ON: FRONT_ON
  } );
} );
