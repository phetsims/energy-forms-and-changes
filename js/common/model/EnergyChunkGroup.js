// Copyright 2020, University of Colorado Boulder

/**
 * PhetioGroup for creating EnergyChunks
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import PropertyIO from '../../../../axon/js/PropertyIO.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioGroupIO from '../../../../tandem/js/PhetioGroupIO.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from './EnergyChunk.js';
import EnergyType from './EnergyType.js';

class EnergyChunkGroup extends PhetioGroup {

  constructor( options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroupIO( EnergyChunk.EnergyChunkIO )
    }, options );

    // TODO: making your own visibleProperty default? https://github.com/phetsims/energy-forms-and-changes/issues/350
    const defaultPositionProperty = new Property( true, {
      tandem: options.tandem.createTandem( 'positionProperty' ),
      phetioType: PropertyIO( BooleanIO )
    } );
    super( EnergyChunkGroup.createEnergyChunk,
      [ EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, defaultPositionProperty, {} ], options );
  }

  // @public
  static createEnergyChunk( tandem, energyType, position, velocity, visibleProperty, options ) {
    return new EnergyChunk( energyType, position, velocity, visibleProperty, merge( {}, options, { tandem: tandem } ) );
  }
}

energyFormsAndChanges.register( 'EnergyChunkGroup', EnergyChunkGroup );
export default EnergyChunkGroup;
