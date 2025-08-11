// Copyright 2020-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * PhetioGroup for creating EnergyChunks. This type adds support for dynamically created and destroyed, instrumented
 * PhET-iO Elements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetioGroup, { PhetioGroupOptions } from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from './EnergyChunk.js';
import EnergyType from './EnergyType.js';

type SelfOptions = EmptySelfOptions;

type EnergyChunkGroupOptions = SelfOptions & PhetioGroupOptions;

class EnergyChunkGroup extends PhetioGroup {

  /**
   * @param energyChunksVisibleProperty - used to create the archetype
   * @param providedOptions
   */
  public constructor( energyChunksVisibleProperty: BooleanProperty, providedOptions?: EnergyChunkGroupOptions ) {

    const options = optionize<EnergyChunkGroupOptions, SelfOptions, PhetioGroupOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroup.PhetioGroupIO( EnergyChunk.EnergyChunkIO )
    }, providedOptions );

    super(
      EnergyChunkGroup.createEnergyChunk,
      [ EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, energyChunksVisibleProperty, {} ],
      options
    );
  }

  public static createEnergyChunk( tandem: Tandem, energyType: EnergyType, position: Vector2, velocity: Vector2, visibleProperty: BooleanProperty, options?: EnergyChunkGroupOptions ): EnergyChunk {
    assert && options && assert( !options.hasOwnProperty( 'tandem' ), 'EnergyChunkGroup supplies its own tandem' );
    return new EnergyChunk( energyType, position, velocity, visibleProperty, merge( { tandem: tandem }, options ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkGroup', EnergyChunkGroup );
export default EnergyChunkGroup;