// Copyright 2018, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 * @author John Blanco (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyUser' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var ANGULAR_ACCELERATION = Math.PI * 4; // In radians/(sec^2).
  var MINIMUM_TARGET_VELOCITY = 4; // In radians/sec. Any speed lower than this looks choppy, so this is the cutoff
  var INCOMING_ENERGY_VELOCITY_COEFFICIENT = 0.0051; // empirically determined. used to map incoming energy to a target velocity
  var MAX_INTERNAL_ENERGY = EFACConstants.ENERGY_PER_CHUNK * 4;
  var ENERGY_LOST_PROPORTION = 0.30; // used to remove some energy from internal energy when a target velocity is set

  // empirically determined. used to map internal energy to a target velocity. the value is so specific because the speed
  // of the fan when using internal energy should closely match its speed when using incoming energy
  var INTERNAL_ENERGY_VELOCITY_COEFFICIENT = 0.00255;

  // constants for temperature
  var ROOM_TEMPERATURE = 22; // in Celsius
  var TEMPERATURE_GAIN_PER_ENERGY_CHUNK = 1.5; // in Celsius
  var THERMAL_RELEASE_TEMPERATURE = 38; // in Celsius
  var COOLING_RATE = 0.5; // in degrees Celsius per second

  // energy chunk path vars
  var OFFSET_TO_WIRE_START = new Vector2( -0.055, -0.0435 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.0365, -0.0385 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.0275, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0265, -0.0175 );
  var OFFSET_TO_FAN_MOTOR_INTERIOR = new Vector2( -0.0265, 0.019 );
  var INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.05; // in meters
  var BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.3; // in meters

  // images
  var FAN_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fan_icon.png' );

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Fan( energyChunksVisibleProperty ) {

    EnergyUser.call( this, new Image( FAN_ICON ) );

    // @public (read-only) {NumberProperty}
    this.bladePositionProperty = new Property( 0 );

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

  energyFormsAndChanges.register( 'Fan', Fan );

  return inherit( EnergyUser, Fan, {

    /**
     * @param {number} dt - time step, in seconds
     * @param {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      var self = this;
      if ( !this.activeProperty.value ) {
        return;
      }

      // handle any incoming energy chunks
      if ( this.incomingEnergyChunks.length > 0 ) {
        this.incomingEnergyChunks.forEach( function( chunk ) {

          assert && assert(
            chunk.energyTypeProperty.value === EnergyType.ELECTRICAL,
            'Energy chunk type should be ELECTRICAL but is ' + chunk.energyTypeProperty.value
          );

          // add the energy chunk to the list of those under management
          self.energyChunkList.push( chunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          self.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( chunk,
            self.createElectricalEnergyChunkPath( self.positionProperty.get() ),
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

      var dOmega = this.targetVelocity - this.bladeAngularVelocity;
      if ( dOmega !== 0 ) {
        var change = ANGULAR_ACCELERATION * dt;
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
      var newAngle = ( this.bladePositionProperty.value + this.bladeAngularVelocity * dt ) % ( 2 * Math.PI );
      this.bladePositionProperty.set( newAngle );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // the electrical energy chunk has reached the motor, so it needs to change into mechanical or thermal energy
          _.pull( self.electricalEnergyChunkMovers, mover );
          self.hasEnergy = true;

          if ( self.internalTemperature < THERMAL_RELEASE_TEMPERATURE ) {

            // increase the temperature a little, since this energy chunk is going to move the fan
            self.internalTemperature += TEMPERATURE_GAIN_PER_ENERGY_CHUNK;

            // add the energy from this chunk to the fan's internal energy
            self.internalEnergyFromEnergyChunks += EFACConstants.ENERGY_PER_CHUNK;

            mover.energyChunk.energyTypeProperty.set( EnergyType.MECHANICAL );

            // release the energy chunk as mechanical to blow away
            self.mechanicalEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createBlownEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          }
          else {
            mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

            // release the energy chunk as thermal to radiate away
            self.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover(
              mover.energyChunk,
              self.createRadiatedEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY
            ) );

            // cool back to room temperature, since some thermal energy was released
            self.internalTemperature = ROOM_TEMPERATURE;
          }
        }
      } );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.radiatedEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        // remove this energy chunk entirely
        if ( mover.pathFullyTraversed ) {
          self.energyChunkList.remove( mover.energyChunk );
          _.pull( self.radiatedEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveBlownEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.mechanicalEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        // remove this energy chunk entirely
        if ( mover.pathFullyTraversed ) {
          self.energyChunkList.remove( mover.energyChunk );
          _.pull( self.mechanicalEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     * create a path for chunks to follow when traveling along the wire to the motor
     * @param  {Vector2} center
     * @returns {Vector2[]}
     * @private
     */
    createElectricalEnergyChunkPath: function( center ) {
      var path = [];

      path.push( center.plus( OFFSET_TO_WIRE_START ) );
      path.push( center.plus( OFFSET_TO_FIRST_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SECOND_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_THIRD_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_FAN_MOTOR_INTERIOR ) );
      return path;
    },

    /**
     * create a path for chunks to follow when radiated from the motor. originally from BeakerHeater.js
     * @param  {Vector2} startingPoint
     * @returns {Vector2[]}
     * @private
     */
    createRadiatedEnergyChunkPath: function( startingPoint ) {
      var path = [];
      var numberOfDirectionChanges = 4; // Empirically chosen.
      var nominalTravelVector = new Vector2(
        0,
        ( EFACConstants.ENERGY_CHUNK_MAX_TRAVEL_HEIGHT - startingPoint.y ) / numberOfDirectionChanges
      );

      // The first point is straight above the starting point.  This is done because it looks good, making the chunk
      // move straight up out of the motor.
      var currentPosition = startingPoint.plus( nominalTravelVector );
      path.push( currentPosition );

      // add the remaining points in the path
      for ( var i = 0; i < numberOfDirectionChanges - 1; i++ ) {
        var movement = nominalTravelVector.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 );
        currentPosition = currentPosition.plus( movement );
        path.push( currentPosition );
      }

      return path;
    },

    /**
     * create a path for chunks to follow when blown out of the fan.
     * @param  {Vector2} startingPoint
     * @returns {Vector2[]}
     * @private
     */
    createBlownEnergyChunkPath: function( startingPoint ) {
      var path = [];
      var numberOfDirectionChanges = 20; // empirically determined
      var nominalTravelVector = new Vector2( BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE / numberOfDirectionChanges, 0 );

      // The first point is straight right the starting point.  This is done because it makes the chunk
      // move straight out of the fan center cone.
      var currentPosition = startingPoint.plus( new Vector2( INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE, 0 ) );
      path.push( currentPosition );

      // add the remaining points in the path
      for ( var i = 0; i < numberOfDirectionChanges - 1; i++ ) {
        var movement = nominalTravelVector.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 );
        currentPosition = currentPosition.plus( movement );
        path.push( currentPosition );
      }

      return path;
    },

    /**
     * deactivate this energy system element
     * @public
     * @override
     */
    deactivate: function() {
      EnergyUser.prototype.deactivate.call( this );
      this.bladePositionProperty.reset();
      this.bladeAngularVelocity = 0;
      this.targetVelocity = 0;
      this.internalEnergyFromEnergyChunks = 0;
      this.internalTemperature = ROOM_TEMPERATURE;
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergyUser.prototype.clearEnergyChunks.call( this );
      this.electricalEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;
      this.mechanicalEnergyChunkMovers.length = 0;
      this.incomingEnergyChunks.length = 0;
    },

    /**
     * @param {Energy} incomingEnergy
     * @public
     * @override
     */
    preloadEnergyChunks: function( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( this.targetVelocity < MINIMUM_TARGET_VELOCITY ||
           incomingEnergy.type !== EnergyType.ELECTRICAL ) {

        // no energy chunk pre-loading needed
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99; // prime the pump
      var timeSimulated = 0; // in seconds

      // simulate energy chunks moving through the system, have a time limit to prevent infinite loops
      var preloadComplete = false;
      while ( !preloadComplete && timeSimulated < 10 ) {

        energySinceLastChunk += incomingEnergy.amount * dt;
        timeSimulated += dt;

        // determine if time to add a new chunk
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.positionProperty.value.plus( OFFSET_TO_WIRE_START ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover(
            newEnergyChunk,
            this.createElectricalEnergyChunkPath( this.positionProperty.value ),
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
  } );
} );

