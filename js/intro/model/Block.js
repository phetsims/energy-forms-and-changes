// Copyright 2014-2023, University of Colorado Boulder

/**
 * Block that contains and exchanges thermal energy.  In the model, a block is two-dimensional, so its shape is
 * represented by a rectangle.
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import required from '../../../../phet-core/js/required.js';
import { Color } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkContainerSlice from '../../common/model/EnergyChunkContainerSlice.js';
import EnergyContainerCategory from '../../common/model/EnergyContainerCategory.js';
import HorizontalSurface from '../../common/model/HorizontalSurface.js';
import RectangularThermalMovableModelElement from '../../common/model/RectangularThermalMovableModelElement.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BlockType from './BlockType.js';

// constants
const NUM_ENERGY_CHUNK_SLICES = 4; // Number of slices where energy chunks may be placed.
const MAX_TEMPERATURE = 620; // in degrees Kelvin, see usage below for where the value comes from
const BLOCK_PERSPECTIVE_EXTENSION = EFACConstants.BLOCK_SURFACE_WIDTH *
                                    EFACConstants.BLOCK_PERSPECTIVE_EDGE_PROPORTION *
                                    Math.cos( EFACConstants.BLOCK_PERSPECTIVE_ANGLE ) / 2;

const BlockTypeEnumerationIO = EnumerationIO( BlockType );

// TODO: use constants from EFAConstants, https://github.com/phetsims/energy-forms-and-changes/issues/420
const BLOCK_COMPOSITION = {};
BLOCK_COMPOSITION[ BlockType.IRON ] = {
  color: new Color( 150, 150, 150 ),
  density: EFACConstants.IRON_DENSITY,
  specificHeat: EFACConstants.IRON_SPECIFIC_HEAT,
  energyContainerCategory: EnergyContainerCategory.IRON
};
BLOCK_COMPOSITION[ BlockType.BRICK ] = {
  color: new Color( 223, 22, 12 ),
  density: EFACConstants.BRICK_DENSITY,
  specificHeat: EFACConstants.BRICK_SPECIFIC_HEAT,
  energyContainerCategory: EnergyContainerCategory.BRICK
};

// static data
let instanceCount = 0; // counter for creating unique IDs

class Block extends RectangularThermalMovableModelElement {

  /**
   * @param {Vector2} initialPosition
   * @param {Property} energyChunksVisibleProperty
   * @param {BlockType} blockType
   * @param {PhetioGroup} energyChunkGroup
   * optional for the parent
   * @param {Object} config
   */
  constructor( initialPosition,
               energyChunksVisibleProperty,
               blockType,
               energyChunkGroup,
               config ) {

    config = merge( {
      energyChunkWanderControllerGroup: required( config.energyChunkWanderControllerGroup ),
      predistributedEnergyChunkConfigurations: ENERGY_CHUNK_PRESET_CONFIGURATIONS,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioDynamicElement: true,
      phetioType: Block.BlockIO,
      phetioDocumentation: 'block that can be of type iron or brick'
    }, config );

    super(
      initialPosition,
      EFACConstants.BLOCK_SURFACE_WIDTH,
      EFACConstants.BLOCK_SURFACE_WIDTH,
      Math.pow( EFACConstants.BLOCK_SURFACE_WIDTH, 3 ) * BLOCK_COMPOSITION[ blockType ].density,
      BLOCK_COMPOSITION[ blockType ].specificHeat,
      energyChunksVisibleProperty,
      energyChunkGroup,
      config
    );

    // @public (read-only) {String} - unique ID for this block
    this.id = `block-${instanceCount++}`;

    // @public
    this.blockType = blockType;

    // @public {number} - the z-index of this block in relation to other blocks. updated when a user interacts with any
    // block.
    this.zIndex = instanceCount;

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
    assert && assert( this.slices.length === 0 ); // make sure this method isn't being misused

    // the slices for the block are intended to match the projection used in the view
    const projectionToFront = EFACConstants.MAP_Z_TO_XY_OFFSET( EFACConstants.BLOCK_SURFACE_WIDTH / 2 );
    const sliceWidth = EFACConstants.BLOCK_SURFACE_WIDTH / ( NUM_ENERGY_CHUNK_SLICES - 1 );
    const rectangle = this.getBounds();

    for ( let i = 0; i < NUM_ENERGY_CHUNK_SLICES; i++ ) {
      const projectionOffsetVector = EFACConstants.MAP_Z_TO_XY_OFFSET( -i * sliceWidth );
      const sliceBounds = Bounds2.rect( rectangle.x, rectangle.y, rectangle.width, rectangle.height );
      sliceBounds.shiftXY(
        projectionToFront.x + projectionOffsetVector.x,
        projectionToFront.y + projectionOffsetVector.y
      );

      this.slices.push( new EnergyChunkContainerSlice(
        sliceBounds,
        -i * sliceWidth,
        this.positionProperty, {
          tandem: this.tandem.createTandem( `energyChunkContainerSlice${i}` )
        }
      ) );
    }
  }

  /**
   * This function originally existed primarily in support of boiling liquids, whose temperatures should not go up
   * after reaching a certain temperature.  In the context of a block, it is less meaningful in a true physical sense
   * (unless we're talking about the boiling point of iron I suppose).  However, it turns out to be useful to the sim
   * to set a max temperature beyond which the block will exchange energy with the air more quickly thus limiting how
   * hot it will get, because this effectively limits the number of energy chunks that can end up in the block.  So,
   * this method does return a positive value when the block is above a certain temperature, but this behavior is what
   * we often call "Hollywooding", since it doesn't do this for a real physical reason.  The max temperature values are
   * empirically determined to be higher than the value that maxes out the thermometers, and enough above that value
   * that two stacked blocks can both reach the max value shown on the thermometer if heated long enough.
   * @returns {number}
   * @public
   */
  getEnergyBeyondMaxTemperature() {
    return Math.max( this.energyProperty.value - ( MAX_TEMPERATURE * this.mass * this.specificHeat ), 0 );
  }
}

