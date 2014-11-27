// Copyright 2002-2012, University of Colorado

/**
 * A class that contains  methods for redistributing a set of energy
 * chunks within a shape.  The basic approach is to simulate a set of
 * particles embedded in a fluid, and each particle repels all others as well
 * as the edges of the containers.
 *
 * Reuse Notes: This could probably be generalized fairly easily to distribute
 * any number items within a container of arbitrary size in a way that looks
 * pretty random.  Either that, or the code itself could be copied and the
 * various parameters changed as needed.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Vector2 = require( 'DOT/Vector2' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );

  // /constants
  var OUTSIDE_CONTAINER_FORCE = 0.01; // In Newtons, empirically determined.
  var ZERO_VECTOR = new Vector2( 0, 0 );

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

  function EnergyChunkDistributor() {}


  return inherit( Object, EnergyChunkDistributor, {
    /**
     * Redistribute a set of energy chunks that are contained in energy chunk
     * "slices".  This is done in this way because all of the energy chunks in
     * a set of slices interact with each other, but the container for each is
     * defined by the boundary of its containing slice.
     *
     * @param energyChunkContainerSlices Set of slices, each containing a set of energy chunks.
     * @param dt                         Delta time
     */
    updatePositions: function( energyChunkContainerSlices, dt ) {

      // Determine a rectangle that bounds all of the slices.
      var boundingRect;
      {
        var minX = Number.POSITIVE_INFINITY;
        var minY = Number.POSITIVE_INFINITY;
        var maxX = Number.NEGATIVE_INFINITY;
        var maxY = Number.NEGATIVE_INFINITY;
        energyChunkContainerSlices.forEach( function( slice ) {
          minX = Math.min( slice.getShape().getBounds2D().getMinX(), minX );
          maxX = Math.max( slice.getShape().getBounds2D().getMaxX(), maxX );
          minY = Math.min( slice.getShape().getBounds2D().getMinY(), minY );
          maxY = Math.max( slice.getShape().getBounds2D().getMaxY(), maxY );
        } );
        boundingRect = new Rectangle( minX, minY, maxX - minX, maxY - minY );
      }

      // Create a map that tracks the force applied to each energy chunk.
      //TODO ask JB about hashmap
      var mapEnergyChunkToForceVector = new Object();

      energyChunkContainerSlices.forEach( function( energyChunkContainerSlice ) {
        energyChunkContainerSlice.energyChunkList.forEach( function( energyChunk ) {
          mapEnergyChunkToForceVector.push = {x: energyChunk, y: ZERO_VECTOR};
        } );
      } );

      // Make sure that there is actually something to distribute.
      if ( mapEnergyChunkToForceVector.isEmpty() ) {
        return false; // Nothing to do - abort.
      }

      // Determine the minimum distance that is allowed to be used in the
      // force calculations.  This prevents hitting infinities that can
      // cause run time issues or unreasonably large forces.
      var minDistance = Math.min( boundingRect.getWidth(), boundingRect.getHeight() ) / 20; // Divisor empirically determined.

      // The particle repulsion force varies inversely with the density of
      // particles so that we don't end up with hugely repulsive forces that
      // tend to push the particles out of the container.  This formula was
      // made up, and can be adjusted if needed.
      var forceConstant = ENERGY_CHUNK_MASS * boundingRect.getWidth() * boundingRect.getHeight() * 0.1 / mapEnergyChunkToForceVector.size();

      // Loop once for each max time step plus any remainder.
      var particlesRedistributed = false;
      var numForceCalcSteps = Math.floor( dt / MAX_TIME_STEP );
      var extraTime = dt - numForceCalcSteps * MAX_TIME_STEP;
      var forceCalcStep;
      for ( forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++ ) {
        var timeStep = forceCalcStep < numForceCalcSteps ? MAX_TIME_STEP : extraTime;

        // Update the forces acting on the particle due to its bounding
        // container, other particles, and drag.
        energyChunkContainerSlices.forEach( function( energyChunkContainerSlice ) {
          {
            var containerShape = energyChunkContainerSlice.getShape();

            // Determine the max possible distance to an edge.
            var maxDistanceToEdge = Math.sqrt( Math.pow( containerShape.getBounds2D().getWidth(), 2 ) +
                                               Math.pow( containerShape.getBounds2D().getHeight(), 2 ) );

            // Determine forces on each energy chunk.
            energyChunkContainerSlice.energyChunkList.forEach( function( energyChunk ) {
              // Reset accumulated forces.
//              mapEnergyChunkToForceVector[energyChunk] = ZERO_VECTOR;

              if ( containerShape.contains( energyChunk.position.get().toPoint2D() ) ) {

                // Loop on several angles, calculating the forces from the
                // edges at the given angle.
                var angle;
                for ( angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2 ) {
                  var edgeDetectSteps = 8;
                  var lengthBounds = new Range( 0, maxDistanceToEdge );
                  var edgeDetectStep;
                  for ( edgeDetectStep = 0; edgeDetectStep < edgeDetectSteps; edgeDetectStep++ ) {
                    var vectorToEdge = new Vector2( lengthBounds.getCenter(), 0 ).rotate( angle );
                    if ( containerShape.contains( energyChunk.position.get().plus( vectorToEdge ).toPoint2D() ) ) {
                      lengthBounds = new Range( lengthBounds.getCenter(), lengthBounds.getMax() );
                    }
                    else {
                      lengthBounds = new Range( lengthBounds.getMin(), lengthBounds.getCenter() );
                    }
                  }

                  // Handle case where point is too close to the container's edge.
                  if ( lengthBounds.getCenter() < minDistance ) {
                    lengthBounds = new Range( minDistance, minDistance );
                  }

                  // Apply the force due to this edge.
                  var edgeForce = new Vector2( forceConstant / Math.pow( lengthBounds.getCenter(), 2 ), 0 ).rotate( angle + Math.PI );
                  mapEnergyChunkToForceVector.put( energyChunk, mapEnergyChunkToForceVector.get( energyChunk ).plus( edgeForce ) );
                }

                // Now apply the force from each of the other
                // particles, but set some limits on the max force
                // that can be applied.
                Object.keys( mapEnergyChunkToForceVector ).forEach( function( energyChunk ) {

                  if ( energyChunk == otherEnergyChunk ) {
                    continue;
                  }

                  // Calculate force vector, but handle cases where too close.
                  var vectorToOther = energyChunk.position.get().minus( otherEnergyChunk.position.get() );
                  if ( vectorToOther.magnitude() < minDistance ) {
                    if ( vectorToOther.magnitude() == 0 ) {
                      // Create a random vector of min distance.
                      var randomAngle = Math.random() * Math.PI * 2;
                      vectorToOther = new Vector2( minDistance * Math.cos( randomAngle ), minDistance * Math.sin( randomAngle ) );
                    }
                    else {
                      vectorToOther = vectorToOther.setMagnitude( minDistance );
                    }
                  }
                  // Add the force to the accumulated forces on this energy chunk.
                  mapEnergyChunkToForceVector.put( energyChunk, mapEnergyChunkToForceVector.get( energyChunk ).plus( vectorToOther.setMagnitude( forceConstant / ( vectorToOther.magnitudeSquared() ) ) ) );

                  else
                  {
                    // Point is outside container, move it towards center of shape.
                    var vectorToCenter = new Vector2( boundingRect.getCenterX(), boundingRect.getCenterY() ).minus( energyChunk.position.get() );
                    mapEnergyChunkToForceVector.put( energyChunk, vectorToCenter.setMagnitude( OUTSIDE_CONTAINER_FORCE ) );
                  }
                } );

              }

              // Update energy chunk velocities, drag force, and position.
              var maxEnergy = 0;
              Object.keys( mapEnergyChunkToForceVector ).forEach( function( energyChunk ) {

                // Calculate the energy chunk's velocity as a result of forces acting on it.
                var forceOnThisChunk = mapEnergyChunkToForceVector.get( energyChunk );
                var newVelocity = energyChunk.getVelocity().plus( forceOnThisChunk.times( timeStep / ENERGY_CHUNK_MASS ) );

                // Calculate drag force.  Uses standard drag equation.
                var dragMagnitude = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA * newVelocity.magnitudeSquared();
                var dragForceVector = dragMagnitude > 0 ? newVelocity.rotate( Math.PI ).setMagnitude( dragMagnitude ) : ZERO_VECTOR;

                // Update velocity based on drag force.
                newVelocity = newVelocity.plus( dragForceVector.times( timeStep / ENERGY_CHUNK_MASS ) );
                energyChunk.setVelocity( newVelocity );

                // Update max energy.
                var totalParticleEnergy = 0.5 * ENERGY_CHUNK_MASS * newVelocity.magnitudeSquared() + forceOnThisChunk.magnitude() * Math.PI / 2;
                if ( totalParticleEnergy > maxEnergy ) {
                  maxEnergy = totalParticleEnergy;
                }
              } );

              particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;

              if ( particlesRedistributed ) {
                Object.keys( mapEnergyChunkToForceVector ).forEach( function( energyChunk ) {
                  // Update position.
                  energyChunk.position.set( energyChunk.position.get().plus( energyChunk.getVelocity().times( timeStep ) ) );
                } );
              }

              return particlesRedistributed;
            }
          }
          ,

          /*
           * Super simple alternative energy chunk distribution algorithm - just puts
           * all energy chunks in center of slide.  This is useful for debugging.
           * Rename it to substitute if for the 'real' algorithm.
           */
          updatePositionsDbg: function( energyChunkContainerSlices, dt ) {
            // Update the positions of the energy chunks.
            energyChunkContainerSlices.forEach( function( slice ) {
              var sliceCenter = new Vector2( slice.getShape().getBounds2D().getCenterX(), slice.getShape().getBounds2D().getCenterY() );
              slice.energyChunkList.forEach( function( energyChunk ) {
                energyChunk.position.set( sliceCenter );
              } );
            } );
          }
          ,


          generateRandomLocation: function( rectangle ) {
            return new Vector2( rectangle.getMinX() + ( Math.random() * rect.getWidth() ), rectangle.getMinY() + ( Math.random() * rectangle.getHeight() ) );
          }
        }
      }
    } );


//
//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.*;
//import java.awt.geom.Rectangle2D;
//import java.util.HashMap;
//import java.util.List;
//import java.util.Map;
//import java.util.Random;
//
//import edu.colorado.phet.common.phetcommon.math.vector.MutableVector2D;
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.util.DoubleRange;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyChunk;
//
///**
// * A class that contains static methods for redistributing a set of energy
// * chunks within a shape.  The basic approach is to simulate a set of
// * particles embedded in a fluid, and each particle repels all others as well
// * as the edges of the containers.
// * <p/>
// * Reuse Notes: This could probably be generalized fairly easily to distribute
// * any number items within a container of arbitrary size in a way that looks
// * pretty random.  Either that, or the code itself could be copied and the
// * various parameters changed as needed.
// *
// * @author John Blanco
// */
//public class EnergyChunkDistributor {
//
//  private static final double OUTSIDE_CONTAINER_FORCE = 0.01; // In Newtons, empirically determined.
//  private static final Random RAND = new Random( 2 ); // Seeded for greater consistency.
//  private static final Vector2D ZERO_VECTOR = new Vector2D( 0, 0 );
//
//  // Parameters that can be adjusted to change they nature of the redistribution.
//  private static final double MAX_TIME_STEP = 5E-3; // In seconds, for algorithm that moves the points.
//  private static final double ENERGY_CHUNK_MASS = 1E-3; // In kilograms, chosen arbitrarily.
//  private static final double FLUID_DENSITY = 1000; // In kg / m ^ 3, same as water, used for drag.
//  private static final double ENERGY_CHUNK_DIAMETER = 1E-3; // In meters, chosen empirically.
//  private static final double ENERGY_CHUNK_CROSS_SECTIONAL_AREA = Math.PI * Math.pow( ENERGY_CHUNK_DIAMETER, 2 ); // Treat energy chunk as if it is shaped like a sphere.
//  private static final double DRAG_COEFFICIENT = 500; // Unitless, empirically chosen.
//
//  // Thresholds for deciding whether or not to perform redistribution.
//  // These value should be chosen such that particles spread out, then stop
//  // all movement.
//  private static final double REDISTRIBUTION_THRESHOLD_ENERGY = 1E-4; // In joules, I think.
//
//  /**
//   * Redistribute a set of energy chunks that are contained in energy chunk
//   * "slices".  This is done in this way because all of the energy chunks in
//   * a set of slices interact with each other, but the container for each is
//   * defined by the boundary of its containing slice.
//   *
//   * @param energyChunkContainerSlices Set of slices, each containing a set of energy chunks.
//   * @param dt                         Delta time
//   */
//  public static boolean updatePositions( List<EnergyChunkContainerSlice> energyChunkContainerSlices, double dt ) {
//
//    // Determine a rectangle that bounds all of the slices.
//    Rectangle2D boundingRect;
//    {
//      double minX = Double.POSITIVE_INFINITY;
//      double minY = Double.POSITIVE_INFINITY;
//      double maxX = Double.NEGATIVE_INFINITY;
//      double maxY = Double.NEGATIVE_INFINITY;
//      for ( EnergyChunkContainerSlice slice : energyChunkContainerSlices ) {
//      minX = Math.min( slice.getShape().getBounds2D().getMinX(), minX );
//      maxX = Math.max( slice.getShape().getBounds2D().getMaxX(), maxX );
//      minY = Math.min( slice.getShape().getBounds2D().getMinY(), minY );
//      maxY = Math.max( slice.getShape().getBounds2D().getMaxY(), maxY );
//    }
//      boundingRect = new Rectangle2D.Double( minX, minY, maxX - minX, maxY - minY );
//    }
//
//    // Create a map that tracks the force applied to each energy chunk.
//    Map<EnergyChunk, Vector2D> mapEnergyChunkToForceVector = new HashMap<EnergyChunk, Vector2D>();
//    for ( EnergyChunkContainerSlice energyChunkContainerSlice : energyChunkContainerSlices ) {
//      for ( EnergyChunk ec : energyChunkContainerSlice.energyChunkList ) {
//        mapEnergyChunkToForceVector.put( ec, ZERO_VECTOR );
//      }
//    }
//
//    // Make sure that there is actually something to distribute.
//    if ( mapEnergyChunkToForceVector.isEmpty() ) {
//      return false; // Nothing to do - abort.
//    }
//
//    // Determine the minimum distance that is allowed to be used in the
//    // force calculations.  This prevents hitting infinities that can
//    // cause run time issues or unreasonably large forces.
//    double minDistance = Math.min( boundingRect.getWidth(), boundingRect.getHeight() ) / 20; // Divisor empirically determined.
//
//    // The particle repulsion force varies inversely with the density of
//    // particles so that we don't end up with hugely repulsive forces that
//    // tend to push the particles out of the container.  This formula was
//    // made up, and can be adjusted if needed.
//    double forceConstant = ENERGY_CHUNK_MASS * boundingRect.getWidth() * boundingRect.getHeight() * 0.1 / mapEnergyChunkToForceVector.size();
//
//    // Loop once for each max time step plus any remainder.
//    boolean particlesRedistributed = false;
//    int numForceCalcSteps = (int) ( dt / MAX_TIME_STEP );
//    double extraTime = dt - numForceCalcSteps * MAX_TIME_STEP;
//    for ( int forceCalcStep = 0; forceCalcStep <= numForceCalcSteps; forceCalcStep++ ) {
//
//      double timeStep = forceCalcStep < numForceCalcSteps ? MAX_TIME_STEP : extraTime;
//
//      // Update the forces acting on the particle due to its bounding
//      // container, other particles, and drag.
//      for ( EnergyChunkContainerSlice energyChunkContainerSlice : energyChunkContainerSlices ) {
//        Shape containerShape = energyChunkContainerSlice.getShape();
//
//        // Determine the max possible distance to an edge.
//        double maxDistanceToEdge = Math.sqrt( Math.pow( containerShape.getBounds2D().getWidth(), 2 ) +
//                                              Math.pow( containerShape.getBounds2D().getHeight(), 2 ) );
//
//        // Determine forces on each energy chunk.
//        for ( EnergyChunk ec : energyChunkContainerSlice.energyChunkList ) {
//          // Reset accumulated forces.
//          mapEnergyChunkToForceVector.put( ec, ZERO_VECTOR );
//
//          if ( containerShape.contains( ec.position.get().toPoint2D() ) ) {
//
//            // Loop on several angles, calculating the forces from the
//            // edges at the given angle.
//            for ( double angle = 0; angle < 2 * Math.PI; angle += Math.PI / 2 ) {
//              int edgeDetectSteps = 8;
//              DoubleRange lengthBounds = new DoubleRange( 0, maxDistanceToEdge );
//              for ( int edgeDetectStep = 0; edgeDetectStep < edgeDetectSteps; edgeDetectStep++ ) {
//                Vector2D vectorToEdge = new Vector2D( lengthBounds.getCenter(), 0 ).getRotatedInstance( angle );
//                if ( containerShape.contains( ec.position.get().plus( vectorToEdge ).toPoint2D() ) ) {
//                  lengthBounds = new DoubleRange( lengthBounds.getCenter(), lengthBounds.getMax() );
//                }
//                else {
//                  lengthBounds = new DoubleRange( lengthBounds.getMin(), lengthBounds.getCenter() );
//                }
//              }
//
//              // Handle case where point is too close to the container's edge.
//              if ( lengthBounds.getCenter() < minDistance ) {
//                lengthBounds = new DoubleRange( minDistance, minDistance );
//              }
//
//              // Apply the force due to this edge.
//              Vector2D edgeForce = new Vector2D( forceConstant / Math.pow( lengthBounds.getCenter(), 2 ), 0 ).getRotatedInstance( angle + Math.PI );
//              mapEnergyChunkToForceVector.put( ec, mapEnergyChunkToForceVector.get( ec ).plus( edgeForce ) );
//            }
//
//            // Now apply the force from each of the other
//            // particles, but set some limits on the max force
//            // that can be applied.
//            for ( EnergyChunk otherEnergyChunk : mapEnergyChunkToForceVector.keySet() ) {
//              if ( ec == otherEnergyChunk ) {
//                continue;
//              }
//
//              // Calculate force vector, but handle cases where too close.
//              Vector2D vectorToOther = ec.position.get().minus( otherEnergyChunk.position.get() );
//              if ( vectorToOther.magnitude() < minDistance ) {
//                if ( vectorToOther.magnitude() == 0 ) {
//                  // Create a random vector of min distance.
//                  double randomAngle = RAND.nextDouble() * Math.PI * 2;
//                  vectorToOther = new Vector2D( minDistance * Math.cos( randomAngle ), minDistance * Math.sin( randomAngle ) );
//                }
//                else {
//                  vectorToOther = vectorToOther.getInstanceOfMagnitude( minDistance );
//                }
//              }
//              // Add the force to the accumulated forces on this energy chunk.
//              mapEnergyChunkToForceVector.put( ec, mapEnergyChunkToForceVector.get( ec ).plus( vectorToOther.getInstanceOfMagnitude( forceConstant / ( vectorToOther.magnitudeSquared() ) ) ) );
//            }
//          }
//          else {
//            // Point is outside container, move it towards center of shape.
//            Vector2D vectorToCenter = new Vector2D( boundingRect.getCenterX(), boundingRect.getCenterY() ).minus( ec.position.get() );
//            mapEnergyChunkToForceVector.put( ec, vectorToCenter.getInstanceOfMagnitude( OUTSIDE_CONTAINER_FORCE ) );
//          }
//        }
//      }
//
//      // Update energy chunk velocities, drag force, and position.
//      double maxEnergy = 0;
//      for ( EnergyChunk energyChunk : mapEnergyChunkToForceVector.keySet() ) {
//
//        // Calculate the energy chunk's velocity as a result of forces acting on it.
//        Vector2D forceOnThisChunk = mapEnergyChunkToForceVector.get( energyChunk );
//        Vector2D newVelocity = energyChunk.getVelocity().plus( forceOnThisChunk.times( timeStep / ENERGY_CHUNK_MASS ) );
//
//        // Calculate drag force.  Uses standard drag equation.
//        double dragMagnitude = 0.5 * FLUID_DENSITY * DRAG_COEFFICIENT * ENERGY_CHUNK_CROSS_SECTIONAL_AREA * newVelocity.magnitudeSquared();
//        Vector2D dragForceVector = dragMagnitude > 0 ? newVelocity.rotate( Math.PI ).getInstanceOfMagnitude( dragMagnitude ) : ZERO_VECTOR;
//
//        // Update velocity based on drag force.
//        newVelocity = newVelocity.plus( dragForceVector.times( timeStep / ENERGY_CHUNK_MASS ) );
//        energyChunk.setVelocity( newVelocity );
//
//        // Update max energy.
//        double totalParticleEnergy = 0.5 * ENERGY_CHUNK_MASS * newVelocity.magnitudeSquared() + forceOnThisChunk.magnitude() * Math.PI / 2;
//        if ( totalParticleEnergy > maxEnergy ){
//          maxEnergy = totalParticleEnergy;
//        }
//      }
//
//      particlesRedistributed = maxEnergy > REDISTRIBUTION_THRESHOLD_ENERGY;
//
//      if ( particlesRedistributed ) {
//        for ( EnergyChunk energyChunk : mapEnergyChunkToForceVector.keySet() ) {
//          // Update position.
//          energyChunk.position.set( energyChunk.position.get().plus( energyChunk.getVelocity().times( timeStep ) ) );
//        }
//      }
//    }
//    return particlesRedistributed;
//  }
//
//  /*
//   * Super simple alternative energy chunk distribution algorithm - just puts
//   * all energy chunks in center of slide.  This is useful for debugging.
//   * Rename it to substitute if for the 'real' algorithm.
//   */
//  public static void updatePositionsDbg( List<EnergyChunkContainerSlice> energyChunkContainerSlices, double dt ) {
//    // Update the positions of the energy chunks.
//    for ( EnergyChunkContainerSlice slice : energyChunkContainerSlices ) {
//      Vector2D sliceCenter = new Vector2D( slice.getShape().getBounds2D().getCenterX(), slice.getShape().getBounds2D().getCenterY() );
//      for ( EnergyChunk energyChunk : slice.energyChunkList ) {
//        energyChunk.position.set( sliceCenter );
//      }
//    }
//  }
//
//  public static Vector2D generateRandomLocation( Rectangle2D rect ) {
//    return new Vector2D( rect.getMinX() + ( RAND.nextDouble() * rect.getWidth() ), rect.getMinY() + ( RAND.nextDouble() * rect.getHeight() ) );
//  }
//}
//

