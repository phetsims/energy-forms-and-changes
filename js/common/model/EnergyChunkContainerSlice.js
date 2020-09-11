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

import ObservableArray from '../../../../axon/js/ObservableArray.js';
import ObservableArrayIO from '../../../../axon/js/ObservableArrayIO.js';
import PropertyIO from '../../../../axon/js/PropertyIO.js';
import Bounds2IO from '../../../../dot/js/Bounds2IO.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
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
      tandem: Tandem.OPTIONAL,
      phetioDynamicElement: true,
      phetioType: EnergyChunkContainerSliceIO
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

    // @private {ObservableArray.<EnergyChunk>} - list of energy chunks owned by this slice
    this.energyChunkList = new ObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),
      phetioType: ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    assert && this.isPhetioInstrumented() && this.energyChunkList.addItemAddedListener( energyChunk => {
      assert( energyChunk.isPhetioInstrumented(), 'EnergyChunk should be instrumented if I am.' );
    } );

    // monitor the "anchor point" position in order to update the bounds and move contained energy chunks
    const anchorPointListener = ( newPosition, oldPosition ) => {

      const xTranslation = newPosition.x - oldPosition.x;
      const yTranslation = newPosition.y - oldPosition.y;

      this.bounds.shift( xTranslation, yTranslation );

      // c-style loop for best performance
      for ( let i = 0; i < this.energyChunkList.length; i++ ) {
        this.energyChunkList.get( i ).translate( xTranslation, yTranslation );
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
   * @private
   * @returns {Object}
   */
  toStateObject() {
    return {
      bounds: Bounds2IO.toStateObject( this.bounds ),
      zPosition: this.zPosition,
      anchorPointPropertyPhetioID: this.anchorPointProperty.tandem.phetioID,
      phetioID: this.tandem.phetioID
    };
  }

  /**
   * @private
   * @param {Object} stateObject
   */
  static stateToArgsForConstructor( stateObject ) {
    const anchorPointProperty = ReferenceIO( PropertyIO( Vector2IO ) ).fromStateObject( stateObject.anchorPointPropertyPhetioID );
    return [ Bounds2IO.fromStateObject( stateObject.bounds ), stateObject.zPosition, anchorPointProperty ];
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

class EnergyChunkContainerSliceIO extends ObjectIO {

  // @public @override
  static toStateObject( energyChunkContainerSlice ) { return energyChunkContainerSlice.toStateObject(); }

  // @public @override
  static stateToArgsForConstructor( state ) { return EnergyChunkContainerSlice.stateToArgsForConstructor( state ); }

  // @public - use reference serialization when a member of another data structure like ObservableArray
  static fromStateObject( stateObject ) {
    return ReferenceIO( EnergyChunkContainerSliceIO ).fromStateObject( stateObject.phetioID );
  }
}

EnergyChunkContainerSliceIO.documentation = 'My Documentation';
EnergyChunkContainerSliceIO.typeName = 'EnergyChunkContainerSliceIO';
EnergyChunkContainerSliceIO.validator = { valueType: EnergyChunkContainerSlice };

EnergyChunkContainerSlice.EnergyChunkContainerSliceIO = EnergyChunkContainerSliceIO;

energyFormsAndChanges.register( 'EnergyChunkContainerSlice', EnergyChunkContainerSlice );
export default EnergyChunkContainerSlice;