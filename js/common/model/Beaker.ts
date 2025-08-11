// Copyright 2014-2025, University of Colorado Boulder

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
import optionize from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Color from '../../../../scenery/js/util/Color.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EnumerationIO from '../../../../tandem/js/types/EnumerationIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import EFACQueryParameters from '../EFACQueryParameters.js';
import BeakerType from './BeakerType.js';
import EnergyChunk from './EnergyChunk.js';
import EnergyChunkContainerSlice from './EnergyChunkContainerSlice.js';
import energyChunkDistributor from './energyChunkDistributor.js';
import EnergyChunkGroup from './EnergyChunkGroup.js';
import EnergyContainerCategory from './EnergyContainerCategory.js';
import EnergyType from './EnergyType.js';
import HorizontalSurface from './HorizontalSurface.js';
import RectangularThermalMovableModelElement, { RectangularThermalMovableModelElementOptions } from './RectangularThermalMovableModelElement.js';
import ThermalContactArea from './ThermalContactArea.js';
import UserMovableModelElement from './UserMovableModelElement.js';

// constants
const MATERIAL_THICKNESS = 0.001; // In meters.
const NUM_SLICES = 6;
const STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.
const SWITCH_TO_FASTER_ALGORITHM_THRESHOLD = 10; // in milliseconds, empirically determined, see usage for more info
const BeakerTypeEnumerationIO = EnumerationIO( BeakerType );

const BEAKER_COMPOSITION = {} as IntentionalAny;
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

type SelfOptions = {
  beakerType?: typeof BeakerType;
  majorTickMarkDistance?: number;
  predistributedEnergyChunkConfigurations?: IntentionalAny[];
};

type BeakerOptions = SelfOptions & RectangularThermalMovableModelElementOptions;

abstract class Beaker extends RectangularThermalMovableModelElement {

  private readonly _energyContainerCategory: typeof EnergyContainerCategory;

  // The type of beaker (water or olive oil)
  public readonly beakerType: typeof BeakerType;

  // The color of the fluid in the beaker
  public readonly fluidColor: Color;

  // The color of the steam that comes from the beaker
  public readonly steamColor: Color;

  // The boiling point temperature of the fluid in the beaker
  public readonly fluidBoilingPoint: number;

  // The distance between major tick marks on the side of the beaker
  public readonly majorTickMarkDistance: number;

  // Proportion of fluid in the beaker, should only be set in sub-types
  public readonly fluidProportionProperty: NumberProperty;

  // Indicator of how much steam is being emitted, ranges from 0 to 1 where 0 is no
  // steam, 1 is the max amount (full boil)
  public steamingProportion: number;

  // Indicates when a reset starts and finished
  public readonly resetInProgressProperty: BooleanProperty;

  // Max height above water where steam still affects the measured temperature
  private readonly maxSteamHeight: number;

