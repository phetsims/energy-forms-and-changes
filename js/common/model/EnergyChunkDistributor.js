// Copyright 2014-2017, University of Colorado Boulder

/**
 * A class that contains  methods for redistributing a set of energy chunks within
 * a shape.  The basic approach is to simulate a set of particles embedded in a
 * fluid, and each particle repels all others as well as the edges of the
 * containers.
 *
 * Reuse Notes: This could probably be generalized fairly easily to distribute
 * any number items within a container of arbitrary size in a way that looks
 * pretty random.  Either that, or the code itself could be copied and the various
 * parameters changed as needed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var OUTSIDE_CONTAINER_FORCE = 0.01; // In Newtons, empirically determined.
  var ZERO_VECTOR = Vector2.ZERO;

  // Parameters that can be adjusted to change they nature of the redistribution.
  var MAX_TIME_STEP = 5E-3; // In seconds, for algorithm that moves the points.
  var ENERGY_CHUNK_MASS = 1E-3; // In kilograms, chosen arbitrarily.
  var FLUID_DENSITY = 1000; // In kg / m ^ 3, same as water, used for drag.
  var ENERGY_CHUNK_DIAMETER = 1E-3; // In meters, chosen empirically.

  // Treat energy chunk as if it is shaped like a sphere.
  var ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow( ENERGY_CHUNK_DIAMETER, 2 );
  var DRAG_COEFFICIENT = 500; // Unitless, empirically chosen.

  // Thresholds for deciding whether or not to perform redistribution.
  // These value should be chosen such that particles spread out, then stop
  // all movement.
  var REDISTRIBUTION_THRESHOLD_ENERGY = 1E-4; // In joules, I think.

  /**
   * @constructor
   */
  function EnergyChunkDistributor() {
    Object.call( this );
  }

  energyFormsAndChanges.register( 'EnergyChunkDistributor', EnergyChunkDistributor );

  return inherit( Object, EnergyChunkDistributor, {}, {

    /**
     * Redistribute a set of energy chunks that are contained in energy chunk
     * "slices".  This is done in this way because all of the energy chunks in a
     * set of slices interact with each other, but the container for each is
     * defined by the boundary of its containing slice.
     *
     * @param {EnergyChunkContainerSlice[]} slices - Set of slices,
     *                                           each containing a set of energy chunks.
     * @param {number} dt change in time
     */
    updatePositions: function( slices, dt ) {

      var self = this;

      // Determine a rectangle that bounds all of the slices.
      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;

      slices.forEach( function( slice ) {
        minX = Math.min( slice.shape.bounds.minX, minX );
        maxX = Math.max( slice.shape.bounds.maxX, maxX );
        minY = Math.min( slice.shape.bounds.minY, minY );
        maxY = Math.max( slice.shape.bounds.maxY, maxY );
      } );

      var width = maxX - minX;
      var height = maxY - minY;
      var boundingRect = new Rectangle( minX, minY, width, height );

      // Create a map that tracks the force applied to each energy chunk and a
      // map that tracks each energyChunk with a unique ID.
      var chunkForces = {}; // Map of chunkID (number) => force (Vector2)
      var chunkMap = {}; // Map of chunkID (number) => chunk (EnergyChunk)
      slices.forEach( function( slice ) {
        slice.energyChunkList.forEach( function( chunk ) {
          chunkForces[ chunk.uniqueID ] = ZERO_VECTOR;
          chunkMap[ chunk.uniqueID ] = chunk;
        } );
      } );

      // Get the size of the map above.
      var mapSize = 0;
      for ( var force in chunkForces ) {
        if ( chunkForces.hasOwnProperty( force ) ) {
          mapSize++;
        }
      }

      // Make sure that there is actually something to distribute.
      if ( mapSize === 0 ) {
        return false; // Nothing to do - abort.
      }

      // Determine the minimum distance that is allowed to be used in the force
      // calculations.  This prevents hitting infinities that can cause run time
      // issues or unreasonably large forces. Denominator empirically determined.
      var minDistance = Math.min( boundingRect.width, boundingRect.height ) / 20;

      // The particle repulsion force varies inversely with the density of
      // particles so that we don't end up with hugely repulsive forces that
      // tend to push the particles out of the container.  This formula was made
      // up, and can be adjusted if needed.
      var forceConstant = ENERGY_CHUNK_MASS * boundingRect.width * boundingRect.height * 0.1 / mapSize;

      // Loop once for each max time step plus any remainder.
      var particlesRedistributed = false;
      var numForceCalcSteps = Math.floor( dt / MAX_TIME_STEP );
      var extraTime = dt - numForceCalcSteps * MAX_TIME_STEP;
      for ( var forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++ ) {
        var timeStep = forceCalcStep < numForceCalcSteps ? MAX_TIME_STEP : extraTime;

        // Update the forces acting on the particle due to its bounding container,
        // other particles, and drag.
        slices.forEach( function( slice ) {
          var containerShape = slice.shape;

          // Determine the max possible distance to an edge.
          var maxDistanceToEdge = Math.sqrt( Math.pow( containerShape.bounds.width, 2 ) +
            Math.pow( containerShape.bounds.height, 2 ) );

          // Determine forces on each energy chunk.
          slice.energyChunkList.forEach( function( chunk ) {
            // Reset accumulated forces.
            chunkForces[ chunk.uniqueID ] = ZERO_VECTOR;
            if ( containerShape.containsPoint( chunk.positionProperty.value ) ) {
              self.computeEdgeForces( chunk, chunkForces, forceConstant, minDistance, maxDistanceToEdge, containerShape );
              self.updateForces( chunk, chunkMap, chunkForces, minDistance, forceConstant );
            }
            else {
              // Point is outside container, move it towards center of shape.
              var vectorToCenter = new Vector2( boundingRect.centerX, boundingRect.centerY ).minus( chunk.positionProperty.value );
              chunkForces[ chunk.uniqueID ] = vectorToCenter.setMagnitude( OUTSIDE_CONTAINER_FORCE );
            }
          } );
        } );

        var maxEnergy = this.updateVelocities( chunkMap, chunkForces, timeStep );

        particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;

        if ( particlesRedistributed ) {
          this.stepChunks( chunkMap, dt );
        }
      }
      return particlesRedistributed;
    },

    computeEdgeForces: function( chunk, chunkForces, forceConstant, minDistance, maxDistance, containerShape ) {
      // Loop on several angles, calculating the forces from the edges at the given angle.
      for ( var angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2 ) {
        var edgeDetectSteps = 8;
        var lengthRange = new Range( 0, maxDistance );
        for ( var edgeDetectStep = 0; edgeDetectStep < edgeDetectSteps; edgeDetectStep++ ) {
          var vectorToEdge = new Vector2( lengthRange.getCenter(), 0 ).rotated( angle );
          if ( containerShape.containsPoint( chunk.positionProperty.value.plus( vectorToEdge ) ) ) {
            lengthRange = new Range( lengthRange.getCenter(), lengthRange.max );
          }
          else {
            lengthRange = new Range( lengthRange.min, lengthRange.getCenter() );
          }
        }

        // Handle case where point is too close to the container's edge.
        if ( lengthRange.getCenter() < minDistance ) {
          lengthRange = new Range( minDistance, minDistance );
        }

        // Apply the force due to this edge.
        var edgeForce = new Vector2( forceConstant / Math.pow( lengthRange.getCenter(), 2 ), 0 ).rotated( angle + Math.PI );

        chunkForces[ chunk.uniqueID ] = chunkForces[ chunk.uniqueID ].plus( edgeForce );
      }
    },

    // TODO: This was factored from updatePositions and requires further cleanup, probably more refactoring, bug fixes, and docs.
    updateForces: function( chunk, chunkMap, chunkForces, minDistance, forceConstant ) {

      // Now apply the force from each of the other particles, but set some limits on the max force that can be
      // applied.
      for ( var otherEnergyChunkID in chunkForces ) {
        if ( chunkForces.hasOwnProperty( otherEnergyChunkID ) ) {
          if ( chunk === chunkMap[ otherEnergyChunkID ] ) {
            continue;
          }
          // Calculate force vector, but handle cases where too close.
          var vectorToOther = chunk.positionProperty.value.minus( chunkMap[ otherEnergyChunkID ].positionProperty.value );
          if ( vectorToOther.magnitude() < minDistance ) {
            if ( vectorToOther.magnitude() === 0 ) {
              // Create a random vector of min distance.
              var randomAngle = phet.joist.random.nextDouble() * Math.PI * 2;
              vectorToOther = new Vector2( minDistance * Math.cos( randomAngle ),
                minDistance * Math.sin( randomAngle ) );
            }
            else {
              vectorToOther = vectorToOther.setMagnitude( minDistance );
            }
          }

          var forceToOther = vectorToOther.setMagnitude( forceConstant / vectorToOther.magnitudeSquared() );

          // Add the force to the accumulated forces on this energy chunk.
          chunkForces[ chunk.uniqueID ] = chunkForces[ chunk.uniqueID ].plus( forceToOther );
        }
      }
    },

    /**
     * Update energy chunk velocities and drag force, returning max total energy of chunks.
     *
     * @param  {Object} chunkMap - Id => EnergyChunk pairs
     * @param  {Object} chunkForces - Id => Vector2 pairs
     * @param  {number} dt - timestep
     *
     * @returns {number} maxEnergy - max total energy of all provided chunks
     */
    updateVelocities: function( chunkMap, chunkForces, dt ) {
      // Update energy chunk velocities, drag force, and position.
      var maxEnergy = 0;
      for ( var id in chunkMap ) {
        if ( chunkMap.hasOwnProperty( id ) ) {

          // Calculate the energy chunk's velocity as a result of forces acting on it.

          // Force on this chunk
          var force = chunkForces[ id ];
          assert && assert( !_.isNaN( force.x ) && !_.isNaN( force.y ), 'force contains NaN value' );

          // Current velocity
          var v = chunkMap[ id ].velocity;
          assert && assert( v.x !== Infinity && !_.isNaN( v.x ) && typeof v.x === 'number', 'v.x is ' + v.x );
          assert && assert( v.y !== Infinity && !_.isNaN( v.y ) && typeof v.y === 'number', 'v.y is ' + v.y );

          // New velocity
          v = v.plus( force.times( dt / ENERGY_CHUNK_MASS ) );
          assert && assert( !_.isNaN( v.x ) && !_.isNaN( v.y ), 'New v contains NaN value' );

          var v2 = v.magnitudeSquared();
          assert && assert( v2 !== Infinity && !_.isNaN( v2 ) && typeof v2 === 'number', 'v^2 is ' + v2 );

          // Calculate drag force using standard drag equation.
          var dragMagnitude = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA * v2;
          var dragForce = dragMagnitude > 0 ? v.rotated( Math.PI ).setMagnitude( dragMagnitude ) : ZERO_VECTOR;
          assert && assert( !_.isNaN( dragForce.x ) && !_.isNaN( dragForce.y ), 'dragForce contains NaN value' );

          // Update velocity based on drag force.
          chunkMap[ id ].velocity = v.plus( dragForce.times( dt / ENERGY_CHUNK_MASS ) );

          // Update max energy.
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
     *
     * @param  {Object} chunkMap - Id => EnergyChunk pairs
     * @param  {number} dt - timestep in seconds
     *
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
      // Update the positions of the energy chunks.
      slices.forEach( function( slice ) {
        var sliceCenter = new Vector2( slice.shape.bounds.centerX, slice.shape.bounds.centerY );
        slice.energyChunkList.forEach( function( energyChunk ) {
          energyChunk.positionProperty.value = sliceCenter;
        } );
      } );
    },

    /**
     * Generate a random location inside a rectangle.
     *
     * @param {Rectangle} rect
     */
    generateRandomLocation: function( rect ) {
      return new Vector2(
        rect.x + ( phet.joist.random.nextDouble() * rect.width ),
        rect.y + ( phet.joist.random.nextDouble() * rect.height )
      );
    }
  } );
} );
