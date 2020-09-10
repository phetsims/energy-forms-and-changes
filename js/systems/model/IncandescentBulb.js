// Copyright 2016-2020, University of Colorado Boulder

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import INCANDESCENT_ICON from '../../../images/incandescent_icon_png.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import energyFormsAndChangesStrings from '../../energyFormsAndChangesStrings.js';
import LightBulb from './LightBulb.js';

class IncandescentBulb extends LightBulb {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Tandem} tandem
   */
  constructor( energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, tandem ) {
    super( new Image( INCANDESCENT_ICON ), true, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, tandem );

    // @public {string} - a11y name
    this.a11yName = energyFormsAndChangesStrings.a11y.incandescentLightBulb;
  }
}

energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );
export default IncandescentBulb;