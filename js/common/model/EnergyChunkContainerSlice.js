// Copyright 2014-2018, University of Colorado Boulder

/**
 * This class represents a "slice" within a 2D container that can contain a set of energy chunks, and can be used to add
 * some limited 3D capabilities by having some z-dimension information.  The slice consists of a 2D shape and a Z value
 * representing its position in Z space.
 *
 * Note to maintainers: In the original Java of this simulation, these slices where shapes that could be more elaborate
 * than a simple rectangle.  Translating these shapes proved to be a performance problem in the JavaScript version, so
 * the shapes were simplified to be bounds.  This is not quite as nice in doing things like distributing the energy
 * chunks in the beaker, but works well enough, and performs far better.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Martin Veillette
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Bounds2} bounds
   * @param {number} zPosition - used to give appearance of depth
   * @param {Property.<Vector2>} anchorPointProperty
   * @constructor
   */
  function EnergyChunkContainerSlice( bounds, zPosition, anchorPointProperty ) {

    var self = this;

    // @public {Property.<Vector2>} - position of this slice in model space
    this.anchorPointProperty = anchorPointProperty;

    // @public (read-only) {Bounds2} - 2D bounds of this slice in model space, translates with the anchor point
    this.bounds = bounds;

    // @private {number}
    this.zPosition = zPosition;

    // @private {ObservableArray.<EnergyChunk>} - list of energy chunks owned by this slice
    this.energyChunkList = new ObservableArray();

    var reusableTranslationVector = new Vector2();

    // monitor the "anchor point" position in order to update the bounds and move contained energy chunks
    this.anchorPointProperty.lazyLink( function( newPosition, oldPosition ) {

      reusableTranslationVector.setXY( newPosition.x - oldPosition.x, newPosition.y - oldPosition.y );

      self.bounds.shift( reusableTranslationVector.x, reusableTranslationVector.y );

      self.energyChunkList.forEach( function( energyChunk ) {
        energyChunk.translate( reusableTranslationVector );
      } );
    } );
  }

  energyFormsAndChanges.register( 'EnergyChunkContainerSlice', EnergyChunkContainerSlice );

  return inherit( Object, EnergyChunkContainerSlice, {

    /**
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunk: function( energyChunk ) {
      energyChunk.zPositionProperty.set( this.zPosition );
      this.energyChunkList.push( energyChunk );
    },

    /**
     * expand or contract the bounds of this slice in the y-direction based on the provided multiplier value
     * @param {number} multiplier
     * @public
     */
    updateHeight: function( multiplier ) {
      this.bounds.maxY = this.bounds.minY + this.bounds.height * multiplier;
    },

    /**
     * @returns {number}
     * @public
     */
    getNumEnergyChunks: function() {
      return this.energyChunkList.length;
    }

  } );
} );

