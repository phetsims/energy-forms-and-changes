// Copyright 2016-2024, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * base class for light bulbs in the model
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import createObservableArray, { ObservableArrayDef } from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import EnergyUser, { EnergyUserOptions } from './EnergyUser.js';

// constants
const THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range( 2, 2.5 );
const ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
const LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
const LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

// energy chunk path offsets
const LEFT_SIDE_OF_WIRE_OFFSET = new Vector2( -0.04, -0.041 );
const WIRE_CURVE_POINT_1_OFFSET = new Vector2( -0.02, -0.041 );
const WIRE_CURVE_POINT_2_OFFSET = new Vector2( -0.015, -0.04 );
const WIRE_CURVE_POINT_3_OFFSET = new Vector2( -0.006, -0.034 );
const WIRE_CURVE_POINT_4_OFFSET = new Vector2( -0.001, -0.026 );
const WIRE_CURVE_POINT_5_OFFSET = new Vector2( -0.0003, -0.02 );
const BOTTOM_OF_CONNECTOR_OFFSET = new Vector2( 0.0002, -0.01 );
const RADIATE_POINT_OFFSET = new Vector2( 0.0002, 0.066 );
const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [
  WIRE_CURVE_POINT_1_OFFSET,
  WIRE_CURVE_POINT_2_OFFSET,
  WIRE_CURVE_POINT_3_OFFSET,
  WIRE_CURVE_POINT_4_OFFSET,
  WIRE_CURVE_POINT_5_OFFSET,
  BOTTOM_OF_CONNECTOR_OFFSET,
  RADIATE_POINT_OFFSET
];

type SelfOptions = EmptySelfOptions;
export type LightBulbOptions = SelfOptions & EnergyUserOptions;

class LightBulb extends EnergyUser {

  public readonly litProportionProperty: NumberProperty;
  private readonly hasFilament: boolean;
  private readonly energyChunksVisibleProperty: Property<boolean>;
  private readonly energyChunkGroup: EnergyChunkGroup;
  private readonly energyChunkPathMoverGroup: EnergyChunkPathMoverGroup;

  // Fewer thermal energy chunks are radiated for bulbs without a filament
  private readonly proportionOfThermalChunksRadiated: number;

  // Movers and flags that control how the energy chunks move through the light bulb
  private readonly electricalEnergyChunkMovers: ObservableArrayDef<EnergyChunkPathMover>;
  private readonly filamentEnergyChunkMovers: ObservableArrayDef<EnergyChunkPathMover>;
  private readonly radiatedEnergyChunkMovers: ObservableArrayDef<EnergyChunkPathMover>;
  private goRightNextTime: boolean;

