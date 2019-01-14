// Copyright 2014-2018, University of Colorado Boulder

/**
 * This type is used to make an energy chunk wander, i.e. to perform somewhat of a random walk while moving towards a
 * destination.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MIN_SPEED = 0.06; // In m/s.
  var MAX_SPEED = 0.10; // In m/s.
  var MIN_TIME_IN_ONE_DIRECTION = 0.4;
  var MAX_TIME_IN_ONE_DIRECTION = 0.8;
  var DISTANCE_AT_WHICH_TO_STOP_WANDERING = 0.05; // in meters, empirically chosen
  var DEFAULT_ANGLE_VARIATION = Math.PI * 0.2; // deviation from angle to destination, in radians, empirically chosen.

  /**
   * @param {EnergyChunk} energyChunk
   * @param {Property.<Vector2>} destinationProperty
   * @param {Object} [options]
   * @constructor
   */
  function EnergyChunkWanderController( energyChunk, destinationProperty, options ) {

    options = _.extend( {

      // {Range} - bounding range in the X direction within which the energy chunk's motion should be constrained
      horizontalWanderConstraint: null,

      // {number} - range of angle variations, higher means more wandering, in radians from Math.PI to zero
      wanderAngleVariation: DEFAULT_ANGLE_VARIATION

    }, options );

    // parameter checking
    assert && options.wanderConstraint && assert(
      options.wanderConstraint.containsPoint( energyChunk.positionProperty.value ),
      'energy chunk starting position is not within the wander constraint'
    );
    assert && options.wanderConstraint && assert(
      options.wanderConstraint.containsPoint( destinationProperty.value ),
      'energy chunk destination is not within the wander constraint'
    );
    assert && assert(
    options.wanderAngleVariation <= Math.PI && options.wanderAngleVariation >= 0,
      'wander angle must be from zero to PI (inclusive)'
    );

    // @public (read-only) {EnergyChunk)
    this.energyChunk = energyChunk;

    // @private
    this.horizontalWanderConstraint = options.horizontalWanderConstraint;
    this.wanderAngleVariation = options.wanderAngleVariation;
    this.destinationProperty = destinationProperty;
    this.velocity = new Vector2( 0, MAX_SPEED );
    this.resetCountdownTimer();
    this.changeVelocityVector();
  }

  energyFormsAndChanges.register( 'EnergyChunkWanderController', EnergyChunkWanderController );

  return inherit( Object, EnergyChunkWanderController, {

    /**
     * Update the position of this energy chunk for a given change in time.
     * @param {number} dt
     * @public
     */
    updatePosition: function( dt ) {

      var currentPosition = this.energyChunk.positionProperty.get();
      var destination = this.destinationProperty.get();
      var distanceToDestination = currentPosition.distance( destination );
      var speed = this.velocity.magnitude();

      // only do something if the energy chunk has not yet reached its destination
      if ( speed > 0 || !currentPosition.equals( destination ) ) {

        // check if destination reached
        if ( distanceToDestination <= this.velocity.magnitude() * dt ) {
          this.energyChunk.positionProperty.set( destination );
          this.velocity.setMagnitude( 0 );
        }
        else {

          if ( this.horizontalWanderConstraint ) {

            // stay within the confines of the horizontal wander constraint
            var proposedX = this.energyChunk.positionProperty.value.x + dt * this.velocity.x;
            if ( proposedX < this.horizontalWanderConstraint.min && this.velocity.x < 0 ||
                 proposedX > this.horizontalWanderConstraint.max && this.velocity.x > 0 ) {

              // bounce in the x direction
              this.velocity.setX( -this.velocity.x );
            }
          }

          // update the position of the energy chunk based on its velocity
          this.energyChunk.positionProperty.set( Vector2.createFromPool(
            currentPosition.x + dt * this.velocity.x,
            currentPosition.y + dt * this.velocity.y
          ) );

          // free the previous position for reuse
          currentPosition.freeToPool();

          // determine whether any updates to the motion are needed and make them if so
          this.countdownTimer -= dt;
          if ( this.countdownTimer <= 0 || distanceToDestination < DISTANCE_AT_WHICH_TO_STOP_WANDERING ) {
            this.changeVelocityVector();
            this.resetCountdownTimer();
          }
        }
      }
    },

    /**
     * randomly change the velocity vector of the energy chunk
     * @private
     */
    changeVelocityVector: function() {
      var vectorToDestination = this.destinationProperty.value.minus( this.energyChunk.positionProperty.value );
      var angle = vectorToDestination.angle();
      if ( vectorToDestination.magnitude() > DISTANCE_AT_WHICH_TO_STOP_WANDERING ) {

        // add some randomness to the direction of travel
        angle = angle + ( ( phet.joist.random.nextDouble() - 0.5 ) * 2 ) * this.wanderAngleVariation;
      }
      var speed = MIN_SPEED + ( MAX_SPEED - MIN_SPEED ) * phet.joist.random.nextDouble();
      this.velocity.setXY( speed * Math.cos( angle ), speed * Math.sin( angle ) );
    },

    /**
     * reset the countdown timer that is used to decide when to change direction
     * @private
     */
    resetCountdownTimer: function() {
      this.countdownTimer = MIN_TIME_IN_ONE_DIRECTION + ( MAX_TIME_IN_ONE_DIRECTION - MIN_TIME_IN_ONE_DIRECTION ) *
                            phet.joist.random.nextDouble();
    },

    /**
     * returns true if the energy chunk has reached its destination, false if not
     * @returns {boolean}
     * @public
     */
    isDestinationReached: function() {
      return this.energyChunk.positionProperty.value.equals( this.destinationProperty.value );
    },

    /**
     * set a new constraint on the wandering
     * @param {Range|null} horizontalWanderConstraint
     */
    setHorizontalWanderConstraint: function( horizontalWanderConstraint ) {
      this.horizontalWanderConstraint = horizontalWanderConstraint;
    }
  } );
} )
;