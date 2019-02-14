// Copyright 2014-2019, University of Colorado Boulder

/**
 * A type that represents the air in the model. Air can hold heat and exchange thermal energy with other model objects.
 *
 * @author John Blanco
 */

define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  const EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Property = require( 'AXON/Property' );
  const ThermalContactArea = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ThermalContactArea' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants

  // 2D size of the air. It is sized such that it will extend off the left, right, and top edges of screen for the
  // most common aspect ratios of the view.
  const SIZE = new Dimension2( 0.7, EFACConstants.INTRO_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT );

  // The thickness of the slice of air being modeled.  This is basically the z dimension, and is used solely for
  // volume calculations.
  const DEPTH = 0.1; // in meters

  // constants that define the heat carrying capacity of the air.
  const SPECIFIC_HEAT = 1012; // In J/kg-K, source = design document.
  const DENSITY = 10; // In kg/m^3, far more dense than real air (real air is 0.001), done to make things cool faster

  // derived constants
  const VOLUME = SIZE.width * SIZE.height * DEPTH;
  const MASS = VOLUME * DENSITY;
  const INITIAL_ENERGY = MASS * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE;
  const THERMAL_CONTACT_AREA = new ThermalContactArea( new Bounds2( -SIZE.width / 2, 0, SIZE.width, SIZE.height ), true );

  // instance counter used for creating unique IDs
  let instanceCounter = 0;

  class Air {

    /**
     * @param {BooleanProperty} energyChunksVisibleProperty - visibility of energy chunks, used when creating new ones
     */
    constructor( energyChunksVisibleProperty ) {

      // @private {BooleanProperty}
      this.energyChunksVisibleProperty = energyChunksVisibleProperty;

      // @public (read-only) - list of energy chunks owned by this model element
      this.energyChunkList = new ObservableArray();

      // @public (read-only) {string} - unique ID
      this.id = `air-${instanceCounter++}`;

      // @private {Array<EnergyChunkWanderController>} - wander controolers for energy chunks that are owned by this model
      // element but are wandering outside of it
      this.energyChunkWanderControllers = [];

      // @private {number} - total energy of the air, accessible through getters/setters defined below
      this.energy = INITIAL_ENERGY;
    }

    /**
     * step function for this model element
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step( dt ) {
      const wanderControllers = this.energyChunkWanderControllers.slice();

      wanderControllers.forEach( wanderController => {
        wanderController.updatePosition( dt );
        if ( wanderController.isDestinationReached() ) {

          // The energy chuck has reached its destination, which for the air means it has risen out of view, so remove
          // it from the model.
          this.energyChunkList.remove( wanderController.energyChunk );
          _.pull( this.energyChunkWanderControllers, wanderController );
        }
      } );

      this.equalizeWithSurroundingAir( dt );
    }

    /**
     * This method simulates how air in a particular area loses heat over time as it equalizes with other air nearby.
     * It assumes that the surrounding air is infinite and is at room temperature.
     * @param {number} dt - delta time, in seconds
     * @private
     */
    equalizeWithSurroundingAir( dt ) {
      if ( Math.abs( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) >
           EFACConstants.SIGNIFICANT_TEMPERATURE_DIFFERENCE ) {

        const numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        const leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        _.times( numFullTimeStepExchanges + 1, index => {
          const timeStep = index < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          const thermalEnergyLost = ( this.getTemperature() - EFACConstants.ROOM_TEMPERATURE ) *
                                  HeatTransferConstants.getAirToSurroundingAirHeatTransferFactor() * timeStep;
          this.changeEnergy( -thermalEnergyLost );

        } );
      }
    }

    /**
     * @param {number} deltaEnergy
     * @public
     */
    changeEnergy( deltaEnergy ) {
      this.energy += deltaEnergy;
    }

    /**
     * @returns {number}
     * @public
     */
    getEnergy() {
      return this.energy;
    }

    /**
     * @public
     */
    reset() {
      this.energy = INITIAL_ENERGY;
      this.energyChunkList.clear();
    }

    /**
     * exchange thermal energy with the provided energy container
     * @param {RectangularThermalMovableModelElement} energyContainer
     * @param {number} dt - time in seconds
     * @returns {number} - energy, in joules, that is transferred from air to the object, negative if energy was absosrbed
     * @public
     */
    exchangeEnergyWith( energyContainer, dt ) {
      let energyToExchange = 0;
      const thermalContactLength = this.thermalContactArea.getThermalContactLength( energyContainer.thermalContactArea );
      if ( thermalContactLength > 0 ) {

        // calculate the amount of energy to exchange based on the thermal differential
        const heatTransferConstant = HeatTransferConstants.getHeatTransferFactor(
          this.energyContainerCategory,
          energyContainer.energyContainerCategory
        );
        const numFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        const leftoverTime = dt - ( numFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
        for ( let i = 0; i < numFullTimeStepExchanges + 1; i++ ) {
          const timeStep = i < numFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
          const thermalEnergyGained = ( energyContainer.getTemperature() - this.getTemperature() ) *
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
      return -energyToExchange;
    }

    /**
     * @param {EnergyChunk} energyChunk
     * @param {Range} horizontalWanderConstraint
     */
    addEnergyChunk( energyChunk, horizontalWanderConstraint ) {
      energyChunk.zPositionProperty.value = 0;
      this.energyChunkList.push( energyChunk );
      this.energyChunkWanderControllers.push( new EnergyChunkWanderController(
        energyChunk,
        new Property( new Vector2( energyChunk.positionProperty.value.x, SIZE.height ) ),
        { horizontalWanderConstraint: horizontalWanderConstraint }
      ) );
    }

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint() {
      return new Vector2( 0, SIZE.height / 2 );
    }

    /**
     * create a new energy chunk at the top of the air above the specified point
     * @param {Vector2} point
     * @returns {EnergyChunk}
     * @public
     */
    requestEnergyChunk( point ) {

      // create a new chunk at the top of the air above the specified point
      return new EnergyChunk(
        EnergyType.THERMAL,
        new Vector2( point.x, SIZE.height ),
        new Vector2( 0, 0 ),
        this.energyChunksVisibleProperty
      );
    }

    /**
     * get the thermal contact area for air, where thermal energy may be exchanged with other objects
     * @returns {ThermalContactArea}
     * @public
     */
    get thermalContactArea() {
      return THERMAL_CONTACT_AREA;
    }

    /**
     * get the air temperature
     * @returns {number}
     * @public
     */
    getTemperature() {
      return this.energy / ( MASS * SPECIFIC_HEAT );
    }

    /**
     * @returns {EnergyContainerCategory}
     * @public
     */
    get energyContainerCategory() {
      return EnergyContainerCategory.AIR;
    }

    /**
     * @returns {number}
     * @public
     */
    getEnergyBeyondMaxTemperature() {

      // air temperature is unlimited
      return 0;
    }
  }

  return energyFormsAndChanges.register( 'Air', Air );
} );