// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class is used to make an energy chunk wander, i.e. to perform somewhat
 * of a random walk while moving towards a destination.
 *
 * @author John Blanco
 *
 */


define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MIN_VELOCITY = 0.06; // In m/s.
  var MAX_VELOCITY = 0.10; // In m/s.
  // Random RAND = new Random();
  var MIN_TIME_IN_ONE_DIRECTION = 0.4;
  var MAX_TIME_IN_ONE_DIRECTION = 0.8;
  var DISTANCE_AT_WHICH_TO_STOP_WANDERING = 0.05; // In meters, empirically chosen.
  var MAX_ANGLE_VARIATION = Math.PI * 0.2; // Max deviation from angle to destination, in radians, empirically chosen.

  //-------------------------------------------------------------------------
  // Instance Data
  //-------------------------------------------------------------------------

  /**
   *
   * @param {EnergyChunk} energyChunk
   * @param {Property.<Vector2>} destinationProperty
   * @param {Rectangle} initialWanderConstraint
   * @constructor
   */
  function EnergyChunkWanderController( energyChunk, destinationProperty, initialWanderConstraint ) {

    this.energyChunk = energyChunk;
    this.initialWanderConstraint = initialWanderConstraint;
    this.destinationProperty = destinationProperty;
    this.velocity = new Vector2( 0, MAX_VELOCITY );

    this.resetCountdownTimer();
    this.changeVelocityVector();

  }

  return inherit( Object, EnergyChunkWanderController, {

    /**
     * Update the position of this energy chunk for a given change in time.
     *
     * @param {number} dt
     */
    updatePosition: function( dt ) {

      var distanceToDestination = this.energyChunk.position.distance( this.destinationProperty.value );
      if ( distanceToDestination < this.velocity.magnitude() * dt && !this.energyChunk.position.equals( this.destinationProperty.value ) ) {
        // Destination reached.
        this.energyChunk.position = this.destinationProperty.value;
        this.velocity.setMagnitude( 0 );
      }
      else if ( this.energyChunk.position.distance( this.destinationProperty.value ) < dt * this.velocity.magnitude() ) {
        // Prevent overshoot.
        this.velocity.times( this.energyChunk.position.distance( this.destinationProperty.value ) * dt );
      }

      // Stay within the horizontal confines of the initial bounds.
      if ( this.initialWanderConstraint !== null && this.energyChunk.position.y < this.initialWanderConstraint.maxY ) {
        var proposedPosition = this.energyChunk.position.plus( this.velocity.times( dt ) );
        if ( proposedPosition.x < this.initialWanderConstraint.minX || proposedPosition.x > this.initialWanderConstraint.maxX ) {
          // Bounce in the x direction to prevent going outside initial bounds.
          this.velocity.setComponents( -this.velocity.x, this.velocity.y );
        }
      }

      this.energyChunk.position = this.energyChunk.position.plus( this.velocity.times( dt ) );
      this.countdownTimer -= dt;
      if ( this.countdownTimer <= 0 ) {
        this.changeVelocityVector();
        this.resetCountdownTimer();
      }
    },
    /**
     *
     */
    changeVelocityVector: function() {
      var vectorToDestination = this.destinationProperty.value.minus( this.energyChunk.position );
      var angle = vectorToDestination.angle();
      if ( vectorToDestination.magnitude() > DISTANCE_AT_WHICH_TO_STOP_WANDERING ) {
        // Add some randomness to the direction of travel.
        angle = angle + ( Math.random() - 0.5 ) * 2 * MAX_ANGLE_VARIATION;
      }
      var scalarVelocity = MIN_VELOCITY + ( MAX_VELOCITY - MIN_VELOCITY ) * Math.random();
      this.velocity.setXY( scalarVelocity * Math.cos( angle ), scalarVelocity * Math.sin( angle ) );
    },

    /**
     * *
     */
    resetCountdownTimer: function() {
      this.countdownTimer = MIN_TIME_IN_ONE_DIRECTION + ( MAX_TIME_IN_ONE_DIRECTION - MIN_TIME_IN_ONE_DIRECTION ) * Math.random();
    },

    /**
     * *
     * @returns {EnergyChunk|*}
     */
    getEnergyChunk: function() {
      return this.energyChunk;
    },

    /**
     * *
     * @returns {boolean}
     */
    destinationReached: function() {
      return this.destinationProperty.value.distance( this.energyChunk.position ) < 1E-7;
    }
  } );
} );
//