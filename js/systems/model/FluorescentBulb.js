// Copyright 2016-2020, University of Colorado Boulder

/**
 * a type that models a fluorescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Image from '../../../../scenery/js/nodes/Image.js';
import FLUORESCENT_ICON from '../../../images/fluorescent_icon_png.js';
import energyFormsAndChangesStrings from '../../energyFormsAndChangesStrings.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import LightBulb from './LightBulb.js';

class FluorescentBulb extends LightBulb {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {Tandem} tandem
   */
  constructor( energyChunksVisibleProperty, tandem ) {
    super( new Image( FLUORESCENT_ICON ), false, energyChunksVisibleProperty, tandem );

    // @public {string} - a11y name
    this.a11yName = energyFormsAndChangesStrings.a11y.fluorescentLightBulb;
  }
}

energyFormsAndChanges.register( 'FluorescentBulb', FluorescentBulb );
export default FluorescentBulb;