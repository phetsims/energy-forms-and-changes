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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/LightBulb' );

  // images
  var INCANDESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_icon.png' );

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

  return inherit( LightBulb, IncandescentBulb );
} );

