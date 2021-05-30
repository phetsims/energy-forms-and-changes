// Copyright 2014-2021, University of Colorado Boulder

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

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from './EnergyChunk.js';

class EnergyChunkContainerSlice extends PhetioObject {

  /**
   * @param {Bounds2} bounds
   * @param {number} zPosition - used to give appearance of depth
   * @param {Property.<Vector2>} anchorPointProperty
   * @param {Object} [options]
   */
  constructor( bounds, zPosition, anchorPointProperty, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED, // must instrument the energyChunkList to support state
      phetioType: EnergyChunkContainerSlice.EnergyChunkContainerSliceIO
    }, options );

    super( options );

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( anchorPointProperty.isPhetioInstrumented(),
      'provided Property should be instrumented if I am.' );

    // @public {Property.<Vector2>} - position of this slice in model space
    this.anchorPointProperty = anchorPointProperty;

    // @public (read-only) {Bounds2} - 2D bounds of this slice in model space, translates with the anchor point
    this.bounds = bounds;

    // @private {number}
    this.zPosition = zPosition;

    // @private {ObservableArrayDef.<EnergyChunk>} - list of energy chunks owned by this slice
    this.energyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    assert && this.isPhetioInstrumented() && this.energyChunkList.addItemAddedListener( energyChunk => {
      assert( energyChunk.isPhetioInstrumented(), 'EnergyChunk should be instrumented if I am.' );
    } );

    // monitor the "anchor point" position in order to update the bounds and move contained energy chunks
    const anchorPointListener = ( newPosition, oldPosition ) => {

      // Don't let the PhET-iO state engine call this (as the second time) when the anchorPointProperty changes. This line of
      // code could be replaced with altering the for-loop below to be based on each EnergyChunk's position, but that
      // would be too slow, and performance is important here. See https://github.com/phetsims/energy-forms-and-changes/issues/353
      if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {

        const xTranslation = newPosition.x - oldPosition.x;
        const yTranslation = newPosition.y - oldPosition.y;

        this.bounds.shiftXY( xTranslation, yTranslation );

        // c-style loop for best performance
        for ( let i = 0; i < this.energyChunkList.length; i++ ) {
          this.energyChunkList.get( i ).translate( xTranslation, yTranslation );
        }
      }
    };
    this.anchorPointProperty.lazyLink( anchorPointListener );

    // @private
    this.disposeEnergyChunkContainerSlice = () => {
      this.energyChunkList.clear();
      this.energyChunkList.dispose();
      this.anchorPointProperty.unlink( anchorPointListener );
    };
  }

  /**
   * @public (EnergyChunkContainerSliceIO)
   * @returns {{bounds: Bounds2}}
   */
  toStateObject() {
    return {
      bounds: Bounds2.Bounds2IO.toStateObject( this.bounds )
    };
  }

  /**
   * @public (EnergyChunkContainerSliceIO)
   * @param {Object} stateObject
   */
  applyState( stateObject ) {
    this.bounds = Bounds2.Bounds2IO.fromStateObject( stateObject.bounds );
  }

  /**
   * @param {EnergyChunk} energyChunk
   * @public
   */
  addEnergyChunk( energyChunk ) {
    energyChunk.zPositionProperty.set( this.zPosition );
    this.energyChunkList.push( energyChunk );
  }

  /**
   * expand or contract the bounds of this slice in the y-direction based on the provided multiplier value
   * @param {number} multiplier
   * @public
   */
  updateHeight( multiplier ) {
    this.bounds.maxY = this.bounds.minY + this.bounds.height * multiplier;
  }

  /**
   * @returns {number}
   * @public
   */
  getNumberOfEnergyChunks() {
    return this.energyChunkList.length;
  }

  /**
   * @public
   */
  dispose() {
    this.disposeEnergyChunkContainerSlice();
    super.dispose();
  }
}

EnergyChunkContainerSlice.EnergyChunkContainerSliceIO = new IOType( 'EnergyChunkContainerSliceIO', {
  valueType: EnergyChunkContainerSlice,
  toStateObject: energyChunkContainerSlice => energyChunkContainerSlice.toStateObject(),
  applyState: ( energyChunkContainerSlice, stateObject ) => energyChunkContainerSlice.applyState( stateObject ),
  stateSchema: {
    bounds: Bounds2.Bounds2IO
  }
} );

energyFormsAndChanges.register( 'EnergyChunkContainerSlice', EnergyChunkContainerSlice );
export default EnergyChunkContainerSlice;