// Copyright 2018-2020, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyUser' );
  const Image = require( 'SCENERY/nodes/Image' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const Vector2 = require( 'DOT/Vector2' );

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

  // images
  const FAN_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fan_icon.png' );

  class Fan extends EnergyUser {

    /**
     * @param {Property.<boolean>} energyChunksVisibleProperty
     * @param {Tandem} tandem
     */
    constructor( energyChunksVisibleProperty, tandem ) {
      super( new Image( FAN_ICON ), tandem );

      // @public (read-only) {NumberProperty}
      this.bladePositionProperty = new NumberProperty( 0, {
        range: new Range( 0, 2 * Math.PI ),
        tandem: tandem.createTandem( 'bladePositionProperty' ),
        phetioReadyOnly: true,
        phetioDocumentation: 'the angle of the blade as it\'s spinning in a circular motion, in radians'
      } );

      // @private - movers that control how the energy chunks move towards and through the fan
      this.electricalEnergyChunkMovers = [];
      this.radiatedEnergyChunkMovers = [];
      this.mechanicalEnergyChunkMovers = [];

      // @private
      this.bladeAngularVelocity = 0;
      this.energyChunksVisibleProperty = energyChunksVisibleProperty;

      // @private {number} - the internal energy of the fan, which is only used by energy chunks, not incomingEnergy.
      // incoming chunks add their energy values to this, which is then used to determine a target velocity for the fan.
      this.internalEnergyFromEnergyChunks = 0;

      // @private {number} - a temperature value used to decide when to release thermal energy chunks, very roughly in
      // degrees Celsius
      this.internalTemperature = ROOM_TEMPERATURE;

      this.targetVelocity = 0;
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

          // add a "mover" that will move this energy chunk through the wire to the heating element
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( chunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        } );

        // clear incoming chunks array
        this.incomingEnergyChunks.length = 0;
      }
      this.moveElectricalEnergyChunks( dt );
      this.moveRadiatedEnergyChunks( dt );
      this.moveBlownEnergyChunks( dt );

      // Cool down a bit on each step.  If the fan doesn't cool off fast enough, thermal energy will be released.  The
      // cooling is linear rather than differential, which isn't very realistic, but works for our purposes here.
      this.internalTemperature = Math.max( this.internalTemperature - dt * COOLING_RATE, ROOM_TEMPERATURE );

      // set the target velocity of the fan
      if ( this.energyChunksVisibleProperty.get() ) {

        // cap the internal energy
        this.internalEnergyFromEnergyChunks = Math.min( this.internalEnergyFromEnergyChunks, MAX_INTERNAL_ENERGY );

        // when chunks are on, use internal energy of the fan to determine the target velocity
        this.targetVelocity = this.internalEnergyFromEnergyChunks * INTERNAL_ENERGY_VELOCITY_COEFFICIENT;

        // lose a proportion of the energy
        this.internalEnergyFromEnergyChunks = Math.max(
          this.internalEnergyFromEnergyChunks - this.internalEnergyFromEnergyChunks * ENERGY_LOST_PROPORTION * dt,
          0
        );
      }
      else {

        // when chunks are off, get a smooth target velocity from incoming energy by using dt
        this.targetVelocity = incomingEnergy.amount * INCOMING_ENERGY_VELOCITY_COEFFICIENT / dt;
      }
      this.targetVelocity = this.targetVelocity < MINIMUM_TARGET_VELOCITY ? 0 : this.targetVelocity;

      // dump any internal energy that was left around from when chunks were on
      this.internalEnergyFromEnergyChunks = this.targetVelocity === 0 ? 0 : this.internalEnergyFromEnergyChunks;

      const dOmega = this.targetVelocity - this.bladeAngularVelocity;
      if ( dOmega !== 0 ) {
        const change = ANGULAR_ACCELERATION * dt;
        if ( dOmega > 0 ) {

          // accelerate
          this.bladeAngularVelocity = Math.min(
            this.bladeAngularVelocity + change,
            this.targetVelocity
          );
        }
        else {

          // decelerate
          this.bladeAngularVelocity = Math.max( this.bladeAngularVelocity - change, 0 );
        }
      }
      const newAngle = ( this.bladePositionProperty.value + this.bladeAngularVelocity * dt ) % ( 2 * Math.PI );
      this.bladePositionProperty.set( newAngle );
    }

    /**
     * move electrical energy chunks through the fan's wire
     *
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks( dt ) {
      const movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // the electrical energy chunk has reached the motor, so it needs to change into mechanical or thermal energy
          _.pull( this.electricalEnergyChunkMovers, mover );
          this.hasEnergy = true;

          if ( this.internalTemperature < THERMAL_RELEASE_TEMPERATURE ) {

            // increase the temperature a little, since this energy chunk is going to move the fan
            this.internalTemperature += TEMPERATURE_GAIN_PER_ENERGY_CHUNK;

            // add the energy from this chunk to the fan's internal energy
            this.internalEnergyFromEnergyChunks += EFACConstants.ENERGY_PER_CHUNK;

            mover.energyChunk.energyTypeProperty.set( EnergyType.MECHANICAL );

            // release the energy chunk as mechanical to blow away
            this.mechanicalEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              createBlownEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          }
          else {
            mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

            // release the energy chunk as thermal to radiate away
            this.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover(
              mover.energyChunk,
              EnergyChunkPathMover.createRadiatedPath( mover.energyChunk.positionProperty.get(), 0 ),
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
      const movers = _.clone( this.radiatedEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        // remove this energy chunk entirely
        if ( mover.pathFullyTraversed ) {
          this.energyChunkList.remove( mover.energyChunk );
          _.pull( this.radiatedEnergyChunkMovers, mover );
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
      const movers = _.clone( this.mechanicalEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        // remove this energy chunk entirely
        if ( mover.pathFullyTraversed ) {
          this.energyChunkList.remove( mover.energyChunk );
          _.pull( this.mechanicalEnergyChunkMovers, mover );
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
      this.bladeAngularVelocity = 0;
      this.targetVelocity = 0;
      this.internalEnergyFromEnergyChunks = 0;
      this.internalTemperature = ROOM_TEMPERATURE;
    }

    /**
     * @public
     * @override
     */
    clearEnergyChunks() {
      super.clearEnergyChunks();
      this.electricalEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;
      this.mechanicalEnergyChunkMovers.length = 0;
      this.incomingEnergyChunks.length = 0;
    }

    /**
     * @param {Energy} incomingEnergy
     * @public
     * @override
     */
    preloadEnergyChunks( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( this.targetVelocity < MINIMUM_TARGET_VELOCITY ||
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
          const newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.positionProperty.value.plus( WIRE_START_OFFSET ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover(
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
  }

  /**
   * create a path for chunks to follow when blown out of the fan.
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
      const movement = nominalTravelVector.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 );
      currentPosition = currentPosition.plus( movement );
      path.push( currentPosition );
    }

    return path;
  };

  return energyFormsAndChanges.register( 'Fan', Fan );
} );

