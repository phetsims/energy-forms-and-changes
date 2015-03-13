//  Copyright 2002-2015, University of Colorado Boulder

/**
 * Class that represents a block in the model.  In the model, a block is two-
 * dimensional, so its shape is represented by a rectangle.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkContainerSlice' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );

  // constants
  var SURFACE_WIDTH = 0.045; // In meters
  var NUM_ENERGY_CHUNK_SLICES = 4;  // Number of slices where energy chunks may be placed.
  var MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.

  /**
   *
   * @param {Vector2} initialPosition
   * @param {number} density
   * @param {number} specificHeat
   * @param {Property} energyChunksVisibleProperty
   * @constructor
   */
  function Block( initialPosition, density, specificHeat, energyChunksVisibleProperty ) {
    RectangularThermalMovableModelElement.call( this, initialPosition, SURFACE_WIDTH, SURFACE_WIDTH, Math.pow( SURFACE_WIDTH, 3 ) * density, specificHeat, energyChunksVisibleProperty );

    var block = this;

    // Update the top and bottom surfaces whenever the position changes.
    this.positionProperty.link( function() {
      block.updateTopSurfaceProperty();
      block.updateBottomSurfaceProperty();
    } );
  }

  return inherit( RectangularThermalMovableModelElement, Block, {
    // TODO: ask about getcolor and abstract class
    getColor: function() {
      assert && assert( true, 'This function should not be called, getColor() needs to be implemented in a subclass' );
      return 'pink';
    },

    getFrontTextureImage: function() {
      return null;
    },

    getTopTextureImage: function() {
      return null;
    },

    getSideTextureImage: function() {
      return null;
    },

    /**
     * *
     * @returns {HorizontalSurface}
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * *
     * @returns {HorizontalSurface}
     */
    getBottomSurfaceProperty: function() {
      return this.bottomSurfaceProperty;
    },

    /**
     * *
     * @returns {ThermalContactArea}
     */
    getThermalContactArea: function() {
      return new ThermalContactArea( this.getRect(), false );
    },

    /**
     * *
     */
    addEnergyChunkSlices: function() {
      // The slices for the block are intended to match the projection used in the view.
      var projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( this, SURFACE_WIDTH / 2 );
      var i;
      for ( i = 0; i < NUM_ENERGY_CHUNK_SLICES; i++ ) {
        var projectionOffsetVector = EFACConstants.MAP_Z_TO_XY_OFFSET.apply( this, i * ( -SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 ) ) );

        var transform = new Matrix3.translation( projectionToFront.getX() + projectionOffsetVector.getX(),
          projectionToFront.getY() + projectionOffsetVector.getY() );
        this.slices.push( new EnergyChunkContainerSlice( this.getRect().transformed( transform ), -i * ( SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 ) ), this.position ) );
      }
    },

    /**
     * *
     * @returns {Rectangle}
     */
    getRect: function() {
      return new Rectangle( this.position.x - SURFACE_WIDTH / 2,
        this.position.y,
        SURFACE_WIDTH,
        SURFACE_WIDTH );
    },

    /**
     * @private
     */
    updateTopSurfaceProperty: function() {
      var rectangle = this.getRect();
      this.topSurfaceProperty.set( new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.maxY, this ) );
    },

    /**
     * @private
     */
    updateBottomSurfaceProperty: function() {
      var rectangle = this.getRect();
      this.bottomSurfaceProperty.set( new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.minY, this ) );
    },

    /**
     * *
     * @returns {Rectangle}
     */
    getRawShape: function() {
      return new Rectangle( -SURFACE_WIDTH / 2, 0, SURFACE_WIDTH, SURFACE_WIDTH );
    },

    /**
     * *
     * @returns {number}
     */
    getEnergyBeyondMaxTemperature: function() {
      return Math.max( this.energy - ( MAX_TEMPERATURE * this.mass * this.specificHeat ), 0 );
    }
  } );

} );

