// Copyright 2014-2019, University of Colorado Boulder

/**
 * Model element that represents a burner in the simulation.  The burner can heat and also cool other model elements.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  const ModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ModelElement' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const Range = require( 'DOT/Range' );
  const Rectangle = require( 'DOT/Rectangle' );
  const Vector2 = require( 'DOT/Vector2' );
  const Vector2Property = require( 'DOT/Vector2Property' );

  // constants
  const SIDE_LENGTH = 0.075; // in meters
  const MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen
  const CONTACT_DISTANCE = 0.001; // in meters
  const ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // in meters, empirically chosen

  // Because of the way that energy chunks are exchanged between thermal modeling elements within this simulation,
  // things can end up looking a bit odd if a burner is turned on with nothing on it.  To account for this, a separate
  // energy generation rate is used when a burner is exchanging energy directly with the air.
  // Units: joules/sec, multiplier empirically chosen.
  const MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3;

  // counter used by constructor to create unique IDs for each burner
  let idCounter = 0;

  class Burner extends ModelElement {

    /**
     * @param {Vector2} position - the position in model space where this burner exists
     * @param {Property.<boolean>} energyChunksVisibleProperty - controls whether the energy chunks are visible
     */
    constructor( position, energyChunksVisibleProperty ) {
      super( position );

      // @public (read-only) {string} - unique ID, used for debug
      this.id = `burner-${idCounter++}`;

      // @public {NumberProperty}
      this.heatCoolLevelProperty = new NumberProperty( 0, {
        range: new Range( -1, 1 )
      } );

      // @public (read-only) {ObservableArray.<EnergyChunk>}
      this.energyChunkList = new ObservableArray();

      // @private {Vector2}
      this.position = position;

      // @private {Object[]} - motion strategies that control the movement of the energy chunks owned by this burner
      this.energyChunkMotionStrategies = [];

      // @private {Range} - used to keep incoming energy chunks from wandering very far to the left or right
      this.incomingEnergyChunkWanderBounds = new Range( position.x - SIDE_LENGTH / 3, position.x + SIDE_LENGTH / 3 );

      // @private {Property.<boolean>}
      this.energyChunksVisibleProperty = energyChunksVisibleProperty;

      // @private {Bounds2} - bounds of the burner in model space
      this.bounds = new Bounds2(
        position.x - SIDE_LENGTH / 2,
        position.y,
        position.x + SIDE_LENGTH / 2,
        position.y + SIDE_LENGTH
      );

      // add position test bounds (see definition in base class for more info)
      this.relativePositionTestingBoundsList.push( new Bounds2( -SIDE_LENGTH / 2, 0, SIDE_LENGTH / 2, SIDE_LENGTH ) );

      // Create and add the top surface.  Some compensation for perspective is necessary in order to avoid problems with
      // edge overlap when dropping objects on top of burner.
      const perspectiveCompensation = this.bounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                      Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;

      // @public - see base class for description
      this.topSurface = new HorizontalSurface(
        new Vector2( this.position.x, this.bounds.maxY ),
        this.bounds.maxX + perspectiveCompensation - ( this.bounds.minX - perspectiveCompensation ),
        this
      );
    }

    /**
     * Get a rectangle that defines the outline of the burner.  In the model the burner is essentially a 2D rectangle.
     * @returns {Rectangle} - rectangle that defines the outline in model space.
     * @public
     */
    getBounds() {
      return this.bounds;
    }

    /**
     * Interact with a thermal container, adding or removing energy based on the current heat/cool setting.
     * NOTE: this shouldn't be used for air - there is a specific method for that
     * @param {RectangularThermalMovableModelElement} thermalContainer - model object that will get or give energy
     * @param {number} dt - amount of time (delta time)
     * @returns {number} - amount of energy transferred in joules, can be negative if energy was drawn from object
     * @public
     */
    addOrRemoveEnergyToFromObject( thermalContainer, dt ) {
      let deltaEnergy = 0;

      if ( this.inContactWith( thermalContainer ) ) {
        if ( thermalContainer.getTemperature() > EFACConstants.WATER_FREEZING_POINT_TEMPERATURE ) {
          deltaEnergy = MAX_ENERGY_GENERATION_RATE * this.heatCoolLevelProperty.value * dt;

          // make sure we don't cool the object below its minimum allowed energy level
          if ( this.heatCoolLevelProperty.value < 0 ) {
            if ( Math.abs( deltaEnergy ) > thermalContainer.getEnergyAboveMinimum() ) {
              deltaEnergy = -thermalContainer.getEnergyAboveMinimum();
            }
          }
        }
        thermalContainer.changeEnergy( deltaEnergy );
      }
      return deltaEnergy;
    }

    /**
     * Exchange energy with the air.  This has specific behavior that is different from addOrRemoveEnergyToFromObject,
     * defined elsewhere in this type.
     * @param {Air} air - air as a thermal energy container
     * @param dt - amount of time (delta time)
     * @returns {number} - energy, in joules, transferred to the air, negative if energy was absorbed
     * @public
     */
    addOrRemoveEnergyToFromAir( air, dt ) {
      const deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * this.heatCoolLevelProperty.value * dt;
      air.changeEnergy( deltaEnergy );
      return deltaEnergy;
    }

    /**
     * determine if the burner is in contact with a thermal energy container
     * @param {RectangularThermalMovableModelElement} thermalContainer
     * @returns {boolean}
     * @public
     */
    inContactWith( thermalContainer ) {
      const burnerRect = this.getBounds();
      const area = thermalContainer.thermalContactArea;
      const xContact = ( area.centerX > burnerRect.minX && area.centerX < burnerRect.maxX );
      const yContact = ( Math.abs( area.minY - burnerRect.maxY ) < CONTACT_DISTANCE );
      return ( xContact && yContact );
    }

    /**
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunk( energyChunk ) {

      // make sure the chunk is at the front (which makes it fully opaque in the view)
      energyChunk.zPositionProperty.value = 0;

      // create a motion strategy that will move this energy chunk
      const motionStrategy = new EnergyChunkWanderController(
        energyChunk,
        new Vector2Property( this.getCenterPoint() ),
        { horizontalWanderConstraint: this.incomingEnergyChunkWanderBounds, wanderAngleVariation: Math.PI * 0.15 }
      );

      energyChunk.zPosition = 0;

      // add the chunk and its motion strategy to this model
      this.energyChunkList.add( energyChunk );
      this.energyChunkMotionStrategies.push( motionStrategy );
    }

    /**
     * request an energy chunk from the burner
     * @param {Vector2} point - point from which to search for closest chunk
     * @returns {EnergyChunk} - closest energy chunk, null if none are contained
     * @public
     */
    extractEnergyChunkClosestToPoint( point ) {
      let closestEnergyChunk = null;
      if ( this.energyChunkList.length > 0 ) {
        this.energyChunkList.forEach( energyChunk => {
          if ( energyChunk.positionProperty.value.distance( this.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE &&
               ( closestEnergyChunk === null ||
                 energyChunk.positionProperty.value.distance( point ) <
                 closestEnergyChunk.positionProperty.value.distance( point ) ) ) {

            // found a closer chunk
            closestEnergyChunk = energyChunk;
          }
        } );

        this.energyChunkList.remove( closestEnergyChunk );
        this.energyChunkMotionStrategies.forEach( ( energyChunkWanderController, index ) => {
          if ( energyChunkWanderController.energyChunk === closestEnergyChunk ) {
            this.energyChunkMotionStrategies.splice( index, 1 );
          }
        } );
      }

      if ( closestEnergyChunk === null && this.heatCoolLevelProperty.value > 0 ) {

        // create an energy chunk
        closestEnergyChunk = new EnergyChunk(
          EnergyType.THERMAL,
          this.getCenterPoint(), // will originate from the center of this burner
          new Vector2( 0, 0 ),
          this.energyChunksVisibleProperty
        );
      }

      if ( closestEnergyChunk === null ) {

        // This probably shouldn't ever occur, but it doesn't really warrant an assert, so log a warning that will
        // encourage investigation if it DOES happen.
        console.warn( 'Burner was unable to supply energy chunks.' );
      }
      return closestEnergyChunk;
    }

    /**
     * request an energy chunk from the burner based on provided bounds
     * @param {Bounds2} bounds - bounds to which the energy chunks will be heading
     * @returns {EnergyChunk} - closest energy chunk
     * @public
     */
    extractEnergyChunkClosestToBounds( bounds ) {

      // verify that the bounds where the energy chunk is going are above this burner
      const burnerBounds = this.getBounds();
      assert && assert(
      bounds.minY > burnerBounds.centerY && bounds.centerX > burnerBounds.minX && bounds.centerX < burnerBounds.maxX,
        'items should only be on top of burner when getting ECs'
      );
      return this.extractEnergyChunkClosestToPoint( new Vector2( bounds.centerX, bounds.minY ) );
    }

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint() {
      return new Vector2( this.position.x, this.position.y + SIDE_LENGTH / 2 );
    }

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterTopPoint() {
      return new Vector2( this.position.x, this.position.y + SIDE_LENGTH );
    }

    /**
     * @public
     */
    reset() {
      super.reset();
      this.energyChunkList.clear();
      this.heatCoolLevelProperty.reset();
    }

    /**
     * @param {RectangularThermalMovableModelElement[]} thermalContainers
     * @returns {boolean}
     * @public
     */
    areAnyOnTop( thermalContainers ) {
      let onTop = false;
      thermalContainers.forEach( thermalContainer => {
        if ( this.inContactWith( thermalContainer ) ) {
          onTop = true;
        }
      } );
      return onTop;
    }

    /**
     * animate the energy chunks
     * @param {number} dt
     * @private
     */
    step( dt ) {
      const controllers = this.energyChunkMotionStrategies.slice();

      controllers.forEach( controller => {
        controller.updatePosition( dt );

        if ( controller.isDestinationReached() ) {
          this.energyChunkList.remove( controller.energyChunk );
          _.pull( this.energyChunkMotionStrategies, controller );
        }
      } );
    }

    /**
     * get a rectangle in model space the corresponds to where the flame and ice exist
     * @returns {Rectangle}
     * @public
     */
    getFlameIceRect() {

      // word of warning: this needs to stay consistent with the view
      const outlineRect = this.getBounds();
      const width = outlineRect.width;
      const height = outlineRect.height;
      return new Rectangle( outlineRect.centerX - width / 4, outlineRect.centerY, width / 2, height / 2 );
    }

    /**
     * get burner temperature, clamped at minimum to the freezing point of water
     * @returns {number}
     * @public
     */
    getTemperature() {
      const temperature = EFACConstants.ROOM_TEMPERATURE + this.heatCoolLevelProperty.value * 100;
      return Math.max( temperature, EFACConstants.WATER_FREEZING_POINT_TEMPERATURE );
    }
  }

  return energyFormsAndChanges.register( 'Burner', Burner );
} );

