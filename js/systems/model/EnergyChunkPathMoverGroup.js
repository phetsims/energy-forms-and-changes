// Copyright 2020, University of Colorado Boulder

/**
 * PhetioGroup for creating EnergyChunks
 *
 * @author John Blanco
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioGroupIO from '../../../../tandem/js/PhetioGroupIO.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';

class EnergyChunkPathMoverGroup extends PhetioGroup {

  /**
   *
   * @param energyChunkGroup
   * @param options
   */
  constructor( energyChunkGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroupIO( EnergyChunkPathMover.EnergyChunkPathMoverIO )
    }, options );

    super( EnergyChunkPathMoverGroup.createEnergyChunkPathMover,
      [ energyChunkGroup.archetype, [ Vector2.ZERO ], 1, {} ], options );
  }

  // @public
  static createEnergyChunkPathMover( tandem, energyChunk, path, speed, options ) {
    return new EnergyChunkPathMover( energyChunk, path, speed, merge( {}, options, { tandem: tandem } ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkPathMoverGroup', EnergyChunkPathMoverGroup );
export default EnergyChunkPathMoverGroup;
