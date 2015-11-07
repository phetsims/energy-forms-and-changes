// Copyright 2014-2015, University of Colorado Boulder

/**
 * Class that represents a block in the model.  In the model, a block is two-
 * dimensional, so its shape is represented by a rectangle.
 *
 * TODO: Some functions in this model object could use documentation.
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
  var Shape = require( 'KITE/Shape' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );

  // constants
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
    RectangularThermalMovableModelElement.call( this, initialPosition, EFACConstants.BLOCK_SURFACE_WIDTH, EFACConstants.BLOCK_SURFACE_WIDTH, Math.pow( EFACConstants.BLOCK_SURFACE_WIDTH, 3 ) * density, specificHeat, energyChunksVisibleProperty );

    var thisBlock = this;

    // Update the top and bottom surfaces whenever the position changes.
    this.positionProperty.link( function() {
      //console.log( 'block position changing' );
      thisBlock.updateTopSurfaceProperty();
      thisBlock.updateBottomSurfaceProperty();
    } );
  }

  return inherit( RectangularThermalMovableModelElement, Block, {
    // TODO: ask about getcolor and abstract class
    getColor: function() {
      assert && assert( true, 'This function should not be called, getColor() needs to be implemented in a subclass' );
      return 'pink';
    },

    getLabel: function() {
      assert && assert( true, 'Get label should be implemented in subclasses.' );
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
      return new ThermalContactArea( this.getRectangleBounds(), false );
    },

    /**
     * *
     */
    addEnergyChunkSlices: function() {
      // The slices for the block are intended to match the projection used in the view.
      var projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      for ( var i = 0; i < NUM_ENERGY_CHUNK_SLICES; i++ ) {
        var projectionOffsetVector = EFACConstants.MAP_Z_TO_XY_OFFSET( i * ( -EFACConstants.BLOCK_SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 ) ) );

        var transform = Matrix3.translation( projectionToFront.x + projectionOffsetVector.x, projectionToFront.y + projectionOffsetVector.y );
        this.slices.push( new EnergyChunkContainerSlice(
          this.getRectangleShape().transformed( transform ),
          -i * ( EFACConstants.BLOCK_SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 ) ),
          this.positionProperty ) );
      }
    },

    /**
     * Get a rectangle the defines the current shape in model space.  By convention for this simulation, the position
     * is the middle of the bottom of the block's defining rectangle.
     *
     * @return {Shape} rectangle that defines this item's 2D shape
     */
    getRectangleShape: function() {
      return Shape.rectangle( this.position.x - EFACConstants.BLOCK_SURFACE_WIDTH / 2,
        this.position.y,
        EFACConstants.BLOCK_SURFACE_WIDTH,
        EFACConstants.BLOCK_SURFACE_WIDTH );
    },

    /**
     * Convenience function to get the rectangle bounds.  Outlining bounds are needed in multiple places throughout the
     * sim.
     *
     * @returns {Bounds2}
     */
    getRectangleBounds: function() {
      return this.getRectangleShape().bounds;
    },

    /**
     * @private
     */
    updateTopSurfaceProperty: function() {
      var rectangle = this.getRectangleBounds();
      this.topSurfaceProperty.set( new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.maxY, this ) );
    },

    /**
     * @private
     */
    updateBottomSurfaceProperty: function() {
      var rectangle = this.getRectangleBounds();
      this.bottomSurfaceProperty.set( new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.minY, this ) );
    },

    /**
     * *
     * @returns {Rectangle}
     */
    getRawShape: function() {
      return new Rectangle( -EFACConstants.BLOCK_SURFACE_WIDTH / 2, 0, EFACConstants.BLOCK_SURFACE_WIDTH, EFACConstants.BLOCK_SURFACE_WIDTH );
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

