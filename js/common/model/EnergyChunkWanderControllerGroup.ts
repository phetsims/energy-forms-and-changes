// Copyright 2020-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * PhetioGroup for creating EnergyChunkWanderControllers. This type adds support for dynamically created and destroyed,
 * instrumented PhET-iO Elements.
 *
 * @author Michael Kauzmann (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from './EnergyChunk.js';
import EnergyChunkGroup from './EnergyChunkGroup.js';
import EnergyChunkWanderController from './EnergyChunkWanderController.js';

class EnergyChunkWanderControllerGroup extends PhetioGroup {

  public constructor( energyChunkGroup: EnergyChunkGroup, options?: any ) {

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

  public static createEnergyChunkWanderController( tandem: Tandem, energyChunk: EnergyChunk, destinationProperty: Property<Vector2>, options?: any ): EnergyChunkWanderController {
    assert && options && assert( !options.hasOwnProperty( 'tandem' ), 'EnergyChunkWanderControllerGroup supplies its own tandem' );
    return new EnergyChunkWanderController( energyChunk, destinationProperty, merge( { tandem: tandem }, options ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkWanderControllerGroup', EnergyChunkWanderControllerGroup );
export default EnergyChunkWanderControllerGroup;