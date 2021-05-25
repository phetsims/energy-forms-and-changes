// Copyright 2016-2021, University of Colorado Boulder

/**
 * base type for energy converters, i.e. model elements that take energy from a source and convert it to something else
 * (such as mechanical to electrical) and then supply it to an energy user
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergySystemElement from './EnergySystemElement.js';

class EnergyConverter extends EnergySystemElement {

  /**
   * @param {Image} iconImage Image to identify source on carousel menu
   * @param {Object} [options]
   */
  constructor( iconImage, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

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
   * @returns {EnergyChunk[]}
   * @public
   */
  extractOutgoingEnergyChunks() {
    const energyChunksToRemove = this.outgoingEnergyChunks.filter( energyChunk => this.energyChunkList.includes( energyChunk ) );
    this.energyChunkList.removeAll( energyChunksToRemove );

    const outgoingEnergyChunksCopy = this.outgoingEnergyChunks.slice();
    this.outgoingEnergyChunks.clear();
    return outgoingEnergyChunksCopy;
  }

  /**
   * Inject a list of energy chunks into this energy system element.  Once injected, it is the system's responsibility
   * to move, convert, and otherwise manage them.
   * @param {EnergyChunk[]} energyChunks
   * @public
   */
  injectEnergyChunks( energyChunks ) {
    energyChunks.forEach( energyChunk => {
      if ( !this.incomingEnergyChunks.includes( energyChunk ) ) {
        this.incomingEnergyChunks.push( energyChunk );
      }
    } );
  }

  /**
   * clear internal list of energy chunks and outgoing energy chunks
   * @public
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.incomingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.incomingEnergyChunks.clear();
    this.outgoingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.outgoingEnergyChunks.clear();
  }
}

energyFormsAndChanges.register( 'EnergyConverter', EnergyConverter );
export default EnergyConverter;