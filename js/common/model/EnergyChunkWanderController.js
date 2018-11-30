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
  var MIN_VELOCITY = 0.06; // In m/s.
  var MAX_VELOCITY = 0.10; // In m/s.
  var MIN_TIME_IN_ONE_DIRECTION = 0.4;
  var MAX_TIME_IN_ONE_DIRECTION = 0.8;
  var DISTANCE_AT_WHICH_TO_STOP_WANDERING = 0.05; // In meters, empirically chosen.
  var MAX_ANGLE_VARIATION = Math.PI * 0.2; // Max deviation from angle to destination, in radians, empirically chosen.

  /**
   * @param {EnergyChunk} energyChunk
   * @param {Property.<Vector2>} destinationProperty
   * @param {Object} options
   * @constructor
   */
  function EnergyChunkWanderController( energyChunk, destinationProperty, options ) {

    options = _.extend( {

      // {Bounds2} - bounding area within which the energy chunk's motion should be constrained
      initialWanderConstraint: null
    }, options );

    // parameter checking
    assert && options.initialWanderConstraint && assert(
      options.initialWanderConstraint.containsPoint( energyChunk.positionProperty.value ),
      'energy chunk starting position is not within the wander constraint'
    );
    assert && options.initialWanderConstraint && assert(
      options.initialWanderConstraint.containsPoint( destinationProperty.value ),
      'energy chunk destination is not within the wander constraint'
    );

    // @public (read-only) {EnergyChunk)
    this.energyChunk = energyChunk;

    // @private
    this.initialWanderConstraint = options.initialWanderConstraint;
    this.destinationProperty = destinationProperty;
    this.velocity = new Vector2( 0, MAX_VELOCITY );
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

      var distanceToDestination = this.energyChunk.positionProperty.value.distance( this.destinationProperty.value );

      // Destination reached.
      if ( distanceToDestination < this.velocity.magnitude() * dt &&
           !this.energyChunk.positionProperty.value.equals( this.destinationProperty.value ) ) {

        this.energyChunk.positionProperty.set( this.destinationProperty.value );
        this.velocity.setMagnitude( 0 );
      }

      // Prevent overshoot.
      else if ( this.energyChunk.positionProperty.value.distance( this.destinationProperty.value ) < dt * this.velocity.magnitude() ) {
        this.velocity.times( this.energyChunk.positionProperty.value.distance( this.destinationProperty.value ) * dt );
      }

      // Stay within the horizontal confines of the initial bounds.
      if ( this.initialWanderConstraint !== null && this.energyChunk.positionProperty.value.y < this.initialWanderConstraint.maxY ) {
        var proposedX = this.energyChunk.positionProperty.value.plus( this.velocity.times( dt ) ).x;
        if ( proposedX < this.initialWanderConstraint.minX || proposedX > this.initialWanderConstraint.maxX ) {
          // Bounce in the x direction to prevent going outside initial bounds.
          this.velocity.setXY( -this.velocity.x, this.velocity.y );
        }
      }

      this.energyChunk.positionProperty.value = this.energyChunk.positionProperty.value.plus( this.velocity.times( dt ) );
      this.countdownTimer -= dt;
      if ( this.countdownTimer <= 0 ) {
        this.changeVelocityVector();
        this.resetCountdownTimer();
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
        angle = angle + ( phet.joist.random.nextDouble() - 0.5 ) * 2 * MAX_ANGLE_VARIATION;
      }
      var scalarVelocity = MIN_VELOCITY + ( MAX_VELOCITY - MIN_VELOCITY ) * phet.joist.random.nextDouble();
      this.velocity.setXY( scalarVelocity * Math.cos( angle ), scalarVelocity * Math.sin( angle ) );
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
    }
  } );
} );