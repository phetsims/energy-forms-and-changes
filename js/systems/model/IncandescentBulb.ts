// Copyright 2016-2025, University of Colorado Boulder

/**
 * a type that models an incandescent light bulb in an energy system
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import incandescentIcon_png from '../../../images/incandescentIcon_png.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import LightBulb, { LightBulbOptions } from './LightBulb.js';

type SelfOptions = EmptySelfOptions;
type IncandescentBulbOptions = SelfOptions & LightBulbOptions;

class IncandescentBulb extends LightBulb {

  public constructor( energyChunksVisibleProperty: BooleanProperty, energyChunkGroup: EnergyChunkGroup, energyChunkPathMoverGroup: EnergyChunkPathMoverGroup, providedOptions?: IncandescentBulbOptions ) {

    const options = optionize<IncandescentBulbOptions, SelfOptions, LightBulbOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( new Image( incandescentIcon_png ), true, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options );

    this.a11yName = EnergyFormsAndChangesStrings.a11y.incandescentLightBulb;
  }
}

energyFormsAndChanges.register( 'IncandescentBulb', IncandescentBulb );
export default IncandescentBulb;