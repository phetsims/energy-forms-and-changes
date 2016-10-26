// Copyright 2014-2015, University of Colorado Boulder


/**
 * Class that represents the air in the model.  Air can hold heat, and can
 * exchange thermal energy with other model objects.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var Vector2 = require( 'DOT/Vector2' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Bounds2 = require( 'DOT/Bounds2' );

  // constants

  // 2D size of the air.  It is sized such that it will extend off the left, right, and top edges of screen for the
  // most common aspect ratios of the view.
  var SIZE = new Dimension2( 0.7, 0.3 );

  // The thickness of the slice of air being modeled.  This is basically the z dimension, and is used solely for
  // volume calculations.
  var DEPTH = 0.1; // In meters.

  // constants that define the heat carrying capacity of the air.
  var SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
  // var DENSITY = 0.001; // In kg/m^3, source = design document (and common knowledge).
  var DENSITY = 10; // In kg/m^3, far more dense than real air, done to make things cool faster.

  // Derived constants.
  var VOLUME = SIZE.width * SIZE.height * DEPTH;
  var MASS = VOLUME * DENSITY;
  var INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
  var THERMAL_CONTACT_AREA = new ThermalContactArea( new Bounds2( -SIZE.width / 2, 0, SIZE.width, SIZE.height ), true );

  // Class variable that keeps track of energy state for all air.
  var energy = INITIAL_ENERGY;

  /**
   * *
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Air( energyChunksVisibleProperty ) {

    Object.call( this );

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Energy chunks that are wandering outside this model element.
    this.energyChunkWanderControllers = [];
    this.energyChunkList = new ObservableArray();

    // this.positionProperty = new Property( new Vector2( SIZE.x, SIZE.y ) );
    // this.positionProperty = new Property( this.getCenterPoint() );
    // this.positionProperty = new Property( Vector2.ZERO );
  }

  energyFormsAndChanges.register( 'Air', Air );

  return inherit( Object, Air, {

    /**
     * *
     * @param dt
     */
    step: function( dt ) {

      var self = this;
      var controllers = this.energyChunkWanderControllers.slice();

      controllers.forEach( function( controller ) {
        controller.updatePosition( dt );

        // if ( !( self.getThermalContactArea().containsPoint( controller.energyChunk.positionProperty.value ) ) ) {
        if ( controller.destinationReached() ) {
          // }
          // Remove this energy chunk.
          console.log( 'Air: removing chunk' );
          self.energyChunkList.remove( controller.energyChunk );
          _.pull( self.energyChunkWanderControllers, controller );
        }
      } );

    },

    /**
     * *
     * @param {number} dt
     */
    equalizeWithSurroundingAir: function( dt ) {
      if ( Math.abs( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) > EFACConstants.SIGNIFICANT_TEMPERATURE_DIFFERENCE ) {
        var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        var i;
        for ( i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
          var timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          var thermalEnergyLost = ( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) * HeatTransferConstants.getAirToSurroundingAirHeatTransferFactor() * timeStep;
          this.changeEnergy( -thermalEnergyLost );
        }
      }
    },

    /**
     * *
     * @param {number} deltaEnergy
     */
    changeEnergy: function( deltaEnergy ) {
      energy += deltaEnergy;
    },

    /**
     * *
     * @returns {number}
     */
    getEnergy: function() {
      return energy;
    },

    /**
     * *
     */
    reset: function() {
      energy = INITIAL_ENERGY;
      this.energyChunkList.clear();
    },

    /**
     * *
     * @param energyContainer
     * @param dt
     */
    exchangeEnergyWith: function( energyContainer, dt ) {
      var thermalContactLength = this.getThermalContactArea().getThermalContactLength( energyContainer.getThermalContactArea() );
      if ( thermalContactLength > 0 ) {
        var excessEnergy = energyContainer.getEnergyBeyondMaxTemperature();
        if ( excessEnergy === 0 ) {
          // Container is below max temperature, exchange energy normally.
          var heatTransferConstant = HeatTransferConstants.getHeatTransferFactor( this.getEnergyContainerCategory(), energyContainer.getEnergyContainerCategory() );
          var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
          var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
          var i;
          for ( i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
            var timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
            var thermalEnergyGained = ( energyContainer.getTemperature() - this.getTemperature() ) * thermalContactLength * heatTransferConstant * timeStep;
            energyContainer.changeEnergy( -thermalEnergyGained );
            this.changeEnergy( thermalEnergyGained );
          }
        } else {
          // Item is at max temperature.  Shed all excess energy into the air.
          energyContainer.changeEnergy( -excessEnergy );
          this.changeEnergy( excessEnergy );
        }
      }
    },

    /**
     * *
     * @param {EnergyChunk} energyChunk
     * @param initialWanderConstraint
     */
    addEnergyChunk: function( energyChunk, initialWanderConstraint ) {
      energyChunk.zPosition = 0;
      this.energyChunkList.push( energyChunk );
      this.energyChunkWanderControllers.push( new EnergyChunkWanderController( energyChunk,
        new Property( new Vector2( energyChunk.positionProperty.value.x, SIZE.height ) ),
        initialWanderConstraint ) );
    },

    /**
     *
     * @returns {Vector2}
     */
    getCenterPoint: function() {
      return new Vector2( 0, SIZE.height / 2 );
    },

    requestEnergyChunk: function( point ) {
      // Create a new chunk at the top of the air above the specified point.
      return new EnergyChunk( EnergyType.THERMAL, new Vector2( point.x, SIZE.height ), new Vector2( 0, 0 ), this.energyChunksVisibleProperty );
    },

    /**
     * *
     * @returns {ThermalContactArea}
     */
    getThermalContactArea: function() {
      return THERMAL_CONTACT_AREA;
    },

    /**
     * *
     * @returns {number}
     */
    getTemperature: function() {
      return energy / ( MASS * SPECIFIC_HEAT );
    },

    getEnergyChunkList: function() {
      return this.energyChunkList;
    },

    /**
     * *
     * @returns {EnergyContainerCategory.AIR|*|PropertySet.AIR}
     */
    getEnergyContainerCategory: function() {
      return EnergyContainerCategory.AIR;
    },

    /**
     * *
     * @returns {number}
     */
    getEnergyBeyondMaxTemperature: function() {
      // Air temperature is unlimited.
      return 0;
    }
  } );
} );

