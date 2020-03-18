// Copyright 2016-2020, University of Colorado Boulder

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import INCANDESCENT_ICON from '../../../images/incandescent_icon_png.js';
import energyFormsAndChangesStrings from '../../energy-forms-and-changes-strings.js';
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
    this.a11yName = energyFormsAndChangesStrings.a11y.incandescentLightBulb;
  }
}

energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );
export default IncandescentBulb;