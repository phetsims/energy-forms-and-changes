// Copyright 2016, University of Colorado Boulder

/**
 * This class represents a bicycle being pedaled by a rider in order to
 * generate energy.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  // var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  // var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  // var Random = require( 'DOT/Random' );
  // var Range = require( 'DOT/Range' );
  // var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var MAX_ANGULAR_VELOCITY_OF_CRANK = 3 * Math.PI; // In radians/sec.
  var ANGULAR_ACCELERATION = Math.PI / 2; // In radians/(sec^2).
  // var MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR = EFACConstants.MAX_ENERGY_PRODUCTION_RATE; // In joules / sec
  // var MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR / 5; // In joules / sec
  var CRANK_TO_REAR_WHEEL_RATIO = 1;
  // var INITIAL_NUM_ENERGY_CHUNKS = 15;
  // var RAND = new Random();
  // var MECHANICAL_TO_THERMAL_CHUNK_RATIO = 5;
  // var REAR_WHEEL_RADIUS = 0.02; // In meters, must be worked out with the image.

  // Offsets used for creating energy chunk paths.  These need to be
  // coordinated with the images.
  // var BIKER_BUTTOCKS_OFFSET = new Vector2( 0.02, 0.04 );
  // var TOP_TUBE_ABOVE_CRANK_OFFSET = new Vector2( 0.007, 0.015 );
  // var BIKE_CRANK_OFFSET = new Vector2( 0.0052, -0.006 );
  // var CENTER_OF_BACK_WHEEL_OFFSET = new Vector2( 0.03, -0.01 );
  // var BOTTOM_OF_BACK_WHEEL_OFFSET = new Vector2( 0.03, -0.03 );
  // var NEXT_ENERGY_SYSTEM_OFFSET = new Vector2( 0.13, -0.01 );

  // Offset of the bike frame center.  Most other image offsets are relative
  // to this one.
  var FRAME_CENTER_OFFSET = new Vector2( 0.0, 0.01 );

  var LEG_IMAGE_OFFSET = new Vector2( 0.009, 0.002 );
  var LEG_OFFSET = FRAME_CENTER_OFFSET.plus( LEG_IMAGE_OFFSET );

  // Images
  var BACK_LEG = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_10.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_11.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_12.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_13.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_14.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_15.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_16.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_17.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_18.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_19.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_20.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_21.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_22.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_23.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_24.png' )
  ];
  var FRONT_LEG = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_10.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_11.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_12.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_13.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_14.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_15.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_16.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_17.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_18.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_19.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_20.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_21.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_22.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_23.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_24.png' )
  ];

  // EFACModelImage arrays
  var FRONT_LEG_IMAGES = [];
  var BACK_LEG_IMAGES = [];

  for ( var i = 1; i < 25; i++ ) {
    BACK_LEG_IMAGES.push( new EFACModelImage( BACK_LEG[ i - 1 ], BACK_LEG[ i - 1 ].width, LEG_OFFSET ) );
    FRONT_LEG_IMAGES.push( new EFACModelImage( FRONT_LEG[ i - 1 ], FRONT_LEG[ i - 1 ].width, LEG_OFFSET ) );
  }

  var NUM_LEG_IMAGES = FRONT_LEG_IMAGES.length;

  var BICYCLE_FRAME_3 = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_frame_3.png' );
  var BICYCLE_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_icon.png' );
  var BICYCLE_RIDER = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_rider.png' );
  var BICYCLE_RIDER_TIRED = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_rider_tired.png' );
  var BICYCLE_SPOKES = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_spokes.png' );

  // Images used when representing this model element in the view.  The
  // offsets, which are in meters, were empirically determined.  The values
  // aren't really to scale, since there are so many things in this model
  // with very different scales.
  var FRAME_IMAGE = new EFACModelImage( BICYCLE_FRAME_3, BICYCLE_FRAME_3.width, FRAME_CENTER_OFFSET );
  var REAR_WHEEL_SPOKES_IMAGE = new EFACModelImage( BICYCLE_SPOKES, BICYCLE_SPOKES.width, FRAME_CENTER_OFFSET.plus( new Vector2( 0.035, -0.020 ) ) );
  var RIDER_NORMAL_UPPER_BODY_IMAGE = new EFACModelImage( BICYCLE_RIDER, BICYCLE_RIDER.width, FRAME_CENTER_OFFSET.plus( new Vector2( -0.0025, 0.062 ) ) );
  var RIDER_TIRED_UPPER_BODY_IMAGE = new EFACModelImage( BICYCLE_RIDER_TIRED, BICYCLE_RIDER_TIRED.width, FRAME_CENTER_OFFSET.plus( new Vector2( -0.0032, 0.056 ) ) );

  function Biker( energyChunksVisible, mechanicalPoweredSystemIsNext ) {

    EnergySource.call( this, new Image( BICYCLE_ICON ) );

    this.energyChunksVisible = energyChunksVisible;
    this.mechanicalPoweredSystemIsNext = mechanicalPoweredSystemIsNext;

    this.addProperty( 'crankAngle', 0. ); // rad
    this.addProperty( 'rearWheelAngle', 0. ); // rad
    this.addProperty( 'bikerHasEnergy', true );
    this.addProperty( 'targetCrankAngularVelocity', 0 );

    this.crankAngularVelocity = 0.; // rad/s
    this.energyChunkMovers = [];
    this.energyProducedSinceLastChunkEmitted = EFACConstants.ENERGY_PER_CHUNK * 0.9;
    this.mechanicalChunksSinceLastThermal = 0; // unsigned int (count)

    // Monitor target rotation rate for validity.
    this.targetCrankAngularVelocityProperty.link( function( omega ) {
      assert && assert( omega >= 0 && omega <= MAX_ANGULAR_VELOCITY_OF_CRANK, 'The angular velocity was out of range: ' + omega );
    } );

    // TODO:
    // Add initial set of energy chunks.
    // replenishEnergyChunks();

    // Get the crank into a position where animation will start right away.
    this.setCrankToPoisedPosition();

    // Add a handler for the situation when energy chunks were in transit
    // to the next energy system and that system is swapped out.
    // (Link function for mechanicalPoweredSystemIsNext)
  }

  energyFormsAndChanges.register( 'Biker', Biker );

  return inherit( EnergySource, Biker, {
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

      // Update energy state
      this.bikerHasEnergyProperty.set( this.bikerCanPedal() );

      // If there is no energy, the target speed is 0, otherwise it is
      // the current set point.
      var target = this.bikerHasEnergy ? this.targetCrankAngularVelocity : 0;

      // Speed up or slow down the angular velocity of the crank.
      var previousAngularVelocity = this.crankAngularVelocity;

      var dOmega = target - this.crankAngularVelocity;

      if ( dOmega !== 0 ) {
        var change = ANGULAR_ACCELERATION * dt;
        if ( dOmega > 0 ) {
          // Accelerate
          this.crankAngularVelocity = Math.min( this.crankAngularVelocity + change, this.targetCrankAngularVelocity );
        }
        else {
          // Decelerate
          this.crankAngularVelocity = Math.min( this.crankAngularVelocity - change, 0 );
        }
      }

      var newAngle = ( this.crankAngle + this.crankAngularVelocity * dt ) % ( 2 * Math.PI );

      this.crankAngleProperty.set( newAngle );

      this.rearWheelAngleProperty.set( ( this.rearWheelAngle + this.crankAngularVelocity * dt * CRANK_TO_REAR_WHEEL_RATIO ) % ( 2 * Math.PI ) );


      if ( this.crankAngularVelocity === 0 && previousAngularVelocity !== 0 ) {
        // Set crank to a good position where animation will start
        // right away when motion is restarted.
        this.setCrankToPoisedPosition();
      }

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

    /*
     * Set the crank to a position where a very small amount of motion will
     * cause a new image to be chosen.  This is generally done when the biker
     * stops so that the animation starts right away the next time the motion
     * starts.
     * @private
     */
    setCrankToPoisedPosition: function() {
      var currentIndex = this.mapAngleToImageIndex( this.crankAngle );
      var radiansPerImage = 2 * Math.PI / NUM_LEG_IMAGES;
      this.crankAngleProperty.set( ( currentIndex % NUM_LEG_IMAGES * radiansPerImage + ( radiansPerImage - 1E-7 ) ) );
      assert && assert( this.crankAngle >= 0 && this.crankAngle <= 2 * Math.PI );
    },

    /**
     * [deactivate description]
     * @public
     * @override
     */
    deactivate: function() {

    },

    /**
     * [activate description]
     * @public
     * @override
     */
    activate: function() {

    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {

    },

    mapAngleToImageIndex: function( angle ) {
      var i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUM_LEG_IMAGES ) );

      assert && assert( i >= 0 && i < NUM_LEG_IMAGES );

      return i;
    },

    /**
     * Say whether the biker has energy to pedal.
     * Renamed from bikerHasEnergy() to avoid collision with the identically-
     * named property.
     *
     * @return {Boolean}
     */
    bikerCanPedal: function() {
      var nChunks = this.energyChunkList.length;
      return nChunks > 0 && nChunks > this.energyChunkMovers.length;
    }

  }, {
    // Exported variables for static access
    BACK_LEG_IMAGES: BACK_LEG_IMAGES,
    FRAME_IMAGE: FRAME_IMAGE,
    FRONT_LEG_IMAGES: FRONT_LEG_IMAGES,
    MAX_ANGULAR_VELOCITY_OF_CRANK: MAX_ANGULAR_VELOCITY_OF_CRANK,
    NUM_LEG_IMAGES: NUM_LEG_IMAGES,
    REAR_WHEEL_SPOKES_IMAGE: REAR_WHEEL_SPOKES_IMAGE,
    RIDER_NORMAL_UPPER_BODY_IMAGE: RIDER_NORMAL_UPPER_BODY_IMAGE,
    RIDER_TIRED_UPPER_BODY_IMAGE: RIDER_TIRED_UPPER_BODY_IMAGE
  } );
} );
