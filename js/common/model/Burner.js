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
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var SIDE_LENGTH = 0.075; // In meters.
  var MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen.
  var CONTACT_DISTANCE = 0.001; // In meters.
  var ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // In meters, empirically chosen.

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

    var self = this;
    ModelElement.call( this, position );

    // @public (read-only) {string} - unique ID, used for debug
    this.id = 'burner-' + idCounter++;

    // @public {Property<number>}
    this.heatCoolLevelProperty = new Property( 0 );

    // @public (read-only) {ObservableArray.<EnergyChunk>}
    this.energyChunkList = new ObservableArray();

    // @private {Vector2}
    this.position = position;

    // @private {EnergyChunkWanderController[]}
    this.energyChunkWanderControllers = [];

    // @private {Property.<boolean>}
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Track energy transferred to anything sitting on the burner.
    this.energyExchangedWithObjectSinceLastChunkTransfer = 0; // @private

    // Track build up of energy for transferring chunks to/from the air.
    this.energyExchangedWithAirSinceLastChunkTransfer = 0; // @private

    // Create and add the top surface.  Some compensation for perspective is necessary in order to avoid problems with
    // edge overlap when dropping objects on top of burner.
    var perspectiveCompensation = self.getOutlineRect().height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                  Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE );

    // @public (read-only) {Property.<HorizontalSurface>} - surface upon which other objects can rest
    this.topSurfaceProperty.set(
      new HorizontalSurface(
        new Range(
          self.getOutlineRect().getMinX() - perspectiveCompensation,
          self.getOutlineRect().maxX + perspectiveCompensation
        ),
        self.getOutlineRect().maxY,
        this
      )
    );

    // add position test bounds (see definition in base class for more info)
    this.relativePositionTestingBoundsList.push( new Bounds2( -SIDE_LENGTH / 2, 0, SIDE_LENGTH / 2, SIDE_LENGTH ) );
  }

  energyFormsAndChanges.register( 'Burner', Burner );

  return inherit( ModelElement, Burner, {

    /**
     * Get a rectangle that defines the outline of the burner.  In the model the burner is essentially a 2D rectangle.
     * @returns {Rectangle} - rectangle that defines the outline in model space.
     * @public
     */
    getOutlineRect: function() {
      // TODO: This is wasteful to reconstruct this every time, since burners don't move, should be optimized.  Also should be bounds.
      return new Rectangle( this.position.x - SIDE_LENGTH / 2, this.position.y, SIDE_LENGTH, SIDE_LENGTH );
    },

    /**
     * @returns {Property}
     * @public
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * Interact with a thermal energy container, adding or removing energy based on the current heat/cool setting.
     * @param {ThermalEnergyContainer} thermalEnergyContainer - model object that will get or give energy
     * @param {number} dt - amount of time (delta time)
     * @public
     */
    addOrRemoveEnergyToFromObject: function( thermalEnergyContainer, dt ) {

      // this shouldn't be used for air - there is a specific method for that
      var deltaEnergy = 0;

      if ( this.inContactWith( thermalEnergyContainer ) ) {
        if ( thermalEnergyContainer.getTemperature() > EFACConstants.FREEZING_POINT_TEMPERATURE ) {
          deltaEnergy = MAX_ENERGY_GENERATION_RATE * this.heatCoolLevelProperty.value * dt;
        }
        thermalEnergyContainer.changeEnergy( deltaEnergy );
        this.energyExchangedWithObjectSinceLastChunkTransfer += deltaEnergy;
      }
    },

    /**
     * Exchange energy with the air.  This has specific behavior that is different from addOrRemoveEnergyToFromObject,
     * defined elsewhere in this type.
     * @param {Air} air - air as a thermal energy container
     * @param dt - amount of time (delta time)
     * @public
     */
    addOrRemoveEnergyToFromAir: function( air, dt ) {
      var deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * this.heatCoolLevelProperty.value * dt;
      if ( deltaEnergy > 0 ) {
        // TODO: is this a special case?
      }
      air.changeEnergy( deltaEnergy );
      this.energyExchangedWithAirSinceLastChunkTransfer += deltaEnergy;
    },

    /**
     * determine if the burner is in contact with a thermal energy container
     * @param {ThermalEnergyContainer} thermalEnergyContainer
     * @returns {boolean}
     * @public
     */
    inContactWith: function( thermalEnergyContainer ) {
      var burnerRect = this.getOutlineRect();
      var area = thermalEnergyContainer.getThermalContactArea();
      var xContact = ( area.centerX > burnerRect.minX && area.centerX < burnerRect.maxX );
      var yContact = ( Math.abs( area.minY - burnerRect.maxY ) < CONTACT_DISTANCE );
      return ( xContact && yContact );
    },

    /**
     * @param {EnergyChunk} energyChunk
     * @public
     */
    addEnergyChunk: function( energyChunk ) {

      // create a controller that will move this energy chunk around
      var controller = new EnergyChunkWanderController(
        energyChunk,
        new Property( this.getEnergyChunkStartEndPoint() ),
        null
      );

      energyChunk.zPosition = 0;

      // add the chunk and its controller to this model
      this.energyChunkList.add( energyChunk );
      this.energyChunkWanderControllers.push( controller );

      // reset energy transfer accumulators
      this.energyExchangedWithAirSinceLastChunkTransfer = 0;
      this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
    },

    /**
     * @returns {Vector2}
     * @private
     */
    getEnergyChunkStartEndPoint: function() {
      return this.getCenterPoint();
    },

    /**
     * request an energy chunk from the burner
     * @param {Vector2} point - point from which to search for closest chunk
     * @returns {EnergyChunk} - closest energy chunk, null if none are contained
     * @public
     */
    extractClosestEnergyChunk: function( point ) {
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
        this.energyChunkWanderControllers.forEach( function( energyChunkWanderController, index ) {
          if ( energyChunkWanderController.energyChunk === closestEnergyChunk ) {
            self.energyChunkWanderControllers.splice( index, 1 );
          }
        } );
      }

      if ( closestEnergyChunk === null && this.heatCoolLevelProperty.value > 0 ) {

        // create an energy chunk
        closestEnergyChunk = new EnergyChunk( EnergyType.THERMAL, this.getEnergyChunkStartEndPoint(),
          new Vector2( 0, 0 ), this.energyChunksVisibleProperty );
      }
      if ( closestEnergyChunk !== null ) {
        this.energyExchangedWithAirSinceLastChunkTransfer = 0;
        this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
      }
      else {

        // TODO: This was in the Java code, and will be left for a while, but should be removed or turned into an assert eventually.
        console.log( 'Warning: Request for energy chunk from burner when not in heat mode and no chunks contained, returning null.' );
      }
      return closestEnergyChunk;
    },

    /**
     * @returns {Vector2}
     * @public
     */
    getCenterPoint: function() {
      return new Vector2( this.position.x, this.position.y + SIDE_LENGTH / 2 );
    },

    /**
     * @public
     */
    reset: function() {
      ModelElement.prototype.reset.call( this );
      this.energyChunkList.clear();
      this.energyExchangedWithAirSinceLastChunkTransfer = 0;
      this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
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
     * @returns {number}
     * @public
     */
    getEnergyChunkCountForAir: function() {
      var self = this; // extend scope for nested loop function.
      var count = 0;
      // If there are approaching chunks, and the mode has switched to off or to heating,
      // the chunks should go back to the air (if they're not almost to the burner).
      if ( this.energyChunkList.length > 0 && this.heatCoolLevelProperty.value >= 0 ) {
        this.energyChunkList.forEach( function( energyChunk ) {
          if ( self.position.distance( energyChunk.positionProperty.value ) > ENERGY_CHUNK_CAPTURE_DISTANCE ) {
            count++;
          }
        } );
      }
      if ( count === 0 ) {
        // See whether the energy exchanged with the air since the last chunk transfer warrants another chunk.
        count = Math.round( this.energyExchangedWithAirSinceLastChunkTransfer / EFACConstants.ENERGY_PER_CHUNK );
      }
      return count;
    },

    /**
     * animate the energy chunks
     * @param {number} dt
     * @private
     */
    step: function( dt ) {
      var self = this;
      var controllers = this.energyChunkWanderControllers.splice();

      controllers.forEach( function( controller ) {

        controller.updatePosition( dt );

        if ( controller.isDestinationReached() ) {
          self.energyChunkList.remove( controller.energyChunk );

          _.pull( self.energyChunkWanderControllers, controller );
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
      var outlineRect = this.getOutlineRect();
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
      return Math.max( temperature, EFACConstants.FREEZING_POINT_TEMPERATURE );
    },

    /**
     * get the (signed) number of energy chunks for interaction with thermal objects (as opposed to air)
     * @return {number} - The umber of energy chunks that could be supplied or consumed. Negative value indicates that
     * chunks should come in.
     * @public
     */
    getEnergyChunkBalanceWithObjects: function() {
      var deltaE = this.energyExchangedWithObjectSinceLastChunkTransfer;
      var sign = Util.sign( deltaE );
      return ( Math.floor( Math.abs( deltaE ) / EFACConstants.ENERGY_PER_CHUNK ) * sign );
    },

    /**
     * whether burner can emit an energy chunk to another element
     * @returns {boolean}
     * @public
     */
    canSupplyEnergyChunk: function() {
      return this.heatCoolLevelProperty.value > 0;
    },

    /**
     * whether burner can receive an energy chunk from another element
     * @returns {boolean}
     * @public
     */
    canAcceptEnergyChunk: function() {
      return this.heatCoolLevelProperty.value < 0;
    }
  } );
} );

