// Copyright 2014-2022, University of Colorado Boulder

/**
 * A static object that contains methods for redistributing a set of energy chunks within a shape in order to make them
 * spread out fairly evenly in a way that looks dynamic and realistic.  The basic approach is to simulate a set of
 * small spheres embedded in a fluid, and each one is changes such that it repels all others as well as the edges of the
 * container(s).  The repulsion algorithm is based on Coulomb's law.
 *
 * Reuse Notes: This could probably be generalized fairly easily to distribute any number items within a container of
 * arbitrary size.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACQueryParameters from '../EFACQueryParameters.js';

// constants
const OUTSIDE_SLICE_FORCE = 0.01; // In Newtons, empirically determined.

// width of an energy chunk in the view, used to keep them in bounds
const ENERGY_CHUNK_VIEW_TO_MODEL_WIDTH = 0.012;

// parameters that can be adjusted to change the nature of the repulsive redistribution algorithm
const MAX_TIME_STEP = ( 1 / 60 ) / 3; // in seconds, for algorithm that moves the points, best if a multiple of nominal frame rate
const ENERGY_CHUNK_MASS = 0.00035; // in kilograms, mass of a bb, which seems about right
const FLUID_DENSITY = 8000; // in kg / m ^ 3 - for reference, water is 1000, molten lead is around 10000
const ENERGY_CHUNK_DIAMETER = 0.0044; // in meters, this is the diameter of a bb, which seems about right

// charge of an energy chunk in Coulombs, about 1/100th of what a charged balloon would be
const ENERGY_CHUNK_CHARGE = 1E-9;

// charge of the wall, used to calculate repulsion of energy chunks
const WALL_CHARGE = ENERGY_CHUNK_CHARGE;

// for drag, treat energy chunk as if it is shaped like a sphere
const ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow( ENERGY_CHUNK_DIAMETER, 2 );
const DRAG_COEFFICIENT = 0.48; // unitless, this is what Wikipedia says is the value for a rough sphere

// Threshold for deciding whether or not to perform redistribution. Lower values finish the redistribution more
// quickly but not as thoroughly, higher values are thorough but more computationally intensive.  The value here was
// empirically determined to work well for the EFAC sim.
const REDISTRIBUTION_THRESHOLD_ENERGY = 3E-6; // in joules (I think)

// max number of energy chunk slices that can be handled per call to update positions, adjust as needed
const MAX_SLICES = 6;

// max number of energy chunks per slice that can be redistributed per call, adjust as needed
const MAX_ENERGY_CHUNKS_PER_SLICE = 25;

// speed used when positioning ECs using deterministic algorithms, in meters per second
const EC_SPEED_DETERMINISTIC = 0.1;

// Coulomb's constant, used to calculate repulsive forces, from Wikipedia
const COULOMBS_CONSTANT = 9E9;

// pre-calculated factors based on the above values, used to save time in the computations below
const DRAG_MULTIPLIER = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA;
const WALL_REPULSION_FACTOR = -COULOMBS_CONSTANT * ENERGY_CHUNK_CHARGE * WALL_CHARGE; // based on Coulomb's law
const EC_REPULSION_FACTOR = -COULOMBS_CONSTANT * ENERGY_CHUNK_CHARGE * ENERGY_CHUNK_CHARGE; // based on Coulomb's law

//-------------------------------------------------------------------------------------------------------------------
// reusable variables and array intended to reduce garbage collection and thus improve performance
//-------------------------------------------------------------------------------------------------------------------

// a reusable 2D array of the energy chunks being redistributed, indexed by [sliceNum][ecNum]
const energyChunks = new Array( MAX_SLICES );

// a reusable 2D array of the force vectors for the energy chunks, indexed by [sliceNum][ecNum]
const energyChunkForces = new Array( MAX_SLICES );

// initialize the reusable arrays
_.times( MAX_SLICES, sliceIndex => {
  energyChunks[ sliceIndex ] = new Array( MAX_ENERGY_CHUNKS_PER_SLICE );
  energyChunkForces[ sliceIndex ] = new Array( MAX_ENERGY_CHUNKS_PER_SLICE );
  _.times( MAX_ENERGY_CHUNKS_PER_SLICE, ecIndex => {
    energyChunkForces[ sliceIndex ][ ecIndex ] = new Vector2( 0, 0 );
  } );
} );

// a reusable vector for calculating drag force
const reusableDragForceVector = new Vector2( 0, 0 );

const compositeSliceBounds = Bounds2.NOTHING.copy();

// the main singleton object definition
const energyChunkDistributor = {

  /**
   * Redistribute a set of energy chunks that are contained in energy chunk slices using an algorithm where the
   * chunks are repelled by each other and by the edges of the slice.  The distribution is done taking all nearby
   * slices into account so that the chunks can be distributed in a way that minimizes overlap.
   * @param {EnergyChunkContainerSlice[]} slices - set of slices that contain energy chunks
   * @param {number} dt - change in time
   * @returns {boolean} - a value indicating whether redistribution was done, false can occur if the energy chunks are
   * already well distributed
   * @private
   */
  updatePositionsRepulsive( slices, dt ) {

    // determine a rectangle that bounds all of the slices
    let minX = Number.POSITIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    let maxX = Number.NEGATIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;

    // determine the collective bounds of all the slices
    slices.forEach( slice => {
      minX = Math.min( slice.bounds.minX, minX );
      maxX = Math.max( slice.bounds.maxX, maxX );
      minY = Math.min( slice.bounds.minY, minY );
      maxY = Math.max( slice.bounds.maxY, maxY );
    } );
    compositeSliceBounds.setMinMax( minX, minY, maxX, maxY );

    // reusable iterator values and loop variables
    let sliceIndex;
    let ecIndex;
    let slice;

    // initialize the list of energy chunks and forces acting upon them
    let totalNumEnergyChunks = 0;
    for ( sliceIndex = 0; sliceIndex < slices.length; sliceIndex++ ) {

      slice = slices[ sliceIndex ];

      // make sure the pre-allocated arrays for energy chunks and their forces are big enough
      assert && assert(
        slice.energyChunkList.length <= MAX_ENERGY_CHUNKS_PER_SLICE,
        'pre-allocated array too small, please adjust'
      );

      // put each energy chunk on the list of those to be processed
      for ( ecIndex = 0; ecIndex < slices[ sliceIndex ].energyChunkList.length; ecIndex++ ) {
        energyChunks[ sliceIndex ][ ecIndex ] = slices[ sliceIndex ].energyChunkList.get( ecIndex );
        totalNumEnergyChunks++;
      }
    }

    // make sure that there is actually something to distribute
    if ( totalNumEnergyChunks === 0 ) {
      return false; // nothing to do - bail out
    }

    // divide the time step up into the largest value known to work consistently for the algorithm
    let particlesRedistributed = false;
    const numberOfUpdateSteps = Math.floor( dt / MAX_TIME_STEP );
    const extraTime = dt - numberOfUpdateSteps * MAX_TIME_STEP;
    for ( let forceCalcStep = 0; forceCalcStep <= numberOfUpdateSteps; forceCalcStep++ ) {
      const timeStep = forceCalcStep < numberOfUpdateSteps ? MAX_TIME_STEP : extraTime;
      assert && assert( timeStep <= MAX_TIME_STEP );

      // update the forces acting on the energy chunk due to its bounding container, other energy chunks, and drag
      for ( sliceIndex = 0; sliceIndex < slices.length; sliceIndex++ ) {
        slice = slices[ sliceIndex ];
        const containerShapeBounds = slice.bounds;

        // determine forces on each energy chunk
        for ( ecIndex = 0; ecIndex < slice.energyChunkList.length; ecIndex++ ) {
          const ec = energyChunks[ sliceIndex ][ ecIndex ];
          energyChunkForces[ sliceIndex ][ ecIndex ].setXY( 0, 0 );
          if ( containerShapeBounds.containsPoint( ec.positionProperty.value ) ) {

            // compute forces from the edges of the slice boundary
            this.updateEdgeForces(
              ec.positionProperty.value,
              energyChunkForces[ sliceIndex ][ ecIndex ],
              containerShapeBounds
            );

            // compute forces from other energy chunks
            this.updateEnergyChunkForces(
              ec,
              energyChunkForces[ sliceIndex ][ ecIndex ],
              energyChunks,
              slices
            );

            // update drag force
            this.updateDragForce( ec.velocity, energyChunkForces[ sliceIndex ][ ecIndex ], timeStep );
          }
          else {

            // point is outside container, move it towards center of shape
            energyChunkForces[ sliceIndex ][ ecIndex ].setXY(
              containerShapeBounds.centerX - ec.positionProperty.value.x,
              containerShapeBounds.centerY - ec.positionProperty.value.y
            ).setMagnitude( OUTSIDE_SLICE_FORCE );
          }
        }
      }

      const maxEnergy = this.updateVelocities( slices, energyChunks, energyChunkForces, timeStep );

      particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;

      if ( particlesRedistributed ) {
        this.updateEnergyChunkPositions( slices, timeStep );
      }
    }

    return particlesRedistributed;
  },

  /**
   * compute the force on an energy chunk based on the edges of the container in which it resides
   * @param {Vector2} position
   * @param {Vector2} ecForce
   * @param {Bounds2} containerBounds
   * @private
   */
  updateEdgeForces: function( position, ecForce, containerBounds ) {

    // this should only be called for chunks that are inside a container
    assert && assert( containerBounds.containsPoint( position ) );

    // the minimum distance from the wall is one EC radius
    const minDistance = ENERGY_CHUNK_DIAMETER / 2;

    // get the distance to the four different edges
    const distanceFromRightSide = Math.max( containerBounds.maxX - position.x, minDistance );
    const distanceFromBottom = Math.max( position.y - containerBounds.minY, minDistance );
    const distanceFromLeftSide = Math.max( position.x - containerBounds.minX, minDistance );
    const distanceFromTop = Math.max( containerBounds.maxY - position.y, minDistance );

    // apply the forces
    ecForce.addXY( WALL_REPULSION_FACTOR / Math.pow( distanceFromRightSide, 2 ), 0 ); // force from right edge
    ecForce.addXY( 0, -WALL_REPULSION_FACTOR / Math.pow( distanceFromBottom, 2 ) ); // force from bottom edge
    ecForce.addXY( -WALL_REPULSION_FACTOR / Math.pow( distanceFromLeftSide, 2 ), 0 ); // force from left edge
    ecForce.addXY( 0, WALL_REPULSION_FACTOR / Math.pow( distanceFromTop, 2 ) ); // force from top edge
  },

  /**
   * compute the force on an energy chunk based on the drag that it is experiencing
   * @param {Vector2} velocity
   * @param {Vector2} ecForce
   * @param {number} timeStep - length of time step, in seconds
   * @private
   */
  updateDragForce: function( velocity, ecForce, timeStep ) {

    const velocityMagnitude = velocity.magnitude;
    const velocityMagnitudeSquared = Math.pow( velocityMagnitude, 2 );
    assert && assert(
    velocityMagnitudeSquared !== Infinity && !_.isNaN( velocityMagnitudeSquared ) && typeof velocityMagnitudeSquared === 'number',
      `velocity^2 is ${velocityMagnitudeSquared}`
    );

    // calculate the drag based on the velocity and the nature of the fluid that it's in, see
    // https://en.wikipedia.org/wiki/Drag_equation
    let dragForceMagnitude = DRAG_MULTIPLIER * velocityMagnitudeSquared;
    if ( dragForceMagnitude > 0 ) {

      // limit the drag force vector such that it can't reverse the current velocity, since that is unphysical
      if ( dragForceMagnitude / ENERGY_CHUNK_MASS * timeStep > velocityMagnitude ) {
        dragForceMagnitude = velocityMagnitude * ENERGY_CHUNK_MASS / timeStep;
      }

      // calculate the drag force vector
      reusableDragForceVector.setXY( -velocity.x, -velocity.y );
      reusableDragForceVector.setMagnitude( dragForceMagnitude );

      // add the drag force to the total force acting on this energy chunk
      ecForce.addXY( reusableDragForceVector.x, reusableDragForceVector.y );
    }
  },

  /**
   * update the forces acting on the provided energy chunk due to all the other energy chunks
   * @param {EnergyChunk} ec
   * @param {Vector2} ecForce - the force vector acting on the energy chunk being evaluated
   * @param {EnergyChunk[]} energyChunks
   * @param {EnergyChunkContainerSlice[]} slices
   * @private
   */
  updateEnergyChunkForces: function( ec, ecForce, energyChunks, slices ) {

    // allocate reusable vectors to improve performance
    let vectorFromOther = Vector2.pool.fetch();
    const forceFromOther = Vector2.pool.fetch();

    // the minimum distance between two chunks is 2 times the radius of each, or 1x the diameter
    const minDistance = ENERGY_CHUNK_DIAMETER / 2;

    // apply the force from each of the other energy chunks, but set some limits on the max force that can be applied
    for ( let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++ ) {
      for ( let ecIndex = 0; ecIndex < slices[ sliceIndex ].energyChunkList.length; ecIndex++ ) {

        const otherEnergyChunk = energyChunks[ sliceIndex ][ ecIndex ];

        // skip self
        if ( otherEnergyChunk === ec ) {
          continue;
        }

        // calculate force vector, but handle cases where too close
        vectorFromOther.setXY(
          ec.positionProperty.value.x - otherEnergyChunk.positionProperty.value.x,
          ec.positionProperty.value.y - otherEnergyChunk.positionProperty.value.y
        );
        if ( vectorFromOther.magnitude < minDistance ) {
          if ( vectorFromOther.setMagnitude( 0 ) ) {

            // create a random vector of min distance
            const randomAngle = dotRandom.nextDouble() * Math.PI * 2;
            vectorFromOther.setXY(
              minDistance * Math.cos( randomAngle ),
              minDistance * Math.sin( randomAngle )
            );
          }
          else {
            vectorFromOther = vectorFromOther.setMagnitude( minDistance );
          }
        }

        forceFromOther.setXY( vectorFromOther.x, vectorFromOther.y );
        forceFromOther.setMagnitude( -EC_REPULSION_FACTOR / vectorFromOther.magnitudeSquared );

        // add the force to the accumulated forces on this energy chunk
        ecForce.setXY( ecForce.x + forceFromOther.x, ecForce.y + forceFromOther.y );
      }
    }

    // free allocations
    vectorFromOther.freeToPool();
    forceFromOther.freeToPool();
  },

  /**
   * update energy chunk velocities, returning max energy found
   * @param  {EnergyChunkContainerSlice[]} slices
   * @param  {EnergyChunk[][]} energyChunks
   * @param  {Vector2[][]} energyChunkForces
   * @param {number} dt - time step
   * @returns {number} - the energy in the most energetic energy chunk
   * @private
   */
  updateVelocities: function( slices, energyChunks, energyChunkForces, dt ) {

    let energyInMostEnergeticEC = 0;

    // loop through the slices, and then the energy chunks therein, and update their velocities
    for ( let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++ ) {

      const numberOfEnergyChunksInSlice = slices[ sliceIndex ].energyChunkList.length;

      for ( let ecIndex = 0; ecIndex < numberOfEnergyChunksInSlice; ecIndex++ ) {

        // force on this chunk
        const force = energyChunkForces[ sliceIndex ][ ecIndex ];
        assert && assert( !_.isNaN( force.x ) && !_.isNaN( force.y ), 'force contains NaN value' );

        // current velocity
        const velocity = energyChunks[ sliceIndex ][ ecIndex ].velocity;
        assert && assert( !_.isNaN( velocity.x ) && !_.isNaN( velocity.y ), 'velocity contains NaN value' );

        // velocity change is based on the formula v = (F/m)* t, so pre-compute the t/m part for later use
        const forceMultiplier = dt / ENERGY_CHUNK_MASS;

        // update velocity based on the sum of forces acting on the energy chunk
        velocity.addXY( force.x * forceMultiplier, force.y * forceMultiplier );
        assert && assert( !_.isNaN( velocity.x ) && !_.isNaN( velocity.y ), 'New velocity contains NaN value' );

        // update max energy
        const totalParticleEnergy = 0.5 * ENERGY_CHUNK_MASS * velocity.magnitudeSquared + force.magnitude * Math.PI / 2;
        energyInMostEnergeticEC = Math.max( totalParticleEnergy, energyInMostEnergeticEC );
      }
    }

    return energyInMostEnergeticEC;
  },

  /**
   * update the energy chunk positions based on their velocity and a time step
   * @param  {EnergyChunkContainerSlice[]} slices
   * @param  {number} dt - time step in seconds
   * @public
   */
  updateEnergyChunkPositions: function( slices, dt ) {
    slices.forEach( slice => {
      slice.energyChunkList.forEach( ec => {
        const v = ec.velocity;
        const position = ec.positionProperty.value;
        ec.setPositionXY( position.x + v.x * dt, position.y + v.y * dt );
      } );
    } );
  },

  /**
   * An order-N algorithm for distributing the energy chunks based on an Archimedean spiral.  This was created from
   * first thinking about using concentric circles, then figuring that a spiral is perhaps and easier way to get a
   * similar effect.  Many of the values used were arrived at through trial and error.
   * @param {EnergyChunkContainerSlice[]} slices
   * @param {number} dt - time step
   * @returns {boolean} - true if any energy chunks needed to be moved, false if not
   * @private
   */
  updatePositionsSpiral( slices, dt ) {

    let ecMoved = false;
    const ecDestination = new Vector2( 0, 0 ); // reusable vector to minimize garbage collection

    // loop through each slice, updating the energy chunk positions for each
    for ( let sliceIndex = 0; sliceIndex < slices.length; sliceIndex++ ) {

      const sliceBounds = slices[ sliceIndex ].bounds;
      const sliceCenter = sliceBounds.getCenter();
      const numberOfEnergyChunksInSlice = slices[ sliceIndex ].energyChunkList.length;
      if ( numberOfEnergyChunksInSlice === 0 ) {

        // bail out now if there are no energy chunks to distribute in this slice
        continue;
      }

      // number of turns of the spiral
      const numberOfTurns = 3;

      const maxAngle = numberOfTurns * Math.PI * 2;
      const a = 1 / maxAngle; // the equation for the spiral is generally written as r = a * theta, this is the 'a'

      // Define the angular span over which energy chunks will be placed.  This will grow as the number of energy
      // chunks grows.
      let angularSpan;
      if ( numberOfEnergyChunksInSlice <= 6 ) {
        angularSpan = 2 * Math.PI * ( 1 - 1 / numberOfEnergyChunksInSlice );
      }
      else {
        angularSpan = Math.min( Math.max( numberOfEnergyChunksInSlice / 19 * maxAngle, 2 * Math.PI ), maxAngle );
      }

      // The offset faction defined below controls how weighted the algorithm is towards placing chunks towards the
      // end of the spiral versus the beginning.  We always want to be somewhat weighted towards the end since there
      // is more space at the end, but this gets more important as the number of slices increases because we need to
      // avoid overlap of energy chunks in the middle of the model element.
      const offsetFactor = ( -1 / Math.pow( slices.length, 1.75 ) ) + 1;
      const startAngle = offsetFactor * ( maxAngle - angularSpan );

      // Define a value that will be used to offset the spiral rotation in the different slices so that energy chunks
      // are less likely to line up across slices.
      const spiralAngleOffset = ( 2 * Math.PI ) / slices.length + Math.PI;

      // loop through each energy chunk in this slice and set its position
      for ( let ecIndex = 0; ecIndex < numberOfEnergyChunksInSlice; ecIndex++ ) {
        const ec = slices[ sliceIndex ].energyChunkList.get( ecIndex );

        // calculate the angle to feed into the spiral formula
        let angle;
        if ( numberOfEnergyChunksInSlice <= 1 ) {
          angle = startAngle;
        }
        else {
          angle = startAngle + Math.pow( ecIndex / ( numberOfEnergyChunksInSlice - 1 ), 0.75 ) * angularSpan;
        }

        // calculate a radius value within the "normalized spiral", where the radius is 1 at the max angle
        const normalizedRadius = a * Math.abs( angle );
        assert && assert( normalizedRadius <= 1, 'normalized length must be 1 or smaller' );

        // Rotate the spiral in each set of two slices to minimize overlap between slices.  This works in conjunction
        // with the code that reverses the winding direction below so that the same spiral is never used for any two
        // slices.
        let adjustedAngle = angle + spiralAngleOffset * sliceIndex;

        // Determine the max possible radius for the current angle, which is basically the distance from the center to
        // the closest edge.  This must be reduced a bit to account for the fact that energy chunks have some width in
        // the view.
        const maxRadius = getCenterToEdgeDistance( sliceBounds, adjustedAngle ) - ENERGY_CHUNK_VIEW_TO_MODEL_WIDTH / 2;

        // determine the radius to use as a function of the value from the normalized spiral and the max value
        const radius = maxRadius * normalizedRadius;

        // Reverse the angle on every other slice to get more spread between slices and a more random appearance when
        // chunks are added (because they don't all wind in the same direction).
        if ( sliceIndex % 2 === 0 ) {
          adjustedAngle = -adjustedAngle;
        }

        // calculate the desired position using polar coordinates
        ecDestination.setPolar( radius, adjustedAngle );
        ecDestination.add( sliceCenter );

        // animate the energy chunk towards its destination if it isn't there already
        if ( !ec.positionProperty.value.equals( ecDestination ) ) {
          moveECTowardsDestination( ec, ecDestination, dt );
          ecMoved = true;
        }
      }
    }

    return ecMoved;
  },

  /**
   * Super simple alternative energy chunk distribution algorithm - just puts all energy chunks in center of slice.
   * This is useful for debugging since it positions the chunks as quickly as possible.
   * @param {EnergyChunkContainerSlice[]} slices
   * @param {number} dt - time step
   * @returns {boolean} - true if any energy chunks needed to be moved, false if not
   * @private
   */
  updatePositionsSimple( slices, dt ) {

    let ecMoved = false;
    const ecDestination = new Vector2( 0, 0 ); // reusable vector to minimze garbage collection

    // update the positions of the energy chunks
    slices.forEach( slice => {
      slice.energyChunkList.forEach( energyChunk => {
        ecDestination.setXY( slice.bounds.centerX, slice.bounds.centerY );

        // animate the energy chunk towards its destination if it isn't there already
        if ( !energyChunk.positionProperty.value.equals( ecDestination ) ) {
          moveECTowardsDestination( energyChunk, ecDestination, dt );
          ecMoved = true;
        }
      } );
    } );

    return ecMoved;
  },

  /**
   * Set the algorithm to use in the "updatePositions" method.  This is generally done only during initialization so
   * that users don't see noticeable changes in the energy chunk motion.  The tradeoffs between the different
   * algorithms are generally based on how good it looks and how much computational power it requires.
   * @param {string} algorithmName
   * @public
   */
  setDistributionAlgorithm( algorithmName ) {
    if ( algorithmName === 'repulsive' ) {
      this.updatePositions = this.updatePositionsRepulsive;
    }
    else if ( algorithmName === 'spiral' ) {
      this.updatePositions = this.updatePositionsSpiral;
    }
    else if ( algorithmName === 'simple' ) {
      this.updatePositions = this.updatePositionsSimple;
    }
    else {
      assert && assert( false, `unknown distribution algorithm specified: ${algorithmName}` );
    }
  }
};

