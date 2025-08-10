// Copyright 2016-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import merge from '../../../../phet-core/js/merge.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import incandescentIcon_png from '../../../images/incandescentIcon_png.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import LightBulb from './LightBulb.js';

class IncandescentBulb extends LightBulb {

  public constructor( energyChunksVisibleProperty: BooleanProperty, energyChunkGroup: EnergyChunkGroup, energyChunkPathMoverGroup: EnergyChunkPathMoverGroup, options?: IntentionalAny ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( incandescentIcon_png ), true, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.incandescentLightBulb;
  }
}

energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );
export default IncandescentBulb;