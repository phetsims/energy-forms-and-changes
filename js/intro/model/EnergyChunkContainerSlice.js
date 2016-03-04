// Copyright 2014-2015, University of Colorado Boulder

/**
 * This class represents a "slice" within a 2D container that contains a set of energy chunks and can be used to add some limited 3D capabilities by
 * having some z-dimension information.  The slice consists of a 2D shape and a Z value representing its position in Z space.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Martin Veillette
 */

define( function( require ) {
  'use strict';

  //modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Matrix3 = require( 'DOT/Matrix3' );

  /**
   *
   * @param {Shape} shape
   * @param {Vector2} zPosition
   * @param {Property} anchorPointProperty a vector
   * @constructor
   */
  function EnergyChunkContainerSlice( shape, zPosition, anchorPointProperty ) {

    var thisContainerSlice = this;
    this.shape = shape;
    this.zPosition = zPosition;
    this.energyChunkList = new ObservableArray();

    // Monitor the anchor position and move the contained energy chunks to match.
    anchorPointProperty.link( function( newPosition, oldPosition ) {
      // null check for first set of position.
      if ( oldPosition !== null ) {
        // Translation vector is new position minus the old position.
        var translation = newPosition.minus( oldPosition );
        // TODO: Check this ported transform, Java code left in for now.
        thisContainerSlice.shape = thisContainerSlice.shape.transformed( Matrix3.translationFromVector( translation ) );
        //EnergyChunkContainerSlice.this.shape = AffineTransform.getTranslateInstance( translation.getX(), translation.getY() ).createTransformedShape( EnergyChunkContainerSlice.this.shape );
        thisContainerSlice.energyChunkList.forEach( function( energyChunk ) {
          energyChunk.translate( translation );
        } );
      }
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