// Set up the distribution algorithm to use based on query parameters.  If no query parameter is specified, we start
// with the repulsive algorithm because it looks best, but may move to spiral if poor performance is detected.
if ( EFACQueryParameters.ecDistribution === null ) {

  // use the repulsive algorithm by default, which looks the best but is also the most computationally expensive
  energyChunkDistributor.updatePositions = energyChunkDistributor.updatePositionsRepulsive;
}
else {
  energyChunkDistributor.setDistributionAlgorithm( EFACQueryParameters.ecDistribution );
}

/**
 * helper function for moving an energy chunk towards a destination, sets the EC's velocity value
 * @param {EnergyChunk} ec
 * @param {Vector2} destination
 * @param {number} dt - delta time, in seconds
 */
const moveECTowardsDestination = ( ec, destination, dt ) => {
  const ecPosition = ec.positionProperty.value;
  if ( !ecPosition.equals( destination ) ) {
    if ( ecPosition.distance( destination ) <= EC_SPEED_DETERMINISTIC * dt ) {

      // EC is close enough that it should just go to the destination
      ec.positionProperty.set( destination.copy() );
    }
    else {
      const vectorTowardsDestination = destination.minus( ec.positionProperty.value );
      vectorTowardsDestination.setMagnitude( EC_SPEED_DETERMINISTIC );
      ec.velocity.set( vectorTowardsDestination );
      ec.setPositionXY( ecPosition.x + ec.velocity.x * dt, ecPosition.y + ec.velocity.y * dt );
    }
  }
};

/**
 * helper function for getting the distance from the center of the provided bounds to the edge at the given angle
 * @param {Bounds2} bounds
 * @param {number} angle in radians
 * @returns {number}
 */
const getCenterToEdgeDistance = ( bounds, angle ) => {
  const halfWidth = bounds.width / 2;
  const halfHeight = bounds.height / 2;
  const tangentOfAngle = Math.tan( angle );
  let opposite;
  let adjacent;
  if ( Math.abs( halfHeight / tangentOfAngle ) < halfWidth ) {
    opposite = halfHeight;
    adjacent = opposite / tangentOfAngle;
  }
  else {
    adjacent = halfWidth;
    opposite = halfWidth * tangentOfAngle;
  }

  return Math.sqrt( opposite * opposite + adjacent * adjacent );
};

energyFormsAndChanges.register( 'energyChunkDistributor', energyChunkDistributor );
export default energyChunkDistributor;