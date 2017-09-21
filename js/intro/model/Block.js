// Copyright 2014-2017, University of Colorado Boulder

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
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var Shape = require( 'KITE/Shape' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );

  // constants
  var NUM_ENERGY_CHUNK_SLICES = 4; // Number of slices where energy chunks may be placed.
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
    RectangularThermalMovableModelElement.call(
      this,
      initialPosition,
      EFACConstants.BLOCK_SURFACE_WIDTH,
      EFACConstants.BLOCK_SURFACE_WIDTH,
      Math.pow( EFACConstants.BLOCK_SURFACE_WIDTH, 3 ) * density,
      specificHeat,
      energyChunksVisibleProperty
    );

    var self = this;

    this.initialBounds = this.getBounds();

    // Update the top and bottom surfaces whenever the position changes.
    this.positionProperty.link( function() {
      self.updateTopSurfaceProperty();
      self.updateBottomSurfaceProperty();
    } );
  }

  energyFormsAndChanges.register( 'Block', Block );

  return inherit( RectangularThermalMovableModelElement, Block, {

    getColor: function() {
      assert && assert( false, 'This function should not be called, getColor() needs to be implemented in a subclass' );
      return 'pink';
    },

    getLabel: function() {
      assert && assert( false, 'Get label should be implemented in subclasses.' );
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
     * @returns {HorizontalSurface}
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * @returns {HorizontalSurface}
     */
    getBottomSurfaceProperty: function() {
      return this.bottomSurfaceProperty;
    },

    /**
     * @returns {ThermalContactArea}
     */
    getThermalContactArea: function() {
      return new ThermalContactArea( this.getBounds(), false );
    },

    addEnergyChunkSlices: function() {

      // The slices for the block are intended to match the projection used in the view.
      var projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      var sliceWidth = EFACConstants.BLOCK_SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 );
      var rect = this.getRect();
      var rectShape = Shape.rect( rect.x, rect.y, rect.width, rect.height );

      for ( var i = 0; i < NUM_ENERGY_CHUNK_SLICES; i++ ) {
        var projectionOffsetVector = EFACConstants.MAP_Z_TO_XY_OFFSET( -i * sliceWidth );

        var transform = Matrix3.translation( projectionToFront.x + projectionOffsetVector.x,
          projectionToFront.y + projectionOffsetVector.y );

        this.slices.push( new EnergyChunkContainerSlice( rectShape.transformed( transform ), -i * sliceWidth,
          this.positionProperty ) );
      }
    },

    /**
     * Get a rectangle the defines the current shape in model space.  By convention for this simulation, the position
     * is the middle of the bottom of the block's defining rectangle.
     *
     * @returns {Dot.Rectangle} rectangle that defines this item's 2D shape
     */
    getRect: function() {
      return new Rectangle(
        this.positionProperty.value.x - EFACConstants.BLOCK_SURFACE_WIDTH / 2,
        this.positionProperty.value.y,
        EFACConstants.BLOCK_SURFACE_WIDTH,
        EFACConstants.BLOCK_SURFACE_WIDTH ); // Height = width
    },

    /**
     * Convenience function to get the rectangle bounds.  Outlining bounds are needed in multiple places throughout the
     * sim.
     *
     * @returns {Bounds2}
     */
    getBounds: function() {
      var rect = this.getRect();
      return new Bounds2( rect.x, rect.y, rect.x + rect.width, rect.y + rect.height );
    },

    /**
     * @private
     */
    updateTopSurfaceProperty: function() {
      var rectangle = this.getBounds();
      this.topSurfaceProperty.set( new HorizontalSurface( new RangeWithValue( rectangle.minX, rectangle.maxX ), rectangle.maxY, this ) );
    },

    /**
     * @private
     */
    updateBottomSurfaceProperty: function() {
      var rectangle = this.getBounds();
      this.bottomSurfaceProperty.set( new HorizontalSurface( new RangeWithValue( rectangle.minX, rectangle.maxX ), rectangle.minY, this ) );
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