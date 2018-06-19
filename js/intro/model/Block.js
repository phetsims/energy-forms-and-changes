// Copyright 2014-2018, University of Colorado Boulder

/**
 * Abstract base type for a block that contains and exchanges thermal energy.  In the model, a block is two-dimensional,
 * so its shape is represented by a rectangle.
 *
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
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var Shape = require( 'KITE/Shape' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );

  // constants
  var NUM_ENERGY_CHUNK_SLICES = 4; // Number of slices where energy chunks may be placed.
  var MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.
  var BLOCK_PERSPECTIVE_EXTENSION = EFACConstants.BLOCK_SURFACE_WIDTH *
                                    EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION *
                                    Math.cos( EFACConstants.BLOCK_PERSPECTIVE_ANGLE ) / 2;

  /**
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

    // add position test bounds (see definition in base class for more info)
    this.relativePositionTestingBoundsList.push( new Bounds2(
      -EFACConstants.BLOCK_SURFACE_WIDTH / 2,
      0,
      EFACConstants.BLOCK_SURFACE_WIDTH / 2,
      EFACConstants.BLOCK_SURFACE_WIDTH
    ) );

    // update the top and bottom surfaces whenever the position changes
    this.positionProperty.link( function() {
      self.updateTopSurfaceProperty();
      self.updateBottomSurfaceProperty();
    } );

    // add perspective information, used for validating positions
    this.perspectiveCompensation.setXY( BLOCK_PERSPECTIVE_EXTENSION, BLOCK_PERSPECTIVE_EXTENSION );
  }

  energyFormsAndChanges.register( 'Block', Block );

  return inherit( RectangularThermalMovableModelElement, Block, {

    /**
     * @public
     * @return {string}
     */
    getColor: function() {
      assert && assert( false, 'This function should not be called, getColor() needs to be implemented in a subclass' );
      return 'pink';
    },
    get color() {
      return this.getColor();
    },

    /**
     * @public
     */
    getLabel: function() {
      assert && assert( false, 'Get label should be implemented in subclasses.' );
    },

    // TODO: I (jbphet) noticed a number of unused methods below during code cleanup, and should delete any that are still not used when code is fully cleaned up.

    /**
     * @return {Image|null}
     * @public
     */
    getFrontTextureImage: function() {
      return null;
    },

    /**
     * @return {Image|null}
     * @public
     */
    getTopTextureImage: function() {
      return null;
    },

    /**
     * @return {Image|null}
     * @public
     */
    getSideTextureImage: function() {
      return null;
    },

    /**
     * @returns {HorizontalSurface}
     * @public
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * @returns {HorizontalSurface}
     * @public
     */
    getBottomSurfaceProperty: function() {
      return this.bottomSurfaceProperty;
    },

    /**
     * @returns {ThermalContactArea}
     * @public
     */
    getThermalContactArea: function() {
      return new ThermalContactArea( this.getBounds(), false );
    },

    /**
     * @override
     */
    addEnergyChunkSlices: function() {

      // the slices for the block are intended to match the projection used in the view
      var projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      var sliceWidth = EFACConstants.BLOCK_SURFACE_WIDTH / (NUM_ENERGY_CHUNK_SLICES - 1 );
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
     * @returns {Dot.Rectangle} rectangle that defines this item's 2D shape
     * @public
     */
    getRect: function() {
      return new Rectangle(
        this.positionProperty.value.x - EFACConstants.BLOCK_SURFACE_WIDTH / 2,
        this.positionProperty.value.y,
        EFACConstants.BLOCK_SURFACE_WIDTH,
        EFACConstants.BLOCK_SURFACE_WIDTH  // height = width
      );
    },

    /**
     * Convenience function to get the rectangle bounds.  Outlining bounds are needed in multiple places throughout the
     * sim.
     * @returns {Bounds2}
     * @public
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
      this.topSurfaceProperty.set( new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.maxY, this ) );
    },

    /**
     * @private
     */
    updateBottomSurfaceProperty: function() {
      var rectangle = this.getBounds();
      this.bottomSurfaceProperty.set( new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.minY, this ) );
    },

    /**
     * @returns {Rectangle}
     * @public
     */
    getRawShape: function() {
      return new Rectangle(
        -EFACConstants.BLOCK_SURFACE_WIDTH / 2,
        0,
        EFACConstants.BLOCK_SURFACE_WIDTH,
        EFACConstants.BLOCK_SURFACE_WIDTH
      );
    },

    /**
     * @returns {number}
     * @override
     */
    getEnergyBeyondMaxTemperature: function() {
      return Math.max( this.energy - ( MAX_TEMPERATURE * this.mass * this.specificHeat ), 0 );
    }
  } );
} );