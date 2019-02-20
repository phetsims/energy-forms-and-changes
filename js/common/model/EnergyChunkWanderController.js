// Copyright 2014-2019, University of Colorado Boulder

/**
 * This type is used to make an energy chunk wander, i.e. to perform somewhat of a random walk while moving towards a
 * destination.
 *
 * @author John Blanco
 */

define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Range = require( 'DOT/Range' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const DEFAULT_MIN_SPEED = 0.06; // In m/s.
  const DEFAULT_MAX_SPEED = 0.10; // In m/s.
  const MIN_TIME_IN_ONE_DIRECTION = 0.4;
  const MAX_TIME_IN_ONE_DIRECTION = 0.8;
  const DISTANCE_AT_WHICH_TO_STOP_WANDERING = 0.05; // in meters, empirically chosen
  const DEFAULT_ANGLE_VARIATION = Math.PI * 0.2; // deviation from angle to destination, in radians, empirically chosen.
  const GO_STRAIGHT_HOME_DISTANCE = 0.2; // in meters, distance at which, if destination changes, speed increases

  class EnergyChunkWanderController {

    /**
     * @param {EnergyChunk} energyChunk
     * @param {Property.<Vector2>} destinationProperty
     * @param {Object} [options]
     */
    constructor( energyChunk, destinationProperty, options ) {

      const self = this;

      options = _.extend( {

        // {Range} - bounding range in the X direction within which the energy chunk's motion should be constrained
        horizontalWanderConstraint: null,

        // {number} - range of angle variations, higher means more wandering, in radians from Math.PI to zero
        wanderAngleVariation: DEFAULT_ANGLE_VARIATION,

        // {boolean} - Translate the EC position and wander constraints horizonally if the destination changes.  This
        // was found to be useful to help prevent "chase scenes" when an energy was heading towards an object and the
        // user started dragging that object.
        translateXWithDestination: true

      }, options );

      // parameter checking
      assert && options.horizontalWanderConstraint && assert(
        options.horizontalWanderConstraint.contains( energyChunk.positionProperty.value.x ),
        'energy chunk starting position is not within the wander constraint'
      );
      assert && options.horizontalWanderConstraint && assert(
        options.horizontalWanderConstraint.contains( destinationProperty.value.x ),
        'energy chunk destination is not within the wander constraint'
      );
      assert && assert(
      options.wanderAngleVariation <= Math.PI && options.wanderAngleVariation >= 0,
        'wander angle must be from zero to PI (inclusive)'
      );

      // @public (read-only) {EnergyChunk)
      this.energyChunk = energyChunk;

      // @private
      this.minSpeed = DEFAULT_MIN_SPEED;
      this.maxSpeed = DEFAULT_MAX_SPEED;
      this.horizontalWanderConstraint = options.horizontalWanderConstraint;
      this.wanderAngleVariation = options.wanderAngleVariation;
      this.destinationProperty = destinationProperty;
      this.velocity = new Vector2( 0, DEFAULT_MAX_SPEED );
      this.wandering = true;
      this.resetCountdownTimer();
      this.changeVelocityVector();

      let speedIncreased = false;

      function handleDestinationChanged( newDestination, oldDestination ) {

        const distanceToDestination = newDestination.distance( self.energyChunk.positionProperty.value );

        // if the destination changes, speed up and go directly to the destination
        if ( distanceToDestination <= GO_STRAIGHT_HOME_DISTANCE && !speedIncreased ) {
          const increaseFactor = 8;
          self.minSpeed = DEFAULT_MIN_SPEED * increaseFactor;
          self.maxSpeed = DEFAULT_MAX_SPEED * increaseFactor;
          speedIncreased = true;
          self.wandering = false;
        }
        self.changeVelocityVector();

        if ( options.translateXWithDestination ) {

          const translation = newDestination.minus( oldDestination );

          // adjust the current EC position
          self.energyChunk.positionProperty.set(
            self.energyChunk.positionProperty.value.plusXY( translation.x, 0 )
          );

          // adjust the wander constraints if present
          if ( self.horizontalWanderConstraint ) {
            self.setHorizontalWanderConstraint( new Range(
              self.horizontalWanderConstraint.min + translation.x,
              self.horizontalWanderConstraint.max + translation.x
            ) );
          }
        }
      }

      this.destinationProperty.lazyLink( handleDestinationChanged );

      this.disposeEnergyChunkWanderController = () => {
        this.destinationProperty.unlink( handleDestinationChanged );
      };
    }

    /**
     * dispose function
     * @public
     */
    dispose() {
      this.disposeEnergyChunkWanderController();
    }

    /**
     * Update the position of this energy chunk for a given change in time.
     * @param {number} dt
     * @public
     */
    updatePosition( dt ) {

      const currentPosition = this.energyChunk.positionProperty.get();
      const destination = this.destinationProperty.get();
      const distanceToDestination = currentPosition.distance( destination );
      const speed = this.velocity.magnitude;

      // only do something if the energy chunk has not yet reached its destination
      if ( speed > 0 || !currentPosition.equals( destination ) ) {

        // check if destination reached
        if ( distanceToDestination <= this.velocity.magnitude * dt ) {
          this.energyChunk.positionProperty.set( destination );
          this.velocity.setMagnitude( 0 );
        }
        else {

          if ( this.horizontalWanderConstraint ) {

            // stay within the confines of the horizontal wander constraint
            const proposedX = this.energyChunk.positionProperty.value.x + dt * this.velocity.x;
            if ( proposedX < this.horizontalWanderConstraint.min && this.velocity.x < 0 ||
                 proposedX > this.horizontalWanderConstraint.max && this.velocity.x > 0 ) {

              // bounce in the x direction
              this.velocity.setX( -this.velocity.x );
            }
          }

          // update the position of the energy chunk based on its velocity
          this.energyChunk.positionProperty.set( new Vector2(
            currentPosition.x + dt * this.velocity.x,
            currentPosition.y + dt * this.velocity.y
          ) );

          // determine whether any updates to the motion are needed and make them if so
          this.countdownTimer -= dt;
          if ( this.countdownTimer <= 0 || distanceToDestination < DISTANCE_AT_WHICH_TO_STOP_WANDERING ) {
            this.changeVelocityVector();
            this.resetCountdownTimer();
          }
        }
      }
    }

    /**
     * randomly change the velocity vector of the energy chunk
     * @private
     */
    changeVelocityVector() {
      const vectorToDestination = this.destinationProperty.value.minus( this.energyChunk.positionProperty.value );
      let angle = vectorToDestination.angle;
      if ( vectorToDestination.magnitude > DISTANCE_AT_WHICH_TO_STOP_WANDERING && this.wandering ) {

        // add some randomness to the direction of travel
        angle = angle + ( ( phet.joist.random.nextDouble() - 0.5 ) * 2 ) * this.wanderAngleVariation;
      }
      const speed = this.minSpeed + ( this.maxSpeed - this.minSpeed ) * phet.joist.random.nextDouble();
      this.velocity.setXY( speed * Math.cos( angle ), speed * Math.sin( angle ) );
    }

    /**
     * reset the countdown timer that is used to decide when to change direction
     * @private
     */
    resetCountdownTimer() {
      this.countdownTimer = MIN_TIME_IN_ONE_DIRECTION + ( MAX_TIME_IN_ONE_DIRECTION - MIN_TIME_IN_ONE_DIRECTION ) *
                            phet.joist.random.nextDouble();
    }

    /**
     * returns true if the energy chunk has reached its destination, false if not
     * @returns {boolean}
     * @public
     */
    isDestinationReached() {
      return this.energyChunk.positionProperty.value.equals( this.destinationProperty.value );
    }

    /**
     * set a new constraint on the wandering
     * @param {Range|null} horizontalWanderConstraint
     */
    setHorizontalWanderConstraint( horizontalWanderConstraint ) {
      this.horizontalWanderConstraint = horizontalWanderConstraint;
    }
  }

  return energyFormsAndChanges.register( 'EnergyChunkWanderController', EnergyChunkWanderController );
} );