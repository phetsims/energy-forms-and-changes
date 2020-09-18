// Copyright 2016-2020, University of Colorado Boulder

/**
 * base type for energy users, i.e. model elements that take energy from an energy converter and do something with it,
 * such as producing light or heat
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import ObservableArrayIO from '../../../../axon/js/ObservableArrayIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergySystemElement from './EnergySystemElement.js';

class EnergyUser extends EnergySystemElement {

  /**
   * @param {Image} iconImage
   * @param {Tandem} tandem
   */
  constructor( iconImage, tandem ) {
    super( iconImage, tandem );

    // @private {EnergyChunk[]}
    this.incomingEnergyChunks = new ObservableArray( {
      tandem: tandem.createTandem( 'incomingEnergyChunks' ),
      phetioType: ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
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
    this.incomingEnergyChunks.clear();
    this.incomingEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) ); // TODO: this is backwards and doesn't do anything. https://github.com/phetsims/energy-forms-and-changes/issues/361
  }
}

energyFormsAndChanges.register( 'EnergyUser', EnergyUser );
export default EnergyUser;