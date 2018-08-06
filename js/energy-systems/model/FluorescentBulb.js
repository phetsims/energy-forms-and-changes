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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/LightBulb' );

  // images
  var FLUORESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_icon.png' );

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

  return inherit( LightBulb, FluorescentBulb );
} );
