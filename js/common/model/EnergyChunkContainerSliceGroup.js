// Copyright 2014-2020, University of Colorado Boulder

/**
 * This class represents a "slice" within a 2D container that can contain a set of energy chunks, and can be used to add
 * some limited 3D capabilities by having some z-dimension information.  The slice consists of a 2D shape and a Z value
 * representing its position in Z space.
 *
 * Note to maintainers: In the original Java of this simulation, these slices where shapes that could be more elaborate
 * than a simple rectangle.  Translating these shapes proved to be a performance problem in the JavaScript version, so
 * the shapes were simplified to be bounds.  This is not quite as nice in doing things like distributing the energy
 * chunks in the beaker, but works well enough, and performs far better.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Martin Veillette
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import PhetioGroupIO from '../../../../tandem/js/PhetioGroupIO.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkContainerSlice from './EnergyChunkContainerSlice.js';

class EnergyChunkContainerSliceGroup extends PhetioGroup {

  /**
   * @param {Property.<boolean>} defaultVisibleProperty
   * @param {Object} [options]
   */
  constructor( defaultVisibleProperty, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: PhetioGroupIO( EnergyChunkContainerSlice.EnergyChunkContainerSliceIO )
    }, options );

    super( EnergyChunkContainerSliceGroup.createEnergyChunk, [ new Bounds2( 0, 0, 10, 10 ), 0, defaultVisibleProperty ], options );
  }

  // @private
  static createEnergyChunk( tandem, bounds, zPosition, anchorPointProperty ) {
    return new EnergyChunkContainerSlice( bounds, zPosition, anchorPointProperty, { tandem: tandem } );
  }
}

energyFormsAndChanges.register( 'EnergyChunkContainerSliceGroup', EnergyChunkContainerSliceGroup );
export default EnergyChunkContainerSliceGroup;