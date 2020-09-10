// Copyright 2016-2020, University of Colorado Boulder

/**
 * a type that models a fluorescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import FLUORESCENT_ICON from '../../../images/fluorescent_icon_png.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import energyFormsAndChangesStrings from '../../energyFormsAndChangesStrings.js';
import LightBulb from './LightBulb.js';

class FluorescentBulb extends LightBulb {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Tandem} tandem
   */
  constructor( energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, tandem ) {
    super( new Image( FLUORESCENT_ICON ), false, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, tandem );

    // @public {string} - a11y name
    this.a11yName = energyFormsAndChangesStrings.a11y.fluorescentLightBulb;
  }
}

energyFormsAndChanges.register( 'FluorescentBulb', FluorescentBulb );
export default FluorescentBulb;