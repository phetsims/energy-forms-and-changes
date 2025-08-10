// Copyright 2020-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * PhetioGroup for creating EnergyChunkPathMovers. This type adds support for dynamically created and destroyed,
 * instrumented PhET-iO Elements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';

class EnergyChunkPathMoverGroup extends PhetioGroup {

  public constructor( energyChunkGroup: EnergyChunkGroup, options?: Object ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroup.PhetioGroupIO( EnergyChunkPathMover.EnergyChunkPathMoverIO )
    }, options );

    super( EnergyChunkPathMoverGroup.createEnergyChunkPathMover,
      () => [ energyChunkGroup.archetype, [ Vector2.ZERO ], 1, {} ], options );
  }

  public static createEnergyChunkPathMover( tandem: Tandem, energyChunk: EnergyChunk, path: Vector2[], speed: number, options?: Object ): EnergyChunkPathMover {
    assert && options && assert( !options.hasOwnProperty( 'tandem' ), 'EnergyChunkPathMoverGroup supplies its own tandem' );
    return new EnergyChunkPathMover( energyChunk, path, speed, merge( { tandem: tandem }, options ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkPathMoverGroup', EnergyChunkPathMoverGroup );
export default EnergyChunkPathMoverGroup;