// Copyright 2014-2015, University of Colorado Boulder

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
  var RangeWithValue = require( 'DOT/RangeWithValue' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var WIDTH = 0.075; // In meters.
  var HEIGHT = WIDTH * 1;
  var MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen.
  var CONTACT_DISTANCE = 0.001; // In meters.
  var ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // In meters, empirically chosen.

  // Because of the way that energy chunks are exchanged between thermal modeling elements within this simulation,
  // things can end up looking a bit odd if a burner is turned on with nothing on it.  To account for this, a separate
  // energy generation rate is used when a burner is exchanging energy directly with the air.
  // Units: joules/sec, multiplier empirically chosen.
  var MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3;

  /**
   * Burner class
   *
   * @param {Vector2} position - The position in model space where this burner exists.
   * @param {Property.<boolean>} energyChunksVisibleProperty - Controls whether the energy chunks are visible
   * @constructor
   */
  function Burner( position, energyChunksVisibleProperty ) {

    ModelElement.call( this );

    this.heatCoolLevelProperty = new Property( 0 );

    var self = this;

    this.position = position;
    this.energyChunkList = new ObservableArray();
    this.energyChunkWanderControllers = [];
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Track energy transferred to anything sitting on the burner.
    this.energyExchangedWithObjectSinceLastChunkTransfer = 0; // @private

    // Track build up of energy for transferring chunks to/from the air.
    this.energyExchangedWithAirSinceLastChunkTransfer = 0; // @private

    // Create and add the top surface.  Some compensation for perspective is
    // necessary in order to avoid problems with edge overlap when dropping
    // objects on top of burner.
    var perspectiveCompensation =
      self.getOutlineRect().height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
      Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE );

    this.topSurfaceProperty = new Property(
      new HorizontalSurface( new RangeWithValue( self.getOutlineRect().getMinX() - perspectiveCompensation,
        self.getOutlineRect().maxX + perspectiveCompensation ), self.getOutlineRect().maxY, this ) );
  }

  energyFormsAndChanges.register( 'Burner', Burner );

  return inherit( ModelElement, Burner, {

    /**
     * Get a rectangle that defines the outline of the burner.  In the model the burner is essentially a 2D rectangle.
     *
     * @return {Rectangle} Rectangle that defines the outline in model space.
     */
    getOutlineRect: function() {
      return new Rectangle( this.position.x - WIDTH / 2, this.position.y, WIDTH, HEIGHT );
    },

    /**
     * *
     * @returns {Property}
     */
    getTopSurfaceProperty: function() {
      return this.topSurfaceProperty;
    },

    /**
     * Interact with a thermal energy container, adding or removing energy based on the current heat/cool setting.
     *
     * @param {ThermalEnergyContainer} thermalEnergyContainer - Model object that will get or give energy.
     * @param {number} dt - Amount of time (delta time).
     */
    addOrRemoveEnergyToFromObject: function( thermalEnergyContainer, dt ) {
      // This shouldn't be used for air - there is a specific method for that.
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
     * Add or remove energy from the specific energy container air.  This has specific behavior that is different from
     * addOremoveEnergyToFromObject() above.
     *
     * @param {Air} air - air as a thermal energy container
     * @param dt - amount of time (delta time)
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
     * Determine if the burner is in contact with a thermal energy container.
     *
     * @param {ThermalEnergyContainer} thermalEnergyContainer
     * @returns {boolean}
     */
    inContactWith: function( thermalEnergyContainer ) {
      var burnerRect = this.getOutlineRect();
      var area = thermalEnergyContainer.getThermalContactArea();
      var xContact = ( area.centerX > burnerRect.minX && area.centerX < burnerRect.maxX );
      var yContact = ( Math.abs( area.minY - burnerRect.maxY ) < CONTACT_DISTANCE );
      return ( xContact && yContact );
    },

    /**
     *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      var controller = new EnergyChunkWanderController( energyChunk,
        new Property( this.getEnergyChunkStartEndPoint() ), null );

      energyChunk.zPosition = 0;
      this.energyChunkList.add( energyChunk );
      this.energyChunkWanderControllers.push( controller );
      this.energyExchangedWithAirSinceLastChunkTransfer = 0;
      this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
    },

    /**
     * @private
     * @returns {Vector2}
     */
    getEnergyChunkStartEndPoint: function() {
      return this.getCenterPoint();
    },

    /**
     * Request an energy chunk from the burner.
     *
     * @param {Vector2} point - Point from which to search for closest chunk.
     * @return {EnergyChunk} Closest energy chunk, null if none are contained.
     */
    extractClosestEnergyChunk: function( point ) {
      // Extend the scope for callbacks.
      var self = this;
      var closestEnergyChunk = null;
      if ( this.energyChunkList.length > 0 ) {
        this.energyChunkList.forEach( function( energyChunk ) {
          if ( energyChunk.positionProperty.value.distance( self.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE &&
            ( closestEnergyChunk === null ||
              energyChunk.positionProperty.value.distance( point ) < closestEnergyChunk.positionProperty.value.distance( point ) ) ) {
            // Found a closer chunk.
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

      if ( closestEnergyChunk === null && this.heatCoolLevel > 0 ) {
        // Create an energy chunk.
        closestEnergyChunk = new EnergyChunk( EnergyType.THERMAL, this.getEnergyChunkStartEndPoint(),
          new Vector2( 0, 0 ), this.energyChunksVisibleProperty );
      }
      if ( closestEnergyChunk !== null ) {
        this.energyExchangedWithAirSinceLastChunkTransfer = 0;
        this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
      } else {
        console.log( 'Warning: Request for energy chunk from burner when not in heat mode and no chunks contained, returning null.' );
      }
      return closestEnergyChunk;
    },

    /**
     * *
     * @returns {Vector2}
     */
    getCenterPoint: function() {
      return new Vector2( this.position.x, this.position.y + HEIGHT / 2 );
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
     * *
     * @param {ThermalEnergyContainer[]} thermalEnergyContainers
     * @returns {boolean}
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
     * *
     * @returns {number}
     */
    getEnergyChunkCountForAir: function() {
      var self = this; // extend scope for nested loop function.
      var count = 0;
      // If there are approaching chunks, and the mode has switched to off or to heating,
      // the chunks should go back to the air (if they're not almost to the burner).
      if ( this.energyChunkList.length > 0 && this.heatCoolLevel >= 0 ) {
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
     * Animate the energy chunks.
     *
     * @private
     * @param {number} dt
     */
    step: function( dt ) {
      var self = this;
      var controllers = this.energyChunkWanderControllers.splice();

      controllers.forEach( function( controller ) {

        controller.updatePosition( dt );

        if ( controller.destinationReached() ) {
          self.energyChunkList.remove( controller.energyChunk );

          _.pull( self.energyChunkWanderControllers, controller );
        }
      } );
    },

    /**
     * *
     * @returns {Rectangle}
     */
    getFlameIceRect: function() {
      // be coordinated with the view.
      var outlineRect = this.getOutlineRect();
      var width = outlineRect.width;
      var height = outlineRect.height;
      return new Rectangle( outlineRect.centerX - width / 4, outlineRect.centerY, width / 2, height / 2 );
    },

    /**
     * Get burner temperature, clamped at minimum to the freezing point of water.
     *
     * @returns {number}
     */
    getTemperature: function() {
      var temperature = EFACConstants.ROOM_TEMPERATURE + this.heatCoolLevel * 100;
      return Math.max( temperature, EFACConstants.FREEZING_POINT_TEMPERATURE );
    },

    /**
     * Get the (signed) number of energy chunks for interaction with thermal
     * objects (as opposed to air).
     *
     * @return Number of energy chunks that could be supplied or consumed.
     *         Negative value indicates that chunks should come in.
     */
    getEnergyChunkBalanceWithObjects: function() {
      var deltaE = this.energyExchangedWithObjectSinceLastChunkTransfer;
      var sign = Math.sign( deltaE );
      return ( Math.floor( Math.abs( deltaE ) / EFACConstants.ENERGY_PER_CHUNK ) * sign );
    },

    /**
     * Whether burner can emit an energy chunk to another element
     *
     * @returns {boolean}
     */
    canSupplyEnergyChunk: function() {
      return this.heatCoolLevel > 0;
    },

    /**
     * Whether burner can receive an energy chunk from another element
     *
     * @returns {boolean}
     */
    canAcceptEnergyChunk: function() {
      return this.heatCoolLevel < 0;
    }
  } );
} );

