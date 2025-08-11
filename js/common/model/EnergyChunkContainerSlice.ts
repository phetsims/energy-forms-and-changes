// Copyright 2014-2023, University of Colorado Boulder

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

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject, { type PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from './EnergyChunk.js';

type SelfOptions = EmptySelfOptions;

type EnergyChunkContainerSliceOptions = SelfOptions & PhetioObjectOptions;

class EnergyChunkContainerSlice extends PhetioObject {

  // Position of this slice in model space
  public readonly anchorPointProperty: Property<Vector2>;

  // 2D bounds of this slice in model space, translates with the anchor point
  public bounds: Bounds2;

  private readonly zPosition: number;

  // List of energy chunks owned by this slice
  private readonly energyChunkList: ObservableArray<EnergyChunk>;

  private readonly disposeEnergyChunkContainerSlice: () => void;

  /**
   * @param bounds
   * @param zPosition - used to give appearance of depth
   * @param anchorPointProperty
   * @param providedOptions
   */
  public constructor( bounds: Bounds2, zPosition: number, anchorPointProperty: Property<Vector2>, providedOptions?: EnergyChunkContainerSliceOptions ) {

    const options = optionize<EnergyChunkContainerSliceOptions, SelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.REQUIRED, // must instrument the energyChunkList to support state

      // @ts-expect-error
      phetioType: EnergyChunkContainerSlice.EnergyChunkContainerSliceIO
    }, providedOptions );

    super( options );

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( anchorPointProperty.isPhetioInstrumented(),
      'provided Property should be instrumented if I am.' );

    this.anchorPointProperty = anchorPointProperty;

    this.bounds = bounds;

    this.zPosition = zPosition;

    this.energyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),

      // @ts-expect-error
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    assert && this.isPhetioInstrumented() && this.energyChunkList.addItemAddedListener( energyChunk => {
      assert && assert( energyChunk.isPhetioInstrumented(), 'EnergyChunk should be instrumented if I am.' );
    } );

    // monitor the "anchor point" position in order to update the bounds and move contained energy chunks
    const anchorPointListener = ( newPosition: Vector2, oldPosition: Vector2 ) => {

      // Don't let the PhET-iO state engine call this (as the second time) when the anchorPointProperty changes. This line of
      // code could be replaced with altering the for-loop below to be based on each EnergyChunk's position, but that
      // would be too slow, and performance is important here. See https://github.com/phetsims/energy-forms-and-changes/issues/353
      if ( !isSettingPhetioStateProperty.value ) {

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

    this.disposeEnergyChunkContainerSlice = () => {
      this.energyChunkList.clear();
      this.energyChunkList.dispose();
      this.anchorPointProperty.unlink( anchorPointListener );
    };
  }

  public toStateObject(): { bounds: Bounds2 } { // TODO: https://github.com/phetsims/energy-forms-and-changes/issues/430 create a type for the state object
    return {

      // @ts-expect-error
      bounds: Bounds2.Bounds2IO.toStateObject( this.bounds )
    };
  }

  public applyState( stateObject: IntentionalAny ): void {
    this.bounds = Bounds2.Bounds2IO.fromStateObject( stateObject.bounds );
  }

  public addEnergyChunk( energyChunk: EnergyChunk ): void {
    energyChunk.zPositionProperty.set( this.zPosition );
    this.energyChunkList.push( energyChunk );
  }

  /**
   * expand or contract the bounds of this slice in the y-direction based on the provided multiplier value
   * @param multiplier
   */
  public updateHeight( multiplier: number ): void {
    this.bounds.maxY = this.bounds.minY + this.bounds.height * multiplier;
  }

  public getNumberOfEnergyChunks(): number {
    return this.energyChunkList.length;
  }

  public override dispose(): void {
    this.disposeEnergyChunkContainerSlice();
    super.dispose();
  }

  public static readonly EnergyChunkContainerSliceIO = new IOType<EnergyChunkContainerSlice>( 'EnergyChunkContainerSliceIO', {
    valueType: EnergyChunkContainerSlice,

    // @ts-expect-error
    toStateObject: energyChunkContainerSlice => energyChunkContainerSlice.toStateObject(),
    applyState: ( energyChunkContainerSlice, stateObject ) => energyChunkContainerSlice.applyState( stateObject ),
    stateSchema: {

      // @ts-expect-error
      bounds: Bounds2.Bounds2IO
    }
  } );
}

energyFormsAndChanges.register( 'EnergyChunkContainerSlice', EnergyChunkContainerSlice );
export default EnergyChunkContainerSlice;