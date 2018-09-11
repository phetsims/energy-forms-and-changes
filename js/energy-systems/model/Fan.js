// Copyright 2018, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var VELOCITY_DIVISOR = 2.7; // empirically determined, lower number = faster fan speed
  var RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.2; // in meters
  var INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.05; // in meters
  var BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.12; // in meters
  var BLOWN_ENERGY_CHUNK_VELOCITY = EFACConstants.ENERGY_CHUNK_VELOCITY * 2; // empirically determined
  var CHANCE_ENERGY_LOST_TO_MOTOR_HEAT = 0.1; // empirically determined
  var INCOMING_ENERGY_FAN_THRESHOLD = 4; // empirically determined, eliminates last few jumpy frames when fan slows to a stop
  var MAX_INCOMING_ENERGY = 150;

  // energy chunk path offsets
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.035, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.026, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.025, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_SECOND_WIRE_BEND = new Vector2( -0.025, 0.011 );
  var OFFSET_TO_FOURTH_WIRE_CURVE_POINT = new Vector2( -0.0225, 0.02 );
  var OFFSET_TO_FIFTH_WIRE_CURVE_POINT = new Vector2( -0.0125, 0.031 );
  var OFFSET_TO_SIXTH_WIRE_CURVE_POINT = new Vector2( -0.005, 0.034 );
  var OFFSET_TO_FAN_MOTOR_INTERIOR = new Vector2( 0.005, 0.034 );

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
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkIncomingEnergy = 0;

    // @private - movers that control how the energy chunks move towards and through the fan
    this.electricalEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
    this.mechanicalEnergyChunkMovers = [];
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

      // when energy chunks are not entering the motor, chip away at the remaining energy from the last chunk
      this.energyChunkIncomingEnergy = this.energyChunkIncomingEnergy === 0 ? 0 : this.energyChunkIncomingEnergy - 0.3;

      // set how fast the fan is turning
      if ( this.energyChunksVisibleProperty.get() ) {
        // handle case where fan only turns when energy chunks are getting to the motor
        this.setBladePosition( dt, this.energyChunkIncomingEnergy );
      }
      else {
        this.setBladePosition( dt, incomingEnergy.amount );
      }
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @param {number} incomingEnergyAmount
     * @private
     */
    setBladePosition: function( dt, incomingEnergyAmount ) {
      if ( incomingEnergyAmount > INCOMING_ENERGY_FAN_THRESHOLD ) {
        var angularVelocity = incomingEnergyAmount / VELOCITY_DIVISOR;
        var newAngle = ( this.bladePositionProperty.value + angularVelocity * dt ) % ( 2 * Math.PI );
        this.bladePositionProperty.set( newAngle );
      }
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

          if ( phet.joist.random.nextDouble() > CHANCE_ENERGY_LOST_TO_MOTOR_HEAT || self.energyChunkIncomingEnergy < MAX_INCOMING_ENERGY / 2 ) {
            mover.energyChunk.energyTypeProperty.set( EnergyType.MECHANICAL );
            self.energyChunkIncomingEnergy = self.energyChunkIncomingEnergy < MAX_INCOMING_ENERGY / 4 ?
                                             self.energyChunkIncomingEnergy = MAX_INCOMING_ENERGY / 2 :
                                             self.energyChunkIncomingEnergy = MAX_INCOMING_ENERGY;

            // release the energy chunk as mechanical to blow away
            self.mechanicalEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createBlownEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
              BLOWN_ENERGY_CHUNK_VELOCITY ) );
          }
          else {
            mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

            // release the energy chunk as thermal to radiate away
            self.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
              self.createRadiatedEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
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

      path.push( center.plus( OFFSET_TO_FIRST_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SECOND_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_THIRD_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_BOTTOM_OF_SECOND_WIRE_BEND ) );
      path.push( center.plus( OFFSET_TO_FOURTH_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_FIFTH_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SIXTH_WIRE_CURVE_POINT ) );
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
      var numDirectionChanges = 8; // Empirically chosen.
      var nominalTravelVector = new Vector2( 0, RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE / numDirectionChanges );

      // The first point is straight above the starting point.  This is done because it looks good, making the chunk
      // move straight up out of the motor.
      var currentPosition = startingPoint.plus( nominalTravelVector );
      path.push( currentPosition );

      // add the remaining points in the path
      for ( var i = 0; i < numDirectionChanges - 1; i++ ) {
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
      var numDirectionChanges = 6; // empirically determined
      var nominalTravelVector = new Vector2( BLOWN_ENERGY_CHUNK_TRAVEL_DISTANCE / numDirectionChanges, 0 );

      // The first point is straight right the starting point.  This is done because it makes the chunk
      // move straight out of the fan center cone.
      var currentPosition = startingPoint.plus( new Vector2( INSIDE_FAN_ENERGY_CHUNK_TRAVEL_DISTANCE, 0 ) );
      path.push( currentPosition );

      // add the remaining points in the path
      for ( var i = 0; i < numDirectionChanges - 1; i++ ) {
        var movement = nominalTravelVector.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 );
        currentPosition = currentPosition.plus( movement );
        path.push( currentPosition );
      }

      return path;
    },

    /**
     * restore the initial state
     * @public
     */
    reset: function() {
      this.bladePositionProperty.reset();
      this.energyChunkIncomingEnergy = 0;
      this.electricalEnergyChunkMovers = [];
      this.radiatedEnergyChunkMovers = [];
      this.mechanicalEnergyChunkMovers = [];
    }
  } );
} );

