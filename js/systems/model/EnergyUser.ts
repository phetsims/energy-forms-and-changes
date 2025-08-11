// Copyright 2016-2020, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * base type for energy users, i.e. model elements that take energy from an energy converter and do something with it,
 * such as producing light or heat
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import createObservableArray, { ObservableArrayDef } from '../../../../axon/js/createObservableArray.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergySystemElement from './EnergySystemElement.js';

type SelfOptions = EmptySelfOptions;

type EnergyUserOptions = SelfOptions & PhetioObjectOptions;

class EnergyUser extends EnergySystemElement {

  protected readonly incomingEnergyChunks: ObservableArrayDef<EnergyChunk>;

  public constructor( iconImage: HTMLImageElement, providedOptions?: EnergyUserOptions ) {

    const options = optionize<EnergyUserOptions, SelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( iconImage, options );

    this.incomingEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'incomingEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );
  }

  /**
   * Inject a list of energy chunks into this energy system element.  Once injected, it is the system's responsibility
   * to move, convert, and otherwise manage them.
   * @param energyChunks - list of energy chunks to inject
   */
  public injectEnergyChunks( energyChunks: EnergyChunk[] ): void {
    energyChunks.forEach( energyChunk => {
      if ( !this.incomingEnergyChunks.includes( energyChunk ) ) {
        this.incomingEnergyChunks.push( energyChunk );
      }
    } );
  }

  protected override clearEnergyChunks(): void {
    super.clearEnergyChunks();
    this.incomingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.incomingEnergyChunks.clear();
  }
}

energyFormsAndChanges.register( 'EnergyUser', EnergyUser );
export default EnergyUser;