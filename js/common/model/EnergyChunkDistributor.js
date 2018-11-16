// Copyright 2014-2018, University of Colorado Boulder

/**
 * A static object that contains methods for redistributing a set of energy chunks within a shape in order to make them
 * spready out fairly evenly in a way that looks dynamic and real.  The basic approach is to simulate a set of particles
 * embedded in a fluid, and each particle repels all others as well as the edges of the containers.
 *
 * Reuse Notes: This could probably be generalized fairly easily to distribute any number items within a container of
 * arbitrary size.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var OUTSIDE_CONTAINER_FORCE = 0.01; // In Newtons, empirically determined.
  var ZERO_VECTOR = Vector2.ZERO;

  // parameters that can be adjusted to change the nature of the redistribution
  var MAX_TIME_STEP = 5E-3; // in seconds, for algorithm that moves the points
  var ENERGY_CHUNK_MASS = 1E-3; // in kilograms, chosen arbitrarily
  var FLUID_DENSITY = 1000; // in kg / m ^ 3, same as water, used for drag
  var ENERGY_CHUNK_DIAMETER = 1E-3; // in meters, chosen empirically

  // treat energy chunk as if it is shaped like a sphere
  var ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow( ENERGY_CHUNK_DIAMETER, 2 );
  var DRAG_COEFFICIENT = 500; // unitless, empirically chosen

  // Thresholds for deciding whether or not to perform redistribution. These value should be chosen such that particles
  // spread out, then stop all movement.
  var REDISTRIBUTION_THRESHOLD_ENERGY = 1E-4; // in joules (I think)

  var EnergyChunkDistributor = {

    /**
     * Redistribute a set of energy chunks that are contained in energy chunk "slices".  The distribution is done taking
     * all nearby slices into account so that the chunks can be distributed in a way that looks good in the view, i.e.
     * the chunks don't overlap with each other.
     * @param {EnergyChunkContainerSlice[]} slices - set of slices that contain energy chunks
     * @param {number} dt - change in time
     * @public
     */
    updatePositions: function( slices, dt ) {

      var self = this;

      // determine a rectangle that bounds all of the slices
      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;

      // determine the collective bounds of all the slices
      slices.forEach( function( slice ) {
        minX = Math.min( slice.shape.bounds.minX, minX );
        maxX = Math.max( slice.shape.bounds.maxX, maxX );
        minY = Math.min( slice.shape.bounds.minY, minY );
        maxY = Math.max( slice.shape.bounds.maxY, maxY );
      } );

      var width = maxX - minX;
      var height = maxY - minY;
      var boundingRect = new Rectangle( minX, minY, width, height );

      // Create a map that tracks the force applied to each energy chunk and a map that tracks each energyChunk with a
      // unique ID.
      var chunkForces = {}; // map of chunkID (number) => force (Vector2)
      var chunkMap = {}; // map of chunkID (number) => chunk (EnergyChunk)
      slices.forEach( function( slice ) {
        slice.energyChunkList.forEach( function( chunk ) {
          chunkForces[ chunk.id ] = Vector2.createFromPool( 0, 0 );
          chunkMap[ chunk.id ] = chunk;
        } );
      } );

      // get the size of the map above
      var mapSize = 0;
      for ( var force in chunkForces ) {
        if ( chunkForces.hasOwnProperty( force ) ) {
          mapSize++;
        }
      }

      // make sure that there is actually something to distribute
      if ( mapSize === 0 ) {
        return false; // nothing to do - abort
      }

      // Determine the minimum distance that is allowed to be used in the force calculations.  This prevents hitting
      // infinities that can cause run time issues or unreasonably large forces. Denominator empirically determined.
      var minDistance = Math.min( boundingRect.width, boundingRect.height ) / 20;

      // The particle repulsion force varies inversely with the density of particles so that we don't end up with hugely
      // repulsive forces that tend to push the particles out of the container.  This formula was made up, and can be
      // adjusted if needed.
      var forceConstant = ENERGY_CHUNK_MASS * boundingRect.width * boundingRect.height * 0.1 / mapSize;

      // divide the time step up into the largest value known to work consistently for the algorithm
      var particlesRedistributed = false;
      var numForceCalcSteps = Math.floor( dt / MAX_TIME_STEP );
      var extraTime = dt - numForceCalcSteps * MAX_TIME_STEP;
      for ( var forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++ ) {
        var timeStep = forceCalcStep < numForceCalcSteps ? MAX_TIME_STEP : extraTime;

        // update the forces acting on the particle due to its bounding container, other particles, and drag
        for ( var i = 0; i < slices.length; i++ ) {
          var slice = slices[ i ];
          var containerShapeBounds = slice.shape.bounds;

          // determine the max possible distance to an edge
          var maxDistanceToEdge = Math.sqrt( Math.pow( containerShapeBounds.width, 2 ) +
                                             Math.pow( containerShapeBounds.height, 2 ) );

          // determine forces on each energy chunk
          slice.energyChunkList.forEach( function( chunk ) {

            // reset accumulated forces
            chunkForces[ chunk.id ].setXY( 0, 0 );
            if ( containerShapeBounds.containsCoordinates( chunk.positionProperty.value.x, chunk.positionProperty.value.y ) ) {
              self.computeEdgeForces( chunk, chunkForces, forceConstant, minDistance, maxDistanceToEdge, containerShapeBounds );
              self.updateForces( chunk, chunkMap, chunkForces, minDistance, forceConstant );
            }
            else {

              // point is outside container, move it towards center of shape
              chunkForces[ chunk.id ].freeToPool();
              var vectorToCenter = Vector2.createFromPool( boundingRect.centerX, boundingRect.centerY ).subtract( chunk.positionProperty.value );
              chunkForces[ chunk.id ] = vectorToCenter.setMagnitude( OUTSIDE_CONTAINER_FORCE );
            }
          } );
        }

        var maxEnergy = this.updateVelocities( chunkMap, chunkForces, timeStep );

        particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;

        if ( particlesRedistributed ) {
          this.stepChunks( chunkMap, timeStep );
        }
      }
      return particlesRedistributed;
    },

    computeEdgeForces: function( chunk, chunkForces, forceConstant, minDistance, maxDistance, containerBounds ) {

      // get the distance to the four different edges
      var rightLength = Math.max( containerBounds.maxX - chunk.positionProperty.value.x, minDistance );
      var bottomLength = Math.max( containerBounds.maxY - chunk.positionProperty.value.y, minDistance );
      var leftLength = Math.max( chunk.positionProperty.value.x - containerBounds.minX, minDistance );
      var topLength = Math.max( chunk.positionProperty.value.y - containerBounds.minY, minDistance );

      // calculate the force from the edge at the given angle
      var rightEdgeForce = Vector2.createFromPool( forceConstant / Math.pow( rightLength, 2 ), 0 ).rotated( Math.PI );
      var bottomEdgeForce = Vector2.createFromPool( forceConstant / Math.pow( bottomLength, 2 ), 0 ).rotated( Math.PI * 1.5 );
      var leftEdgeForce = Vector2.createFromPool( forceConstant / Math.pow( leftLength, 2 ), 0 ).rotated( 0 );
      var topEdgeForce = Vector2.createFromPool( forceConstant / Math.pow( topLength, 2 ), 0 ).rotated( Math.PI / 2 );

      // apply the forces
      chunkForces[ chunk.id ] = chunkForces[ chunk.id ]
        .add( rightEdgeForce )
        .add( bottomEdgeForce )
        .add( leftEdgeForce )
        .add( topEdgeForce );
      rightEdgeForce.freeToPool();
      bottomEdgeForce.freeToPool();
      leftEdgeForce.freeToPool();
      topEdgeForce.freeToPool();
    },

    // TODO: This was factored from updatePositions and requires further cleanup, probably more refactoring, bug fixes, and docs.
    updateForces: function( chunk, chunkMap, chunkForces, minDistance, forceConstant ) {

      // apply the force from each of the other particles, but set some limits on the max force that can be applied
      for ( var otherEnergyChunkID in chunkForces ) {
        if ( chunkForces.hasOwnProperty( otherEnergyChunkID ) ) {
          if ( chunk === chunkMap[ otherEnergyChunkID ] ) {
            continue;
          }

          // calculate force vector, but handle cases where too close
          var vectorToOther = chunk.positionProperty.value.minus( chunkMap[ otherEnergyChunkID ].positionProperty.value );
          if ( vectorToOther.magnitude() < minDistance ) {
            if ( vectorToOther.magnitude() === 0 ) {

              // create a random vector of min distance
              var randomAngle = phet.joist.random.nextDouble() * Math.PI * 2;
              vectorToOther = new Vector2(
                minDistance * Math.cos( randomAngle ),
                minDistance * Math.sin( randomAngle )
              );
            }
            else {
              vectorToOther = vectorToOther.setMagnitude( minDistance );
            }
          }

          var forceToOther = vectorToOther.setMagnitude( forceConstant / vectorToOther.magnitudeSquared() );

          // add the force to the accumulated forces on this energy chunk
          chunkForces[ chunk.id ] = chunkForces[ chunk.id ].add( forceToOther );
        }
      }
    },

    /**
     * Update energy chunk velocities and drag force, returning max total energy of chunks.
     * @param  {Object} chunkMap - Id => EnergyChunk pairs
     * @param  {Object} chunkForces - Id => Vector2 pairs
     * @param  {number} dt - timestep
     * @returns {number} maxEnergy - max total energy of all provided chunks
     */
    updateVelocities: function( chunkMap, chunkForces, dt ) {

      // update energy chunk velocities, drag force, and position
      var maxEnergy = 0;
      for ( var id in chunkMap ) {
        if ( chunkMap.hasOwnProperty( id ) ) {

          // Calculate the energy chunk's velocity as a result of forces acting on it.

          // force on this chunk
          var force = chunkForces[ id ];
          assert && assert( !_.isNaN( force.x ) && !_.isNaN( force.y ), 'force contains NaN value' );

          // current velocity
          var v = chunkMap[ id ].velocity;
          assert && assert( v.x !== Infinity && !_.isNaN( v.x ) && typeof v.x === 'number', 'v.x is ' + v.x );
          assert && assert( v.y !== Infinity && !_.isNaN( v.y ) && typeof v.y === 'number', 'v.y is ' + v.y );

          // new velocity
          v = v.plus( force.times( dt / ENERGY_CHUNK_MASS ) );
          assert && assert( !_.isNaN( v.x ) && !_.isNaN( v.y ), 'New v contains NaN value' );

          var v2 = v.magnitudeSquared();
          assert && assert( v2 !== Infinity && !_.isNaN( v2 ) && typeof v2 === 'number', 'v^2 is ' + v2 );

          // calculate drag force using standard drag equation
          var dragMagnitude = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA * v2;
          var dragForce = dragMagnitude > 0 ? v.rotated( Math.PI ).setMagnitude( dragMagnitude ) : ZERO_VECTOR;
          assert && assert( !_.isNaN( dragForce.x ) && !_.isNaN( dragForce.y ), 'dragForce contains NaN value' );

          // update velocity based on drag force
          chunkMap[ id ].velocity = v.plus( dragForce.times( dt / ENERGY_CHUNK_MASS ) );

          // update max energy
          var totalParticleEnergy = 0.5 * ENERGY_CHUNK_MASS * v2 + force.magnitude() * Math.PI / 2;
          if ( totalParticleEnergy > maxEnergy ) {
            maxEnergy = totalParticleEnergy;
          }
        }
      }
      return maxEnergy;
    },

    /**
     * Update chunk positions. Mutates energy chunks in chunkMap.
     * @param  {Object} chunkMap - Id => EnergyChunk pairs
     * @param  {number} dt - time step in seconds
     */
    stepChunks: function( chunkMap, dt ) {
      for ( var id in chunkMap ) {
        if ( chunkMap.hasOwnProperty( id ) ) {

          var v = chunkMap[ id ].velocity;
          assert && assert( !_.isNaN( v.x ) && !_.isNaN( v.y ), 'v contains NaN value' );

          var position = chunkMap[ id ].positionProperty.value;
          assert && assert( !_.isNaN( position.x ) && !_.isNaN( position.y ), 'position contains NaN value' );

          chunkMap[ id ].positionProperty.set( position.plus( v.times( dt ) ) );
        }
      }
    },

    /**
     * Super simple alternative energy chunk distribution algorithm - just puts all energy chunks in center of slice.
     * This is useful for debugging. Rename it to substitute if for the 'real' algorithm.
     * @param {EnergyChunkContainerSlice[]} slices
     * @param {number} dt
     */
    updatePositionsDbg: function( slices, dt ) {

      // update the positions of the energy chunks
      slices.forEach( function( slice ) {
        var sliceCenter = new Vector2( slice.shape.bounds.centerX, slice.shape.bounds.centerY );
        slice.energyChunkList.forEach( function( energyChunk ) {
          energyChunk.positionProperty.value = sliceCenter;
        } );
      } );
    },

    /**
     * Generate a random location inside a rectangle.
     * @param {Rectangle} rect
     */
    generateRandomLocation: function( rect ) {
      return new Vector2(
        rect.x + ( phet.joist.random.nextDouble() * rect.width ),
        rect.y + ( phet.joist.random.nextDouble() * rect.height )
      );
    }
  };

  energyFormsAndChanges.register( 'EnergyChunkDistributor', EnergyChunkDistributor );

  return EnergyChunkDistributor;
} );