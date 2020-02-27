// Copyright 2016-2019, University of Colorado Boulder

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import INCANDESCENT_ICON from '../../../images/incandescent_icon_png.js';
import EFACA11yStrings from '../../EFACA11yStrings.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import LightBulb from './LightBulb.js';

class IncandescentBulb extends LightBulb {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {Tandem} tandem
   */
  constructor( energyChunksVisibleProperty, tandem ) {
    super( new Image( INCANDESCENT_ICON ), true, energyChunksVisibleProperty, tandem );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.incandescentLightBulb.value;
  }
}

energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );
export default IncandescentBulb;