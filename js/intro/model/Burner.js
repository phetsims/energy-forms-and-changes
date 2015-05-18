// Copyright 2002-2015, University of Colorado

/**
 * Model element that represents a burner in the simulation.  The burner can heat and also cool other model elements.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */


define( function( require ) {
  'use strict';

  // modules
  var Air = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Air' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkWanderController' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HorizontalSurface = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/HorizontalSurface' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );
  var IntroConstants = require( 'ENERGY_FORMS_AND_CHANGES/intro/IntroConstants' );
  var ModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ModelElement' );

  // constants
  var WIDTH = 0.075; // In meters.
  var HEIGHT = WIDTH * 1;
  var MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen.
  var CONTACT_DISTANCE = 0.001; // In meters.
  var ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // In meters, empirically chosen.

  // Because of the way that energy chunks are exchanged between thermal modeling elements within this simulation, things can end up looking a bit
  // odd if a burner is turned on with nothing on it.  To account for this, a separate energy generation rate is used when a burner is exchanging
  // energy directly with the air.
  var MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3; // joules/sec, multiplier empirically chosen.

  /**
   * *
   * @param {Vector2} position - The position in model space where this burner exists. By convention for this simulation, the position is
   * @param {Property.<boolean>} energyChunksVisibleProperty Property that controls whether the energy chunks are visible
   * @constructor
   */
  function Burner( position, energyChunksVisibleProperty ) {

    ModelElement.call( this );

    this.addProperty( 'heatCoolLevel', 0 );

    var thisBurner = this;

    this.position = position;
    this.energyChunkList = new ObservableArray();
    this.energyChunkWanderControllers = [];
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Track build up of energy for transferring chunks to/from the air.
    this.energyExchangedWithAirSinceLastChunkTransfer = 0;

    //this.heatCoolLevelProperty = new Property( new Range( -1, 1, 0 ) );

    //  Create and add the top surface.  Some compensation for perspective is necessary in order to avoid problems with edge overlap when dropping
    // objects on top of burner.
    // TODO: Create a shared constants file
    var perspectiveCompensation = thisBurner.getOutlineRect().height * IntroConstants.BURNER_EDGE_TO_HEIGHT_RATIO * Math.cos( IntroConstants.PERSPECTIVE_ANGLE );
    this.topSurfaceProperty = new Property( new HorizontalSurface( new Range( thisBurner.getOutlineRect().getMinX() - perspectiveCompensation,
      thisBurner.getOutlineRect().maxX + perspectiveCompensation ), thisBurner.getOutlineRect().maxY, this ) );

//    heatCoolLevel.addObserver( new ChangeObserver<Double>() {
//      public void update( Double newValue, Double oldValue ) {
//        if ( newValue === 0 || ( Math.signum( oldValue ) !== Math.signum( newValue ) ) ) {
//          // If the burner has been turned off or switched modes,
//          // clear accumulated heat/cool amount.
//          energyExchangedWithAirSinceLastChunkTransfer = 0;
//        }
//      }
//    } );
//
//    // Clear the accumulated energy transfer if thing is removed from burner.
//    BooleanProperty somethingOnTop = new BooleanProperty( false );
//    somethingOnTop.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean somethingOnTop ) {
//        if ( !somethingOnTop ) {
//          energyExchangedWithObjectSinceLastChunkTransfer = 0;
//        }
//      }
//    } );
//  }
//

  }

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
      assert && assert( !(thermalEnergyContainer instanceof Air), 'This function should not be used with air - there is a specific method for that.' );
      if ( this.inContactWith( thermalEnergyContainer ) ) {
        var deltaEnergy = 0;
        if ( thermalEnergyContainer.getTemperature() > EFACConstants.FREEZING_POINT_TEMPERATURE ) {
          deltaEnergy = MAX_ENERGY_GENERATION_RATE * this.heatCoolLevel * dt;
        }
        thermalEnergyContainer.changeEnergy( deltaEnergy );
        this.energyExchangedWithObjectSinceLastChunkTransfer += deltaEnergy;
      }
    },

    /**
     * Add or remove energy from the specific energy container air.  This has specific behavior that is different from addOremoveEnergyToFromObject()
     * above.
     *
     * @param {Air} air - air as a thermal energy container
     * @param dt - amount of time (delta time)
     */
    addOrRemoveEnergyToFromAir: function( air, dt ) {
      var deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * this.heatCoolLevel * dt;
      if ( deltaEnergy > 0 ) {
      }
      air.changeEnergy( deltaEnergy );
      this.energyExchangedWithAirSinceLastChunkTransfer += deltaEnergy;
    },

    /**
     * *
     * @param {ThermalEnergyContainer} thermalEnergyContainer
     * @returns {boolean}
     */
    inContactWith: function( thermalEnergyContainer ) {
      var containerThermalArea = thermalEnergyContainer.getThermalContactArea().bounds;
      return (
      containerThermalArea.getCenterX() > this.getOutlineRect().minX &&
      containerThermalArea.getCenterX() < this.getOutlineRect().maxX &&
      Math.abs( containerThermalArea.minY - this.getOutlineRect().maxY < CONTACT_DISTANCE ));
    },

    /**
     *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      energyChunk.zPosition = 0;
      this.energyChunkList.add( energyChunk );
      this.energyChunkWanderControllers.push( new EnergyChunkWanderController( energyChunk, new Property( this.getEnergyChunkStartEndPoint() ) ) );
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
      var thisBurner = this;
      var closestEnergyChunk = null;
      if ( this.energyChunkList.length > 0 ) {
        this.energyChunkList.forEach( function( energyChunk ) {
          if ( energyChunk.position.distance( thisBurner.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE &&
               ( closestEnergyChunk === null ||
                 energyChunk.position.distance( point ) < closestEnergyChunk.position.distance( point ) ) ) {
            // Found a closer chunk.
            closestEnergyChunk = energyChunk;
          }
        } );

        this.energyChunkList.remove( closestEnergyChunk );
        this.energyChunkWanderControllers.forEach( function( energyChunkWanderController, index ) {
          if( energyChunkWanderController.energyChunk === closestEnergyChunk ) {
            thisBurner.energyChunkWanderControllers.splice( index, 1 );
          }
        } );
      }
      //}
      if ( closestEnergyChunk === null && this.heatCoolLevel > 0 ) {
        // Create an energy chunk.
        closestEnergyChunk = new EnergyChunk( EnergyType.THERMAL, this.getEnergyChunkStartEndPoint(), new Vector2( 0, 0 ), this.energyChunksVisibleProperty.value );
      }
      if ( closestEnergyChunk !== null ) {
        this.energyExchangedWithAirSinceLastChunkTransfer = 0;
        this.energyExchangedWithObjectSinceLastChunkTransfer = 0;
      }
      else {
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
     *
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
     * @param {Array.<ThermalEnergyContainer>} thermalEnergyContainers
     * @returns {boolean}
     */
    areAnyOnTop: function( thermalEnergyContainers ) {
      var self = this;
      thermalEnergyContainers.forEach( function( thermalEnergyContainer ) {
        if ( self.inContactWith( thermalEnergyContainer ) ) {
          return true;
        }
      } );
      return false;
    },
    /**
     * *
     * @returns {number}
     */
    getEnergyChunkCountForAir: function() {
      var thisModel = this; // extend scope for nested loop function.
      var count = 0;
      // If there are approaching chunks, and the mode has switched to off or to heating, the chunks should go back to the air (if they're not
      // almost to the burner).
      if ( this.energyChunkList.length > 0 && this.heatCoolLevel >= 0 ) {
        this.energyChunkList.forEach( function( energyChunk ) {
          if ( thisModel.position.distance( energyChunk.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE ) {
            count++;
          }
        } );
      }
      if ( count === 0 ) {
        //console.log( EFACConstants.ENERGY_PER_CHUNK );
        //console.log( this.energyExchangedWithAirSinceLastChunkTransfer / EFACConstants.ENERGY_PER_CHUNK )
        // See whether the energy exchanged with the air since the last chunk transfer warrants another chunk.
        count = Math.round( this.energyExchangedWithAirSinceLastChunkTransfer / EFACConstants.ENERGY_PER_CHUNK );
      }
      return count;
    },

    /**
     * @private
     * @param dt
     */
    //stepInTime: function( dt ) {
    //  // Animate energy chunks.
    //  for ( var energyChunkWanderController in new ArrayList( energyChunkWanderControllers ) ) {
    //    energyChunkWanderController.updatePosition( dt );
    //    if ( energyChunkWanderController.destinationReached() ) {
    //      energyChunkList.remove( energyChunkWanderController.getEnergyChunk() );
    //      energyChunkWanderControllers.remove( energyChunkWanderController );
    //    }
    //  }
    //},

    /**
     * *
     * @returns {Rectangle}
     */
    getFlameIceRect: function() {
      // be coordinated with the view.
      var outlineRect = this.getOutlineRect();
      return new Rectangle( outlineRect.centerX - outlineRect.width / 4, outlineRect.centerY, outlineRect.width / 2, outlineRect.height / 2 );
    },

    /**
     * *
     * @returns {number}
     */
    getTemperature: function() {
      // low value is limited to the freezing point of water.
      return Math.max( EFACConstants.ROOM_TEMPERATURE + this.heatCoolLevel * 100, EFACConstants.FREEZING_POINT_TEMPERATURE );
    },
    /**
     * Get the number of excess of deficit energy chunks for interaction with
     * thermal objects (as opposed to air).
     *
     * @return Number of energy chunks that could be supplied or consumed.
     *         Negative value indicates that chunks should come in.
     */
    getEnergyChunkBalanceWithObjects: function() {
      return (Math.floor( Math.abs( this.energyExchangedWithObjectSinceLastChunkTransfer ) / EFACConstants.ENERGY_PER_CHUNK ) * Math.sign( this.energyExchangedWithObjectSinceLastChunkTransfer ));
    },
    /**
     * *
     * @returns {boolean}
     */
    canSupplyEnergyChunk: function() {
      return this.heatCoolLevel > 0;
    },
    /**
     * *
     * @returns {boolean}
     */
    canAcceptEnergyChunk: function() {
      return this.heatCoolLevel < 0;
    }
  } );
} );

