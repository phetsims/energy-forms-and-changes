// Copyright 2014-2025, University of Colorado Boulder

/**
 * type that represents a chunk of energy in the view
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringUnionProperty from '../../../../axon/js/StringUnionProperty.js';
import { TReadOnlyProperty } from '../../../../axon/js/TReadOnlyProperty.js';
import Vector2, { Vector2StateObject } from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize from '../../../../phet-core/js/optionize.js';
import EventType from '../../../../tandem/js/EventType.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO, { ReferenceIOState } from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyType, { EnergyTypeValues } from './EnergyType.js';

// static data
let instanceCount = 0; // counter for creating unique IDs

type SelfOptions = {

  // {number} - The unique id of the chunk. Most often EnergyChunk set's it own. This should only be specified by
  // PhET-iO, to support PhET-iO state recreating exact instances.
  id?: number | null;
};

type EnergyChunkOptions = SelfOptions & PhetioObjectOptions;

type EnergyChunkStateObject = {
  id: number;
  velocity: Vector2StateObject;
  visiblePropertyReference: ReferenceIOState;
};

class EnergyChunk extends PhetioObject {

  // Position property of the energy chunk
  public readonly positionProperty: Vector2Property;

  // For simple 3D layering effects
  public readonly zPositionProperty: NumberProperty;

  // Energy type property
  public readonly energyTypeProperty: StringUnionProperty<EnergyType>;

  // Visibility property
  public readonly visibleProperty: BooleanProperty;

  // An ID that will be used to track this energy chunk
  public readonly id: number;

  // For performance reasons, this is allocated once and should never be overwritten
  public readonly velocity: Vector2;

  // Z position for layering (convenience property)
  public zPosition: number;

  public constructor( initialEnergyType: EnergyType, initialPosition: Vector2, initialVelocity: Vector2, visibleProperty: BooleanProperty, providedOptions?: EnergyChunkOptions ) {

    const options = optionize<EnergyChunkOptions, SelfOptions, PhetioObjectOptions>()( {
      id: null,

      // phet-io
      tandem: Tandem.REQUIRED,

      phetioType: EnergyChunk.EnergyChunkIO,
      phetioDynamicElement: true
    }, providedOptions );

    super( options );

    this.positionProperty = new Vector2Property( initialPosition, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: options.tandem.createTandem( 'positionProperty' ),
      phetioEventType: EventType.OPT_OUT
    } );

    this.zPositionProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'zPositionProperty' )
    } );

    this.energyTypeProperty = new StringUnionProperty( initialEnergyType, {
      validValues: EnergyTypeValues,
      tandem: options.tandem.createTandem( 'energyTypeProperty' )
    } );

    this.visibleProperty = visibleProperty;

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( this.visibleProperty.isPhetioInstrumented(),
      'if this EnergyChunk is instrumented, then the visibleProperty should be too' );

    this.id = options.id || instanceCount++;

    this.velocity = new Vector2( initialVelocity.x, initialVelocity.y );

    // Initialize z position
    this.zPosition = 0;
  }

  public toStateObject(): EnergyChunkStateObject {
    return {
      id: this.id,
      velocity: Vector2.Vector2IO.toStateObject( this.velocity ),
      visiblePropertyReference: ReferenceIO( Property.PropertyIO( BooleanIO ) ).toStateObject( this.visibleProperty )
    };
  }

  public static stateObjectToCreateElementArguments( stateObject: EnergyChunkStateObject ): [ 'HIDDEN', Vector2, Vector2, TReadOnlyProperty<boolean>, { id: number } ] {
    const visibleProperty = ReferenceIO( Property.PropertyIO( BooleanIO ) ).fromStateObject(
      stateObject.visiblePropertyReference
    ) as unknown as TReadOnlyProperty<boolean>;
    return [
      'HIDDEN',
      Vector2.ZERO,
      Vector2.Vector2IO.fromStateObject( stateObject.velocity ),
      visibleProperty,
      { id: stateObject.id }
    ];
  }

  /**
   * set the position
   */
  public setPositionXY( x: number, y: number ): void {
    this.positionProperty.set( new Vector2( x, y ) );
  }

  /**
   * translate the energy chunk by amount specified
   */
  public translate( x: number, y: number ): void {
    this.positionProperty.set( this.positionProperty.get().plusXY( x, y ) );
  }

  /**
   * translate the energy chunk based on its velocity
   * @param dt - delta time
   */
  public translateBasedOnVelocity( dt: number ): void {

    // When setting PhET-iO state, the EnergyChunk is already in its correct spot, so don't alter that based on Property
    // listeners, see https://github.com/phetsims/energy-forms-and-changes/issues/362
    if ( !isSettingPhetioStateProperty.value ) {
      this.translate( this.velocity.x * dt, this.velocity.y * dt );
    }
  }

  /**
   * set the X and Y velocity of the energy chunk
   */
  public setVelocityXY( x: number, y: number ): void {
    this.velocity.setXY( x, y );
  }

  /**
   * set the velocity of the energy chunk (using a vector)
   */
  public setVelocity( newVelocity: Vector2 ): void {
    this.velocity.set( newVelocity );
  }

  public reset(): void {
    this.positionProperty.reset();
    this.zPositionProperty.reset();
    this.energyTypeProperty.reset();
    this.visibleProperty.reset();
  }

  public override dispose(): void {
    this.positionProperty.dispose();
    this.zPositionProperty.dispose();
    this.energyTypeProperty.dispose();
    super.dispose();
  }

  public static readonly EnergyChunkIO = new IOType<EnergyChunk, EnergyChunkStateObject>( 'EnergyChunkIO', {
    valueType: EnergyChunk,
    toStateObject: energyChunk => energyChunk.toStateObject(),
    stateObjectToCreateElementArguments: stateObject => EnergyChunk.stateObjectToCreateElementArguments( stateObject ),
    stateSchema: {
      id: NumberIO,
      velocity: Vector2.Vector2IO,
      visiblePropertyReference: ReferenceIO( Property.PropertyIO( BooleanIO ) )
    }
  } );
}

energyFormsAndChanges.register( 'EnergyChunk', EnergyChunk );
export default EnergyChunk;