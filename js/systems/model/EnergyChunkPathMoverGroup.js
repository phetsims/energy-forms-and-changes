// Copyright 2020-2022, University of Colorado Boulder

/**
 * PhetioGroup for creating EnergyChunkPathMovers. This type adds support for dynamically created and destroyed,
 * instrumented PhET-iO elements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
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
      phetioType: PhetioGroup.PhetioGroupIO( EnergyChunkPathMover.EnergyChunkPathMoverIO )
    }, options );

    super( EnergyChunkPathMoverGroup.createEnergyChunkPathMover,
      () => [ energyChunkGroup.archetype, [ Vector2.ZERO ], 1, {} ], options );
  }

  // @public
  static createEnergyChunkPathMover( tandem, energyChunk, path, speed, options ) {
    assert && options && assert( !options.hasOwnProperty( 'tandem' ), 'EnergyChunkPathMoverGroup supplies its own tandem' );
    return new EnergyChunkPathMover( energyChunk, path, speed, merge( { tandem: tandem }, options ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkPathMoverGroup', EnergyChunkPathMoverGroup );
export default EnergyChunkPathMoverGroup;