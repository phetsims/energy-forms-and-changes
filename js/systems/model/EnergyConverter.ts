// Copyright 2016-2021, University of Colorado Boulder

/**
 * base type for energy converters, i.e. model elements that take energy from a source and convert it to something else
 * (such as mechanical to electrical) and then supply it to an energy user
 *
 * @author John Blanco
 * @author Andrew Adare
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
export type EnergyConverterOptions = SelfOptions & EnergySystemElementOptions;

class EnergyConverter extends EnergySystemElement {

  protected readonly incomingEnergyChunks: ObservableArray<EnergyChunk>;
  protected readonly outgoingEnergyChunks: ObservableArray<EnergyChunk>;

  /**
   * @param iconImage Image to identify source on carousel menu
   * @param providedOptions
   */
  public constructor( iconImage: Image, providedOptions?: EnergyConverterOptions ) {

    const options = optionize<EnergyConverterOptions, SelfOptions, EnergySystemElementOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( iconImage, options );
    this.incomingEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'incomingEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );
    this.outgoingEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'outgoingEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );
  }

  /**
   * get the energy chunks that this source wants to transfer to the next energy system element, reading clears the
   * list
   */
  public extractOutgoingEnergyChunks(): EnergyChunk[] {
    const energyChunksToRemove = this.outgoingEnergyChunks.filter( energyChunk => this.energyChunkList.includes( energyChunk ) );
    this.energyChunkList.removeAll( energyChunksToRemove );

    const outgoingEnergyChunksCopy = this.outgoingEnergyChunks.slice();
    this.outgoingEnergyChunks.clear();
    return outgoingEnergyChunksCopy;
  }

  /**
   * Inject a list of energy chunks into this energy system element.  Once injected, it is the system's responsibility
   * to move, convert, and otherwise manage them.
   */
  public injectEnergyChunks( energyChunks: EnergyChunk[] ): void {
    energyChunks.forEach( energyChunk => {
      if ( !this.incomingEnergyChunks.includes( energyChunk ) ) {
        this.incomingEnergyChunks.push( energyChunk );
      }
    } );
  }

  /**
   * clear internal list of energy chunks and outgoing energy chunks
   */
  public override clearEnergyChunks(): void {
    super.clearEnergyChunks();

    // @ts-expect-error
    this.incomingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.incomingEnergyChunks.clear();

    // @ts-expect-error
    this.outgoingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.outgoingEnergyChunks.clear();
  }
}

energyFormsAndChanges.register( 'EnergyConverter', EnergyConverter );
export default EnergyConverter;