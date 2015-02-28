// Copyright 2002-2015, University of Colorado

/**
 * Class that represents a 2D space that can come into contact with other
 * thermal areas.  This is basically just a shape and a flag that indicates
 * whether immersion can occur
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Bounds2 = require( 'DOT/Bounds2' );


  // Threshold of distance for determining whether two areas are in contact.
  var TOUCH_DISTANCE_THRESHOLD = 0.001; // In meters.

  /**
   *
   * @param {Bounds2} bounds
   * @param {Boolean} supportsImmersion
   * @constructor
   */
  function ThermalContactArea( bounds, supportsImmersion ) {
    this.bounds.set( bounds );
    this.supportsImmersion = supportsImmersion;
  }

  return inherit( Object, ThermalContactArea, {

    getBounds: function() {
      return this.bounds;
    },

    /**
     * Get the amount of thermal contact that exists between this and another
     * thermal area.  Since thermal contact areas are 2D, the amount of
     * contact is a 1D quantity.  For example, when a rectangle is sitting
     * on top of another that is the same width, the contact length is the
     * width of the shared edge.
     *
     * @param that Other thermal contact area.
     * @return Length of contact
     */
    getThermalContactLength: function( that ) {

      var xOverlap = this.getHorizontalOverlap( this.bounds, that.bounds );
      var yOverlap = this.getVerticalOverlap( this.bounds, that.bounds );

      var contactLength = 0;
      if ( xOverlap > 0 && yOverlap > 0 ) {
        // One of the areas is overlapping another.  This should be an
        // 'immersion' situation, i.e. one is all or partially immersed in
        // the other.
        if ( this.supportsImmersion || that.supportsImmersion ) {
          var immersionRect = this.bounds.intersection( that.bounds );
          contactLength = immersionRect.width * 2 + immersionRect.height * 2;
          if ( immersionRect.width != this.bounds.width && immersionRect.width != that.bounds.width ) {
            // Not fully overlapping in X direction, so adjust contact length accordingly.
            contactLength -= immersionRect.height;
          }
          if ( immersionRect.height != this.bounds.height && immersionRect.height != that.bounds.height ) {
            // Not fully overlapping in Y direction, so adjust contact length accordingly.
            contactLength -= immersionRect.width;
          }
        }
        else {
          // This shouldn't occur, but it practice it sometimes does due
          // to floating point tolerances.  Print out an error if a
          // threshold is exceeded.  The threshold value was determined
          // by testing.
          if ( yOverlap > 1E-6 && xOverlap > 1E-6 ) {
            console.log( " - Error: Double overlap detected in case where neither energy container supports immersion.  Ignoring." );
            console.log( "yOverlap = " + yOverlap );
            console.log( "xOverlap = " + xOverlap );
          }
        }
      }
      else if ( xOverlap > 0 || yOverlap > 0 ) {
        // There is overlap in one dimension but not the other, so test to
        // see if the two containers are touching.
        if ( xOverlap > 0 &&
             Math.abs( this.bounds.maxY - that.bounds.minY ) < TOUCH_DISTANCE_THRESHOLD ||
             Math.abs( this.bounds.minY - that.bounds.maxY ) < TOUCH_DISTANCE_THRESHOLD ) {
          contactLength = xOverlap;
        }
        else if ( yOverlap > 0 &&
                  Math.abs( this.bounds.maxX - that.bounds.minX ) < TOUCH_DISTANCE_THRESHOLD ||
                  Math.abs( this.bounds.minX - that.bounds.maxX ) < TOUCH_DISTANCE_THRESHOLD ) {
          contactLength = xOverlap;
        }
      }

      return contactLength;
    },

    // Convenience method for determining overlap of rectangles in X dimension.
    getHorizontalOverlap: function( rectangle1, rectangle2 ) {
      var lowestMax = Math.min( rectangle1.getMaxX(), rectangle2.getMaxX() );
      var highestMin = Math.max( rectangle1.getMinX(), rectangle2.getMinX() );
      return Math.max( lowestMax - highestMin, 0 );
    },

    // Convenience method for determining overlap of rectangles in Y dimension.
    getVerticalOverlap: function( rectangle1, rectangle2 ) {
      var lowestMax = Math.min( rectangle1.getMaxY(), rectangle2.getMaxY() );
      var highestMin = Math.max( rectangle1.getMinY(), rectangle2.getMinY() );
      return Math.max( lowestMax - highestMin, 0 );
    }
  } );

} );
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.geom.Rectangle2D;
//
///**
// * Class that represents a 2D space that can come into contact with other
// * thermal areas.  This is basically just a shape and a flag that indicates
// * whether immersion can occur (such as when
// *
// * @author John Blanco
// */
//public class ThermalContactArea {
//
//  // Threshold of distance for determining whether two areas are in contact.
//  private static final double TOUCH_DISTANCE_THRESHOLD = 0.001; // In meters.
//
//  private final Rectangle2D bounds = new Rectangle2D.Double();
//  private final boolean supportsImmersion;
//
//  public ThermalContactArea( Rectangle2D bounds, boolean supportsImmersion ) {
//    this.bounds.setFrame( bounds );
//    this.supportsImmersion = supportsImmersion;
//  }
//
//  public Rectangle2D getBounds() {
//    return bounds;
//  }
//
//  /**
//   * Get the amount of thermal contact that exists between this and another
//   * thermal area.  Since thermal contact areas are 2D, the amount of
//   * contact is a 1D quantity.  For example, when a rectangle is sitting
//   * on top of another that is the same width, the contact length is the
//   * width of the shared edge.
//   *
//   * @param that Other thermal contact area.
//   * @return Length of contact
//   */
//  public double getThermalContactLength( ThermalContactArea that ) {
//
//    double xOverlap = getHorizontalOverlap( this.bounds, that.bounds );
//    double yOverlap = getVerticalOverlap( this.bounds, that.bounds );
//
//    double contactLength = 0;
//    if ( xOverlap > 0 && yOverlap > 0 ) {
//      // One of the areas is overlapping another.  This should be an
//      // 'immersion' situation, i.e. one is all or partially immersed in
//      // the other.
//      if ( this.supportsImmersion || that.supportsImmersion ) {
//        Rectangle2D immersionRect = this.bounds.createIntersection( that.bounds );
//        contactLength = immersionRect.width * 2 + immersionRect.height * 2;
//        if ( immersionRect.width != this.bounds.width && immersionRect.width != that.bounds.width ) {
//          // Not fully overlapping in X direction, so adjust contact length accordingly.
//          contactLength -= immersionRect.height;
//        }
//        if ( immersionRect.height != this.bounds.height && immersionRect.height != that.bounds.height ) {
//          // Not fully overlapping in Y direction, so adjust contact length accordingly.
//          contactLength -= immersionRect.width;
//        }
//      }
//      else {
//        // This shouldn't occur, but it practice it sometimes does due
//        // to floating point tolerances.  Print out an error if a
//        // threshold is exceeded.  The threshold value was determined
//        // by testing.
//        if ( yOverlap > 1E-6 && xOverlap > 1E-6 ){
//          System.out.println( getClass().getName() + " - Error: Double overlap detected in case where neither energy container supports immersion.  Ignoring." );
//          System.out.println( "yOverlap = " + yOverlap );
//          System.out.println( "xOverlap = " + xOverlap );
//        }
//      }
//    }
//    else if ( xOverlap > 0 || yOverlap > 0 ) {
//      // There is overlap in one dimension but not the other, so test to
//      // see if the two containers are touching.
//      if ( xOverlap > 0 &&
//           Math.abs( this.bounds.maxY - that.bounds.minY ) < TOUCH_DISTANCE_THRESHOLD ||
//           Math.abs( this.bounds.minY - that.bounds.maxY ) < TOUCH_DISTANCE_THRESHOLD ) {
//        contactLength = xOverlap;
//      }
//      else if ( yOverlap > 0 &&
//                Math.abs( this.bounds.maxX - that.bounds.minX ) < TOUCH_DISTANCE_THRESHOLD ||
//                Math.abs( this.bounds.minX - that.bounds.maxX ) < TOUCH_DISTANCE_THRESHOLD ) {
//        contactLength = xOverlap;
//      }
//    }
//
//    return contactLength;
//  }
//
//  // Convenience method for determining overlap of rectangles in X dimension.
//  private double getHorizontalOverlap( Rectangle2D r1, Rectangle2D r2 ) {
//    double lowestMax = Math.min( r1.getMaxX(), r2.getMaxX() );
//    double highestMin = Math.max( r1.getMinX(), r2.getMinX() );
//    return Math.max( lowestMax - highestMin, 0 );
//  }
//
//  // Convenience method for determining overlap of rectangles in X dimension.
//  private double getVerticalOverlap( Rectangle2D r1, Rectangle2D r2 ) {
//    double lowestMax = Math.min( r1.getMaxY(), r2.getMaxY() );
//    double highestMin = Math.max( r1.getMinY(), r2.getMinY() );
//    return Math.max( lowestMax - highestMin, 0 );
//  }
//}
