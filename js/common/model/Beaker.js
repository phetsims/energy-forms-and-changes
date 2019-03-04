// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model element that represents a beaker that contains water.  The water contains energy, which includes energy chunks,
 * and has temperature.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  const Emitter = require( 'AXON/Emitter' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  const EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkDistributor' );
  const EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  const LinearFunction = require( 'DOT/LinearFunction' );
  const Property = require( 'AXON/Property' );
  const Rectangle = require( 'DOT/Rectangle' );
  const RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/RectangularThermalMovableModelElement' );
  const ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const MATERIAL_THICKNESS = 0.001; // In meters.
  const NUM_SLICES = 6;
  const STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.
  const SWITCH_TO_FASTER_ALGORITHM_THRESHOLD = 10; // in milliseconds, empirically determined, see usage for more info

  // class var used for measuring performance during startup
  let performanceMeasurementTaken = false;

  class Beaker extends RectangularThermalMovableModelElement {

    /**
     * @param {Vector2} initialPosition - location where center bottom of beaker will be in model space
     * @param {number} width
     * @param {number} height
     * @param {Property.<boolean>} energyChunksVisibleProperty
     * @param {Object} [options]
     */
    constructor( initialPosition, width, height, energyChunksVisibleProperty, options ) {

      options = _.extend( {
        fluidColor: EFACConstants.WATER_COLOR_IN_BEAKER,
        steamColor: EFACConstants.WATER_STEAM_COLOR,
        fluidSpecificHeat: EFACConstants.WATER_SPECIFIC_HEAT,
        fluidDensity: EFACConstants.WATER_DENSITY,
        fluidBoilingPoint: EFACConstants.WATER_BOILING_POINT_TEMPERATURE,
        energyContainerCategory: EnergyContainerCategory.WATER,
        majorTickMarkDistance: height * 0.95 / 2 // empirically determined
      }, options );

      super(
        initialPosition,
        width,
        height,
        Math.PI * Math.pow( width / 2, 2 ) * height * EFACConstants.INITIAL_FLUID_LEVEL * options.fluidDensity,
        options.fluidSpecificHeat,
        energyChunksVisibleProperty
      );

      // @private
      this.width = width;
      this.height = height;
      this._energyContainerCategory = options.energyContainerCategory;

      // @public {Color) - the color of the fluid in the beaker
      this.fluidColor = options.fluidColor;

      // @public {Color) - the color of the steam that comes from the beaker
      this.steamColor = options.steamColor;

      // @public {number} - the boiling point temperature of the fluid in the beaker
      this.fluidBoilingPoint = options.fluidBoilingPoint;

      // @public {number} - the distance between major tick marks on the side of the beaker
      this.majorTickMarkDistance = options.majorTickMarkDistance;

      // @public {Property.<number>} - fluid level in beaker, should only be set in sub-types
      this.fluidLevelProperty = new Property( EFACConstants.INITIAL_FLUID_LEVEL );

      // @public (read-only) {Property.<number>} - temperature of fluid in beaker
      this.temperatureProperty = new Property( EFACConstants.ROOM_TEMPERATURE );

      // @public (read-only) {number} - indicator of how much steam is being emitted, ranges from 0 to 1 where 0 is no
      // steam, 1 is the max amount (full boil)
      this.steamingProportion = 0;

      // @private {number} - max height above water where steam still affects the measured temperature
      this.maxSteamHeight = 2 * height;

      // @private {ThermalContactArea} - the 2D area in the model where this can be in thermal contact with other areas,
      // only updated when requested so could be out of date and should not be directly read by clients
      this.thermalContactArea = new ThermalContactArea(
        new Bounds2(
          initialPosition.x - this.width / 2,
          initialPosition.y,
          initialPosition.x + this.width / 2,
          initialPosition.y + this.height * this.fluidLevelProperty.get()
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

      // @public - used to notify the view that reset was called
      this.resetEmitter = new Emitter();

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
          position.y + this.height * this.fluidLevelProperty.get()
        );
      } );

      // update internal state when the fluid level changes
      this.fluidLevelProperty.link( ( newFluidLevel, oldFluidLevel ) => {

        // update the thermal contact area
        const position = this.positionProperty.get();
        this.thermalContactArea.setMinMax(
          position.x - this.width / 2,
          position.y,
          position.x + this.width / 2,
          position.y + this.height * this.fluidLevelProperty.get()
        );

        // update the bounds of the energy chunk slices
        if ( oldFluidLevel ) {
          const multiplier = newFluidLevel / oldFluidLevel;
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
      this.temperatureProperty.set( this.getTemperature() );
      const temperature = this.temperatureProperty.get();
      if ( temperature > this.fluidBoilingPoint - STEAMING_RANGE ) {

        // the fluid is emitting some amount of steam - set the proportionate amount
        this.steamingProportion = Util.clamp( 1 - ( this.fluidBoilingPoint - temperature ) / STEAMING_RANGE, 0, 1 );
      }
      else {
        this.steamingProportion = 0;
      }
      super.step( dt );
    }

    /**
     * add the initial energy chunks to this container
     * @override
     */
    addInitialEnergyChunks() {
      let totalSliceArea = 0;

      // remove the current set of energy chunks, calculate total area of the slices
      this.slices.forEach( slice => {
        slice.energyChunkList.clear();
        totalSliceArea += slice.bounds.width * slice.bounds.height;
      } );

      // calculate the number of energy chunks to add based on the amount of energy in the beaker
      const targetNumECs = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( this.energy );

      // make a copy of the slice array sorted such that the smallest is first
      let sortedSliceArray = _.sortBy( this.slices, slice => {
        return slice.bounds.width * slice.bounds.height;
      } );

      const smallOffset = 0.00001; // used so that the ECs don't start on top of each other
      let numECsAdded = 0;

      // go through each slice, adding a number of energy chunks based on proprotion
      sortedSliceArray.forEach( slice => {
        const sliceArea = slice.bounds.width * slice.bounds.height;
        const sliceCenter = slice.bounds.center;
        _.times( Util.roundSymmetric( ( sliceArea / totalSliceArea ) * targetNumECs ), index => {
          if ( numECsAdded < targetNumECs ) {
            slice.addEnergyChunk( new EnergyChunk(
              EnergyType.THERMAL,
              sliceCenter.plusXY( smallOffset * index, smallOffset * index ),
              Vector2.ZERO,
              this.energyChunksVisibleProperty )
            );
            numECsAdded++;
          }
        } );
      } );

      // If the total number of added chunks was not quite enough, work through the list of slices from the biggest to
      // the smallest until they have all been added.
      if ( numECsAdded < targetNumECs ) {
        sortedSliceArray = sortedSliceArray.reverse();
        let sliceIndex = 0;
        while ( numECsAdded < targetNumECs ) {
          const slice = sortedSliceArray[ sliceIndex ];
          const sliceCenter = slice.bounds.center;
          slice.addEnergyChunk( new EnergyChunk(
            EnergyType.THERMAL,
            sliceCenter,
            Vector2.ZERO,
            this.energyChunksVisibleProperty )
          );
          numECsAdded++;
          sliceIndex = ( sliceIndex + 1 ) % sortedSliceArray.length;
        }
      }

      // clear the distribution timer and do a more thorough distribution below
      this.clearECDistributionCountdown();

      // If this is the water beaker, and it's the first time energy chunks have been added, measure the performance
      // and, if it is found to be low, switch to a higher performace (but visually inferior) algorithm for distributing
      // the energy chunks.  This was found to be necessary on some platforms, see
      // https://github.com/phetsims/energy-forms-and-changes/issues/191.
      if ( this.specificHeat === EFACConstants.WATER_SPECIFIC_HEAT && !performanceMeasurementTaken ) {
        const startTime = window.performance.now();
        const numIterations = 10; // empirically determined to give a reasonably consistent value
        for ( let i = 0; i < numIterations; i++ ) {
          EnergyChunkDistributor.updatePositions( this.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL );
        }
        const averageIterationTime = ( window.performance.now() - startTime ) / numIterations;
        if ( averageIterationTime > SWITCH_TO_FASTER_ALGORITHM_THRESHOLD ) {

          // Performance on this device is poor, switch to the less computationally intenstive distribution algorithm,
          // but only if something else wasn't explicitly specified.
          if ( EFACQueryParameters.ecDistribution === null ) {
            EnergyChunkDistributor.setDistributionAlgorithm( 'spiral' );
          }
        }
        performanceMeasurementTaken = true;
      }

      // distribute the initial energy chunks within the container
      for ( let i = 0; i < 500; i++ ) {
        const distributed = EnergyChunkDistributor.updatePositions( this.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL );
        if ( !distributed ) {
          break;
        }
      }
    }

    /**
     * get the area of this beaker where exchange of thermal energy could occur
     * @returns {ThermalContactArea}
     * @public
     */
    get thermalContactAreaX() {

      const currentPosition = this.positionProperty.get();
      if ( this.thermalContactArea.centerX !== currentPosition.x || this.thermalContactArea.minY !== currentPosition.y ) {

        // the thermal contact area needs to be updated
        this.thermalContactArea.setMinMax(
          currentPosition.x - this.width / 2,
          currentPosition.y,
          currentPosition.x + this.width / 2,
          currentPosition.y + this.height * this.fluidLevelProperty.get()
        );
      }

      return this.thermalContactArea;
    }

    /**
     * get the area where the temperature of the steam can be sensed
     * @returns {Rectangle}
     * @public
     */
    getSteamArea() {

      // height of steam rectangle is based on beaker height and steamingProportion
      const liquidWaterHeight = this.height * this.fluidLevelProperty.value;
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
      return Math.max( mappingFunction( heightAboveWater ), EFACConstants.ROOM_TEMPERATURE );
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
        this.height * EFACConstants.INITIAL_FLUID_LEVEL
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
        this.slices.push( new EnergyChunkContainerSlice( sliceBounds, zPosition, this.positionProperty ) );
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
      return Math.max( this.energy - ( this.fluidBoilingPoint * this.mass * this.specificHeat ), 0 );
    }

    /**
     * get the temperature, but limit it to the boiling point for water (for reaslistic behavior)
     * @returns {number}
     * @override
     * @public
     */
    getTemperature() {
      const temperature = super.getTemperature();
      assert && assert( temperature >= 0, `Invalid temperature: ${temperature}` );
      return Math.min( temperature, this.fluidBoilingPoint );
    }

    /**
     * This override handles the case where the point is above the beaker.  In this case, we want to pull from all
     * slices evenly, and not favor the slices that bump up at the top in order to match the 3D look of the water
     * surface.
     * @param {Vector2} point
     * @override
     */
    extractEnergyChunkClosestToPoint( point ) {
      let pointIsAboveWaterSurface = true;
      for ( let i = 0; i < this.slices.length; i++ ) {
        if ( point.y < this.slices[ i ].bounds.maxY ) {
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
      this.fluidLevelProperty.reset();
      this.temperatureProperty.reset();
      this.resetEmitter.emit();
      super.reset();
    }
  }

  return energyFormsAndChanges.register( 'Beaker', Beaker );
} );