// Preset data used for fast addition and positioning of energy chunks during reset.  The data contains information
// about the energy chunk slices and energy chunks that are contained within a block of a specific size with a specific
// number of energy chunks.  If a match can be found, this data is used to quickly configure the block rather than
// using the much more expensive process of inserting and then distributing the energy chunks.  See
// https://github.com/phetsims/energy-forms-and-changes/issues/375.
const ENERGY_CHUNK_PRESET_CONFIGURATIONS = [

  // iron block
  {
    numberOfSlices: 4,
    totalSliceArea: 0.008100000000000001,
    numberOfEnergyChunks: 6,
    energyChunkPositionsBySlice: [
      [
        {
          positionX: -0.25640756950670235,
          positionY: 0.006850135040548302
        }
      ],
      [
        {
          positionX: -0.2537531660345353,
          positionY: 0.02393321792569457
        },
        {
          positionX: -0.23829971427184846,
          positionY: 0.009582482706072211
        }
      ],
      [
        {
          positionX: -0.24358344197642037,
          positionY: 0.035369522321921996
        },
        {
          positionX: -0.2282683630416627,
          positionY: 0.02098996529690959
        }
      ],
      [
        {
          positionX: -0.22579080380196173,
          positionY: 0.038104769283249865
        }
      ]
    ]
  },

  // brick
  {
    numberOfSlices: 4,
    totalSliceArea: 0.008099999999999998,
    numberOfEnergyChunks: 2,
    energyChunkPositionsBySlice: [
      [],
      [
        {
          positionX: -0.15231883878415728,
          positionY: 0.015189399553646257
        }
      ],
      [
        {
          positionX: -0.13768266639921758,
          positionY: 0.029811817909006666
        }
      ],
      []
    ]
  }
];

Block.BlockIO = new IOType( 'BlockIO', {
  valueType: Block,
  toStateObject: block => ( { blockType: BlockTypeEnumerationIO.toStateObject( block.blockType ) } ),
  stateSchema: {
    blockType: BlockTypeEnumerationIO
  }
} );

energyFormsAndChanges.register( 'Block', Block );
export default Block;