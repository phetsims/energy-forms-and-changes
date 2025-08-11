// Copyright 2016-2025, University of Colorado Boulder

/**
 * a type that models a fluorescent light bulb in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import fluorescentIcon_png from '../../../images/fluorescentIcon_png.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import LightBulb, { LightBulbOptions } from './LightBulb.js';

type SelfOptions = EmptySelfOptions;
export type FluorescentBulbOptions = SelfOptions & LightBulbOptions;

class FluorescentBulb extends LightBulb {

  public constructor( energyChunksVisibleProperty: BooleanProperty, energyChunkGroup: EnergyChunkGroup, energyChunkPathMoverGroup: EnergyChunkPathMoverGroup, providedOptions?: FluorescentBulbOptions ) {
    const options = optionize<FluorescentBulbOptions, SelfOptions, LightBulbOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( new Image( fluorescentIcon_png ), false, energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options );

    this.a11yName = EnergyFormsAndChangesStrings.a11y.fluorescentLightBulb;
  }
}

energyFormsAndChanges.register( 'FluorescentBulb', FluorescentBulb );
export default FluorescentBulb;