  /**
   * @param initialPosition - position where center bottom of beaker will be in model space
   * @param width
   * @param height
   * @param energyChunksVisibleProperty
   * @param energyChunkGroup
   * @param [providedOptions]
   */
  protected constructor( initialPosition: Vector2, width: number, height: number, energyChunksVisibleProperty: BooleanProperty, energyChunkGroup: EnergyChunkGroup, providedOptions?: BeakerOptions ) {

    const options = optionize<BeakerOptions, SelfOptions, RectangularThermalMovableModelElementOptions>()( {
      beakerType: BeakerType.WATER,
      majorTickMarkDistance: height * 0.95 / 2, // empirically determined
      predistributedEnergyChunkConfigurations: ENERGY_CHUNK_PRESET_CONFIGURATIONS,

      // phet-io
      tandem: Tandem.REQUIRED,

      phetioType: Beaker.BeakerIO,
      phetioDocumentation: 'beaker that contains either water or olive oil, and may also contain blocks'
    }, providedOptions );

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

    // @ts-expect-error TODO: https://github.com/phetsims/energy-forms-and-changes/issues/430 probably assigned in parent
    this.width = width;

    // @ts-expect-error TODO: https://github.com/phetsims/energy-forms-and-changes/issues/430 probably assigned in parent
    this.height = height;

    this._energyContainerCategory = BEAKER_COMPOSITION[ options.beakerType ].energyContainerCategory;

    this.beakerType = options.beakerType;

    this.fluidColor = BEAKER_COMPOSITION[ options.beakerType ].fluidColor;

    this.steamColor = BEAKER_COMPOSITION[ options.beakerType ].steamColor;

    this.fluidBoilingPoint = BEAKER_COMPOSITION[ options.beakerType ].fluidBoilingPoint;

    this.majorTickMarkDistance = options.majorTickMarkDistance;

    this.fluidProportionProperty = new NumberProperty( EFACConstants.INITIAL_FLUID_PROPORTION, {
      range: new Range( EFACConstants.INITIAL_FLUID_PROPORTION, 1 ),
      tandem: options.tandem.createTandem( 'fluidProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the proportion of fluid in the beaker'
    } );

    this.steamingProportion = 0;

    this.resetInProgressProperty = new BooleanProperty( false );

    this.maxSteamHeight = 2 * height;

    // see base class for info
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

    // see base class for description
    this.topSurface = new HorizontalSurface(
      new Vector2( initialPosition.x, bounds.minY + MATERIAL_THICKNESS ),
      width,
      this,
      options.tandem.createTandem( 'topSurface' )
    );

    // see base class for description
    this.bottomSurface = new HorizontalSurface(
      new Vector2( initialPosition.x, bounds.minY ),
      width,
      this,
      options.tandem.createTandem( 'bottomSurface' )
    );

    // update internal state when the position changes
    this.positionProperty.link( position => {

      const bounds = this.getBounds();

      // update the positions of the top and bottom surfaces
      this.topSurface!.positionProperty.set( new Vector2( position.x, bounds.minY + MATERIAL_THICKNESS ) );
      this.bottomSurface!.positionProperty.set( new Vector2( position.x, bounds.minY ) );

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
      if ( oldFluidProportion && !isSettingPhetioStateProperty.value ) {
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
   * @param dt - delta time (in seconds)
   */
  public override step( dt: number ): void {
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
   */
  protected override addAndDistributeInitialEnergyChunks( targetNumberOfEnergyChunks: number ): void {

    // make a copy of the slice array sorted such that the smallest is first
    let sortedSliceArray = _.sortBy( this.slices, slice => {
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
            // @ts-expect-error
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
          // @ts-expect-error
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

        // @ts-expect-error
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

      // @ts-expect-error
      const distributed = energyChunkDistributor.updatePositions( this.slices.slice(), EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      if ( !distributed ) {
        break;
      }
    }
  }

  /**
   * get the area where the temperature of the steam can be sensed
   */
  public getSteamArea(): Rectangle {

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
   * @param heightAboveWater
   */
  public getSteamTemperature( heightAboveWater: number ): number {
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
   */
  protected override addEnergyChunkSlices(): void {
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
   */
  public get energyContainerCategory(): typeof EnergyContainerCategory {
    return this._energyContainerCategory;
  }

  /**
   * get the beaker energy beyond the max temperature (the boiling point)
   */
  public getEnergyBeyondMaxTemperature(): number {
    return Math.max( this.energyProperty.value - ( this.fluidBoilingPoint * this.mass * this.specificHeat ), 0 );
  }

  /**
   * get the temperature, but limit it to the boiling point for water (for reaslistic behavior)
   */
  public override getTemperature(): number {
    const temperature = super.getTemperature();
    return Math.min( temperature, this.fluidBoilingPoint );
  }

  /**
   * This override handles the case where the point is above the beaker.  In this case, we want to pull from all
   * slices evenly, and not favor the slices that bump up at the top in order to match the 3D look of the water
   * surface.
   * @param point
   */
  public override extractEnergyChunkClosestToPoint( point: Vector2 ): EnergyChunk | null {
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
    let densestSlice: EnergyChunkContainerSlice | null = null;
    for ( let i = 0; i < this.slices.length; i++ ) {
      const slice = this.slices[ i ];
      const sliceDensity = slice.energyChunkList.length / ( slice.bounds.width * slice.bounds.height );
      if ( sliceDensity > maxSliceDensity ) {
        maxSliceDensity = sliceDensity;
        densestSlice = slice;
      }
    }

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

  public override reset(): void {
    this.resetInProgressProperty.set( true );
    this.fluidProportionProperty.reset();
    super.reset();
    this.resetInProgressProperty.set( false );
  }

  public static readonly BeakerIO = new IOType<Beaker, { beakerType: typeof BeakerType }>( 'BeakerIO', {
    supertype: UserMovableModelElement.UserMovableModelElementIO,
    valueType: Beaker,
    stateSchema: {
      beakerType: BeakerTypeEnumerationIO
    }
  } );
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
        new Vector2( 0.00911244536972683, -0.001596201157690377 ),
        new Vector2( -0.0011607888034016745, -0.001260263233759202 ),
        new Vector2( 0.0035476395799065308, 0.00830833687007631 ),
        new Vector2( -0.010558309452327358, -0.0014006625270237634 )
      ],
      [
        new Vector2( -0.01766252635833651, 0.006307322179373496 ),
        new Vector2( -0.008469018876102963, 0.014627798547737368 ),
        new Vector2( 0.019351623411529545, 0.014168538445584971 ),
        new Vector2( -0.025685334941213805, 0.0015598813704961255 ),
        new Vector2( 0.026966992616017232, 0.0018462484323476214 ),
        new Vector2( 0.018289225229863842, 0.0029840248926661967 )
      ],
      [
        new Vector2( -0.035324692893026144, 0.004946701691473413 ),
        new Vector2( 0.03566731295854275, 0.030151905887197336 ),
        new Vector2( 0.006399831234849912, 0.02065394173079762 ),
        new Vector2( -0.024506239001270802, 0.017005245718346496 ),
        new Vector2( 0.03554717913731187, 0.00606404190954684 ),
        new Vector2( 0.02922624544607516, 0.022189193678943488 ),
        new Vector2( -0.03530695761539765, 0.013620569422127976 )
      ],
      [
        new Vector2( 0.013764623655068059, 0.030152565271325076 ),
        new Vector2( 0.03565061610722842, 0.01572085721843787 ),
        new Vector2( -0.03550982904839077, 0.0335189501208214 ),
        new Vector2( -0.025133200312429757, 0.03067241737522126 ),
        new Vector2( -0.03531519768999611, 0.0235661580930112 ),
        new Vector2( 0.03561385874563658, 0.04070591137030983 ),
        new Vector2( -0.03519399086039368, 0.0419806312520849 )
      ],
      [
        new Vector2( -0.010589563425132148, 0.028011604802213583 ),
        new Vector2( 0.01700868135223285, 0.0438323010350111 ),
        new Vector2( 0.024082926425863405, 0.03467489643617197 ),
        new Vector2( -0.025156755961300292, 0.04508455550774215 ),
        new Vector2( -0.016508494677226898, 0.03977233053947086 ),
        new Vector2( 0.026551074663124674, 0.04536442546358017 )
      ],
      [
        new Vector2( -0.0013455182523322562, 0.04778775887478084 ),
        new Vector2( 0.008138007649735435, 0.04802268075219778 ),
        new Vector2( -0.010674122154769733, 0.0482263520067694 ),
        new Vector2( 0.00036229693684378117, 0.03636622814513492 )
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
        new Vector2( 0.0040562743847165905, 0.004483938783700345 )
      ],
      [
        new Vector2( -0.012517490346528548, 0.01135266074270837 )
      ],
      [
        new Vector2( -0.029127940688883414, 0.014944657983227735 ),
        new Vector2( 0.028502675979780567, 0.01540356272815047 )
      ],
      [
        new Vector2( 0.009937780468958268, 0.024124778617726085 ),
        new Vector2( -0.025902019415993127, 0.034060410093368784 )
      ],
      [
        new Vector2( 0.02050244472631646, 0.038454844170679035 )
      ],
      [
        new Vector2( -0.002854236789679304, 0.041265717223805336 )
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
        new Vector2( -0.005327962195427578, 0.0004522961379182615 ),
        new Vector2( 0.005878792977895683, 0.000824467858642923 )
      ],
      [
        new Vector2( -0.01824245083371954, 0.0034380377241471985 ),
        new Vector2( -0.005036590973103385, 0.012944973171205295 ),
        new Vector2( 0.019741565168300078, 0.003279241596617504 ),
        new Vector2( 0.012671290746065678, 0.012710872516212307 )
      ],
      [
        new Vector2( -0.02069178450187043, 0.015736978154630904 ),
        new Vector2( -0.029717716348298683, 0.0074871967959977345 ),
        new Vector2( 0.02956885660028978, 0.008563582772174585 ),
        new Vector2( -0.029712791921195827, 0.021947716659928035 )
      ],
      [
        new Vector2( -0.029417182256097307, 0.03359850547981442 ),
        new Vector2( 0.028983244342911652, 0.020701865304273696 ),
        new Vector2( 0.0025201526950114975, 0.02604248884226837 ),
        new Vector2( 0.029634091878329008, 0.03310958127835711 )
      ],
      [
        new Vector2( -0.01228742259426627, 0.02819195535993875 ),
        new Vector2( -0.019066861676811125, 0.03795731390665523 ),
        new Vector2( 0.016355533191846593, 0.02668223621783737 ),
        new Vector2( 0.019084554783501864, 0.03813406883802284 )
      ],
      [
        new Vector2( -0.005392624572061245, 0.0405126251872509 ),
        new Vector2( 0.005826167710765314, 0.040391565199538224 )
      ]
    ]
  }
];

energyFormsAndChanges.register( 'Beaker', Beaker );
export default Beaker;