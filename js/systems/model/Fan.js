// Copyright 2018-2022, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import fanIcon_png from '../../../images/fanIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyUser from './EnergyUser.js';

// constants
const ANGULAR_ACCELERATION = Math.PI * 4; // In radians/(sec^2).
const MINIMUM_TARGET_VELOCITY = 4; // In radians/sec. Any speed lower than this looks choppy, so this is the cutoff
const INCOMING_ENERGY_VELOCITY_COEFFICIENT = 0.0051; // empirically determined. used to map incoming energy to a target velocity
const MAX_INTERNAL_ENERGY = EFACConstants.ENERGY_PER_CHUNK * 4;
const ENERGY_LOST_PROPORTION = 0.30; // used to remove some energy from internal energy when a target velocity is set

// empirically determined. used to map internal energy to a target velocity. the value is so specific because the speed
// of the fan when using internal energy should closely match its speed when using incoming energy
const INTERNAL_ENERGY_VELOCITY_COEFFICIENT = 0.00255;

// constants for temperature
const ROOM_TEMPERATURE = 22; // in Celsius
const TEMPERATURE_GAIN_PER_ENERGY_CHUNK = 1.5; // in Celsius
const THERMAL_RELEASE_TEMPERATURE = 38; // in Celsius
const COOLING_RATE = 0.5; // in degrees Celsius per second

// energy chunk path vars
const WIRE_START_OFFSET = new Vector2( -0.055, -0.0435 );
const WIRE_CURVE_POINT_1_OFFSET = new Vector2( -0.0425, -0.0405 );
const WIRE_CURVE_POINT_2_OFFSET = new Vector2( -0.0385, -0.039 );
const WIRE_CURVE_POINT_3_OFFSET = new Vector2( -0.0345, -0.0365 );
const WIRE_CURVE_POINT_4_OFFSET = new Vector2( -0.0305, -0.033 );
const WIRE_CURVE_POINT_5_OFFSET = new Vector2( -0.0265, -0.024 );
const FAN_MOTOR_INTERIOR_OFFSET = new Vector2( -0.0265, 0.019 );
const INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.05; // in meters
const BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.3; // in meters
const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [
  WIRE_START_OFFSET,
  WIRE_CURVE_POINT_1_OFFSET,
  WIRE_CURVE_POINT_2_OFFSET,
  WIRE_CURVE_POINT_3_OFFSET,
  WIRE_CURVE_POINT_4_OFFSET,
  WIRE_CURVE_POINT_5_OFFSET,
  FAN_MOTOR_INTERIOR_OFFSET
];


