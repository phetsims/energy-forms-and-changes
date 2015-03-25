// Copyright 2002-2015, University of Colorado

/**
 * This class represents a "slice" within a 2D container that contains a set of
 * energy chunks and can be used to add some limited 3D capabilities by having
 * some z-dimension information.  The slice consists of a 2D shape and a Z
 * value representing its position in Z space.
 *
 * @author John Blanco
 */


define( function() {
  'use strict';

  //modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   *
   * @param {Shape} shape
   * @param {Vector2} zPosition
   * @param {Property} anchorPointProperty a vector
   * @constructor
   */
  function EnergyChunkContainerSlice( shape, zPosition, anchorPointProperty ) {
    var self = this;
    this.shape = shape;
    this.zPosition = zPosition;

    this.energyChunkList = new ObservableArray();

    // Monitor the anchor position and move the contained energy chunks to match.
    anchorPointProperty.lazyLink( function( newPosition, oldPosition ) {
      debugger;
      // TODO: there is something wrong here
      var translation = newPosition.minus( oldPosition );
      //TODO How to do this in javascript?
      self.shape = AffineTransform.getTranslateInstance( translation.x, translation.y ).createTransformedShape( this.shape );
      self.energyChunkList.forEach( function( energyChunk ) {
        energyChunk.translate( translation );
      } );
    } );
  }

  return inherit( Object, EnergyChunkContainerSlice, {

    /**
     * *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      energyChunk.zPosition = this.zPosition;
      this.energyChunkList.push( energyChunk );
    },

    /**
     * *
     * @returns {number}
     */
    getNumEnergyChunks: function() {
      return this.energyChunkList.length;
    },

    /**
     * *
     * @param {Shape} shape
     */
    setShape: function( shape ) {
      this.shape = shape;
    },

    /**
     * *
     * @returns {Shape}
     */
    getShape: function() {
      return this.shape;
    }
  } );
} );

