// Copyright 2014-2018, University of Colorado Boulder


/**
 * A simple, level horizontal surface in a 2D model space.  This is represented by a range of x values and a single y
 * value.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Range} xRange
   * @param {number} yPos
   * @param {ModelElement} owner
   * @constructor
   */
  function HorizontalSurface( xRange, yPos, owner ) {

    // @public (read-only) {number}
    this.yPos = yPos;

    // @public (read-only) {Range}
    this.xRange = xRange;

    // TODO: Consider having the code directly access these values rather than using getter/setter methods once port is nearly complete.
    // @private - this should be accessed through getter/setter methods
    this.owner = owner;
    this.elementOnSurface = null;
  }

  energyFormsAndChanges.register( 'HorizontalSurface', HorizontalSurface );

  return inherit( Object, HorizontalSurface, {

    /**
     * @param {HorizontalSurface} surface
     * @returns {boolean}
     * @public
     */
    overlapsWith: function( surface ) {
      return ( this.xRange.intersectsExclusive( surface.xRange ) );
    },

    /**
     * @returns {number}
     * @public
     */
    getCenterX: function() {
      return this.xRange.getCenter();
    },

    /**
     * @returns {ModelElement}
     * @public read-only
     */
    getOwner: function() {
      return this.owner;
    },

    /**
     * @returns {ModelElement}
     * @public
     */
    getElementOnSurface: function() {
      return this.elementOnSurface;
    },

    /**
     * @param {ModelElement} modelElement
     * @public
     */
    addElementToSurface: function( modelElement ) {
      assert && assert( this.elementOnSurface === null, 'Only one thing on surface allowed at a time' );
      assert && assert( modelElement !== this.owner, 'an element cannot sit upon its own surface' );
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