class Fan extends EnergyUser {

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( fanIcon_png ), options );

    // @public (read-only) {NumberProperty}
    this.bladePositionProperty = new NumberProperty( 0, {
      range: new Range( 0, 2 * Math.PI ),
      units: 'radians',
      tandem: options.tandem.createTandem( 'bladePositionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angle of the blade'
    } );

    // @private - movers that control how the energy chunks move towards and through the fan
    this.electricalEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'electricalEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.mechanicalEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'mechanicalEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.radiatedEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'radiatedEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );

    // @private
    this.angularVelocityProperty = new NumberProperty( 0, {
      units: 'radians/s',
      tandem: options.tandem.createTandem( 'angularVelocityProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angular velocity of the blade'
    } );

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @private {number} - the internal energy of the fan, which is only used by energy chunks, not incomingEnergy.
    // incoming chunks add their energy values to this, which is then used to determine a target velocity for the fan.
    this.internalEnergyFromEnergyChunksProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'internalEnergyFromEnergyChunksProperty' ),
      phetioReadOnly: true
    } );

    // @private {number} - a temperature value used to decide when to release thermal energy chunks, very roughly in
    // degrees Celsius
    this.internalTemperature = ROOM_TEMPERATURE;

    this.targetVelocityProperty = new NumberProperty( 0, {
      units: 'radians/s',
      tandem: options.tandem.createTandem( 'targetVelocityProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the target velocity of the blade'
    } );
  }

  /**
   * @param {number} dt - time step, in seconds
   * @param {Energy} incomingEnergy
   * @public
   */
  step( dt, incomingEnergy ) {
    if ( !this.activeProperty.value ) {
      return;
    }

    // handle any incoming energy chunks
    if ( this.incomingEnergyChunks.length > 0 ) {
      this.incomingEnergyChunks.forEach( chunk => {

        assert && assert(
          chunk.energyTypeProperty.value === EnergyType.ELECTRICAL,
          `Energy chunk type should be ELECTRICAL but is ${chunk.energyTypeProperty.value}`
        );

        // add the energy chunk to the list of those under management
        this.energyChunkList.push( chunk );

        // add a "mover" that will move this energy chunk through the wire to the motor
        this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY ) );
      } );

      // clear incoming chunks array
      this.incomingEnergyChunks.clear();
    }

    // move all energy chunks that are currently owned by this element
    this.moveElectricalEnergyChunks( dt );
    this.moveRadiatedEnergyChunks( dt );
    this.moveBlownEnergyChunks( dt );

    // Cool down a bit on each step.  If the fan doesn't cool off fast enough, thermal energy will be released.  The
    // cooling is linear rather than differential, which isn't very realistic, but works for our purposes here.
    this.internalTemperature = Math.max( this.internalTemperature - dt * COOLING_RATE, ROOM_TEMPERATURE );

    // set the target velocity of the fan
    if ( this.energyChunksVisibleProperty.get() ) {

      // cap the internal energy
      this.internalEnergyFromEnergyChunksProperty.value =
        Math.min( this.internalEnergyFromEnergyChunksProperty.value, MAX_INTERNAL_ENERGY );

      // when chunks are on, use internal energy of the fan to determine the target velocity
      this.targetVelocityProperty.value = this.internalEnergyFromEnergyChunksProperty.value *
                                          INTERNAL_ENERGY_VELOCITY_COEFFICIENT;

      // lose a proportion of the energy
      this.internalEnergyFromEnergyChunksProperty.value = Math.max(
        this.internalEnergyFromEnergyChunksProperty.value - this.internalEnergyFromEnergyChunksProperty.value * ENERGY_LOST_PROPORTION * dt,
        0
      );
    }
    else {

      // when chunks are off, get a smooth target velocity from incoming energy by using dt
      this.targetVelocityProperty.value = incomingEnergy.amount * INCOMING_ENERGY_VELOCITY_COEFFICIENT / dt;
    }
    this.targetVelocityProperty.value = this.targetVelocityProperty.value < MINIMUM_TARGET_VELOCITY ? 0 : this.targetVelocityProperty.value;

    // dump any internal energy that was left around from when chunks were on
    this.internalEnergyFromEnergyChunksProperty.value = this.targetVelocityProperty.value === 0 ?
                                                        0 :
                                                        this.internalEnergyFromEnergyChunksProperty.value;

    const dOmega = this.targetVelocityProperty.value - this.angularVelocityProperty.value;
    if ( dOmega !== 0 ) {
      const change = ANGULAR_ACCELERATION * dt;
      if ( dOmega > 0 ) {

        // accelerate
        this.angularVelocityProperty.value = Math.min(
          this.angularVelocityProperty.value + change,
          this.targetVelocityProperty.value
        );
      }
      else {

        // decelerate
        this.angularVelocityProperty.value = Math.max( this.angularVelocityProperty.value - change, 0 );
      }
    }
    const newAngle = ( this.bladePositionProperty.value + this.angularVelocityProperty.value * dt ) % ( 2 * Math.PI );
    this.bladePositionProperty.set( newAngle );
  }

  /**
   * move electrical energy chunks through the fan's wire
   *
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks( dt ) {
    const movers = this.electricalEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        const chunk = mover.energyChunk;

        // the electrical energy chunk has reached the motor, so it needs to change into mechanical or thermal energy
        this.electricalEnergyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );

        this.hasEnergy = true;

        if ( this.internalTemperature < THERMAL_RELEASE_TEMPERATURE ) {

          // increase the temperature a little, since this energy chunk is going to move the fan
          this.internalTemperature += TEMPERATURE_GAIN_PER_ENERGY_CHUNK;

          // add the energy from this chunk to the fan's internal energy
          this.internalEnergyFromEnergyChunksProperty.value += EFACConstants.ENERGY_PER_CHUNK;

          chunk.energyTypeProperty.set( EnergyType.MECHANICAL );

          // release the energy chunk as mechanical to blow away
          this.mechanicalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
            createBlownEnergyChunkPath( chunk.positionProperty.get() ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        }
        else {
          chunk.energyTypeProperty.set( EnergyType.THERMAL );

          // release the energy chunk as thermal to radiate away
          this.radiatedEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
            chunk,
            EnergyChunkPathMover.createRadiatedPath( chunk.positionProperty.get(), 0 ),
            EFACConstants.ENERGY_CHUNK_VELOCITY
          ) );

          // cool back to room temperature, since some thermal energy was released
          this.internalTemperature = ROOM_TEMPERATURE;
        }
      }
    } );
  }

  /**
   * move thermal energy chunks up and away from the fan
   *
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveRadiatedEnergyChunks( dt ) {
    const movers = this.radiatedEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      // remove this energy chunk entirely
      if ( mover.pathFullyTraversed ) {
        this.energyChunkList.remove( mover.energyChunk );
        this.radiatedEnergyChunkMovers.remove( mover );

        this.energyChunkGroup.disposeElement( mover.energyChunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * move mechanical energy chunks out of the motor and away from the blades as wind
   *
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveBlownEnergyChunks( dt ) {
    const movers = this.mechanicalEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      // remove this energy chunk entirely
      if ( mover.pathFullyTraversed ) {
        this.energyChunkList.remove( mover.energyChunk );
        this.mechanicalEnergyChunkMovers.remove( mover );

        this.energyChunkGroup.disposeElement( mover.energyChunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * deactivate this energy system element
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.bladePositionProperty.reset();
    this.angularVelocityProperty.reset();
    this.targetVelocityProperty.reset();
    this.internalEnergyFromEnergyChunksProperty.reset();
    this.internalTemperature = ROOM_TEMPERATURE;
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.electricalEnergyChunkMovers.clear();
    this.radiatedEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.radiatedEnergyChunkMovers.clear();
    this.mechanicalEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.mechanicalEnergyChunkMovers.clear();
  }

  /**
   * @param {Energy} incomingEnergy
   * @public
   * @override
   */
  preloadEnergyChunks( incomingEnergy ) {

    this.clearEnergyChunks();

    if ( this.targetVelocityProperty.value < MINIMUM_TARGET_VELOCITY ||
         incomingEnergy.type !== EnergyType.ELECTRICAL ) {

      // no energy chunk pre-loading needed
      return;
    }

    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99; // prime the pump
    let timeSimulated = 0; // in seconds

    // simulate energy chunks moving through the system, have a time limit to prevent infinite loops
    let preloadComplete = false;
    while ( !preloadComplete && timeSimulated < 10 ) {

      energySinceLastChunk += incomingEnergy.amount * dt;
      timeSimulated += dt;

      // determine if time to add a new chunk
      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
        const newEnergyChunk = this.energyChunkGroup.createNextElement(
          EnergyType.ELECTRICAL,
          this.positionProperty.value.plus( WIRE_START_OFFSET ),
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

        // update energy since last chunk, and do so by taking "every other" chunk as the generator approximately does.
        // this way, the spread of the preloaded energy chunks better matches what the actual spread would be, instead
        // of being at a higher concentration than normal.
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK * 2;
      }

      this.moveElectricalEnergyChunks( dt );
      this.moveRadiatedEnergyChunks( dt );
      this.moveBlownEnergyChunks( dt );

      if ( this.mechanicalEnergyChunkMovers.length >= 3 ) {

        // a few mechanical energy chunks are moving away from the fan, which completes the preload
        preloadComplete = true;
      }
    }
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return { internalTemperature: this.internalTemperature };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState( stateObject ) {
    this.internalTemperature = stateObject.internalTemperature;
  }
}

/**
 * Create a path for chunks to follow when blown out of the fan.
 * @param  {Vector2} startingPoint
 * @returns {Vector2[]}
 * @private
 */
const createBlownEnergyChunkPath = startingPoint => {
  const path = [];
  const numberOfDirectionChanges = 20; // empirically determined
  const nominalTravelVector = new Vector2( BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE / numberOfDirectionChanges, 0 );

  // The first point is straight right the starting point.  This is done because it makes the chunk
  // move straight out of the fan center cone.
  let currentPosition = startingPoint.plus( new Vector2( INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE, 0 ) );
  path.push( currentPosition );

  // add the remaining points in the path
  for ( let i = 0; i < numberOfDirectionChanges - 1; i++ ) {
    const movement = nominalTravelVector.rotated( ( dotRandom.nextDouble() - 0.5 ) * Math.PI / 4 );
    currentPosition = currentPosition.plus( movement );
    path.push( currentPosition );
  }

  return path;
};

energyFormsAndChanges.register( 'Fan', Fan );
export default Fan;