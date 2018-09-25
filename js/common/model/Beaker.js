// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model element that represents a beaker that contains water.  The water contains energy, which includes energy chunks,
 * and has temperature.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkDistributor' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var Shape = require( 'KITE/Shape' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MATERIAL_THICKNESS = 0.001; // In meters.
  var NUM_SLICES = 6;
  var STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.

  /**
   * @param {Vector2} initialPosition - location where center bottom of beaker will be in model space
   * @param {number} width
   * @param {number} height
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function Beaker( initialPosition, width, height, energyChunksVisibleProperty, options ) {

    options = _.extend( {
      fluidColor: EFACConstants.WATER_COLOR_IN_BEAKER,
      fluidSpecificHeat: EFACConstants.WATER_SPECIFIC_HEAT,
      fluidDensity: EFACConstants.WATER_DENSITY,
      fluidBoilingPoint: EFACConstants.WATER_BOILING_POINT_TEMPERATURE
    }, options );

    RectangularThermalMovableModelElement.call( this,
      initialPosition,
      width,
      height,
      this.calculateWaterMass( width, height * EFACConstants.INITIAL_FLUID_LEVEL, options.fluidDensity ),
      options.fluidSpecificHeat,
      energyChunksVisibleProperty
    );

    var self = this;

    // @private
    this.width = width;
    this.height = height;

    // @public {Color) - the color of the fluid in the beaker
    this.fluidColor = options.fluidColor;

    // @public {number} - the boiling point temperature of the fluid in the beaker
    this.fluidBoilingPoint = options.fluidBoilingPoint;

    // @public {Property.<number>} - fluid level in beaker, should only be set in sub-types
    this.fluidLevelProperty = new Property( EFACConstants.INITIAL_FLUID_LEVEL );

    // @public (read-only) {Property.<number>} - temperature of fluid in beaker
    this.temperatureProperty = new Property( EFACConstants.ROOM_TEMPERATURE );

    // @public (read-only) {number} - indicator of how much steam is being emitted, ranges from 0 to 1 where 0 is no
    // steam, 1 is the max amount (full boil)
    this.steamingProportion = 0;

    // @private {number} - max height above water where steam still affects the measured temperature
    this.maxSteamHeight = 2 * height;

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

    // update the top and bottom surfaces whenever the position changes
    // TODO: Make HorizontalSurface poolable and use pooling.
    this.positionProperty.link( function() {
      var bounds = self.getCompositeBounds();

      self.topSurfaceProperty.set( new HorizontalSurface(
        new Range( bounds.minX, bounds.maxX ),
        bounds.minY + MATERIAL_THICKNESS, self )
      );

      self.bottomSurfaceProperty.set( new HorizontalSurface(
        new Range( bounds.minX, bounds.maxX ),
        bounds.minY, self )
      );
    } );
  }

  energyFormsAndChanges.register( 'Beaker', Beaker );

  return inherit( RectangularThermalMovableModelElement, Beaker, {

    /**
     * get the untranslated rectangle that defines the shape of the beaker
     * @returns {Dot.Rectangle}
     * @public
     */
    getRawOutlineRect: function() {
      return new Rectangle( -this.width / 2, 0, this.width, this.height );
    },

    /**
     * Get a rectangle defining the current outline in model space.  By convention for this simulation, the position
     * is the middle of the bottom of the beakers's defining rectangle.
     * @returns {Dot.Rectangle} - rectangle that defines this item's 2D shape
     * @public
     */
    get rect() {
      return new Rectangle(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.width,
        this.height
      );
    },

    /**
     * Get a Bounds2 object defining the current boundaries in model space.  By convention for this simulation, the
     * position is the middle of the bottom of the block's defining rectangle.
     * @returns {Bounds2} - boundaries this item's 2D shape
     * @public
     */
    getBounds: function() {
      return new Bounds2(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.positionProperty.value.x + this.width / 2,
        this.positionProperty.value.y + this.height
      );
    },

    /**
     * step the beaker in time
     * @param {number} dt - delta time (in seconds)
     * @public
     */
    step: function( dt ) {
      this.temperatureProperty.set( this.getTemperature() );
      var temperature = this.temperatureProperty.get();
      if ( temperature > this.fluidBoilingPoint - STEAMING_RANGE ) {

        // water is emitting some amount of steam - set the proportionate amount
        this.steamingProportion = Util.clamp(
          1 - ( this.fluidBoilingPoint - temperature ) / STEAMING_RANGE,
          0,
          1
        );
      }
      else {
        this.steamingProportion = 0;
      }
      RectangularThermalMovableModelElement.prototype.step.call( this, dt );
    },

    /**
     * add the initial energy chunks to this container
     * @override
     */
    addInitialEnergyChunks: function() {

      // extend scope for nested functions
      var self = this;
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.clear();
      } );
      var targetNumChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( self.energy );

      // var initialChunkBounds = self.getSliceBounds();
      var initialChunkBounds = self.getSliceBounds().shiftedX( self.getBounds().width / 8 );

      while ( self.getNumEnergyChunks() < targetNumChunks ) {

        // add a chunk at a random location in the beaker
        self.addEnergyChunkToNextSlice( new EnergyChunk(
          EnergyType.THERMAL,
          EnergyChunkDistributor.generateRandomLocation( initialChunkBounds ),
          new Vector2( 0, 0 ),
          self.energyChunksVisibleProperty )
        );
      }

      // distribute the energy chunks within the beaker
      // TODO: This loop uses an arbitrary values, and that value was 1000 in the Java version of the sim, but that
      // increases load time to an unacceptable level, so this should probably be revisited.
      for ( var i = 0; i < 50; i++ ) {
        EnergyChunkDistributor.updatePositions( self.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      }
    },

    /**
     * add an energy chunk to the next horizontal slice
     * @param {EnergyChunk} energyChunk
     * @protected
     * @override
     */
    addEnergyChunkToNextSlice: function( energyChunk ) {
      var totalSliceArea = 0;
      this.slices.forEach( function( slice ) {
        totalSliceArea += slice.shape.bounds.width * slice.shape.bounds.height;
      } );

      var sliceSelectionValue = phet.joist.random.nextDouble();
      var chosenSlice = this.slices[ 0 ];
      var accumulatedArea = 0;
      for ( var i = 0; i < this.slices.length; i++ ) {
        accumulatedArea += this.slices[ i ].shape.bounds.width * this.slices[ i ].shape.bounds.height;
        if ( accumulatedArea / totalSliceArea >= sliceSelectionValue ) {
          chosenSlice = this.slices[ i ];
          break;
        }
      }
      chosenSlice.addEnergyChunk( energyChunk );
    },

    /**
     * @param {number} width
     * @param {number} height
     * @param {number} fluidDensity
     * @returns {number}
     * @private
     */
    calculateWaterMass: function( width, height, fluidDensity ) {
      return Math.PI * Math.pow( width / 2, 2 ) * height * fluidDensity;
    },

    /**
     * get the area of this beaker where exchange of thermal energy could occur
     * @returns {ThermalContactArea}
     * @public
     */
    get thermalContactArea() {

      var currentPosition = this.positionProperty.get();

      return new ThermalContactArea(
        new Bounds2(
          currentPosition.x - this.width / 2,
          currentPosition.y,
          currentPosition.x + this.width / 2,
          currentPosition.y + this.height * this.fluidLevelProperty.get()
        ),
        true
      );
    },

    /**
     * get the area where the temperature of the steam can be sensed
     * @returns {Rectangle}
     * @public
     */
    getSteamArea: function() {

      // height of steam rectangle is based on beaker height and steamingProportion
      var liquidWaterHeight = this.height * this.fluidLevelProperty.value;
      var position = this.positionProperty.value;
      return new Rectangle( position.x - this.width / 2,
        position.y + liquidWaterHeight,
        this.width,
        this.maxSteamHeight );
    },

    /**
     * get the temperature value above the beaker at the given height
     * @param {number} heightAboveWater
     * @returns {number}
     * @public
     */
    getSteamTemperature: function( heightAboveWater ) {
      var mappingFunction = new LinearFunction(
        0,
        this.maxSteamHeight * this.steamingProportion,
        this.temperatureProperty.value,
        EFACConstants.ROOM_TEMPERATURE
      );
      return Math.max( mappingFunction.evaluate( heightAboveWater ), EFACConstants.ROOM_TEMPERATURE );
    },

    /**
     * add the initial energy chunk slices, called in super constructor
     * @protected
     * @override
     */
    addEnergyChunkSlices: function() {
      assert && assert( this.slices.length === 0 ); // Check that his has not been already called.

      var fluidRect = new Rectangle(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.width,
        this.height * EFACConstants.INITIAL_FLUID_LEVEL
      );

      var widthYProjection = Math.abs( this.width * EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER );
      for ( var i = 0; i < NUM_SLICES; i++ ) {
        var proportion = ( i + 1 ) * ( 1 / ( NUM_SLICES + 1 ) );

        // The slice width is calculated to fit into the 3D projection. It uses an exponential function that is shifted
        // in order to yield width value proportional to position in Z-space.
        var sliceWidth = ( -Math.pow( ( 2 * proportion - 1 ), 2 ) + 1 ) * fluidRect.width;
        var bottomY = fluidRect.minY - ( widthYProjection / 2 ) + ( proportion * widthYProjection );

        // TODO: this code is broken. It produces skewed parallelogram-looking shapes.
        // TODO: Using Shape.rect instead for now.
        // var topY = bottomY + fluidRect.height;
        // var centerX = fluidRect.centerX;
        // var controlPointYOffset = ( bottomY - fluidRect.minY ) * 0.5;
        // var sliceShape = new Shape();
        // sliceShape.moveTo( centerX - sliceWidth / 2, bottomY )
        //   .quadraticCurveTo( centerX - sliceWidth * 0.33, bottomY + controlPointYOffset, centerX + sliceWidth * 0.33, bottomY + controlPointYOffset, centerX + sliceWidth / 2, bottomY )
        //   .lineTo( centerX + sliceWidth / 2, topY )
        //   .quadraticCurveTo( centerX + sliceWidth * 0.33, topY + controlPointYOffset, centerX - sliceWidth * 0.33, topY + controlPointYOffset, centerX - sliceWidth / 2, topY )
        //   .lineTo( centerX - sliceWidth / 2, bottomY );

        var zPosition = -proportion * this.width;
        var sliceShape = Shape.rect( fluidRect.centerX - 0.44 * sliceWidth, bottomY, sliceWidth, fluidRect.height );
        this.slices.push( new EnergyChunkContainerSlice( sliceShape, zPosition, this.positionProperty ) );
      }
    },

    /**
     * get the energy container category, which is an enum that is used to determine heat transfer rates
     * @returns {EnergyContainerCategory}
     */
    get energyContainerCategory() {
      return EnergyContainerCategory.WATER;
    },

    /**
     * get the beaker energy beyond the max temperature (the boiling point)
     * @public
     * @returns {number}
     */
    getEnergyBeyondMaxTemperature: function() {
      return Math.max( this.energy - ( this.fluidBoilingPoint * this.mass * this.specificHeat ), 0 );
    },

    /**
     * get the temperature, but limit it to the boiling point for water (for reaslistic behavior)
     * @returns {number}
     * @override
     * @public
     */
    getTemperature: function() {
      var temperature = RectangularThermalMovableModelElement.prototype.getTemperature.call( this );
      assert && assert( temperature >= 0, 'Invalid temperature: ' + temperature );
      return Math.min( temperature, this.fluidBoilingPoint );
    },

    /**
     * This override handles the case where the point is above the beaker.  In this case, we want to pull from all
     * slices evenly, and not favor the slices that bump up at the top in order to match the 3D look of the water
     * surface.
     * @param {Vector2} point
     * @override
     */
    extractClosestEnergyChunk: function( point ) {
      var pointIsAboveWaterSurface = true;
      for ( var i = 0; i < this.slices.length; i++ ) {
        if ( point.y < this.slices[ i ].shape.bounds.maxY ) {
          pointIsAboveWaterSurface = false;
          break;
        }
      }

      // If point is below water surface, call the superclass version.
      if ( !pointIsAboveWaterSurface ) {
        return this.extractClosestEnergyChunkToPoint( point );
      }

      // Point is above water surface.  Identify the slice with the highest density, since this is where we will get the
      // energy chunk.
      var maxSliceDensity = 0;
      var densestSlice = null;
      this.slices.forEach( function( slice ) {
        var sliceDensity = slice.energyChunkList.length / ( slice.shape.bounds.width * slice.shape.bounds.height );
        if ( sliceDensity > maxSliceDensity ) {
          maxSliceDensity = sliceDensity;
          densestSlice = slice;
        }
      } );

      if ( densestSlice === null || densestSlice.energyChunkList.length === 0 ) {
        console.log( ' - Warning: No energy chunks in the beaker, can\'t extract any.' );
        return null;
      }

      var highestEnergyChunk = densestSlice.energyChunkList.get( 0 );
      assert && assert( highestEnergyChunk, 'highestEnergyChunk does not exist' );
      densestSlice.energyChunkList.forEach( function( energyChunk ) {
        if ( energyChunk.positionProperty.value.y > highestEnergyChunk.positionProperty.value.y ) {
          highestEnergyChunk = energyChunk;
        }
      } );

      this.removeEnergyChunk( highestEnergyChunk );
      return highestEnergyChunk;
    },

    /**
     * @override
     * @public
     */
    reset: function() {
      this.fluidLevelProperty.reset();
      this.temperatureProperty.reset();
      RectangularThermalMovableModelElement.prototype.reset.call( this );
    }

  } );
} );
