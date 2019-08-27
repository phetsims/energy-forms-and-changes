// Copyright 2014-2019, University of Colorado Boulder

/**
 * Block that contains and exchanges thermal energy.  In the model, a block is two-dimensional, so its shape is
 * represented by a rectangle.
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  const BlockType = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BlockType' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const Color = require( 'SCENERY/util/Color' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  const EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyContainerCategory' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  const RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/RectangularThermalMovableModelElement' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const NUM_ENERGY_CHUNK_SLICES = 4; // Number of slices where energy chunks may be placed.
  const MAX_TEMPERATURE = 620; // in degrees Kelvin, see usage below for where the value comes from
  const BLOCK_PERSPECTIVE_EXTENSION = EFACConstants.BLOCK_SURFACE_WIDTH *
                                      EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION *
                                      Math.cos( EFACConstants.BLOCK_PERSPECTIVE_ANGLE ) / 2;

  const BLOCK_COMPOSITION = {};
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

  // static data
  let instanceCount = 0; // counter for creating unique IDs

  class Block extends RectangularThermalMovableModelElement {

    /**
     * @param {Vector2} initialPosition
     * @param {Property} energyChunksVisibleProperty
     * @param {BlockType} blockType
     */
    constructor( initialPosition, energyChunksVisibleProperty, blockType ) {

      super(
        initialPosition,
        EFACConstants.BLOCK_SURFACE_WIDTH,
        EFACConstants.BLOCK_SURFACE_WIDTH,
        Math.pow( EFACConstants.BLOCK_SURFACE_WIDTH, 3 ) * BLOCK_COMPOSITION[ blockType ].density,
        BLOCK_COMPOSITION[ blockType ].specificHeat,
        energyChunksVisibleProperty
      );

      // @public (read-only) {String} - unique ID for this block
      this.id = `block-${instanceCount++}`;

      // @public
      this.blockType = blockType;

      // add position test bounds (see definition in base class for more info)
      this.relativePositionTestingBoundsList.push( new Bounds2(
        -EFACConstants.BLOCK_SURFACE_WIDTH / 2,
        0,
        EFACConstants.BLOCK_SURFACE_WIDTH / 2,
        EFACConstants.BLOCK_SURFACE_WIDTH
      ) );
      const rectangle = this.getBounds();

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
      this.positionProperty.link( position => {
        const currentBounds = this.getBounds();
        this.topSurface.positionProperty.value = new Vector2( position.x, currentBounds.maxY );
        this.bottomSurface.positionProperty.value = new Vector2( position.x, currentBounds.minY );
        this.thermalContactArea.set( currentBounds );
      } );

      // add perspective information, used for validating positions
      this.perspectiveCompensation.setXY( BLOCK_PERSPECTIVE_EXTENSION, BLOCK_PERSPECTIVE_EXTENSION );
    }

    /**
     * @returns {Color}
     * @public
     */
    get color() {
      return BLOCK_COMPOSITION[ this.blockType ].color;
    }

    /**
     * @public
     * @returns {EnergyContainerCategory}
     */
    get energyContainerCategory() {
      return BLOCK_COMPOSITION[ this.blockType ].energyContainerCategory;
    }

    /**
     * @override
     * @public
     */
    addEnergyChunkSlices() {

      // the slices for the block are intended to match the projection used in the view
      const projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
      const sliceWidth = EFACConstants.BLOCK_SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 );
      const rectangle = this.getBounds();

      for ( let i = 0; i < NUM_ENERGY_CHUNK_SLICES; i++ ) {
        const projectionOffsetVector = EFACConstants.MAP_Z_TO_XY_OFFSET( -i * sliceWidth );
        const sliceBounds = new Bounds2.rect( rectangle.x, rectangle.y, rectangle.width, rectangle.height );
        sliceBounds.shift(
          projectionToFront.x + projectionOffsetVector.x,
          projectionToFront.y + projectionOffsetVector.y
        );

        this.slices.push( new EnergyChunkContainerSlice(
          sliceBounds,
          -i * sliceWidth,
          this.positionProperty
        ) );
      }
    }

    /**
     * This function originally existed primarily in support of boiling liquids, whose temperatures should not go up
     * after reaching a certain temperature.  In the context of a block, it is less meaningful in a true physical sense
     * (unless we're talking about the boiling point of iron I suppose).  However, it turns out to be useful to the sim
     * to set a max temperature beyond which the block will exchange energy with the air more quickly thus limiting how
     * hot it will get, because this effectively limits the number of energy chunks that can end up in the block.  So,
     * this method does return a positive value when the block is above a certain temperature, bit this behavior is what
     * we often call "Hollywooding", since it doesn't do this for physical reason.  The max temperature values is
     * empirically determined to be higher than the value that maxes out the thermometers, and enough above that value
     * that two stacked blocks can both reach the max value shown on the thermometer if heated long enough.
     * @returns {number}
     * @public
     */
    getEnergyBeyondMaxTemperature() {
      return Math.max( this.energy - ( MAX_TEMPERATURE * this.mass * this.specificHeat ), 0 );
    }
  }

  return energyFormsAndChanges.register( 'Block', Block );
} );