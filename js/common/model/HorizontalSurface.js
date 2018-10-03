// Copyright 2014-2018, University of Colorado Boulder


/**
 * A simple, level horizontal surface in a 2D model space.  This is represented by a range of x values and a single y
 * value.  The best way to thing of this is that it is much like a Vector2 in that it represents a small piece of
 * information that is generally immutable and is often wrapped in a Property.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );

  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {ModelElement} owner
   * @param {ModelElement} [elementOnSurface]
   * @constructor
   */
  function HorizontalSurface( initialPosition, width, owner, elementOnSurface ) {
    var self = this;

    // @public {Property.<Vector2>}
    this.positionProperty = new Property( initialPosition );

    // @public (read-only) {number}
    this.width = width;

    // @public (read-only) {Range}
    this.xRange = new Range( initialPosition.x - this.width / 2, initialPosition.x + this.width / 2 );
    this.positionProperty.link( function( position ) {
      self.xRange.setMinMax( position.x - self.width / 2, position.x + self.width / 2 );
    } );

    // TODO: Consider having the code directly access these values rather than using getter/setter methods once port is nearly complete.
    // @private - this should be accessed through getter/setter methods
    this.owner = owner;
    this.elementOnSurface = typeof elementOnSurface === 'undefined' ? null : elementOnSurface;
  }

  energyFormsAndChanges.register( 'HorizontalSurface', HorizontalSurface );

  return inherit( Object, HorizontalSurface, {

    /**
     * @param {HorizontalSurface} surface
     * @returns {boolean}
     * @public
     */
    overlapsWith: function( surface ) {
      // if used when the position of a surface is changing (which is probably the only use case), the accuracy of this
      // could be questionable because xRange is set on link to this surface's position property. as of the writing of
      // this comment, this function was no longer needed and is not being used anywhere in efac.
      return ( this.xRange.intersectsExclusive( surface.xRange ) );
    },

    /**
     * @returns {number}
     * @public
     */
    getCenterX: function() {
      return this.positionProperty.value.x;
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
      // TODO: The commented out assertion is helpful when element interaction is being developed, but breaks fuzz
      // testing when enabled because weird cases are reached. @jbphet and @chrisklus are happy with how things are
      // performing in the wild, so the assertion has been removed to stop breaking continuous testing.
      // assert && assert( this.elementOnSurface === null, 'Only one thing on surface allowed at a time' );
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

