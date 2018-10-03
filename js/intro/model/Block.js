// Copyright 2014-2018, University of Colorado Boulder

/**
 * Abstract base type for a block that contains and exchanges thermal energy.  In the model, a block is two-dimensional,
 * so its shape is represented by a rectangle.
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */
define( function( require ) {
  'use strict';

  // modules
  var BlockType = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BlockType' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var Shape = require( 'KITE/Shape' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var NUM_ENERGY_CHUNK_SLICES = 4; // Number of slices where energy chunks may be placed.
  var MAX_TEMPERATURE = 450; // Degrees Kelvin, value is pretty much arbitrary. Whatever works.
  var BLOCK_PERSPECTIVE_EXTENSION = EFACConstants.BLOCK_SURFACE_WIDTH *
                                    EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION *
                                    Math.cos( EFACConstants.BLOCK_PERSPECTIVE_ANGLE ) / 2;

  var BLOCK_COMPOSITION = {};
  BLOCK_COMPOSITION[ BlockType.IRON ] = {
    color: new Color( 150, 150, 150 ),
    density: 7800,
    specificHeat: 450,
    energyContainerCategory: EnergyContainerCategory.IRON
  };
  BLOCK_COMPOSITION[ BlockType.BRICK ] = {
    color: new Color( 223, 22, 12 ),
    density: 3300,
    specificHeat: 840,
    energyContainerCategory: EnergyContainerCategory.BRICK
  };

  /**
   * @param {Vector2} initialPosition
   * @param {Property} energyChunksVisibleProperty
   * @param {BlockType} blockType
   * @constructor
   */
  function Block( initialPosition, energyChunksVisibleProperty, blockType ) {

    RectangularThermalMovableModelElement.call(
      this,
      initialPosition,
      EFACConstants.BLOCK_SURFACE_WIDTH,
      EFACConstants.BLOCK_SURFACE_WIDTH,
      Math.pow( EFACConstants.BLOCK_SURFACE_WIDTH, 3 ) * BLOCK_COMPOSITION[ blockType ].density,
      BLOCK_COMPOSITION[ blockType ].specificHeat,
      energyChunksVisibleProperty
    );

    var self = this;

    // @public
    this.blockType = blockType;

    // add position test bounds (see definition in base class for more info)
    this.relativePositionTestingBoundsList.push( new Bounds2(
      -EFACConstants.BLOCK_SURFACE_WIDTH / 2,
      0,
      EFACConstants.BLOCK_SURFACE_WIDTH / 2,
      EFACConstants.BLOCK_SURFACE_WIDTH
    ) );
    var rectangle = this.getBounds();

    // @public - see base class for description
    this.topSurface = new HorizontalSurface(
      new Vector2( initialPosition.x, rectangle.maxY ),
      EFACConstants.BLOCK_SURFACE_WIDTH,
      this
    );

    // @public - see base class for description
    this.bottomSurface = new HorizontalSurface(
      new Vector2( initialPosition.x, rectangle.minY ),
      EFACConstants.BLOCK_SURFACE_WIDTH,
      this
    );

    // update the top and bottom surfaces whenever the position changes
    this.positionProperty.link( function( position ) {
      var rectangle = self.getBounds();
      self.topSurface.positionProperty.value = new Vector2( position.x, rectangle.maxY );
      self.bottomSurface.positionProperty.value = new Vector2( position.x, rectangle.minY );
    } );

    // add perspective information, used for validating positions
    this.perspectiveCompensation.setXY( BLOCK_PERSPECTIVE_EXTENSION, BLOCK_PERSPECTIVE_EXTENSION );
  }

  energyFormsAndChanges.register( 'Block', Block );

  return inherit( RectangularThermalMovableModelElement, Block, {

    /**
     * @public
     * @return {Color}
     */
    get color() {
      return BLOCK_COMPOSITION[ this.blockType ].color;
    },

    /**
     * @public
     * @return {EnergyContainerCategory}
     */
    get energyContainerCategory() {
      return BLOCK_COMPOSITION[ this.blockType ].energyContainerCategory;
    },

    // TODO: I (jbphet) noticed a number of unused methods below during code cleanup, and should delete any that are still not used when code is fully cleaned up.

    /**
     * @returns {ThermalContactArea}
     * @public
     */
    get thermalContactArea() {
      return new ThermalContactArea( this.getBounds(), false );
    },

    /**
     * @override
     */
    addEnergyChunkSlices: function() {

      // the slices for the block are intended to match the projection used in the view
      var projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      var sliceWidth = EFACConstants.BLOCK_SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 );
      var rect = this.rect;
      var rectShape = Shape.rect( rect.x, rect.y, rect.width, rect.height );

      for ( var i = 0; i < NUM_ENERGY_CHUNK_SLICES; i++ ) {
        var projectionOffsetVector = EFACConstants.MAP_Z_TO_XY_OFFSET( -i * sliceWidth );

        var transform = Matrix3.translation( projectionToFront.x + projectionOffsetVector.x,
          projectionToFront.y + projectionOffsetVector.y );

        this.slices.push( new EnergyChunkContainerSlice(
          rectShape.transformed( transform ),
          -i * sliceWidth,
          this.positionProperty
        ) );
      }
    },

    /**
     * Get a rectangle the defines the current shape in model space.  By convention for this simulation, the position
     * is the middle of the bottom of the block's defining rectangle.
     * @returns {Dot.Rectangle} rectangle that defines this item's 2D shape
     * @public
     */
    get rect() {
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
      var rect = this.rect;
      return new Bounds2( rect.x, rect.y, rect.x + rect.width, rect.y + rect.height );
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
    }
    ,

    /**
     * @returns {number}
     * @override
     */
    getEnergyBeyondMaxTemperature: function() {
      return Math.max( this.energy - ( MAX_TEMPERATURE * this.mass * this.specificHeat ), 0 );
    }
  } )
    ;
} );