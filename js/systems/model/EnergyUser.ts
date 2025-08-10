// Copyright 2016-2020, University of Colorado Boulder

/**
 * base type for energy users, i.e. model elements that take energy from an energy converter and do something with it,
 * such as producing light or heat
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

class EnergyUser extends EnergySystemElement {

  /**
   * @param {Image} iconImage
   * @param {Object} [options]
   */
  constructor( iconImage, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( iconImage, options );

    // @private {EnergyChunk[]}
    this.incomingEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'incomingEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );
  }

  /**
   * Inject a list of energy chunks into this energy system element.  Once injected, it is the system's responsibility
   * to move, convert, and otherwise manage them.
   * @param {Array.<EnergyChunk>} energyChunks - list of energy chunks to inject
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
   * @protected
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.incomingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.incomingEnergyChunks.clear();
  }
}

energyFormsAndChanges.register( 'EnergyUser', EnergyUser );
export default EnergyUser;