// Copyright 2014-2019, University of Colorado Boulder

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

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class EnergyChunkContainerSlice {

  /**
   * @param {Bounds2} bounds
   * @param {number} zPosition - used to give appearance of depth
   * @param {Property.<Vector2>} anchorPointProperty
   */
  constructor( bounds, zPosition, anchorPointProperty ) {

    // @public {Property.<Vector2>} - position of this slice in model space
    this.anchorPointProperty = anchorPointProperty;

    // @public (read-only) {Bounds2} - 2D bounds of this slice in model space, translates with the anchor point
    this.bounds = bounds;

    // @private {number}
    this.zPosition = zPosition;

    // @private {ObservableArray.<EnergyChunk>} - list of energy chunks owned by this slice
    this.energyChunkList = new ObservableArray();

    // monitor the "anchor point" position in order to update the bounds and move contained energy chunks
    this.anchorPointProperty.lazyLink( ( newPosition, oldPosition ) => {

      const xTranslation = newPosition.x - oldPosition.x;
      const yTranslation = newPosition.y - oldPosition.y;

      this.bounds.shift( xTranslation, yTranslation );

      // c-style loop for best performance
      for ( let i = 0; i < this.energyChunkList.length; i++ ) {
        this.energyChunkList.get( i ).translate( xTranslation, yTranslation );
      }
    } );
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
}

energyFormsAndChanges.register( 'EnergyChunkContainerSlice', EnergyChunkContainerSlice );
export default EnergyChunkContainerSlice;