// Copyright 2020-2023, University of Colorado Boulder

/**
 * PhetioGroup for creating EnergyChunkPathMovers. This type adds support for dynamically created and destroyed,
 * instrumented PhET-iO Elements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import StrictOmit from '../../../../phet-core/js/types/StrictOmit.js';
import PhetioGroup, { PhetioGroupOptions } from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkPathMover, { EnergyChunkPathMoverOptions } from './EnergyChunkPathMover.js';

type SelfOptions = EmptySelfOptions;

type EnergyChunkPathMoverGroupOptions = SelfOptions & StrictOmit<PhetioGroupOptions, 'phetioType'>;

class EnergyChunkPathMoverGroup extends PhetioGroup<EnergyChunkPathMover, [ EnergyChunk, Vector2[], number ]> {

  public constructor( energyChunkGroup: EnergyChunkGroup, providedOptions?: EnergyChunkPathMoverGroupOptions ) {

    const options = optionize<EnergyChunkPathMoverGroupOptions, SelfOptions, PhetioGroupOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroup.PhetioGroupIO( EnergyChunkPathMover.EnergyChunkPathMoverIO )
    }, providedOptions );

    super( EnergyChunkPathMoverGroup.createEnergyChunkPathMover,
      () => [ energyChunkGroup.archetype, [ Vector2.ZERO ], 1 ], options );
  }

  public static createEnergyChunkPathMover( tandem: Tandem, energyChunk: EnergyChunk, path: Vector2[], speed: number, options?: EnergyChunkPathMoverOptions ): EnergyChunkPathMover {
    assert && options && assert( !options.hasOwnProperty( 'tandem' ), 'EnergyChunkPathMoverGroup supplies its own tandem' );
    return new EnergyChunkPathMover( energyChunk, path, speed, merge( { tandem: tandem }, options ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkPathMoverGroup', EnergyChunkPathMoverGroup );
export default EnergyChunkPathMoverGroup;