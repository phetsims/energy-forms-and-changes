// Copyright 2002-2015, University of Colorado

/**
 * Model element that represents a beaker that contains some amount of water, and the water contains energy, which
 * includes energy chunks, and has temperature.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  //var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkDistributor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkDistributor' );
  var EnergyChunkContainerSlice = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkContainerSlice' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearFunction = require( 'DOT/LinearFunction' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var RectangularThermalMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/RectangularThermalMovableModelElement' );
  var Shape = require( 'KITE/Shape' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants
  var MATERIAL_THICKNESS = 0.001; // In meters.
  var NUM_SLICES = 6;
  var STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is emitted.

  // Constants that control the nature of the fluid in the beaker.
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

    var thisBeaker = this;
    this.width = width;
    this.height = height;

    // Add the Beaker Properties.
    // TODO: Can this get added directly to the supertype constructor if its most base class is PropertySet? Would be cleaner.
    this.addProperty( 'fluidLevel', EFACConstants.INITIAL_FLUID_LEVEL );
    this.addProperty( 'topSurface', null );
    this.addProperty( 'bottomSurface', null );
    this.addProperty( 'temperature', EFACConstants.ROOM_TEMPERATURE );

    // Indicator of how much steam is being emitted.  Ranges from 0 to 1, where 0 is no steam, 1 is the max amount
    // (full boil).
    this.steamingProportion = 0;

    // Max height above water where steam still affects the temperature.
    this.maxSteamHeight = 2 * height;

    /**
     * Function that updates the bottom and top surfaces
     */
    function updateSurfaces() {
      var rectangle = thisBeaker.getRect();
      thisBeaker.topSurface = new HorizontalSurface( new Range( rectangle.minX, rectangle.maxX ), rectangle.minY + MATERIAL_THICKNESS, thisBeaker );
      thisBeaker.bottomSurface = new HorizontalSurface(
        new Range( rectangle.minX, rectangle.maxX ),
        rectangle.minY,
        thisBeaker );
    }

    // Update the top and bottom surfaces whenever the position changes.
    this.positionProperty.link( updateSurfaces );

  }

  return inherit( RectangularThermalMovableModelElement, Beaker, {

    /**
     * Get the untranslated rectangle that defines the shape of the beaker.
     * @returns {Rectangle}
     */
    getRawOutlineRect: function() {
      return new Rectangle( -this.width / 2, 0, this.width, this.height );
    },

    /**
     *
     * @returns {Rectangle}
     */
    getRect: function() {
      return new Rectangle(
        this.position.x - this.width / 2,
        this.position.y,
        this.width,
        this.height );
    },

    /**
     * Function that steps in time dt
     * @param {number} dt
     */
    step: function( dt ) {
//      RectangularThermalMovableModelElement.prototype.step.call( this, dt );
      this.temperature = this.getTemperature();
      this.steamingProportion = 0;
      if ( EFACConstants.BOILING_POINT_TEMPERATURE - this.temperature < STEAMING_RANGE ) {
        // Water is emitting some amount of steam.  Set the proportionate amount.
        this.steamingProportion = Util.clamp( 0, 1 - ( EFACConstants.BOILING_POINT_TEMPERATURE - this.temperature ) / STEAMING_RANGE, 1 );
      }
    },

    /**
     * *
     * @returns {RectangularThermalMovableModelElement.width|*}
     */
    getWidth: function() {
      return this.width;
    },

    /**
     * *
     * @returns {RectangularThermalMovableModelElement.height|*}
     */
    getHeight: function() {
      return this.height;
    },

    /**
     * *
     * @returns {*}
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * *
     * @returns {*}
     */
    getBottomSurfaceProperty: function() {
      return this.bottomSurfaceProperty;
    },

    /**
     * *
     */
    addInitialEnergyChunks: function() {
      // extend scope for nested functions
      var thisBeaker = this;
      this.slices.forEach( function( slice ) {
        slice.energyChunkList.clear();
        var targetNumChunks = EFACConstants.ENERGY_TO_NUM_CHUNKS_MAPPER( thisBeaker.energy );
        var initialChunkBounds = thisBeaker.getSliceBounds();
        while ( thisBeaker.getNumEnergyChunks() < targetNumChunks ) {
          // Add a chunk at a random location in the beaker.
          thisBeaker.addEnergyChunkToNextSlice( new EnergyChunk( EnergyType.THERMAL, EnergyChunkDistributor.generateRandomLocation( initialChunkBounds ), new Vector2( 0, 0 ), thisBeaker.energyChunksVisibleProperty.get() ) );
        }

        // Distribute the energy chunks within the beaker.
        // TODO: Why 1000 for the loop max?
        for ( var i = 0; i < 1000; i++ ) {
          if ( !EnergyChunkDistributor.updatePositions( thisBeaker.slices, EFACConstants.SIM_TIME_PER_TICK_NORMAL ) ) {
            break;
          }
        }
      } );
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

      var sliceSelectionValue = Math.random();
      var chosenSlice = this.slices[ 0 ];
      var accumulatedArea = 0;
      for ( var i = 0; i < this.slices.length; i++ ) {
        accumulatedArea += this.slices[ i ].getShape().bounds.width * this.slices[ i ].getShape().bounds.height;
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
      return new ThermalContactArea( new Bounds2( this.position.x - this.width / 2, this.position.y, this.width, this.height * this.fluidLevel ), true );
    },

    /**
     * Get the area where the temperature of the steam can be sensed.
     */
    getSteamArea: function() {
      // Height of steam rectangle is based on beaker height and steamingProportion.
      var liquidWaterHeight = this.height * this.fluidLevel;
      return new Rectangle( this.position.x - this.getWidth() / 2,
        this.position.y + liquidWaterHeight,
        this.width,
        this.maxSteamHeight );
    },

    /**
     *
     * @param {number} heightAboveWater
     * @returns {number}
     */
    getSteamTemperature: function( heightAboveWater ) {
      var mappingFunction = new LinearFunction( 0, this.maxSteamHeight * this.steamingProportion, this.temperature, EFACConstants.ROOM_TEMPERATURE );
      return Math.max( mappingFunction.evaluate( heightAboveWater ), EFACConstants.ROOM_TEMPERATURE );
    },

    /**
     *
     */
    addEnergyChunkSlices: function() {
      assert && assert( this.slices.length === 0 ); // Check that his has not been already called.
      var fluidRect = new Rectangle(
        this.position.x - this.width / 2,
        this.position.y,
        this.width,
        this.height * EFACConstants.INITIAL_FLUID_LEVEL );

      var widthYProjection = Math.abs( this.width * EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER );
      for ( var i = 0; i < NUM_SLICES; i++ ) {
        var proportion = ( i + 1 ) * ( 1 / ( NUM_SLICES + 1 ) );

        // The slice width is calculated to fit into the 3D projection. It uses an exponential function that is shifted
        // in order to yield width value proportional to position in Z-space.
        var sliceWidth = ( -Math.pow( ( 2 * proportion - 1 ), 2 ) + 1 ) * fluidRect.width;

        var bottomY = fluidRect.minY - ( widthYProjection / 2 ) + ( proportion * widthYProjection );

        var topY = bottomY + fluidRect.height;

        var centerX = fluidRect.centerX;

        var controlPointYOffset = ( bottomY - fluidRect.minY ) * 0.5;
        var sliceShape = new Shape();
        sliceShape.moveTo( centerX - sliceWidth / 2, bottomY )
          .quadraticCurveTo( centerX - sliceWidth * 0.33, bottomY + controlPointYOffset, centerX + sliceWidth * 0.33, bottomY + controlPointYOffset, centerX + sliceWidth / 2, bottomY )
          .lineTo( centerX + sliceWidth / 2, topY )
          .quadraticCurveTo( centerX + sliceWidth * 0.33, topY + controlPointYOffset, centerX - sliceWidth * 0.33, topY + controlPointYOffset, centerX - sliceWidth / 2, topY )
          .lineTo( centerX - sliceWidth / 2, bottomY );

        this.slices.push( new EnergyChunkContainerSlice( sliceShape, -proportion * this.width, this.positionProperty ) );
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
      return Math.min( RectangularThermalMovableModelElement.prototype.getTemperature.call( this ), EFACConstants.BOILING_POINT_TEMPERATURE );
    },

    /**
     * This override handles the case where the point is above the beaker.  In this case, we want to pull from all
     * slices evenly, and not favor the slices the bump up at the top in order to match the 3D look of the water
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

      if ( !pointIsAboveWaterSurface ) {
        return this.extractClosestEnergyChunk( point );
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
        console.log( " - Warning: No energy chunks in the beaker, can't extract any." );
        return null;
      }

      var highestEnergyChunk = densestSlice.energyChunkList.get( 0 );
      densestSlice.energyChunkList.forEach( function( energyChunk ) {
        if ( energyChunk.position.y > highestEnergyChunk.position.y ) {
          highestEnergyChunk = energyChunk;
        }
      } );

      this.removeEnergyChunk( highestEnergyChunk );
      return highestEnergyChunk;
    }

  } );
} );
