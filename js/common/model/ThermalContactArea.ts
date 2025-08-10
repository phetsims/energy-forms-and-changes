// Copyright 2014-2020, University of Colorado Boulder

/**
 * A type that represents a 2D space that can come into contact with other thermal areas, leading to the exchange of
 * thermal energy. This is basically just a shape and a flag that indicates whether or not immersion can occur.
 *
 * @author John Blanco
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// threshold of distance for determining whether two areas are in contact
const TOUCH_DISTANCE_THRESHOLD = 0.001; // in meters

class ThermalContactArea extends Bounds2 {

  /**
   * @param {Bounds2} bounds
   * @param {boolean} supportsImmersion
   * @public
   */
  constructor( bounds, supportsImmersion ) {
    super( bounds.minX, bounds.minY, bounds.maxX, bounds.maxY );
    this.supportsImmersion = supportsImmersion;
  }

  /**
   * Get the amount of thermal contact that exists between this and another thermal area.  Since thermal contact
   * areas are 2D, the amount of contact is a 1D quantity.  For example, when a rectangle is sitting on top of
   * another that is the same width, the contact length is the width of the shared edge.
   * @param {ThermalContactArea} that -  other thermal contact area
   * @returns {number} - length of contact
   * @public
   */
  getThermalContactLength( that ) {

    const xOverlap = getHorizontalOverlap( this, that );
    const yOverlap = getVerticalOverlap( this, that );

    let contactLength = 0;
    if ( xOverlap > 0 && yOverlap > 0 ) {

      // One of the areas is overlapping another.  This should be an 'immersion' situation, i.e. one is all or
      // partially immersed in the other.
      if ( this.supportsImmersion || that.supportsImmersion ) {
        const immersionRect = this.intersection( that );
        contactLength = immersionRect.width * 2 + immersionRect.height * 2;
        if ( immersionRect.width !== this.width && immersionRect.width !== that.width ) {

          // not fully overlapping in X direction, so adjust contact length accordingly
          contactLength -= immersionRect.height;
        }
        if ( immersionRect.height !== this.height && immersionRect.height !== that.height ) {
          // not fully overlapping in Y direction, so adjust contact length accordingly
          contactLength -= immersionRect.width;
        }
      }
      else {

        // This shouldn't occur, but in practice it sometimes does due to floating point tolerances.  Print out an
        // error if a threshold is exceeded so that we can know that the value needs adjusting.  The threshold value
        // was determined by testing.
        // if ( yOverlap > 1E-6 && xOverlap > 1E-6 ) {
        //   console.warn( 'Double overlap detected in case where neither energy container supports immersion.  Ignoring.' );
        //   console.warn( 'yOverlap = ' + yOverlap );
        //   console.warn( 'xOverlap = ' + xOverlap );
        // }
      }
    }
    else if ( xOverlap > 0 || yOverlap > 0 ) {

      // there is overlap in one dimension but not the other, so test to see if the two containers are touching
      if ( xOverlap > 0 &&
           Math.abs( this.maxY - that.minY ) < TOUCH_DISTANCE_THRESHOLD ||
           Math.abs( this.minY - that.maxY ) < TOUCH_DISTANCE_THRESHOLD ) {
        contactLength = xOverlap;
      }
      else if ( yOverlap > 0 &&
                Math.abs( this.maxX - that.minX ) < TOUCH_DISTANCE_THRESHOLD ||
                Math.abs( this.minX - that.maxX ) < TOUCH_DISTANCE_THRESHOLD ) {
        contactLength = xOverlap;
      }
    }

    return contactLength;
  }
}

/**
 * convenience method for determining overlap of rectangles in X dimension
 * @param {Rectangle} rectangle1
 * @param {Rectangle} rectangle2
 * @returns {number}
 */
const getHorizontalOverlap = ( rectangle1, rectangle2 ) => {
  const lowestMax = Math.min( rectangle1.maxX, rectangle2.maxX );
  const highestMin = Math.max( rectangle1.minX, rectangle2.minX );
  return Math.max( lowestMax - highestMin, 0 );
};

/**
 * convenience method for determining overlap of rectangles in Y dimension
 * @param {Rectangle} rectangle1
 * @param {Rectangle} rectangle2
 * @returns {number}
 */
const getVerticalOverlap = ( rectangle1, rectangle2 ) => {
  const lowestMax = Math.min( rectangle1.maxY, rectangle2.maxY );
  const highestMin = Math.max( rectangle1.minY, rectangle2.minY );
  return Math.max( lowestMax - highestMin, 0 );
};

energyFormsAndChanges.register( 'ThermalContactArea', ThermalContactArea );
export default ThermalContactArea;