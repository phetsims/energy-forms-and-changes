// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model element that represents a beaker that contains some amount of water, and the water contains energy, which
 * includes energy chunks, and has temperature.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkDistributor' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkContainerSlice' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Property = require( 'AXON/Property' );
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var Random = require( 'DOT/Random' );
  var Shape = require( 'KITE/Shape' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MATERIAL_THICKNESS = 0.001; // In meters.
  var NUM_SLICES = 6;
  var STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.
  var RAND = new Random();

  // constants that control the nature of the fluid in the beaker.
  var WATER_SPECIFIC_HEAT = 3000; // In J/kg-K.  The real value for water is 4186, but this was adjusted so that there
  // aren't too many chunks and so that a chunk is needed as soon as heating starts.
  var WATER_DENSITY = 1000.0; // In kg/m^3, source = design document (and common knowledge).

  /**
   * Constructor for Beaker.  Initial posiition is the center bottom of the beaker rectangle.
   *
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Beaker( initialPosition, width, height, energyChunksVisibleProperty ) {

    RectangularThermalMovableModelElement.call( this,
      initialPosition,
      width,
      height,
      this.calculateWaterMass( width, height * EFACConstants.INITIAL_FLUID_LEVEL ),
      WATER_SPECIFIC_HEAT,
      energyChunksVisibleProperty );

    var self = this;
    this.width = width;
    this.height = height;

    // Add the Beaker Properties.
    this.fluidLevelProperty = new Property( EFACConstants.INITIAL_FLUID_LEVEL );
    this.topSurfaceProperty = new Property( null );
    this.bottomSurfaceProperty = new Property( null );
    this.temperatureProperty = new Property( EFACConstants.ROOM_TEMPERATURE );

    // Indicator of how much steam is being emitted.  Ranges from 0 to 1, where 0 is no steam, 1 is the max amount
    // (full boil).
    this.steamingProportion = 0;

    // Max height above water where steam still affects the temperature.
    this.maxSteamHeight = 2 * height;

    /**
     * Function that updates the bottom and top surfaces
     */
    function updateSurfaces() {
      var rectangle = self.getBounds();

      self.topSurfaceProperty.set( new HorizontalSurface(
        new RangeWithValue( rectangle.minX, rectangle.maxX ),
        rectangle.minY + MATERIAL_THICKNESS, self ) );

      self.bottomSurfaceProperty.set( new HorizontalSurface(
        new RangeWithValue( rectangle.minX, rectangle.maxX ),
        rectangle.minY, self ) );
    }

    // Update the top and bottom surfaces whenever the position changes.
    this.positionProperty.link( updateSurfaces );
  }

  energyFormsAndChanges.register( 'Beaker', Beaker );

  return inherit( RectangularThermalMovableModelElement, Beaker, {

    /**
     * Get the untranslated rectangle that defines the shape of the beaker.
     * @returns {Dot.Rectangle}
     */
    getRawOutlineRect: function() {
      return new Rectangle( -this.width / 2, 0, this.width, this.height );
    },

    /**
     * Get a rectangle defining the current boundaries in model space.  By
     * convention for this simulation, the position is the middle of the
     * bottom of the block's defining rectangle.
     *
     * @returns {Dot.Rectangle} - rectangle that defines this item's 2D shape
     */
    getRect: function() {
      return new Rectangle(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.width,
        this.height );
    },

    /**
     * Get a Bounds2 object defining the current boundaries in model space.  By
     * convention for this simulation, the position is the middle of the
     * bottom of the block's defining rectangle.
     *
     * @returns {Bounds2} - boundaries this item's 2D shape
     */
    getBounds: function() {
      return new Bounds2(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.positionProperty.value.x + this.width / 2,
        this.positionProperty.value.y + this.height );
    },

    /**
     * Function that steps in time dt
     * @param {number} dt
     */
    step: function( dt ) {
      RectangularThermalMovableModelElement.prototype.step.call( this, dt );
      this.temperatureProperty.set( this.getTemperature() );
      this.steamingProportion = 0;
      var temperature = this.temperatureProperty.value;
      var steamFraction = 1 - ( EFACConstants.BOILING_POINT_TEMPERATURE - temperature ) / STEAMING_RANGE;
      if ( EFACConstants.BOILING_POINT_TEMPERATURE - temperature < STEAMING_RANGE ) {
        // Water is emitting some amount of steam.  Set the proportionate amount.
        this.steamingProportion = Util.clamp( steamFraction, 0, 1 );
      }
    },

    /**
     * *
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
        // Add a chunk at a random location in the beaker.
        self.addEnergyChunkToNextSlice(
          new EnergyChunk( EnergyType.THERMAL, EnergyChunkDistributor.generateRandomLocation( initialChunkBounds ),
            new Vector2( 0, 0 ), self.energyChunksVisibleProperty ) );
      }

      // Distribute the energy chunks within the beaker.
      // TODO: This loop massively increases load time...leaving commented for now
      // for ( var i = 0; i < 1000; i++ ) {
      //   if ( !EnergyChunkDistributor.updatePositions( self.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL ) ) {
      //     break;
      //   }
      // }
      for ( var i = 0; i < 50; i++ ) {
        EnergyChunkDistributor.updatePositions( self.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      }
    },

    /**
     * Add an energy chunk to the next horizontal slice.
     *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunkToNextSlice: function( energyChunk ) {
      var totalSliceArea = 0;
      this.slices.forEach( function( slice ) {
        totalSliceArea += slice.shape.bounds.width * slice.shape.bounds.height;
      } );

      var sliceSelectionValue = RAND.nextDouble();
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
     * *
     * @param {number} width
     * @param {number} height
     * @returns {number}
     */
    calculateWaterMass: function( width, height ) {
      return Math.PI * Math.pow( width / 2, 2 ) * height * WATER_DENSITY;
    },

    /**
     * *
     * @returns {ThermalContactArea}
     */
    getThermalContactArea: function() {

      return new ThermalContactArea( new Bounds2(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.width,
        this.height * this.fluidLevelProperty.value ), true );
    },

    /**
     * Get the area where the temperature of the steam can be sensed.
     */
    getSteamArea: function() {
      // Height of steam rectangle is based on beaker height and steamingProportion.
      var liquidWaterHeight = this.height * this.fluidLevelProperty.value;
      var position = this.positionProperty.value;
      return new Rectangle( position.x - this.width / 2,
        position.y + liquidWaterHeight,
        this.width,
        this.maxSteamHeight );
    },

    /**
     *
     * @param {number} heightAboveWater
     * @returns {number}
     */
    getSteamTemperature: function( heightAboveWater ) {
      var mappingFunction = new LinearFunction(
        0,
        this.maxSteamHeight * this.steamingProportion,
        this.temperatureProperty.value,
        EFACConstants.ROOM_TEMPERATURE );
      return Math.max( mappingFunction.evaluate( heightAboveWater ), EFACConstants.ROOM_TEMPERATURE );
    },

    /**
     *
     */
    addEnergyChunkSlices: function() {
      assert && assert( this.slices.length === 0 ); // Check that his has not been already called.

      var fluidRect = new Rectangle(
        this.positionProperty.value.x - this.width / 2,
        this.positionProperty.value.y,
        this.width,
        this.height * EFACConstants.INITIAL_FLUID_LEVEL );

      var widthYProjection = Math.abs( this.width * EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER );
      for ( var i = 0; i < NUM_SLICES; i++ ) {
        var proportion = ( i + 1 ) * ( 1 / ( NUM_SLICES + 1 ) );

        // The slice width is calculated to fit into the 3D projection. It uses
        // an exponential function that is shifted in order to yield width value
        // proportional to position in Z-space.
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
     * Function that returns the energy Container Category
     * @returns {string}
     */
    getEnergyContainerCategory: function() {
      return EnergyContainerCategory.WATER;
    },

    /**
     * Function that returns the beaker energy beyond the max temperature (the boiling point)
     * @returns {number}
     */
    getEnergyBeyondMaxTemperature: function() {
      return Math.max( this.energy - ( EFACConstants.BOILING_POINT_TEMPERATURE * this.mass * this.specificHeat ), 0 );
    },

    /**
     * Function that returns temperature of the beaker
     * Limit max temp to the boiling point.
     * @returns {number}
     */
    getTemperature: function() {
      var T = RectangularThermalMovableModelElement.prototype.getTemperature.call( this );
      assert && assert( T >= 0, 'Invalid temperature: ' + T );
      return Math.min( T, EFACConstants.BOILING_POINT_TEMPERATURE );
    },

    /**
     * This override handles the case where the point is above the beaker.  In
     * this case, we want to pull from all slices evenly, and not favor the
     * slices that bump up at the top in order to match the 3D look of the water
     * surface.
     *
     * @param {Vector2} point
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

    reset: function() {
      RectangularThermalMovableModelElement.prototype.reset.call( this );
      this.fluidLevelProperty.reset();
      this.topSurfaceProperty.reset();
      this.bottomSurfaceProperty.reset();
      this.temperatureProperty.reset();
    }

  } );
} );
