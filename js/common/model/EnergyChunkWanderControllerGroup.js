// Copyright 2020-2022, University of Colorado Boulder

/**
 * PhetioGroup for creating EnergyChunkWanderControllers. This type adds support for dynamically created and destroyed,
 * instrumented PhET-iO elements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkWanderController from './EnergyChunkWanderController.js';

class EnergyChunkWanderControllerGroup extends PhetioGroup {

  /**
   *
   * @param energyChunkGroup
   * @param options
   */
  constructor( energyChunkGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroup.PhetioGroupIO( EnergyChunkWanderController.EnergyChunkWanderControllerIO )
    }, options );

    // If other archetypes don't exist, then we won't create ours, so these values can be null.
    const defaultArguments = () => {
      return [
        energyChunkGroup.archetype,
        energyChunkGroup.archetype ? energyChunkGroup.archetype.positionProperty : null,
        {}
      ];
    };

    super( EnergyChunkWanderControllerGroup.createEnergyChunkWanderController, defaultArguments, options );
  }

  // @public
  static createEnergyChunkWanderController( tandem, energyChunk, destinationProperty, options ) {
    assert && options && assert( !options.hasOwnProperty( 'tandem' ), 'EnergyChunkWanderControllerGroup supplies its own tandem' );
    return new EnergyChunkWanderController( energyChunk, destinationProperty, merge( { tandem: tandem }, options ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkWanderControllerGroup', EnergyChunkWanderControllerGroup );
export default EnergyChunkWanderControllerGroup;