// Copyright 2014-2017, University of Colorado Boulder

/**
 * This class represents a "slice" within a 2D container that contains a set of
 * energy chunks and can be used to add some limited 3D capabilities by having
 * some z-dimension information.  The slice consists of a 2D shape and a Z value
 * representing its position in Z space.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Martin Veillette
 */

define( function( require ) {
  'use strict';

  //modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var ObservableArray = require( 'AXON/ObservableArray' );

  /**
   *
   * @param {Shape} shape
   * @param {number} zPosition - used to give appearance of depth
   * @param {Property.<Vector2>} anchorPointProperty
   * @constructor
   */
  function EnergyChunkContainerSlice( shape, zPosition, anchorPointProperty ) {

    var self = this;
    this.shape = shape;
    this.zPosition = zPosition;
    this.energyChunkList = new ObservableArray();

    // Monitor the anchor position and move the contained energy chunks to match.
    anchorPointProperty.lazyLink( function( newPosition, oldPosition ) {
      var translation = newPosition.minus( oldPosition );

      self.shape = self.shape.transformed( Matrix3.translationFromVector( translation ) );

      self.energyChunkList.forEach( function( energyChunk ) {
        energyChunk.translate( translation );
      } );
    } );
  }

  energyFormsAndChanges.register( 'EnergyChunkContainerSlice', EnergyChunkContainerSlice );

  return inherit( Object, EnergyChunkContainerSlice, {

    /**
     * *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      energyChunk.zPositionProperty.set( this.zPosition );
      this.energyChunkList.push( energyChunk );
    },

    /**
     * *
     * @returns {number}
     */
    getNumEnergyChunks: function() {
      return this.energyChunkList.length;
    }

  } );
} );

