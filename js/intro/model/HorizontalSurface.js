// Copyright 2002-2015, University of Colorado Boulder


/**
 * A simple horizontal surface.  This is represented by a range of x values
 * and a single y value.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Range} xRange
   * @param {number} yPos
   * @param {ModelElement} owner
   * @constructor
   */
  function HorizontalSurface( xRange, yPos, owner ) {

    this.xRange = xRange; // {Range}
    this.yPos = yPos; // {number}
    this.owner = owner; // @private {ModelElement}
    this.elementOnSurface = null; // {ModelElement}
  }

  return inherit( Object, HorizontalSurface, {

    /**
     * @public
     * @param {HorizontalSurface} surface
     * @returns {boolean}
     */
    overlapsWith: function( surface ) {
      return ( this.xRange.intersectsExclusive( surface.xRange ) );
    },

    /**
     * @public read-only
     * @returns {number}
     */
    getCenterX: function() {
      return this.xRange.getCenter();
    },

    /**
     * @public read-only
     * @returns {ModelElement}
     */
    getOwner: function() {
      return this.owner;
    },

    /**
     * @public read-only
     * @returns {ModelElement}
     */
    getElementOnSurface: function() {
      return this.elementOnSurface;
    },

    /**
     * @public
     * @param {ModelElement} modelElement
     */
    addElementToSurface: function( modelElement ) {
      assert && assert( this.elementOnSurface === null, 'Only one thing on surface allowed at a time' );
      this.elementOnSurface = modelElement;
    },

    /**
     * @public
     */
    clearSurface: function() {
      this.elementOnSurface = null;
    }

  } );
} );

