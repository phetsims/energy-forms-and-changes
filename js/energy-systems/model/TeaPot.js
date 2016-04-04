// Copyright 2016, University of Colorado Boulder

/**
 * Class representing the steam-generating tea pot in the model.
 *
 * @author John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  // var Cloud = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Cloud' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'DOT/Random' );
  // var Range = require( 'DOT/Range' );
  // var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var TEAPOT_LARGE = require( 'image!ENERGY_FORMS_AND_CHANGES/teapot_large.png' );

  // Constants
  var TEAPOT_OFFSET = new Vector2( 0.0, 0.015 );
  var TEAPOT_IMAGE = new EFACModelImage( TEAPOT_LARGE, TEAPOT_OFFSET );

  // Offsets and other constants used for energy paths.  These are mostly
  // empirically determined and coordinated with the image.
  // var SPOUT_BOTTOM_OFFSET = new Vector2( 0.03, 0.02 );
  // var SPOUT_TIP_OFFSET = new Vector2( 0.25, 0.3 );
  // var DISTANT_TARGET_OFFSET = new Vector2( 1, 1 );
  // var WATER_SURFACE_HEIGHT_OFFSET = 0; // From teapot position, in meters.
  var THERMAL_ENERGY_CHUNK_Y_ORIGIN = -0.05; // Meters. Coordinated with heater position.
  var THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE = new Range( -0.015, 0.015 ); // Meters. Coordinated with heater position.

  // Miscellaneous other constants.
  var MAX_ENERGY_CHANGE_RATE = EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 5; // In joules/second
  var COOLING_CONSTANT = 0.1; // Controls rate at which tea pot cools down, empirically determined.
  var COOL_DOWN_COMPLETE_THRESHOLD = 30; // In joules/second
  // var ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range( 0.12, 0.15 );
  var RAND = new Random();
  // var ENERGY_CHUNK_WATER_TO_SPOUT_TIME = 0.7; // Used to keep chunks evenly spaced.

  /**
   * @param {Property<boolean>} energyChunksVisible
   * @param {Property<boolean>} steamPowerableElementInPlace
   * @constructor
   */
  function TeaPot( energyChunksVisible, steamPowerableElementInPlace ) {

    EnergySource.call( this, new Image( TEAPOT_LARGE ) );

    this.addProperty( 'heatCoolAmount', 0 );
    this.addProperty( 'energyProductionRate', 0 );

    this.energyChunksVisible = energyChunksVisible;
    this.steamPowerableElementInPlace = steamPowerableElementInPlace;
    this.heatEnergyProducedSinceLastChunk = EFACConstants.ENERGY_PER_CHUNK / 2;
    this.energyChunkMovers = [];

    // List of chunks that are not being transferred to the next energy system
    // element.
    this.exemptFromTransferEnergyChunks = [];

    // Flag for whether next chunk should be transferred or kept, used to
    // alternate transfer with non-transfer.
    this.transferNextAvailableChunk = true;
  }

  energyFormsAndChanges.register( 'TeaPot', TeaPot );

  return inherit( EnergySource, TeaPot, {

    /**
     * [step description]
     *
     * @param  {Number} dt timestep
     *
     * @return {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

      if ( this.active ) {
        if ( this.heatCoolAmount > 0 || this.energyProductionRate > COOL_DOWN_COMPLETE_THRESHOLD ) {

          // Calculate the energy production rate.

          // Analogous to acceleration.
          var increase = this.heatCoolAmount * MAX_ENERGY_CHANGE_RATE;

          // Analogous to friction.
          var decrease = this.energyProductionRate * COOLING_CONSTANT;

          // Analogous to velocity.
          var rate = this.energyProductionRate + increase * dt - decrease * dt;
          rate = Math.min( rate, EFACConstants.MAX_ENERGY_PRODUCTION_RATE );

          this.energyProductionRateProperty.set( rate );
        } else {
          // Clamp the energy production rate to zero so that it doesn't
          // trickle on forever.
          this.energyProductionRateProperty.set( 0 );
        }

        this.heatEnergyProducedSinceLastChunk += Math.max( this.heatCoolAmount, EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt );
        if ( this.heatEnergyProducedSinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var xRange = THERMAL_ENERGY_CHUNK_X_ORIGIN_RANGE;
          var x0 = this.position.x + xRange.min + RAND.nextDouble() * xRange.length;
          var y0 = this.position.y + THERMAL_ENERGY_CHUNK_Y_ORIGIN;
          var initialPosition = new Vector2( x0, y0 );

          var energyChunk = new EnergyChunk( EnergyType.THERMAL, initialPosition, this.energyChunksVisible );
          this.energyChunkList.push( energyChunk );
          // heatEnergyProducedSinceLastChunk -= ENERGY_PER_CHUNK;
          // energyChunkMovers.add( new EnergyChunkPathMover( energyChunk,
          //   createThermalEnergyChunkPath( initialPosition, getPosition() ),
          //   EFACConstants.ENERGY_CHUNK_VELOCITY ) );

        }

        // this.moveEnergyChunks(dt);
      }
      return new Energy( EnergyType.MECHANICAL, this.energyProductionRate * dt, Math.PI / 2 );
    },

    /**
     * [moveEnergyChunks description]
     *
     * @param  {Number} dt time step
     * @private
     */
    moveEnergyChunks: function( dt ) {

    },

    /**
     * [createThermalEnergyChunkPath description]
     *
     * @param  {Vector2}  startPosition [description]
     * @param  {Vector2}  teapotPosition [description]
     *
     * @return {Array<Vector2>} [description]
     * @private
     */
    createThermalEnergyChunkPath: function( startPosition, teapotPosition ) {

    },

    /**
     * [createPathToSpoutBottom description]
     *
     * @param  {Vector2} parentElementPosition [description]
     *
     * @return {Array<Vector2>}       [description]
     * @private
     */
    createPathToSpoutBottom: function( parentElementPosition ) {

    },

    /**
     * [createSpoutExitPath description]
     *
     * @param  {Vector2} parentElementPosition [description]
     *
     * @return {Array<Vector2>}       [description]
     * @private
     */
    createSpoutExitPath: function( parentElementPosition ) {

    },


    /**
     * [preLoadEnergyChunks description]
     * @public
     * @override
     */
    preLoadEnergyChunks: function() {

    },

    /**
     * [getEnergyOutputRate description]
     *
     * @return {Energy} [description]
     * @public
     * @override
     */
    getEnergyOutputRate: function() {

    },

    /**
     * Deactivate the teapot
     * @public
     * @override
     */
    deactivate: function() {
      EnergySource.prototype.deactivate.call( this );
      this.heatCoolAmountProperty.reset();
      this.energyProductionRateProperty.reset();
    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {

    }

  }, {
    // Expose the following as public static members
    TEAPOT_IMAGE: TEAPOT_IMAGE
  } );
} );
