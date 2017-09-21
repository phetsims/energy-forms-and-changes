// Copyright 2014-2017, University of Colorado Boulder

/**
 * Class that represents a 2D space that can come into contact with other thermal areas.  This is basically just a
 * shape and a flag that indicates whether immersion can occur
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  // Threshold of distance for determining whether two areas are in contact.
  var TOUCH_DISTANCE_THRESHOLD = 0.001; // In meters.

  /**
   *  Constructor for a ThermalContactArea.
   *
   * @param {Bounds2} bounds
   * @param {boolean} supportsImmersion
   * @constructor
   */
  function ThermalContactArea( bounds, supportsImmersion ) {

    Bounds2.call( this, bounds.minX, bounds.minY, bounds.maxX, bounds.maxY );
    this.supportsImmersion = supportsImmersion;

  }

  energyFormsAndChanges.register( 'ThermalContactArea', ThermalContactArea );

  return inherit( Bounds2, ThermalContactArea, {

    /**
     * Get the amount of thermal contact that exists between this and another thermal area.  Since thermal contact
     * areas are 2D, the amount of contact is a 1D quantity.  For example, when a rectangle is sitting on top of
     * another that is the same width, the contact length is the width of the shared edge.
     *
     * @param {ThermalContactArea} that -  Other thermal contact area.
     * @returns {number} Length of contact
     */
    getThermalContactLength: function( that ) {

      var xOverlap = this.getHorizontalOverlap( this, that );
      var yOverlap = this.getVerticalOverlap( this, that );

      var contactLength = 0;
      if ( xOverlap > 0 && yOverlap > 0 ) {
        // One of the areas is overlapping another.  This should be an 'immersion' situation, i.e. one is all or
        // partially immersed in the other.
        if ( this.supportsImmersion || that.supportsImmersion ) {
          var immersionRect = this.intersection( that );
          contactLength = immersionRect.width * 2 + immersionRect.height * 2;
          if ( immersionRect.width !== this.width && immersionRect.width !== that.width ) {
            // Not fully overlapping in X direction, so adjust contact length accordingly.
            contactLength -= immersionRect.height;
          }
          if ( immersionRect.height !== this.height && immersionRect.height !== that.height ) {
            // Not fully overlapping in Y direction, so adjust contact length accordingly.
            contactLength -= immersionRect.width;
          }
        } else {
          // This shouldn't occur, but it practice it sometimes does due to floating point tolerances.  Print out an
          // error if a threshold is exceeded.  The threshold value was determined by testing.
          if ( yOverlap > 1E-6 && xOverlap > 1E-6 ) {
            console.log( ' - Error: Double overlap detected in case where neither energy container supports immersion.  Ignoring.' );
            console.log( 'yOverlap = ' + yOverlap );
            console.log( 'xOverlap = ' + xOverlap );
          }
        }
      } else if ( xOverlap > 0 || yOverlap > 0 ) {
        // There is overlap in one dimension but not the other, so test to see if the two containers are touching.
        if ( xOverlap > 0 &&
          Math.abs( this.maxY - that.minY ) < TOUCH_DISTANCE_THRESHOLD ||
          Math.abs( this.minY - that.maxY ) < TOUCH_DISTANCE_THRESHOLD ) {
          contactLength = xOverlap;
        } else if ( yOverlap > 0 &&
          Math.abs( this.maxX - that.minX ) < TOUCH_DISTANCE_THRESHOLD ||
          Math.abs( this.minX - that.maxX ) < TOUCH_DISTANCE_THRESHOLD ) {
          contactLength = xOverlap;
        }
      }

      return contactLength;
    },

    /**
     * Convenience method for determining overlap of rectangles in X dimension.
     *
     * @param {Rectangle} rectangle1
     * @param {Rectangle} rectangle2
     * @returns {number}
     */
    getHorizontalOverlap: function( rectangle1, rectangle2 ) {
      var lowestMax = Math.min( rectangle1.maxX, rectangle2.maxX );
      var highestMin = Math.max( rectangle1.minX, rectangle2.minX );
      return Math.max( lowestMax - highestMin, 0 );
    },

    /**
     * Convenience method for determining overlap of rectangles in Y dimension.
     *
     * @param {Rectangle} rectangle1
     * @param {Rectangle} rectangle2
     * @returns {number}
     */
    getVerticalOverlap: function( rectangle1, rectangle2 ) {
      var lowestMax = Math.min( rectangle1.maxY, rectangle2.maxY );
      var highestMin = Math.max( rectangle1.minY, rectangle2.minY );
      return Math.max( lowestMax - highestMin, 0 );
    }
  } );

} );

