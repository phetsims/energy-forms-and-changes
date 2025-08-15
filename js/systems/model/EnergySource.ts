// Copyright 2016-2021, University of Colorado Boulder

/**
 * base class for energy sources, i.e. model elements that produce energy and can supply it to other energy system
 * components, such as energy converters or energy users
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergySystemElement, { EnergySystemElementOptions } from './EnergySystemElement.js';

type SelfOptions = EmptySelfOptions;
export type EnergySourceOptions = SelfOptions & EnergySystemElementOptions;

abstract class EnergySource extends EnergySystemElement {

  protected readonly outgoingEnergyChunks: ObservableArray<EnergyChunk>;

  /**
   * @param iconImage Image to identify source on carousel menu
   * @param providedOptions
   */
  public constructor( iconImage: Image, providedOptions?: EnergySourceOptions ) {

    const options = optionize<EnergySourceOptions, SelfOptions, EnergySystemElementOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( iconImage, options );
    this.outgoingEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'outgoingEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    assert && this.outgoingEnergyChunks.addItemAddedListener( chunk => {
      assert && assert( !this.energyChunkList.includes( chunk ), 'cannot be included in energyChunkList and outgoing list' );
    } );
  }

  /**
   * Get the energy chunks that this source wants to transfer to the next energy system element. This is a mutating
   * operation: it removes all outgoing chunks from both this.energyChunkList and this.outgoingEnergyChunks.
   * @returns List of energy chunks to transfer
   */
  public extractOutgoingEnergyChunks(): EnergyChunk[] {

    // remove all outgoing chunks from this.energyChunkList
    const energyChunksToRemove = this.outgoingEnergyChunks.filter( energyChunk => this.energyChunkList.includes( energyChunk ) );
    this.energyChunkList.removeAll( energyChunksToRemove );

    const outgoingEnergyChunksCopy = this.outgoingEnergyChunks.slice();
    this.outgoingEnergyChunks.clear();
    return outgoingEnergyChunksCopy;
  }

  /**
   * clear internal list of energy chunks and outgoing energy chunks
   */
  protected override clearEnergyChunks(): void {
    super.clearEnergyChunks();

    this.outgoingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.outgoingEnergyChunks.clear();
  }
}

energyFormsAndChanges.register( 'EnergySource', EnergySource );
export default EnergySource;