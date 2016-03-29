// Copyright 2016, University of Colorado Boulder

/**
 * Class that represents a faucet that can be turned on to provide mechanical
 * energy to other energy system elements.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  // Replace with correct path
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  // var Random = require( 'DOT/Random' );
  // var Range = require( 'DOT/Range' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var FAUCET_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/faucet_icon.png' );

  // Constants

  var OFFSET_FROM_CENTER_TO_WATER_ORIGIN = new Vector2( 0.065, 0.08 );
  // var FALLING_ENERGY_CHUNK_VELOCITY = 0.09; // In meters/second.
  // var MAX_WATER_WIDTH = 0.015; // In meters.
  // var MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER = 0.5; // In meters.
  // var RAND = new Random();
  // var ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range( 0.05, 0.06 );

  // The following acceleration constant defines the rate at which the water
  // flows from the faucet.  The value used is not the actual value in
  // Earth's gravitational field - it has been tweaked for optimal visual
  // effect.
  // var ACCELERATION_DUE_TO_GRAVITY = new Vector2( 0, -0.15 );

  /**
   * @param {Property<boolean>} energyChunksVisible
   * @param {Property<boolean>} waterPowerableElementInPlace
   * @constructor
   */
  function FaucetAndWater( energyChunksVisible, waterPowerableElementInPlace ) {

    EnergySource.call( this, new Image( FAUCET_ICON ) );

    this.energyChunksVisible = energyChunksVisible;

    // Flag that is used to decide whether to pass energy chunks to the next
    // energy system element.
    this.waterPowerableElementInPlace = waterPowerableElementInPlace;

    // Proportion of full available flow that is occurring.
    this.addProperty( 'flowProportion', 0 );

    // Water drops that comprise the stream of water.
    this.waterDrops = new ObservableArray();

    // List of chunks that are not being transferred to the next energy system
    // element.
    this.exemptFromTransferEnergyChunks = [];

    this.energySinceLastChunk = 0;

    // Flag for whether next chunk should be transferred or kept, used to
    // alternate transfer with non-transfer.
    this.transferNextAvailableChunk = true;
  }

  return inherit( EnergySource, FaucetAndWater, {

    /**
     * @private
     */
    createNewChunk: function() {

    },

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
     * [deactivate description]
     * @public
     * @override
     */
    deactivate: function() {

    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {

    }

  }, {
    OFFSET_FROM_CENTER_TO_WATER_ORIGIN: OFFSET_FROM_CENTER_TO_WATER_ORIGIN
  } );
} );