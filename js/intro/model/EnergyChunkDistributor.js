// Copyright 2002-2015, University of Colorado Boulder

/**
 * A class that contains  methods for redistributing a set of energy chunks within a shape.  The basic approach is to
 * simulate a set of particles embedded in a fluid, and each particle repels all others as well as the edges of the
 * containers.
 *
 * Reuse Notes: This could probably be generalized fairly easily to distribute any number items within a container of
 * arbitrary size in a way that looks pretty random.  Either that, or the code itself could be copied and the various
 * parameters changed as needed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
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
  var ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow( ENERGY_CHUNK_DIAMETER, 2 ); // Treat energy chunk as if it is shaped like a sphere.
  var DRAG_COEFFICIENT = 500; // Unitless, empirically chosen.

  // Thresholds for deciding whether or not to perform redistribution.
  // These value should be chosen such that particles spread out, then stop
  // all movement.
  var REDISTRIBUTION_THRESHOLD_ENERGY = 1E-4; // In joules, I think.

  return {

    /**
     * Redistribute a set of energy chunks that are contained in energy chunk "slices".  This is done in this way
     * because all of the energy chunks in a set of slices interact with each other, but the container for each is
     * defined by the boundary of its containing slice.
     *
     * @param {array.<EnergyChunkContainerSlice>} energyChunkContainerSlices Set of slices, each containing a set of energy chunks.
     * @param {number} dt change in time
     */
    updatePositions: function( energyChunkContainerSlices, dt ) {

      // Determine a rectangle that bounds all of the slices.
      var minX = Number.POSITIVE_INFINITY;
      var minY = Number.POSITIVE_INFINITY;
      var maxX = Number.NEGATIVE_INFINITY;
      var maxY = Number.NEGATIVE_INFINITY;
      energyChunkContainerSlices.forEach( function( slice ) {
        minX = Math.min( slice.shape.bounds.minX, minX );
        maxX = Math.max( slice.shape.bounds.minY, maxX );
        minY = Math.min( slice.shape.bounds.maxX, minY );
        maxY = Math.max( slice.shape.bounds.maxY, maxY );
      } );
      var boundingRect = new Rectangle( minX, minY, maxX - minX, maxY - minY );

      // Create a map that tracks the force applied to each energy chunk and a map that tracks each energyChunk with a
      // unique ID.
      var mapEnergyChunkToForceVector = {};
      var mapIDToEnergyChunk = {};
      energyChunkContainerSlices.forEach( function( energyChunkContainerSlice ) {
        energyChunkContainerSlice.energyChunkList.forEach( function( energyChunk ) {
          mapEnergyChunkToForceVector[ energyChunk.uniqueID ] = ZERO_VECTOR;
          mapIDToEnergyChunk[ energyChunk.uniqueID ] = energyChunk;
        } );
      } );

      // Get the size of the map above.
      var mapSize = 0;
      for ( var force in mapEnergyChunkToForceVector ) {
        if ( mapEnergyChunkToForceVector.hasOwnProperty( force ) ) {
          mapSize++;
        }
      }

      // Make sure that there is actually something to distribute.
      if ( mapSize === 0 ) {
        return false; // Nothing to do - abort.
      }

      // Determine the minimum distance that is allowed to be used in the force calculations.  This prevents hitting
      // infinities that can cause run time issues or unreasonably large forces.
      var minDistance = Math.min( boundingRect.width, boundingRect.height ) / 20; // Divisor empirically determined.

      // The particle repulsion force varies inversely with the density of particles so that we don't end up with hugely
      // repulsive forces that tend to push the particles out of the container.  This formula was made up, and can be
      // adjusted if needed.
      var forceConstant = ENERGY_CHUNK_MASS * boundingRect.width * boundingRect.height * 0.1 / mapSize;

      // Loop once for each max time step plus any remainder.
      var particlesRedistributed = false;
      var numForceCalcSteps = Math.floor( dt / MAX_TIME_STEP );
      var extraTime = dt - numForceCalcSteps * MAX_TIME_STEP;
      for ( var forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++ ) {
        var timeStep = forceCalcStep < numForceCalcSteps ? MAX_TIME_STEP : extraTime;

        // Update the forces acting on the particle due to its bounding container, other particles, and drag.
        energyChunkContainerSlices.forEach( function( energyChunkContainerSlice ) {
          var containerShape = energyChunkContainerSlice.shape;

          // Determine the max possible distance to an edge.
          var maxDistanceToEdge = Math.sqrt( Math.pow( containerShape.bounds.width, 2 ) + Math.pow( containerShape.bounds.height, 2 ) );

          // Determine forces on each energy chunk.
          energyChunkContainerSlice.energyChunkList.forEach( function( energyChunk ) {
            // Reset accumulated forces.
            mapEnergyChunkToForceVector[ energyChunk.uniqueID ] = ZERO_VECTOR;

            if ( containerShape.containsPoint( energyChunk.position ) ) {
              // Loop on several angles, calculating the forces from the edges at the given angle.
              for ( var angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2 ) {
                var edgeDetectSteps = 8;
                var lengthRange = new Range( 0, maxDistanceToEdge );
                for ( var edgeDetectStep = 0; edgeDetectStep < edgeDetectSteps; edgeDetectStep++ ) {
                  var vectorToEdge = new Vector2( lengthRange.getCenter(), 0 ).rotated( angle );
                  if ( containerShape.containsPoint( energyChunk.position.plus( vectorToEdge ) ) ) {
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
                mapEnergyChunkToForceVector[ energyChunk.uniqueID ] = mapEnergyChunkToForceVector[ energyChunk.uniqueID ].plus( edgeForce );
              }

              // Now apply the force from each of the other particles, but set some limits on the max force that can be
              // applied.
              for ( var otherEnergyChunk in mapEnergyChunkToForceVector ) {
                if ( mapEnergyChunkToForceVector.hasOwnProperty( otherEnergyChunk ) ) {
                  if ( energyChunk === mapEnergyChunkToForceVector[ otherEnergyChunk ] ) {
                    continue;
                  }
                  // Calculate force vector, but handle cases where too close.
                  var vectorToOther = energyChunk.position.minus( mapEnergyChunkToForceVector[ otherEnergyChunk ] );
                  if ( vectorToOther.magnitude() < minDistance ) {
                    if ( vectorToOther.magnitude() === 0 ) {
                      // Create a random vector of min distance.
                      var randomAngle = Math.random() * Math.PI * 2;
                      vectorToOther = new Vector2( minDistance * Math.cos( randomAngle ), minDistance * Math.sin( randomAngle ) );
                    }
                    else {
                      vectorToOther = vectorToOther.setMagnitude( minDistance );
//                  vectorToOther = vectorToOther.getInstanceOfMagnitude( minDistance ); // Old Javas method.
                    }
                  }
                  // Add the force to the accumulated forces on this energy chunk.
                  mapEnergyChunkToForceVector[ energyChunk.uniqueID ] = mapEnergyChunkToForceVector[ energyChunk.uniqueID ].plus( vectorToOther.setMagnitude( forceConstant / vectorToOther.magnitudeSquared() ) );
//                    mapEnergyChunkToForceVector.put( ec, mapEnergyChunkToForceVector.get( ec ).plus( vectorToOther.getInstanceOfMagnitude( forceConstant / ( vectorToOther.magnitudeSquared() ) ) ) );
                }
              }
            }
            else {
              // Point is outside container, move it towards center of shape.
              var vectorToCenter = new Vector2( boundingRect.centerX, boundingRect.centerY ).minus( energyChunk.position );
              mapEnergyChunkToForceVector[ energyChunk.uniqueID ] = vectorToCenter.setMagnitude( OUTSIDE_CONTAINER_FORCE );
//            mapEnergyChunkToForceVector.put( ec, vectorToCenter.getInstanceOfMagnitude( OUTSIDE_CONTAINER_FORCE ) );
            }
          } );
        } );


        // Update energy chunk velocities, drag force, and position.
        var maxEnergy = 0;
        for ( var energyChunkID in mapIDToEnergyChunk ) {
          if ( mapIDToEnergyChunk.hasOwnProperty( energyChunkID ) ) {

            // Calculate the energy chunk's velocity as a result of forces acting on it.
            var forceOnThisChunk = mapEnergyChunkToForceVector[ energyChunkID ];
            var newVelocity = mapIDToEnergyChunk[ energyChunkID ].velocity.plus( forceOnThisChunk.times( timeStep / ENERGY_CHUNK_MASS ) );

            // Calculate drag force.  Uses standard drag equation.
            var dragMagnitude = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA * newVelocity.magnitudeSquared();
            var dragForceVector = dragMagnitude > 0 ? newVelocity.rotated( Math.PI ).setMagnitude( dragMagnitude ) : ZERO_VECTOR;

            // Update velocity based on drag force.
            newVelocity = newVelocity.plus( dragForceVector.times( timeStep / ENERGY_CHUNK_MASS ) );
            mapIDToEnergyChunk[ energyChunkID ].velocity = newVelocity;

            // Update max energy.
            var totalParticleEnergy = 0.5 * ENERGY_CHUNK_MASS * newVelocity.magnitudeSquared() + forceOnThisChunk.magnitude() * Math.PI / 2;
            if ( totalParticleEnergy > maxEnergy ) {
              maxEnergy = totalParticleEnergy;
            }
          }
        }

        particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;

        if ( particlesRedistributed ) {
          for ( var newEnergyChunkID in mapIDToEnergyChunk ) {
            if ( mapIDToEnergyChunk.hasOwnProperty( newEnergyChunkID ) ) {

              // Update position.
              mapIDToEnergyChunk[ newEnergyChunkID ].position = mapIDToEnergyChunk[ newEnergyChunkID ].position.plus( mapIDToEnergyChunk[ newEnergyChunkID ].velocity.times( timeStep ) );
            }
          }
        }
      }
      return particlesRedistributed;
    },


    /**
     * Super simple alternative energy chunk distribution algorithm - just puts all energy chunks in center of slide.
     * This is useful for debugging. Rename it to substitute if for the 'real' algorithm.
     *
     * @param {array<EnergyChunkContainerSlice>} energyChunkContainerSlices
     * @param {number} dt
     */
    updatePositionsDbg: function( energyChunkContainerSlices, dt ) {
      // Update the positions of the energy chunks.
      energyChunkContainerSlices.forEach( function( slice ) {
        var sliceCenter = new Vector2( slice.shape.bounds.centerX, slice.shape.bounds.centerY );
        slice.energyChunkList.forEach( function( energyChunk ) {
          energyChunk.position = sliceCenter;
        } );
      } );
    },

    /**
     * Generate a random location inside a rectangle.
     *
     * @param {Rectangle} rect
     */
    generateRandomLocation: function( rect ) {
      return new Vector2( rect.x + ( Math.random() * rect.width ), rect.y + ( Math.random() * rect.height ) );
    }
  };
} );
