// Copyright 2014-2022, University of Colorado Boulder

/**
 * Model element that represents a beaker which contains a fluid. The fluid contains energy, which includes energy
 * chunks, and has a temperature.
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import LinearFunction from '../../../../dot/js/LinearFunction.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import EFACQueryParameters from '../EFACQueryParameters.js';
import BeakerType from './BeakerType.js';
import EnergyChunkContainerSlice from './EnergyChunkContainerSlice.js';
import energyChunkDistributor from './energyChunkDistributor.js';
import EnergyContainerCategory from './EnergyContainerCategory.js';
import EnergyType from './EnergyType.js';
import HorizontalSurface from './HorizontalSurface.js';
import RectangularThermalMovableModelElement from './RectangularThermalMovableModelElement.js';
import ThermalContactArea from './ThermalContactArea.js';

// constants
const MATERIAL_THICKNESS = 0.001; // In meters.
const NUM_SLICES = 6;
const STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.
const SWITCH_TO_FASTER_ALGORITHM_THRESHOLD = 10; // in milliseconds, empirically determined, see usage for more info
const BeakerTypeEnumerationIO = EnumerationIO( BeakerType );

const BEAKER_COMPOSITION = {};
BEAKER_COMPOSITION[ BeakerType.WATER ] = {
  fluidColor: EFACConstants.WATER_COLOR_IN_BEAKER,
  steamColor: EFACConstants.WATER_STEAM_COLOR,
  fluidSpecificHeat: EFACConstants.WATER_SPECIFIC_HEAT,
  fluidDensity: EFACConstants.WATER_DENSITY,
  fluidBoilingPoint: EFACConstants.WATER_BOILING_POINT_TEMPERATURE,
  energyContainerCategory: EnergyContainerCategory.WATER
};
BEAKER_COMPOSITION[ BeakerType.OLIVE_OIL ] = {
  fluidColor: EFACConstants.OLIVE_OIL_COLOR_IN_BEAKER,
  steamColor: EFACConstants.OLIVE_OIL_STEAM_COLOR,
  fluidSpecificHeat: EFACConstants.OLIVE_OIL_SPECIFIC_HEAT,
  fluidDensity: EFACConstants.OLIVE_OIL_DENSITY,
  fluidBoilingPoint: EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE,
  energyContainerCategory: EnergyContainerCategory.OLIVE_OIL
};

// file variable used for measuring performance during startup, see usage for more information
let performanceMeasurementTaken = false;

class Beaker extends RectangularThermalMovableModelElement {

  /**
   * @param {Vector2} initialPosition - position where center bottom of beaker will be in model space
   * @param {number} width
   * @param {number} height
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor( initialPosition, width, height, energyChunksVisibleProperty, energyChunkGroup, options ) {

    options = merge( {
      beakerType: BeakerType.WATER,
      majorTickMarkDistance: height * 0.95 / 2, // empirically determined
      predistributedEnergyChunkConfigurations: ENERGY_CHUNK_PRESET_CONFIGURATIONS,

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: Beaker.BeakerIO,
      phetioDocumentation: 'beaker that contains either water or olive oil, and may also contain blocks'
    }, options );

    // calculate the mass of the beaker
    const mass = Math.PI * Math.pow( width / 2, 2 ) * height * EFACConstants.INITIAL_FLUID_PROPORTION *
                 BEAKER_COMPOSITION[ options.beakerType ].fluidDensity;

    super(
      initialPosition,
      width,
      height,
      mass,
      BEAKER_COMPOSITION[ options.beakerType ].fluidSpecificHeat,
      energyChunksVisibleProperty,
      energyChunkGroup,
      options
    );

    // @private
    this.width = width;
    this.height = height;
    this._energyContainerCategory = BEAKER_COMPOSITION[ options.beakerType ].energyContainerCategory;

    // @public {BeakerType} (read-only)
    this.beakerType = options.beakerType;

    // @public {Color) - the color of the fluid in the beaker
    this.fluidColor = BEAKER_COMPOSITION[ options.beakerType ].fluidColor;

    // @public {Color) - the color of the steam that comes from the beaker
    this.steamColor = BEAKER_COMPOSITION[ options.beakerType ].steamColor;

    // @public {number} - the boiling point temperature of the fluid in the beaker
    this.fluidBoilingPoint = BEAKER_COMPOSITION[ options.beakerType ].fluidBoilingPoint;

    // @public {number} - the distance between major tick marks on the side of the beaker
    this.majorTickMarkDistance = options.majorTickMarkDistance;

    // @public {Property.<number>} - proportion of fluid in the beaker, should only be set in sub-types
    this.fluidProportionProperty = new NumberProperty( EFACConstants.INITIAL_FLUID_PROPORTION, {
      range: new Range( EFACConstants.INITIAL_FLUID_PROPORTION, 1 ),
      tandem: options.tandem.createTandem( 'fluidProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the proportion of fluid in the beaker'
    } );

    // @public (read-only) {number} - indicator of how much steam is being emitted, ranges from 0 to 1 where 0 is no
    // steam, 1 is the max amount (full boil)
    this.steamingProportion = 0;

    // @public (read-only) - indicates when a reset starts and finished
    this.resetInProgressProperty = new BooleanProperty( false );

    // @private {number} - max height above water where steam still affects the measured temperature
    this.maxSteamHeight = 2 * height;

    // @protected {ThermalContactArea} - see base class for info
    this.thermalContactArea = new ThermalContactArea(
      new Bounds2(
        initialPosition.x - this.width / 2,
        initialPosition.y,
        initialPosition.x + this.width / 2,
        initialPosition.y + this.height * this.fluidProportionProperty.get()
      ),
      true
    );

    // add position test bounds - left side, bottom, right side (see declaration in base class for more info)
    this.relativePositionTestingBoundsList.push( new Bounds2(
      -width / 2 - MATERIAL_THICKNESS / 2,
      0,
      -width / 2 + MATERIAL_THICKNESS / 2,
      height
    ) );
    this.relativePositionTestingBoundsList.push( new Bounds2(
      -width / 2,
      0,
      width / 2,
      MATERIAL_THICKNESS
    ) );
    this.relativePositionTestingBoundsList.push( new Bounds2(
      width / 2 - MATERIAL_THICKNESS / 2,
      0,
      width / 2 + MATERIAL_THICKNESS / 2,
      height
    ) );
    const bounds = this.getBounds();

    // @public - see base class for description
    this.topSurface = new HorizontalSurface(
      new Vector2( initialPosition.x, bounds.minY + MATERIAL_THICKNESS ),
      width,
      this
    );

    // @public - see base class for description
    this.bottomSurface = new HorizontalSurface(
      new Vector2( initialPosition.x, bounds.minY ),
      width,
      this
    );

    // update internal state when the position changes
    this.positionProperty.link( position => {

      const bounds = this.getBounds();

      // update the positions of the top and bottom surfaces
      this.topSurface.positionProperty.set( new Vector2( position.x, bounds.minY + MATERIAL_THICKNESS ) );
      this.bottomSurface.positionProperty.set( new Vector2( position.x, bounds.minY ) );

      // update the thermal contact area
      this.thermalContactArea.setMinMax(
        position.x - this.width / 2,
        position.y,
        position.x + this.width / 2,
        position.y + this.height * this.fluidProportionProperty.get()
      );
    } );

    // update internal state when the fluid level changes
    this.fluidProportionProperty.link( ( newFluidProportion, oldFluidProportion ) => {

      // update the thermal contact area
      const position = this.positionProperty.get();
      this.thermalContactArea.setMinMax(
        position.x - this.width / 2,
        position.y,
        position.x + this.width / 2,
        position.y + this.height * this.fluidProportionProperty.get()
      );

      // update the bounds of the energy chunk slices
      // When setting PhET-iO state, the slices' height is already updated
      if ( oldFluidProportion && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
        const multiplier = newFluidProportion / oldFluidProportion;
        this.slices.forEach( slice => {
          slice.updateHeight( multiplier );
        } );
      }

      // kick off redistribution of the energy chunks
      this.resetECDistributionCountdown();
    } );
  }

  /**
   * step the beaker in time
   * @param {number} dt - delta time (in seconds)
   * @public
   */
  step( dt ) {
    const temperature = this.temperatureProperty.get();
    if ( temperature > this.fluidBoilingPoint - STEAMING_RANGE ) {

      // the fluid is emitting some amount of steam - set the proportionate amount
      this.steamingProportion = Utils.clamp( 1 - ( this.fluidBoilingPoint - temperature ) / STEAMING_RANGE, 0, 1 );
    }
    else {
      this.steamingProportion = 0;
    }
    super.step( dt );
  }

  /**
   * override for adding energy chunks to the beaker
   * @override
   * @protected
   */
  addAndDistributeInitialEnergyChunks( targetNumberOfEnergyChunks ) {

    // make a copy of the slice array sorted such that the smallest is first
    let sortedSliceArray = _.sortBy( this.slices.getArray(), slice => {
      return slice.bounds.width * slice.bounds.height;
    } );

    const totalSliceArea = this.slices.reduce( ( accumulator, slice ) => {
      return accumulator + slice.bounds.width * slice.bounds.height;
    }, 0 );

    const smallOffset = 0.00001; // used so that the ECs don't start on top of each other
    let numberOfEnergyChunksAdded = 0;

    // go through each slice, adding a number of energy chunks based on its proportionate size
    sortedSliceArray.forEach( slice => {
      const sliceArea = slice.bounds.width * slice.bounds.height;
      const sliceCenter = slice.bounds.center;
      _.times( Utils.roundSymmetric( ( sliceArea / totalSliceArea ) * targetNumberOfEnergyChunks ), index => {
        if ( numberOfEnergyChunksAdded < targetNumberOfEnergyChunks ) {
          slice.addEnergyChunk( this.energyChunkGroup.createNextElement(
            EnergyType.THERMAL,
            sliceCenter.plusXY( smallOffset * index, smallOffset * index ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty )
          );
          numberOfEnergyChunksAdded++;
        }
      } );
    } );

    // If the total number of added chunks was not quite enough, work through the list of slices from the biggest to
    // the smallest until they have all been added.
    if ( numberOfEnergyChunksAdded < targetNumberOfEnergyChunks ) {
      sortedSliceArray = sortedSliceArray.reverse();
      let sliceIndex = 0;
      while ( numberOfEnergyChunksAdded < targetNumberOfEnergyChunks ) {
        const slice = sortedSliceArray[ sliceIndex ];
        const sliceCenter = slice.bounds.center;
        slice.addEnergyChunk( this.energyChunkGroup.createNextElement(
          EnergyType.THERMAL,
          sliceCenter,
          Vector2.ZERO,
          this.energyChunksVisibleProperty )
        );
        numberOfEnergyChunksAdded++;
        sliceIndex = ( sliceIndex + 1 ) % sortedSliceArray.length;
      }
    }

    // clear the distribution timer and do a more thorough distribution below
    this.clearECDistributionCountdown();

    // If this is the water beaker, and it's the first time energy chunks have been added, measure the performance
    // and, if it is found to be low, switch to a higher performance (but visually inferior) algorithm for distributing
    // the energy chunks.  This was found to be necessary on some platforms, see
    // https://github.com/phetsims/energy-forms-and-changes/issues/191.
    if ( this.specificHeat === EFACConstants.WATER_SPECIFIC_HEAT && !performanceMeasurementTaken ) {
      const startTime = window.performance.now();
      const numberOfIterations = 10; // empirically determined to give a reasonably consistent value
      for ( let i = 0; i < numberOfIterations; i++ ) {
        energyChunkDistributor.updatePositions( this.slices.slice(), EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      }
      const averageIterationTime = ( window.performance.now() - startTime ) / numberOfIterations;
      if ( averageIterationTime > SWITCH_TO_FASTER_ALGORITHM_THRESHOLD ) {

        // Performance on this device is poor, switch to the less computationally intenstive distribution algorithm,
        // but only if something else wasn't explicitly specified.
        if ( EFACQueryParameters.ecDistribution === null ) {
          energyChunkDistributor.setDistributionAlgorithm( 'spiral' );
        }
      }
      performanceMeasurementTaken = true;
    }

    // distribute the initial energy chunks within the container
    for ( let i = 0; i < EFACConstants.MAX_NUMBER_OF_INITIALIZATION_DISTRIBUTION_CYCLES; i++ ) {
      const distributed = energyChunkDistributor.updatePositions( this.slices.slice(), EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      if ( !distributed ) {
        break;
      }
    }
  }

  /**
   * get the area where the temperature of the steam can be sensed
   * @returns {Rectangle}
   * @public
   */
  getSteamArea() {

    // height of steam rectangle is based on beaker height and steamingProportion
    const liquidWaterHeight = this.height * this.fluidProportionProperty.value;
    const position = this.positionProperty.value;
    return new Rectangle( position.x - this.width / 2,
      position.y + liquidWaterHeight,
      this.width,
      this.maxSteamHeight );
  }

  /**
   * get the temperature value above the beaker at the given height
   * @param {number} heightAboveWater
   * @returns {number}
   * @public
   */
  getSteamTemperature( heightAboveWater ) {
    const mappingFunction = new LinearFunction(
      0,
      this.maxSteamHeight * this.steamingProportion,
      this.temperatureProperty.value,
      EFACConstants.ROOM_TEMPERATURE
    );
    return Math.max( mappingFunction.evaluate( heightAboveWater ), EFACConstants.ROOM_TEMPERATURE );
  }

  /**
   * add the initial energy chunk slices, called in super constructor
   * @protected
   * @override
   */
  addEnergyChunkSlices() {
    assert && assert( this.slices.length === 0 ); // Check that his has not been already called.

    const fluidRect = new Rectangle(
      this.positionProperty.value.x - this.width / 2,
      this.positionProperty.value.y,
      this.width,
      this.height * EFACConstants.INITIAL_FLUID_PROPORTION
    );

    const widthYProjection = Math.abs( this.width * EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER );
    for ( let i = 0; i < NUM_SLICES; i++ ) {
      const proportion = ( i + 1 ) * ( 1 / ( NUM_SLICES + 1 ) );

      // The slice width is calculated to fit into the 3D projection. It uses an exponential function that is shifted
      // in order to yield width value proportional to position in Z-space.
      const sliceWidth = ( -Math.pow( ( 2 * proportion - 1 ), 2 ) + 1 ) * fluidRect.width;
      const bottomY = fluidRect.minY - ( widthYProjection / 2 ) + ( proportion * widthYProjection );

      const zPosition = -proportion * this.width;
      const sliceBounds = Bounds2.rect( fluidRect.centerX - sliceWidth / 2, bottomY, sliceWidth, fluidRect.height );

      this.slices.push( new EnergyChunkContainerSlice( sliceBounds, zPosition, this.positionProperty, {
        tandem: this.tandem.createTandem( `energyChunkContainerSlice${i}` )
      } ) );
    }
  }

  /**
   * get the energy container category, which is an enum that is used to determine heat transfer rates
   * @returns {EnergyContainerCategory}
   */
  get energyContainerCategory() {
    return this._energyContainerCategory;
  }

  /**
   * get the beaker energy beyond the max temperature (the boiling point)
   * @public
   * @returns {number}
   */
  getEnergyBeyondMaxTemperature() {
    return Math.max( this.energyProperty.value - ( this.fluidBoilingPoint * this.mass * this.specificHeat ), 0 );
  }

  /**
   * get the temperature, but limit it to the boiling point for water (for reaslistic behavior)
   * @returns {number}
   * @override
   * @public
   */
  getTemperature() {
    const temperature = super.getTemperature();
    return Math.min( temperature, this.fluidBoilingPoint );
  }

  /**
   * This override handles the case where the point is above the beaker.  In this case, we want to pull from all
   * slices evenly, and not favor the slices that bump up at the top in order to match the 3D look of the water
   * surface.
   * @param {Vector2} point
   * @override
   * @public
   */
  extractEnergyChunkClosestToPoint( point ) {
    let pointIsAboveWaterSurface = true;
    for ( let i = 0; i < this.slices.length; i++ ) {
      if ( point.y < this.slices.get( i ).bounds.maxY ) {
        pointIsAboveWaterSurface = false;
        break;
      }
    }

    // If point is below water surface, call the superclass version.
    if ( !pointIsAboveWaterSurface ) {
      return super.extractEnergyChunkClosestToPoint( point );
    }

    // Point is above water surface.  Identify the slice with the highest density, since this is where we will get the
    // energy chunk.
    let maxSliceDensity = 0;
    let densestSlice = null;
    this.slices.forEach( slice => {
      const sliceDensity = slice.energyChunkList.length / ( slice.bounds.width * slice.bounds.height );
      if ( sliceDensity > maxSliceDensity ) {
        maxSliceDensity = sliceDensity;
        densestSlice = slice;
      }
    } );

    if ( densestSlice === null || densestSlice.energyChunkList.length === 0 ) {
      console.log( ' - Warning: No energy chunks in the beaker, can\'t extract any.' );
      return null;
    }

    // find the chunk in the chosen slice with the most energy and extract that one
    let highestEnergyChunk = densestSlice.energyChunkList.get( 0 );
    assert && assert( highestEnergyChunk, 'highestEnergyChunk does not exist' );
    densestSlice.energyChunkList.forEach( energyChunk => {
      if ( energyChunk.positionProperty.value.y > highestEnergyChunk.positionProperty.value.y ) {
        highestEnergyChunk = energyChunk;
      }
    } );

    this.removeEnergyChunk( highestEnergyChunk );
    return highestEnergyChunk;
  }

  /**
   * @override
   * @public
   */
  reset() {
    this.resetInProgressProperty.set( true );
    this.fluidProportionProperty.reset();
    super.reset();
    this.resetInProgressProperty.set( false );
  }
}

// Preset data used for fast addition and positioning of energy chunks during reset.  The data contains information
// about the energy chunk slices and energy chunks that are contained within a beaker of a specific size with a specific
// number of energy chunks.  If a match can be found, this data is used to quickly configure the beaker rather than
// using the much more expensive process of inserting and then distributing the energy chunks.  See
// https://github.com/phetsims/energy-forms-and-changes/issues/375.
const ENERGY_CHUNK_PRESET_CONFIGURATIONS = [

  // 1st screen water beaker
  {
    numberOfSlices: 6,
    totalSliceArea: 0.01816571428571429,
    numberOfEnergyChunks: 34,
    energyChunkPositionsBySlice: [
      [
        {
          positionX: 0.15411244536972682,
          positionY: -0.001596201157690377
        },
        {
          positionX: 0.14383921119659832,
          positionY: -0.001260263233759202
        },
        {
          positionX: 0.14854763957990652,
          positionY: 0.00830833687007631
        },
        {
          positionX: 0.13444169054767263,
          positionY: -0.0014006625270237634
        }
      ],
      [
        {
          positionX: 0.12733747364166348,
          positionY: 0.006307322179373496
        },
        {
          positionX: 0.13653098112389703,
          positionY: 0.014627798547737368
        },
        {
          positionX: 0.16435162341152953,
          positionY: 0.014168538445584971
        },
        {
          positionX: 0.11931466505878618,
          positionY: 0.0015598813704961255
        },
        {
          positionX: 0.17196699261601722,
          positionY: 0.0018462484323476214
        },
        {
          positionX: 0.16328922522986383,
          positionY: 0.0029840248926661967
        }
      ],
      [
        {
          positionX: 0.10967530710697385,
          positionY: 0.004946701691473413
        },
        {
          positionX: 0.18066731295854274,
          positionY: 0.030151905887197336
        },
        {
          positionX: 0.1513998312348499,
          positionY: 0.02065394173079762
        },
        {
          positionX: 0.12049376099872919,
          positionY: 0.017005245718346496
        },
        {
          positionX: 0.18054717913731186,
          positionY: 0.00606404190954684
        },
        {
          positionX: 0.17422624544607515,
          positionY: 0.022189193678943488
        },
        {
          positionX: 0.10969304238460234,
          positionY: 0.013620569422127976
        }
      ],
      [
        {
          positionX: 0.15876462365506805,
          positionY: 0.030152565271325076
        },
        {
          positionX: 0.1806506161072284,
          positionY: 0.01572085721843787
        },
        {
          positionX: 0.10949017095160922,
          positionY: 0.0335189501208214
        },
        {
          positionX: 0.11986679968757023,
          positionY: 0.03067241737522126
        },
        {
          positionX: 0.10968480231000388,
          positionY: 0.0235661580930112
        },
        {
          positionX: 0.18061385874563657,
          positionY: 0.04070591137030983
        },
        {
          positionX: 0.10980600913960631,
          positionY: 0.0419806312520849
        }
      ],
      [
        {
          positionX: 0.13441043657486784,
          positionY: 0.028011604802213583
        },
        {
          positionX: 0.16200868135223284,
          positionY: 0.0438323010350111
        },
        {
          positionX: 0.1690829264258634,
          positionY: 0.03467489643617197
        },
        {
          positionX: 0.1198432440386997,
          positionY: 0.04508455550774215
        },
        {
          positionX: 0.1284915053227731,
          positionY: 0.03977233053947086
        },
        {
          positionX: 0.17155107466312466,
          positionY: 0.04536442546358017
        }
      ],
      [
        {
          positionX: 0.14365448174766773,
          positionY: 0.04778775887478084
        },
        {
          positionX: 0.15313800764973542,
          positionY: 0.04802268075219778
        },
        {
          positionX: 0.13432587784523026,
          positionY: 0.0482263520067694
        },
        {
          positionX: 0.14536229693684377,
          positionY: 0.03636622814513492
        }
      ]
    ]
  },

  // 1st screen olive oil beaker
  {
    numberOfSlices: 6,
    totalSliceArea: 0.018165714285714278,
    numberOfEnergyChunks: 8,
    energyChunkPositionsBySlice: [
      [
        {
          positionX: 0.24605627438471658,
          positionY: 0.004483938783700345
        }
      ],
      [
        {
          positionX: 0.22948250965347144,
          positionY: 0.01135266074270837
        }
      ],
      [
        {
          positionX: 0.21287205931111658,
          positionY: 0.014944657983227735
        },
        {
          positionX: 0.27050267597978056,
          positionY: 0.01540356272815047
        }
      ],
      [
        {
          positionX: 0.25193778046895826,
          positionY: 0.024124778617726085
        },
        {
          positionX: 0.21609798058400687,
          positionY: 0.034060410093368784
        }
      ],
      [
        {
          positionX: 0.26250244472631645,
          positionY: 0.038454844170679035
        }
      ],
      [
        {
          positionX: 0.2391457632103207,
          positionY: 0.041265717223805336
        }
      ]
    ]
  },

  // 2nd screen water beaker
  {
    numberOfSlices: 6,
    totalSliceArea: 0.014142857142857143,
    numberOfEnergyChunks: 20,
    energyChunkPositionsBySlice: [
      [
        {
          positionX: -0.005327962195427578,
          positionY: 0.016452296137918262
        },
        {
          positionX: 0.005878792977895683,
          positionY: 0.016824467858642923
        }
      ],
      [
        {
          positionX: -0.01824245083371954,
          positionY: 0.0194380377241472
        },
        {
          positionX: -0.005036590973103385,
          positionY: 0.028944973171205295
        },
        {
          positionX: 0.019741565168300078,
          positionY: 0.019279241596617504
        },
        {
          positionX: 0.012671290746065678,
          positionY: 0.028710872516212307
        }
      ],
      [
        {
          positionX: -0.02069178450187043,
          positionY: 0.031736978154630904
        },
        {
          positionX: -0.029717716348298683,
          positionY: 0.023487196795997735
        },
        {
          positionX: 0.02956885660028978,
          positionY: 0.024563582772174585
        },
        {
          positionX: -0.029712791921195827,
          positionY: 0.037947716659928035
        }
      ],
      [
        {
          positionX: -0.029417182256097307,
          positionY: 0.04959850547981442
        },
        {
          positionX: 0.028983244342911652,
          positionY: 0.0367018653042737
        },
        {
          positionX: 0.0025201526950114975,
          positionY: 0.04204248884226837
        },
        {
          positionX: 0.029634091878329008,
          positionY: 0.04910958127835711
        }
      ],
      [
        {
          positionX: -0.01228742259426627,
          positionY: 0.04419195535993875
        },
        {
          positionX: -0.019066861676811125,
          positionY: 0.05395731390665523
        },
        {
          positionX: 0.016355533191846593,
          positionY: 0.04268223621783737
        },
        {
          positionX: 0.019084554783501864,
          positionY: 0.05413406883802284
        }
      ],
      [
        {
          positionX: -0.005392624572061245,
          positionY: 0.0565126251872509
        },
        {
          positionX: 0.005826167710765314,
          positionY: 0.056391565199538224
        }
      ]
    ]
  }
];

Beaker.BeakerIO = new IOType( 'BeakerIO', {
  valueType: Beaker,
  toStateObject: beaker => ( { beakerType: BeakerTypeEnumerationIO.toStateObject( beaker.beakerType ) } ),
  stateSchema: {
    beakerType: BeakerTypeEnumerationIO
  }
} );

energyFormsAndChanges.register( 'Beaker', Beaker );
export default Beaker;
