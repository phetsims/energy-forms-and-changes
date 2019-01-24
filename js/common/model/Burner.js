// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model element that represents a burner in the simulation.  The burner can heat and also cool other model elements.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */


define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ModelElement' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var SIDE_LENGTH = 0.075; // in meters
  var MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen
  var CONTACT_DISTANCE = 0.001; // in meters
  var ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // in meters, empirically chosen

  // Because of the way that energy chunks are exchanged between thermal modeling elements within this simulation,
  // things can end up looking a bit odd if a burner is turned on with nothing on it.  To account for this, a separate
  // energy generation rate is used when a burner is exchanging energy directly with the air.
  // Units: joules/sec, multiplier empirically chosen.
  var MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3;

  // counter used by constructor to create unique IDs for each burner
  var idCounter = 0;

  /**
   * @param {Vector2} position - the position in model space where this burner exists
   * @param {Property.<boolean>} energyChunksVisibleProperty - controls whether the energy chunks are visible
   * @constructor
   */
  function Burner( position, energyChunksVisibleProperty ) {

    ModelElement.call( this, position );

    // @public (read-only) {string} - unique ID, used for debug
    this.id = 'burner-' + idCounter++;

    // @public {Property<number>}
    this.heatCoolLevelProperty = new Property( 0 );

    // @public (read-only) {ObservableArray.<EnergyChunk>}
    this.energyChunkList = new ObservableArray();

    // @private {Vector2}
    this.position = position;

    // @private {Object[]} - motion strategies that control the movement of the energy chunks owned by this burner
    this.energyChunkMotionStrategies = [];

    // @private {Range} - used to keep incoming energy chunks from wandering very far to the left or right
    this.incomingEnergyChunkWanderBounds = new Range( position.x - SIDE_LENGTH / 4, position.x + SIDE_LENGTH / 4 );

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
    var perspectiveCompensation = this.bounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                  Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;

    // @public - see base class for description
    this.topSurface = new HorizontalSurface(
      new Vector2( this.position.x, this.bounds.maxY ),
      this.bounds.maxX + perspectiveCompensation - ( this.bounds.minX - perspectiveCompensation ),
      this
    );
  }

  energyFormsAndChanges.register( 'Burner', Burner );

  return inherit( ModelElement, Burner, {

    /**
     * Get a rectangle that defines the outline of the burner.  In the model the burner is essentially a 2D rectangle.
     * @returns {Rectangle} - rectangle that defines the outline in model space.
     * @public
     * @override
     */
    getCompositeBounds: function() {
      return this.bounds;
    },

    /**
     * @returns {HorizontalSurface}
     * @public
     */
    getTopSurface: function() {
      return this.topSurface;
    },

    /**
     * Interact with a thermal energy container, adding or removing energy based on the current heat/cool setting.
     * NOTE: this shouldn't be used for air - there is a specific method for that
     * @param {ThermalEnergyContainer} thermalEnergyContainer - model object that will get or give energy
     * @param {number} dt - amount of time (delta time)
     * @returns {number} - amount of energy transferred in joules, can be negative if energy was drawn from object
     * @public
     */
    addOrRemoveEnergyToFromObject: function( thermalEnergyContainer, dt ) {

      var deltaEnergy = 0;

      if ( this.inContactWith( thermalEnergyContainer ) ) {
        if ( thermalEnergyContainer.getTemperature() > EFACConstants.WATER_FREEZING_POINT_TEMPERATURE ) {
          deltaEnergy = MAX_ENERGY_GENERATION_RATE * this.heatCoolLevelProperty.value * dt;

          // make sure we don't cool the object below its minimum allowed energy level
          if ( this.heatCoolLevelProperty.value < 0 ) {
            if ( Math.abs( deltaEnergy ) > thermalEnergyContainer.getEnergyAboveMinimum() ) {
              deltaEnergy = -thermalEnergyContainer.getEnergyAboveMinimum();
            }
          }
        }
        thermalEnergyContainer.changeEnergy( deltaEnergy );
      }
      return deltaEnergy;
    },

    /**
     * Exchange energy with the air.  This has specific behavior that is different from addOrRemoveEnergyToFromObject,
     * defined elsewhere in this type.
     * @param {Air} air - air as a thermal energy container
     * @param dt - amount of time (delta time)
     * @returns {number} - energy, in joules, transferred to the air, negative if energy was absorbed
     * @public
     */
    addOrRemoveEnergyToFromAir: function( air, dt ) {
      var deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * this.heatCoolLevelProperty.value * dt;
      air.changeEnergy( deltaEnergy );
      return deltaEnergy;
    },

    /**
     * determine if the burner is in contact with a thermal energy container
     * @param {ThermalEnergyContainer} thermalEnergyContainer
     * @returns {boolean}
     * @public
     */
    inContactWith: function( thermalEnergyContainer ) {
      var burnerRect = this.getCompositeBounds();
      var area = thermalEnergyContainer.thermalContactArea;
      var xContact = ( area.centerX > burnerRect.minX && area.centerX < burnerRect.maxX );
      var yContact = ( Math.abs( area.minY - burnerRect.maxY ) < CONTACT_DISTANCE );
      return ( xContact && yContact );
    },

    /**
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunk: function( energyChunk ) {

      // make sure the chunk is at the front (which makes it fully opaque in the view)
      energyChunk.zPositionProperty.value = 0;

      // create a motion strategy that will move this energy chunk
      var motionStrategy = new EnergyChunkWanderController(
        energyChunk,
        new Property( this.getCenterPoint() ),
        { horizontalWanderConstraint: this.incomingEnergyChunkWanderBounds, wanderAngleVariation: Math.PI * 0.15 }
      );

      energyChunk.zPosition = 0;

      // add the chunk and its motion strategy to this model
      this.energyChunkList.add( energyChunk );
      this.energyChunkMotionStrategies.push( motionStrategy );
    },

    /**
     * request an energy chunk from the burner
     * @param {Vector2} point - point from which to search for closest chunk
     * @returns {EnergyChunk} - closest energy chunk, null if none are contained
     * @public
     */
    extractEnergyChunkClosestToPoint: function( point ) {
      var self = this;
      var closestEnergyChunk = null;
      if ( this.energyChunkList.length > 0 ) {
        this.energyChunkList.forEach( function( energyChunk ) {
          if ( energyChunk.positionProperty.value.distance( self.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE &&
               ( closestEnergyChunk === null ||
                 energyChunk.positionProperty.value.distance( point ) <
                 closestEnergyChunk.positionProperty.value.distance( point ) ) ) {

            // found a closer chunk
            closestEnergyChunk = energyChunk;
          }
        } );

        this.energyChunkList.remove( closestEnergyChunk );
        this.energyChunkMotionStrategies.forEach( function( energyChunkWanderController, index ) {
          if ( energyChunkWanderController.energyChunk === closestEnergyChunk ) {
            self.energyChunkMotionStrategies.splice( index, 1 );
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
    },

    /**
     * request an energy chunk from the burner based on provided bounds
     * @param {Bounds2} bounds - bounds to which the energy chunks will be heading
     * @returns {EnergyChunk} - closest energy chunk
     * @public
     */
    extractEnergyChunkClosestToBounds: function( bounds ) {

      // verify that the bounds where the energy chunk is going are above this burner
      var burnerBounds = this.getCompositeBounds();
      assert && assert(
      bounds.minY >= burnerBounds.maxY && bounds.centerX > burnerBounds.minX && bounds.centerX < burnerBounds.maxX,
        'items should only be on top of burner when getting ECs'
      );
      return this.extractEnergyChunkClosestToPoint( new Vector2( bounds.centerX, bounds.minY ) );
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint: function() {
      return new Vector2( this.position.x, this.position.y + SIDE_LENGTH / 2 );
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterTopPoint: function() {
      return new Vector2( this.position.x, this.position.y + SIDE_LENGTH );
    },

    /**
     * @public
     */
    reset: function() {
      ModelElement.prototype.reset.call( this );
      this.energyChunkList.clear();
      this.heatCoolLevelProperty.reset();
    },

    /**
     * @param {ThermalEnergyContainer[]} thermalEnergyContainers
     * @returns {boolean}
     * @public
     */
    areAnyOnTop: function( thermalEnergyContainers ) {
      var self = this; // Provide a handle for use in nested callback
      var onTop = false;
      thermalEnergyContainers.forEach( function( thermalEnergyContainer ) {
        if ( self.inContactWith( thermalEnergyContainer ) ) {
          onTop = true;
        }
      } );
      return onTop;
    },

    /**
     * animate the energy chunks
     * @param {number} dt
     * @private
     */
    step: function( dt ) {
      var self = this;
      var controllers = this.energyChunkMotionStrategies.slice();

      controllers.forEach( function( controller ) {

        controller.updatePosition( dt );

        if ( controller.isDestinationReached() ) {
          self.energyChunkList.remove( controller.energyChunk );
          _.pull( self.energyChunkMotionStrategies, controller );
        }
      } );
    },

    /**
     * get a rectangle in model space the corresponds to where the flame and ice exist
     * @returns {Rectangle}
     * @public
     */
    getFlameIceRect: function() {

      // word of warning: this needs to stay consistent with the view
      var outlineRect = this.getCompositeBounds();
      var width = outlineRect.width;
      var height = outlineRect.height;
      return new Rectangle( outlineRect.centerX - width / 4, outlineRect.centerY, width / 2, height / 2 );
    },

    /**
     * get burner temperature, clamped at minimum to the freezing point of water
     * @returns {number}
     * @public
     */
    getTemperature: function() {
      var temperature = EFACConstants.ROOM_TEMPERATURE + this.heatCoolLevelProperty.value * 100;
      return Math.max( temperature, EFACConstants.WATER_FREEZING_POINT_TEMPERATURE );
    }

  } );
} );