  public constructor( iconImage: Image, hasFilament: boolean, energyChunksVisibleProperty: Property<boolean>, energyChunkGroup: EnergyChunkGroup, energyChunkPathMoverGroup: EnergyChunkPathMoverGroup, providedOptions?: LightBulbOptions ) {

    const options = optionize<LightBulbOptions, SelfOptions, EnergyUserOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( iconImage, options );

    this.litProportionProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: options.tandem.createTandem( 'litProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of brightness from the bulb'
    } );
    this.hasFilament = hasFilament;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;
    this.proportionOfThermalChunksRadiated = hasFilament ? 0.35 : 0.2;
    this.electricalEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'electricalEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.filamentEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'filamentEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.radiatedEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'radiatedEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.goRightNextTime = true;
  }

  /**
   * @param dt - time step, in seconds
   * @param incomingEnergy
   */
  public step( dt: number, incomingEnergy: Energy ): void {
    if ( this.activeProperty.value ) {

      // handle any incoming energy chunks
      if ( this.incomingEnergyChunks.length > 0 ) {

        this.incomingEnergyChunks.forEach( incomingChunk => {

          if ( incomingChunk.energyTypeProperty.get() === EnergyType.ELECTRICAL ) {

            // add the energy chunk to the list of those under management
            this.energyChunkList.push( incomingChunk );

            // add a "mover" that will move this energy chunk through the wire to the bulb
            this.electricalEnergyChunkMovers.push(
              this.energyChunkPathMoverGroup.createNextElement(
                incomingChunk,
                EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
                EFACConstants.ENERGY_CHUNK_VELOCITY )
            );
          }

          // by design, this shouldn't happen, so warn if it does
          else {
            assert && assert(
              false,
              `Encountered energy chunk with unexpected type: ${this.incomingEnergyChunk.energyTypeProperty.get()}`
            );
          }
        } );

        this.incomingEnergyChunks.clear();
      }

      // move all of the energy chunks
      this.moveElectricalEnergyChunks( dt );
      this.moveFilamentEnergyChunks( dt );
      this.moveRadiatedEnergyChunks( dt );

      // set how lit the bulb is
      if ( this.energyChunksVisibleProperty.get() ) {

        // energy chunks are visible, so the lit proportion is dependent upon whether light energy chunks are present
        let lightChunksInLitRadius = 0;

        this.radiatedEnergyChunkMovers.forEach( mover => {
          const distance = mover.energyChunk.positionProperty.value.distance( this.positionProperty.value.plus( RADIATE_POINT_OFFSET ) );
          if ( distance < LIGHT_CHUNK_LIT_BULB_RADIUS ) {
            lightChunksInLitRadius++;
          }
        } );

        if ( lightChunksInLitRadius > 0 ) {

          // light is on - empirically determined max to match the max from most energy sources when chunks are off
          this.litProportionProperty.set( Math.min( 0.7, this.litProportionProperty.get() + LIGHT_CHANGE_RATE * dt ) );
        }
        else {

          // light is off
          this.litProportionProperty.set( Math.max( 0, this.litProportionProperty.get() - LIGHT_CHANGE_RATE * dt ) );
        }
      }

      // energy chunks not currently visible
      else {
        if ( this.activeProperty.value && incomingEnergy.type === EnergyType.ELECTRICAL ) {
          this.litProportionProperty.set( Utils.clamp( incomingEnergy.amount / ( ENERGY_TO_FULLY_LIGHT * dt ), 0, 1 ) );
        }
        else {
          this.litProportionProperty.set( 0.0 );
        }
      }
    }
  }

  /**
   * @param dt - time step, in seconds
   */
  private moveRadiatedEnergyChunks( dt: number ): void {

    // iterate over a copy to mutate original without problems
    const movers = this.radiatedEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      // remove the chunk and its mover
      if ( mover.pathFullyTraversed ) {
        this.energyChunkList.remove( mover.energyChunk );
        this.radiatedEnergyChunkMovers.remove( mover );
        this.energyChunkGroup.disposeElement( mover.energyChunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * @param dt - time step, in seconds
   */
  private moveFilamentEnergyChunks( dt: number ): void {

    // iterate over a copy to mutate original without problems
    const movers = this.filamentEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      // cause this energy chunk to be radiated from the bulb
      if ( mover.pathFullyTraversed ) {
        this.filamentEnergyChunkMovers.remove( mover );
        this.radiateEnergyChunk( mover.energyChunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );

      }
    } );
  }

  /**
   * @param dt - time step, in seconds
   */
  private moveElectricalEnergyChunks( dt: number ): void {

    // iterate over a copy to mutate original without problems
    const movers = this.electricalEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {
        this.electricalEnergyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );

        // turn this energy chunk into thermal energy on the filament
        if ( this.hasFilament ) {
          mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
          const path = this.createPathOnFilament( mover.energyChunk.positionProperty.value );
          const speed = getTotalPathLength( mover.energyChunk.positionProperty.value, path ) /
                        generateThermalChunkTimeOnFilament();
          this.filamentEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( mover.energyChunk, path, speed ) );
        }
        else {

          // there is no filament, so just radiate the chunk
          this.radiateEnergyChunk( mover.energyChunk );
        }
      }
    } );
  }

  /**
   * @param incomingEnergy
   */
  public override preloadEnergyChunks( incomingEnergy: Energy ): void {

    this.clearEnergyChunks();

    if ( incomingEnergy.amount < EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 10 ||
         incomingEnergy.type !== EnergyType.ELECTRICAL ) {

      // no energy chunk pre-loading needed
      return;
    }

    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99; // prime the pump

    // simulate energy chunks moving through the system
    let preloadComplete = false;
    while ( !preloadComplete ) {
      energySinceLastChunk += incomingEnergy.amount * dt;

      // determine if time to add a new chunk
      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
        const newEnergyChunk = this.energyChunkGroup.createNextElement(
          EnergyType.ELECTRICAL,
          this.positionProperty.value.plus( LEFT_SIDE_OF_WIRE_OFFSET ),
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );

        this.energyChunkList.push( newEnergyChunk );

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
          newEnergyChunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY
        ) );

        // update energy since last chunk
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
      }

      this.moveElectricalEnergyChunks( dt );
      this.moveFilamentEnergyChunks( dt );

      if ( this.radiatedEnergyChunkMovers.length > 1 ) {

        // a couple of chunks are radiating, which completes the pre-load
        preloadComplete = true;
      }
    }
  }

  /**
   * @param energyChunk
   */
  private radiateEnergyChunk( energyChunk: EnergyChunk ): void {
    if ( dotRandom.nextDouble() > this.proportionOfThermalChunksRadiated ) {
      energyChunk.energyTypeProperty.set( EnergyType.LIGHT );
    }
    else {
      energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
    }

    this.radiatedEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
      energyChunk,
      EnergyChunkPathMover.createRandomStraightPath(
        this.positionProperty.value,
        new Range( Math.PI / 3, Math.PI / 3 * 2 ) ),
      EFACConstants.ENERGY_CHUNK_VELOCITY )
    );
  }

  /**
   * @param startingPoint
   */
  private createPathOnFilament( startingPoint: Vector2 ): Vector2[] {
    const path = [];
    const filamentWidth = 0.03;
    const x = ( 0.5 + dotRandom.nextDouble() / 2 ) * filamentWidth / 2 * ( this.goRightNextTime ? 1 : -1 );

    path.push( startingPoint.plus( new Vector2( x, 0 ) ) );
    this.goRightNextTime = !this.goRightNextTime;

    return path;
  }

  /**
   * deactivate the light bulb
   */
  public override deactivate(): void {
    super.deactivate();
    this.litProportionProperty.set( 0 );
  }

  public override clearEnergyChunks(): void {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.electricalEnergyChunkMovers.clear();
    this.filamentEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.filamentEnergyChunkMovers.clear();
    this.radiatedEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.radiatedEnergyChunkMovers.clear();
  }

  /**
   * @public (EnergySystemElementIO)
   */
  public override toStateObject(): Object {
    return {
      goRightNextTime: this.goRightNextTime,
      hasFilament: this.hasFilament,
      proportionOfThermalChunksRadiated: this.proportionOfThermalChunksRadiated
    };
  }

  /**
   * @public (EnergySystemElementIO)
   * @param stateObject - see this.toStateObject()
   */
  public override applyState( stateObject: Object ): void {
    this.goRightNextTime = stateObject.goRightNextTime;
    this.hasFilament = stateObject.hasFilament;
    this.proportionOfThermalChunksRadiated = stateObject.proportionOfThermalChunksRadiated;
  }
}

/**
 * @returns time
 */
const generateThermalChunkTimeOnFilament = (): number => {
  return THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.min +
         dotRandom.nextDouble() * THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.getLength();
};

/**
 * @param startingPosition
 * @param pathPoints
 */
const getTotalPathLength = ( startingPosition: Vector2, pathPoints: Vector2[] ): number => {
  if ( pathPoints.length === 0 ) {
    return 0;
  }

  let pathLength = startingPosition.distance( pathPoints[ 0 ] );
  for ( let i = 0; i < pathPoints.length - 1; i++ ) {
    pathLength += pathPoints[ i ].distance( pathPoints[ i + 1 ] );
  }

  return pathLength;
};

energyFormsAndChanges.register( 'LightBulb', LightBulb );
export default LightBulb;