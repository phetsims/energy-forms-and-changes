// Copyright 2014-2023, University of Colorado Boulder

/**
 * This type is used to make an energy chunk wander, i.e. to perform somewhat of a random walk while moving towards a
 * destination.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyChunk from './EnergyChunk.js';

// constants
const DEFAULT_MIN_SPEED = 0.06; // In m/s.
const DEFAULT_MAX_SPEED = 0.10; // In m/s.
const MIN_TIME_IN_ONE_DIRECTION = 0.4;
const MAX_TIME_IN_ONE_DIRECTION = 0.8;
const DISTANCE_AT_WHICH_TO_STOP_WANDERING = 0.05; // in meters, empirically chosen
const DEFAULT_ANGLE_VARIATION = Math.PI * 0.2; // deviation from angle to destination, in radians, empirically chosen.
const GO_STRAIGHT_HOME_DISTANCE = 0.2; // in meters, distance at which, if destination changes, speed increases

class EnergyChunkWanderController extends PhetioObject {

  /**
   * @param {EnergyChunk} energyChunk
   * @param {Property.<Vector2>} destinationProperty
   * @param {Object} [options]
   */
  constructor( energyChunk, destinationProperty, options ) {

    options = merge( {

      // {Range|null} - bounding range in the X direction within which the energy chunk's motion should be constrained.
      // Not all energy chunks need this constraint, so null is an acceptable value
      horizontalWanderConstraint: null,

      // {number} - range of angle variations, higher means more wandering, in radians from Math.PI to zero
      wanderAngleVariation: DEFAULT_ANGLE_VARIATION,

      // {boolean} - Translate the EC position and wander constraints horizontally if the destination changes.  This
      // was found to be useful to help prevent "chase scenes" when an energy was heading towards an object and the
      // user started dragging that object.
      translateXWithDestination: true,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: EnergyChunkWanderController.EnergyChunkWanderControllerIO,
      phetioDynamicElement: true
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

    super( options );

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( energyChunk.isPhetioInstrumented() );

    // Instead of asserting that the destinationProperty is instrumented, assert that it must be instrumented if it
    // changes. This was the simplest solution zepumph and samreid came up with for dealing with supporting PhET-iO
    // state when there are usages that just wrap a single value in a Property and never change it.
    assert && Tandem.VALIDATION && destinationProperty.lazyLink( () => {
      assert( this.destinationProperty.isPhetioInstrumented(),
        'If the destinationProperty ever changes, then it must be instrumented to support PhET-iO state.' );
    } );

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

    // @private - Store this on the instance so that it can be set by PhET-iO state
    this.translateXWithDestination = options.translateXWithDestination;

    // @private - countdown to when the EnergyChunk will change direction
    this.countdownTimer = 0;
    this.resetCountdownTimer();
    this.changeVelocityVector();

    // if an energy chunk's destination moves, quickly send the chunk to its destination - this is used as a flag to
    // make sure only one speed increase happens
    let speedIncreased = false;

    const handleDestinationChanged = ( newDestination, oldDestination ) => {

      // Short circuit this if state is being set - otherwise approaching energy chunks that are part of the state can
      // get moved around, messing up their state.
      if ( phet.joist.sim.isSettingPhetioStateProperty.value ) {
        return;
      }

      const distanceToDestination = newDestination.distance( this.energyChunk.positionProperty.value );

      // if the destination changes, speed up and go directly to the destination
      if ( distanceToDestination <= GO_STRAIGHT_HOME_DISTANCE && !speedIncreased ) {
        const increaseFactor = 8; // empirically determined to be fast but still visible
        this.minSpeed = DEFAULT_MIN_SPEED * increaseFactor;
        this.maxSpeed = DEFAULT_MAX_SPEED * increaseFactor;
        speedIncreased = true;
        this.wandering = false;
      }
      this.changeVelocityVector();

      if ( this.translateXWithDestination ) {

        const translation = newDestination.minus( oldDestination );

        // adjust the current EC position
        this.energyChunk.positionProperty.set(
          this.energyChunk.positionProperty.value.plusXY( translation.x, 0 )
        );

        // adjust the wander constraints if present
        if ( this.horizontalWanderConstraint ) {
          this.setHorizontalWanderConstraint( new Range(
            this.horizontalWanderConstraint.min + translation.x,
            this.horizontalWanderConstraint.max + translation.x
          ) );
        }
      }
    };

    this.destinationProperty.lazyLink( handleDestinationChanged );

    this.disposeEnergyChunkWanderController = () => {
      this.destinationProperty.unlink( handleDestinationChanged );
    };
  }

  // @public (EnergyChunkWanderControllerIO)
  toStateObject() {

    const stateObject = {
      minSpeed: this.minSpeed,
      maxSpeed: this.maxSpeed,
      wanderAngleVariation: this.wanderAngleVariation,
      translateXWithDestination: this.translateXWithDestination,
      countdownTimer: this.countdownTimer,
      wandering: this.wandering,
      horizontalWanderConstraint: NullableIO( Range.RangeIO ).toStateObject( this.horizontalWanderConstraint ),
      energyChunkReference: ReferenceIO( EnergyChunk.EnergyChunkIO ).toStateObject( this.energyChunk )
    };

    // NOTE: destinationProperty does not need to be instrumented to support this, as some Properties just wrap single
    // values that don't change.
    if ( this.destinationProperty.isPhetioInstrumented() ) {
      stateObject.destinationPropertyReference = ReferenceIO( Property.PropertyIO( Vector2.Vector2IO ) ).toStateObject( this.destinationProperty );
      stateObject.destinationVector2 = null;
    }
    else {
      stateObject.destinationPropertyReference = null;
      stateObject.destinationVector2 = Vector2.Vector2IO.toStateObject( this.destinationProperty.value );
    }
    return stateObject;
  }

  // @public (EnergyChunkWanderControllerIO)
  static stateObjectToCreateElementArguments( stateObject ) {
    const energyChunk = ReferenceIO( EnergyChunk.EnergyChunkIO ).fromStateObject( stateObject.energyChunkReference );

    let destinationProperty = null;
    if ( stateObject.destinationPropertyReference ) {

      destinationProperty = ReferenceIO( Property.PropertyIO( Vector2.Vector2IO ) ).fromStateObject( stateObject.destinationPropertyReference );
    }
    else if ( stateObject.destinationVector2 ) {
      destinationProperty = new Vector2Property( Vector2.Vector2IO.fromStateObject( stateObject.destinationVector2 ) );
    }
    return [ energyChunk, destinationProperty, {} ];
  }

  // @public (EnergyChunkWanderControllerIO)
  applyState( stateObject ) {
    this.minSpeed = stateObject.minSpeed;
    this.maxSpeed = stateObject.maxSpeed;
    this.wanderAngleVariation = stateObject.wanderAngleVariation;
    this.translateXWithDestination = stateObject.translateXWithDestination;
    this.countdownTimer = stateObject.countdownTimer;
    this.wandering = stateObject.wandering;
    this.horizontalWanderConstraint = NullableIO( Range.RangeIO ).fromStateObject( stateObject.horizontalWanderConstraint );
  }


  /**
   * dispose function
   * @public
   */
  dispose() {
    this.disposeEnergyChunkWanderController();
    super.dispose();
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
      angle = angle + ( ( dotRandom.nextDouble() - 0.5 ) * 2 ) * this.wanderAngleVariation;
    }
    const speed = this.minSpeed + ( this.maxSpeed - this.minSpeed ) * dotRandom.nextDouble();
    this.velocity.setXY( speed * Math.cos( angle ), speed * Math.sin( angle ) );
  }

  /**
   * reset the countdown timer that is used to decide when to change direction
   * @private
   */
  resetCountdownTimer() {
    this.countdownTimer = MIN_TIME_IN_ONE_DIRECTION + ( MAX_TIME_IN_ONE_DIRECTION - MIN_TIME_IN_ONE_DIRECTION ) *
                          dotRandom.nextDouble();
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
   * @public
   */
  setHorizontalWanderConstraint( horizontalWanderConstraint ) {
    this.horizontalWanderConstraint = horizontalWanderConstraint;
  }
}

EnergyChunkWanderController.EnergyChunkWanderControllerIO = new IOType( 'EnergyChunkWanderControllerIO', {
  valueType: EnergyChunkWanderController,
  toStateObject: energyChunkWanderController => energyChunkWanderController.toStateObject(),
  stateObjectToCreateElementArguments: EnergyChunkWanderController.stateObjectToCreateElementArguments,
  applyState: ( energyChunkWanderController, stateObject ) => energyChunkWanderController.applyState( stateObject ),
  stateSchema: {
    minSpeed: NumberIO,
    maxSpeed: NumberIO,
    wanderAngleVariation: NumberIO,
    translateXWithDestination: BooleanIO,
    countdownTimer: NumberIO,
    wandering: BooleanIO,
    horizontalWanderConstraint: NullableIO( Range.RangeIO ),
    energyChunkReference: ReferenceIO( EnergyChunk.EnergyChunkIO ),
    destinationPropertyReference: NullableIO( ReferenceIO( Property.PropertyIO( Vector2.Vector2IO ) ) ),
    destinationVector2: NullableIO( Vector2.Vector2IO )
  }
} );

energyFormsAndChanges.register( 'EnergyChunkWanderController', EnergyChunkWanderController );
export default EnergyChunkWanderController;