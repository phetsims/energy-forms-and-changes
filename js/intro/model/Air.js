// Copyright 2014-2021, University of Colorado Boulder

/**
 * A type that represents the air in the model. Air can hold heat and exchange thermal energy with other model objects.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyChunkWanderController from '../../common/model/EnergyChunkWanderController.js';
import EnergyContainerCategory from '../../common/model/EnergyContainerCategory.js';
import EnergyType from '../../common/model/EnergyType.js';
import HeatTransferConstants from '../../common/model/HeatTransferConstants.js';
import ThermalContactArea from '../../common/model/ThermalContactArea.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

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
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkWanderControllerGroup} energyChunkWanderControllerGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, energyChunkGroup, energyChunkWanderControllerGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    // @private {BooleanProperty}
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @public (read-only) - list of energy chunks owned by this model element
    this.energyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    // @public (read-only) {string} - unique ID
    this.id = `air-${instanceCounter++}`;

    // @private
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkWanderControllerGroup = energyChunkWanderControllerGroup;

    // @private {ObservableArrayDef.<EnergyChunkWanderController>} - wander controllers for energy chunks that are owned by
    // this model element but are wandering outside of it.
    this.energyChunkWanderControllers = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkWanderControllers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkWanderController.EnergyChunkWanderControllerIO ) )
    } );

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
        this.energyChunkWanderControllers.remove( wanderController );
        this.energyChunkGroup.disposeElement( wanderController.energyChunk );
        this.energyChunkWanderControllerGroup.disposeElement( wanderController );
      }
    } );
  }

  /**
   * @param {number} deltaEnergy
   * @public
   */
  changeEnergy( deltaEnergy ) {
    // Do nothing - the air is considered to be a heat sink that can take or supply energy without changing
    // temperature.This was changed in Dec 2019 such that the air never gains or loses energy.  The motives for this
    // change are explained in https://github.com/phetsims/energy-forms-and-changes/issues/301.
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
    this.energyChunkList.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.energyChunkList.clear();

    this.energyChunkWanderControllers.forEach( wanderController => this.energyChunkWanderControllerGroup.disposeElement( wanderController ) );
    this.energyChunkWanderControllers.clear();
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
      const numberOfFullTimeStepExchanges = Math.floor( dt / EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
      const leftoverTime = dt - ( numberOfFullTimeStepExchanges * EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP );
      for ( let i = 0; i < numberOfFullTimeStepExchanges + 1; i++ ) {
        const timeStep = i < numberOfFullTimeStepExchanges ? EFACConstants.MAX_HEAT_EXCHANGE_TIME_STEP : leftoverTime;
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
    }
    return -energyToExchange;
  }

  /**
   * @param {EnergyChunk} energyChunk
   * @param {Range} horizontalWanderConstraint
   * @public
   */
  addEnergyChunk( energyChunk, horizontalWanderConstraint ) {
    energyChunk.zPositionProperty.value = 0;
    this.energyChunkList.push( energyChunk );
    this.energyChunkWanderControllers.push( this.energyChunkWanderControllerGroup.createNextElement(
      energyChunk,
      new Vector2Property( new Vector2( energyChunk.positionProperty.value.x, SIZE.height ) ),
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
    return this.energyChunkGroup.createNextElement(
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

energyFormsAndChanges.register( 'Air', Air );
export default Air;