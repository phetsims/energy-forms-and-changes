// Copyright 2016-2021, University of Colorado Boulder

/**
 * a type that models a fluorescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import FLUORESCENT_ICON from '../../../images/fluorescent_icon_png.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import energyFormsAndChangesStrings from '../../energyFormsAndChangesStrings.js';
import LightBulb from './LightBulb.js';

class FluorescentBulb extends LightBulb {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options ) {
    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( FLUORESCENT_ICON ), false, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options );

    // @public {string} - a11y name
    this.a11yName = energyFormsAndChangesStrings.a11y.fluorescentLightBulb;
  }
}

energyFormsAndChanges.register( 'FluorescentBulb', FluorescentBulb );
export default FluorescentBulb;