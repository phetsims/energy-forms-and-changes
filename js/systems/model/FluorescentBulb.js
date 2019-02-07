// Copyright 2016-2019, University of Colorado Boulder

/**
 * a type that models a fluorescent light bulb in an energy system
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
  const FLUORESCENT_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fluorescent_icon.png' );

  class FluorescentBulb extends LightBulb {

    /**
     * @param {BooleanProperty} energyChunksVisibleProperty
     */
    constructor( energyChunksVisibleProperty ) {

      super( new Image( FLUORESCENT_ICON ), false, energyChunksVisibleProperty );

      // @public {string} - a11y name
      this.a11yName = EFACA11yStrings.fluorescentLightBulb.value;
    }
  }

  return energyFormsAndChanges.register( 'FluorescentBulb', FluorescentBulb );
} );
