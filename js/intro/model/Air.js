// Copyright 2014-2018, University of Colorado Boulder


/**
 * A type that represents the air in the model.  Air can hold heat, and can exchange thermal energy with other model
 * objects.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants

  // 2D size of the air.  It is sized such that it will extend off the left, right, and top edges of screen for the
  // most common aspect ratios of the view.
  var SIZE = new Dimension2( 0.7, 0.5 );

  // The thickness of the slice of air being modeled.  This is basically the z dimension, and is used solely for
  // volume calculations.
  var DEPTH = 0.1; // in meters

  // constants that define the heat carrying capacity of the air.
  var SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
  var DENSITY = 10; // In kg/m^3, far more dense than real air (real air is 0.001), done to make things cool faster

  // derived constants
  var VOLUME = SIZE.width * SIZE.height * DEPTH;
  var MASS = VOLUME * DENSITY;
  var INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
  var THERMAL_CONTACT_AREA = new ThermalContactArea( new Bounds2( -SIZE.width / 2, 0, SIZE.width, SIZE.height ), true );

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty - visibility of energy chunks, used when creating new ones
   * @constructor
   */
  function Air( energyChunksVisibleProperty ) {

    // @private {BooleanProperty}
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @public (read-only) - list of energy chunks owned by this model element
    this.energyChunkList = new ObservableArray();

    // @private {Array<EnergyChunkWanderController>} - wander controolers for energy chunks that are owned by this model
    // element but are wandering outside of it
    this.energyChunkWanderControllers = [];

    // @private {number} - total energy of the air, accessible through getters/setters defined below
    this.energy = INITIAL_ENERGY;
  }

  energyFormsAndChanges.register( 'Air', Air );

  return inherit( Object, Air, {

    /**
     * step function for this model element
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step: function( dt ) {

      var self = this;
      var wanderControllers = this.energyChunkWanderControllers.slice();

      wanderControllers.forEach( function( wanderController ) {
        wanderController.updatePosition( dt );
        if ( wanderController.isDestinationReached() ) {

          // The energy chuck has reached its destination, which for the air means it has risen out of view, so remove
          // it from the model.
          self.energyChunkList.remove( wanderController.energyChunk );
          _.pull( self.energyChunkWanderControllers, wanderController );
        }
      } );

      this.equalizeWithSurroundingAir( dt );
    },

    /**
     * This method simulates how air in a particular area loses heat over time as it equalizes with other air nearby.
     * It assumes that the surrounding air is infinite and is at room temperature.
     * @param {number} dt - delta time, in seconds
     * @private
     */
    equalizeWithSurroundingAir: function( dt ) {
      var self = this;
      if ( Math.abs( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) >
           EFACConstants.SIGNIFICANT_TEMPERATURE_DIFFERENCE ) {

        var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        _.times( numFullTimeStepExchanges + 1, function( index ) {
          var timeStep = index < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          var thermalEnergyLost = ( self.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) *
                                  HeatTransferConstants.getAirToSurroundingAirHeatTransferFactor() * timeStep;
          self.changeEnergy( -thermalEnergyLost );

        } );
      }
    },

    /**
     * @param {number} deltaEnergy
     * @public
     */
    changeEnergy: function( deltaEnergy ) {
      this.energy += deltaEnergy;
    },

    /**
     * @returns {number}
     * @public
     */
    getEnergy: function() {
      return this.energy;
    },

    /**
     * @public
     */
    reset: function() {
      this.energy = INITIAL_ENERGY;
      this.energyChunkList.clear();
    },

    /**
     * exchange thermal energy with the provided energy container
     * @param energyContainer
     * @param dt
     * @public
     */
    exchangeEnergyWith: function( energyContainer, dt ) {
      var thermalContactLength = this.thermalContactArea.getThermalContactLength( energyContainer.thermalContactArea );
      if ( thermalContactLength > 0 ) {

        var energyToExchange = 0;

        // calculate the amount of energy to exchange based on the thermal differential
        var heatTransferConstant = HeatTransferConstants.getHeatTransferFactor(
          this.energyContainerCategory,
          energyContainer.energyContainerCategory
        );
        var numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        var leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        for ( var i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
          var timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          var thermalEnergyGained = ( energyContainer.getTemperature() - this.getTemperature() ) *
                                    thermalContactLength * heatTransferConstant * timeStep;
          energyToExchange += thermalEnergyGained;
        }

        // If the container has "excess energy", which can happen in cases such as where energy has been added to water
        // that is already at the boiling point, all of that energy should be dumped into the air.
        if ( energyToExchange >= 0 ) {
          energyToExchange = Math.max( energyToExchange, energyContainer.getEnergyBeyondMaxTemperature() );
        }

        // calculations are complete, do the actual exchange
        energyContainer.changeEnergy( -energyToExchange );
        this.changeEnergy( energyToExchange );
      }
    },

    /**
     * @param {EnergyChunk} energyChunk
     * @param {Range} horizontalWanderConstraint
     */
    addEnergyChunk: function( energyChunk, horizontalWanderConstraint ) {
      energyChunk.zPositionProperty.value = 0;
      this.energyChunkList.push( energyChunk );
      this.energyChunkWanderControllers.push( new EnergyChunkWanderController(
        energyChunk,
        new Property( new Vector2( energyChunk.positionProperty.value.x, SIZE.height ) ),
        { horizontalWanderConstraint: horizontalWanderConstraint }
      ) );
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint: function() {
      return new Vector2( 0, SIZE.height / 2 );
    },

    /**
     * create a new energy chunk at the top of the air above the specified point
     * @param {Vector2} point
     * @returns {EnergyChunk}
     * @public
     */
    requestEnergyChunk: function( point ) {

      // create a new chunk at the top of the air above the specified point
      return new EnergyChunk(
        EnergyType.THERMAL,
        new Vector2( point.x, SIZE.height ),
        new Vector2( 0, 0 ),
        this.energyChunksVisibleProperty
      );
    },

    /**
     * get the thermal contact area for air, where thermal energy may be exchanged with other objects
     * @returns {ThermalContactArea}
     * @public
     */
    get thermalContactArea() {
      return THERMAL_CONTACT_AREA;
    },

    /**
     * get the air temperature
     * @returns {number}
     * @public
     */
    getTemperature: function() {
      return this.energy / ( MASS * SPECIFIC_HEAT );
    },

    /**
     * @returns {EnergyContainerCategory}
     * @public
     */
    get energyContainerCategory() {
      return EnergyContainerCategory.AIR;
    },

    /**
     * @returns {number}
     * @public
     */
    getEnergyBeyondMaxTemperature: function() {

      // air temperature is unlimited
      return 0;
    }
  } );
} );