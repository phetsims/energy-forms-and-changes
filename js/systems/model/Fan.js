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
  var VELOCITY_DIVISOR = 2.7; // empirically determined, lower number = faster fan speed
  var INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.05; // in meters
  var BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.3; // in meters
  var INCOMING_ENERGY_FAN_THRESHOLD = 6; // empirically determined, eliminates last few jumpy frames when fan slows to a stop
  var MAX_INCOMING_ENERGY = 170;
  var ROOM_TEMPERATURE = 22; // in Celsius
  var TEMPERATURE_GAIN_PER_ENERGY_CHUNK = 2.5; // in Celsius
  var THERMAL_RELEASE_TEMPERATURE = 38; // in Celsius
  var COOLING_RATE = 0.25; // in degrees Celsius per second

  // energy chunk path offsets
  var OFFSET_TO_WIRE_START = new Vector2( -0.055, -0.0435 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.0365, -0.0385 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.0275, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0265, -0.0175 );
  var OFFSET_TO_FAN_MOTOR_INTERIOR = new Vector2( -0.0265, 0.019 );

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

    // @private
    this.bladeAngularVelocity = 0;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkIncomingEnergy = 0;

    // @private - movers that control how the energy chunks move towards and through the fan
    this.electricalEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
    this.mechanicalEnergyChunkMovers = [];

    // @private {number} - a temperature value used to decide when to release thermal energy chunks, very roughly in
    // degrees Celsius
    this.internalTemperature = ROOM_TEMPERATURE;
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
      var targetVelocity = 0;

      // Cool down a bit on each step.  If the fan doesn't cool off fast enough, thermal energy will be released.  The
      // cooling is linear rather than differential, which isn't very realistic, but works for our purposes here.
      this.internalTemperature = Math.max( this.internalTemperature - dt * COOLING_RATE, ROOM_TEMPERATURE );

      // set how fast the fan is turning
      if ( this.energyChunksVisibleProperty.get() ) {

        // handle case where fan only turns when energy chunks are getting to the motor
        this.energyChunkIncomingEnergy = this.motorRecentlyReceivedEnergy() ? this.energyChunkIncomingEnergy : 0;
        targetVelocity = this.energyChunkIncomingEnergy / VELOCITY_DIVISOR;
      }
      else {
        targetVelocity = incomingEnergy.amount > INCOMING_ENERGY_FAN_THRESHOLD ? incomingEnergy.amount / VELOCITY_DIVISOR : 0;
      }
      var dOmega = targetVelocity - this.bladeAngularVelocity;

      if ( dOmega !== 0 ) {
        var change = ANGULAR_ACCELERATION * dt;
        if ( dOmega > 0 ) {

          // accelerate
          this.bladeAngularVelocity = Math.min(
            this.bladeAngularVelocity + change,
            targetVelocity
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
     * check if a blown energy chunk is within a certain proximity to the fan. if true is returned, the most recent
     * energy chunk to pass through the motor is still "powering" the motor.
     * @returns {boolean}
     * @private
     */
    motorRecentlyReceivedEnergy: function() {
      var recentEnergy = false;
      var fanPositionX = this.positionProperty.value.x;
      for ( var i = 0; i < this.mechanicalEnergyChunkMovers.length; i++ ) {

        // "recent energy" distance empirically determined to look correct, see function description above
        recentEnergy = this.mechanicalEnergyChunkMovers[ i ].energyChunk.positionProperty.value.x - fanPositionX <
                       INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE ? true : recentEnergy;
      }
      return recentEnergy;
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

            mover.energyChunk.energyTypeProperty.set( EnergyType.MECHANICAL );

            // release the energy chunk as mechanical to blow away
            self.mechanicalEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createBlownEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
            self.energyChunkIncomingEnergy = MAX_INCOMING_ENERGY;
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
      this.energyChunkIncomingEnergy = 0;
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

      if ( incomingEnergy.amount < EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 10 ||
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

          // update energy since last chunk
          energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );
        this.moveRadiatedEnergyChunks( dt );
        this.moveBlownEnergyChunks( dt );

        if ( this.mechanicalEnergyChunkMovers.length >= 4 ) {

          // a few mechanical energy chunks are moving away from the fan, which completes the preload
          preloadComplete = true;
        }
      }
    }
  } );
} );

