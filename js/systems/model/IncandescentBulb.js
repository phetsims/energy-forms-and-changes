// Copyright 2016-2019, University of Colorado Boulder

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LightBulb = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/LightBulb' );

  // images
  const INCANDESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/incandescent_icon.png' );

  class IncandescentBulb extends LightBulb {

    /**
     * @param {BooleanProperty} energyChunksVisibleProperty
     */
    constructor( energyChunksVisibleProperty ) {
      super( new Image( INCANDESCENT_ICON ), true, energyChunksVisibleProperty );

      // @public {string} - a11y name
      this.a11yName = EFACA11yStrings.incandescentLightBulb.value;
    }
  }

  return energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );
} );

