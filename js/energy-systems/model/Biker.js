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
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'DOT/Random' );
  // var Range = require( 'DOT/Range' );
  // var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var MAX_ANGULAR_VELOCITY_OF_CRANK = 3 * Math.PI; // In radians/sec.
  var ANGULAR_ACCELERATION = Math.PI / 2; // In radians/(sec^2).
  var MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR = EFACConstants.MAX_ENERGY_PRODUCTION_RATE; // In joules / sec
  var MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR / 5; // In joules / sec
  var CRANK_TO_REAR_WHEEL_RATIO = 1;
  var INITIAL_NUM_ENERGY_CHUNKS = 15;
  var RAND = new Random();
  var MECHANICAL_TO_THERMAL_CHUNK_RATIO = 5;
  var REAR_WHEEL_RADIUS = 0.02; // In meters, must be worked out with the image.

  // Offsets used for creating energy chunk paths.  These need to be
  // coordinated with the images.
  var BIKER_BUTTOCKS_OFFSET = new Vector2( 0.02, 0.04 );
  var TOP_TUBE_ABOVE_CRANK_OFFSET = new Vector2( 0.007, 0.015 );
  var BIKE_CRANK_OFFSET = new Vector2( 0.0052, -0.006 );
  var CENTER_OF_BACK_WHEEL_OFFSET = new Vector2( 0.03, -0.01 );
  var BOTTOM_OF_BACK_WHEEL_OFFSET = new Vector2( 0.03, -0.03 );
  var NEXT_ENERGY_SYSTEM_OFFSET = new Vector2( 0.13, -0.01 );

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
    BACK_LEG_IMAGES.push( new EFACModelImage( BACK_LEG[ i - 1 ], LEG_OFFSET ) );
    FRONT_LEG_IMAGES.push( new EFACModelImage( FRONT_LEG[ i - 1 ], LEG_OFFSET ) );
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
  var FRAME_IMAGE = new EFACModelImage( BICYCLE_FRAME_3, FRAME_CENTER_OFFSET );
  var REAR_WHEEL_SPOKES_IMAGE = new EFACModelImage( BICYCLE_SPOKES, FRAME_CENTER_OFFSET.plus( new Vector2( 0.035, -0.020 ) ) );
  var RIDER_NORMAL_UPPER_BODY_IMAGE = new EFACModelImage( BICYCLE_RIDER, FRAME_CENTER_OFFSET.plus( new Vector2( -0.0025, 0.062 ) ) );
  var RIDER_TIRED_UPPER_BODY_IMAGE = new EFACModelImage( BICYCLE_RIDER_TIRED, FRAME_CENTER_OFFSET.plus( new Vector2( -0.0032, 0.056 ) ) );

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} mechanicalPoweredSystemIsNext
   * @constructor
   */
  function Biker( energyChunksVisibleProperty, mechanicalPoweredSystemIsNextProperty ) {

    EnergySource.call( this, new Image( BICYCLE_ICON ) );

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.mechanicalPoweredSystemIsNextProperty = mechanicalPoweredSystemIsNextProperty;

    this.addProperty( 'crankAngle', 0 ); // rad
    this.addProperty( 'rearWheelAngle', 0 ); // rad
    this.addProperty( 'bikerHasEnergy', true );
    this.addProperty( 'targetCrankAngularVelocity', 0 );

    this.crankAngularVelocity = 0; // rad/s
    this.energyChunkMovers = [];
    this.energyProducedSinceLastChunkEmitted = EFACConstants.ENERGY_PER_CHUNK * 0.9;
    this.mechanicalChunksSinceLastThermal = 0; // unsigned int (count)

    // Monitor target rotation rate for validity.
    this.targetCrankAngularVelocityProperty.link( function( omega ) {
      assert && assert( omega >= 0 && omega <= MAX_ANGULAR_VELOCITY_OF_CRANK,
        'Angular velocity out of range: ' + omega );
    } );

    // Add initial set of energy chunks.
    this.replenishEnergyChunks();

    // Get the crank into a position where animation will start right away.
    this.setCrankToPoisedPosition();

    // Add a handler for the situation when energy chunks were in transit
    // to the next energy system and that system is swapped out.
    var self = this;
    this.mechanicalPoweredSystemIsNextProperty.link( function( isNext ) {

      var movers = _.clone( self.energyChunkMovers );
      var hubPosition = self.positionProperty.value.plus( CENTER_OF_BACK_WHEEL_OFFSET );

      movers.forEach( function( mover ) {

        var ec = mover.energyChunk;

        if ( ec.energyTypeProperty.get() === EnergyType.MECHANICAL ) {
          if ( ec.positionProperty.get().x > hubPosition.x ) {

            // Just remove this energy chunk.
            self.removeEnergyChunkMover( mover );
            self.energyChunkList.remove( ec );

          } else {

            // Make sure that this energy chunk turns into thermal energy.
            self.removeEnergyChunkMover( mover );

            self.energyChunkMovers.push( new EnergyChunkPathMover( ec,
              self.createMechanicalToThermalEnergyChunkPath( self.position, ec.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          }
        }
      } );
    } );
  }

  energyFormsAndChanges.register( 'Biker', Biker );

  return inherit( EnergySource, Biker, {

    /**
     * @param  {Number} dt timestep
     *
     * @return {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

      if ( !this.active ) {
        return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
      }

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
        } else {
          // Decelerate
          this.crankAngularVelocity = Math.min( this.crankAngularVelocity - change, 0 );
        }
      }

      var newAngle = ( this.crankAngle + this.crankAngularVelocity * dt ) % ( 2 * Math.PI );

      this.crankAngleProperty.set( newAngle );

      this.rearWheelAngleProperty.set( ( this.rearWheelAngle +
        this.crankAngularVelocity * dt * CRANK_TO_REAR_WHEEL_RATIO ) % ( 2 * Math.PI ) );

      if ( this.crankAngularVelocity === 0 && previousAngularVelocity !== 0 ) {
        // Set crank to a good position where animation will start
        // right away when motion is restarted.
        this.setCrankToPoisedPosition();
      }

      var fractionalVelocity = this.crankAngularVelocity / MAX_ANGULAR_VELOCITY_OF_CRANK;

      // Determine how much energy is produced in this time step.
      if ( this.targetCrankAngularVelocity > 0 ) {

        // Less energy is produced if not hooked up to generator.
        var maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE;
        if ( this.mechanicalPoweredSystemIsNext ) {
          maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR;
        }
        this.energyProducedSinceLastChunkEmitted += maxEnergyProductionRate * fractionalVelocity * dt;
      }

      // Decide if new chem energy chunk should start on its way.
      if ( this.energyProducedSinceLastChunkEmitted >= EFACConstants.ENERGY_PER_CHUNK &&
        this.targetCrankAngularVelocity > 0 ) {

        // Start a new chunk moving.
        if ( this.bikerCanPedal() ) {
          var energyChunk = this.findNonMovingEnergyChunk();
          this.energyChunkMovers.push( new EnergyChunkPathMover( energyChunk,
            this.createChemicalEnergyChunkPath( this.position ), EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          this.energyProducedSinceLastChunkEmitted = 0;
        }
      }

      this.moveEnergyChunks( dt );

      var energyAmount = Math.abs( fractionalVelocity * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * dt );
      return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
    },

    moveEnergyChunks: function( dt ) {

      // Iterate through this copy while the original is mutated
      var movers = _.clone( this.energyChunkMovers );

      var self = this;
      movers.forEach( function( mover ) {

        mover.moveAlongPath( dt );

        if ( !mover.pathFullyTraversed ) {
          return;
        }

        var chunk = mover.energyChunk;

        // CHEMICAL
        if ( chunk.energyTypeProperty.get() === EnergyType.CHEMICAL ) {

          // Turn this into mechanical energy.
          chunk.energyTypeProperty.set( EnergyType.MECHANICAL );
          self.removeEnergyChunkMover( mover );

          // Add new mover for the mechanical energy chunk.
          if ( self.mechanicalChunksSinceLastThermal >= MECHANICAL_TO_THERMAL_CHUNK_RATIO ||
            !self.mechanicalPoweredSystemIsNextProperty.get() ) {

            // Make this chunk travel to the rear hub, where it
            // will become a chunk of thermal energy.
            self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createMechanicalToThermalEnergyChunkPath( self.position, chunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );

            self.mechanicalChunksSinceLastThermal = 0;
          } else {

            // Send this chunk to the next energy system.
            self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createMechanicalEnergyChunkPath( self.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );

            self.mechanicalChunksSinceLastThermal++;
          }
        }

        // MECHANICAL (TO THERMAL)
        else if ( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL &&
          chunk.positionProperty.get().distance( self.position.plus( CENTER_OF_BACK_WHEEL_OFFSET ) ) < 1E-6 ) {

          // This is a mechanical energy chunk that has traveled
          // to the hub and should now become thermal energy.
          self.removeEnergyChunkMover( mover );

          chunk.energyType.set( EnergyType.THERMAL );
          self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
            self.createThermalEnergyChunkPath( self.position ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        }

        // THERMAL
        else if ( chunk.energyTypeProperty.get() === EnergyType.THERMAL ) {
          // This is a radiating thermal energy chunk that has
          // reached the end of its route.  Delete it.
          self.removeEnergyChunkMover( mover );
          self.energyChunkList.remove( chunk );
        }

        // MECHANICAL
        else {
          // Must be mechanical energy that is being passed to
          // the next energy system.
          self.outgoingEnergyChunks.push( chunk );
          self.removeEnergyChunkMover( mover );
        }
      } );
    },

    /**
     * Utility method to remove EnergyChunkMover from array.
     *
     * @param  {EnergyChunkMover} mover
     * @private
     */
    removeEnergyChunkMover: function( mover ) {
      _.remove( this.energyChunkMovers, function( m ) {
        return m === mover;
      } );
    },

    /**
     * For the biker, pre-loading of energy chunks isn't necessary, since
     * they are being maintained even when visibility is turned off.
     * @public
     * @override
     */
    preLoadEnergyChunks: function() {},

    /**
     * @return {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      var amount = Math.abs( this.crankAngularVelocity / MAX_ANGULAR_VELOCITY_OF_CRANK *
        MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR );

      return new Energy( EnergyType.MECHANICAL, amount, -Math.PI / 2 );
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
     * The biker is replenished each time she is reactivated.
     * This was a fairly arbitrary decision, and can be changed if desired.
     *
     * @public
     * @override
     */
    activate: function() {
      EnergySource.prototype.activate.call( this );
      this.replenishEnergyChunks();
    },

    /**
     * [deactivate description]
     * @public
     * @override
     */
    deactivate: function() {
      EnergySource.prototype.deactivate.call( this );
      this.targetCrankAngularVelocityProperty.set( 0.0 );
      this.crankAngularVelocity = this.targetCrankAngularVelocity;
    },

    /**
     * [clearEnergyChunks description]
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySource.prototype.clearEnergyChunks.call( this );
      this.energyChunkMovers.length = 0;
    },

    /**
     * Add/restore initial number of energy chunks to biker
     *
     * @public
     */
    replenishEnergyChunks: function() {
      var nominalInitialOffset = new Vector2( 0.019, 0.05 );

      for ( var i = 0; i < INITIAL_NUM_ENERGY_CHUNKS; i++ ) {
        var displacement = new Vector2( ( RAND.nextDouble() - 0.5 ) * 0.02, 0 ).rotated( Math.PI * 0.7 );
        var position = this.position.plus( nominalInitialOffset ).plus( displacement );

        var newEnergyChunk = new EnergyChunk(
          EnergyType.CHEMICAL,
          position,
          Vector2.ZERO,
          this.energyChunksVisibleProperty );

        this.energyChunkList.add( newEnergyChunk );
      }
    },

    mapAngleToImageIndex: function( angle ) {
      var i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUM_LEG_IMAGES ) );

      assert && assert( i >= 0 && i < NUM_LEG_IMAGES );

      return i;
    },

    /**
     * @param  {Vector2} centerPosition
     *
     * @return {Vector2[]}
     */
    createChemicalEnergyChunkPath: function( centerPosition ) {
      var path = [];

      path.push( centerPosition.plus( BIKER_BUTTOCKS_OFFSET ) );
      path.push( centerPosition.plus( TOP_TUBE_ABOVE_CRANK_OFFSET ) );

      return path;
    },

    /**
     * @param  {Vector2} centerPosition
     *
     * @return {Vector2[]}
     */
    createMechanicalEnergyChunkPath: function( centerPosition ) {
      var path = [];

      path.push( centerPosition.plus( BIKE_CRANK_OFFSET ) );
      path.push( centerPosition.plus( BOTTOM_OF_BACK_WHEEL_OFFSET ) );
      path.push( centerPosition.plus( NEXT_ENERGY_SYSTEM_OFFSET ) );

      return path;
    },

    /**
     * Create a path for an energy chunk that will travel to the hub and then become thermal.
     * @param  {Vector2} centerPosition
     * @param  {Vector2} currentPosition
     *
     * @return {Vector2[]}
     */
    createMechanicalToThermalEnergyChunkPath: function( centerPosition, currentPosition ) {
      var path = [];
      var crankPosition = centerPosition.plus( BIKE_CRANK_OFFSET );

      if ( currentPosition.y > crankPosition.y ) {
        // Only add the crank position if the current position
        // indicates that the chunk hasn't reached the crank yet.
        path.push( centerPosition.plus( BIKE_CRANK_OFFSET ) );
      }
      path.push( centerPosition.plus( CENTER_OF_BACK_WHEEL_OFFSET ) );

      return path;
    },

    /**
     * @param  {Vector2} centerPosition
     *
     * @return {Vector2[]}
     */
    createThermalEnergyChunkPath: function( centerPosition ) {
      var path = [];
      var segmentLength = 0.05;
      var maxAngle = Math.PI / 8;
      var numSegments = 3;

      var offset = centerPosition.plus( CENTER_OF_BACK_WHEEL_OFFSET );
      path.push( new Vector2( offset ) );

      // The chuck needs to move up and to the right to avoid overlapping with the biker.
      offset = offset.plus( new Vector2( segmentLength, 0 ).rotated( Math.PI * 0.4 ) );

      // Add a set of path segments that make the chunk move up in a somewhat random path.
      path.push( new Vector2( offset ) );

      for ( var i = 0; i < numSegments; i++ ) {
        offset = offset.plus( new Vector2( 0, segmentLength ).rotated( ( RAND.nextDouble() - 0.5 ) * maxAngle ) );
        path.push( new Vector2( offset ) );
      }

      return path;
    },

    /**
     *Choose a non-moving energy chunk, returns null if all chunks are moving.
     *
     * @return {EnergyChunk}
     */
    findNonMovingEnergyChunk: function() {
      var movingEnergyChunks = [];
      var nonMovingEnergyChunk = null;

      this.energyChunkMovers.forEach( function( mover ) {
        movingEnergyChunks.push( mover.energyChunk );
      } );

      this.energyChunkList.forEach( function( ec ) {
        if ( !_.contains( movingEnergyChunks, function( chunk ) {
            return chunk === ec;
          } ) ) {
          nonMovingEnergyChunk = ec;
          return;
        }
      } );

      return nonMovingEnergyChunk;
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
    CENTER_OF_BACK_WHEEL_OFFSET: CENTER_OF_BACK_WHEEL_OFFSET,
    FRAME_IMAGE: FRAME_IMAGE,
    FRONT_LEG_IMAGES: FRONT_LEG_IMAGES,
    MAX_ANGULAR_VELOCITY_OF_CRANK: MAX_ANGULAR_VELOCITY_OF_CRANK,
    NUM_LEG_IMAGES: NUM_LEG_IMAGES,
    REAR_WHEEL_SPOKES_IMAGE: REAR_WHEEL_SPOKES_IMAGE,
    RIDER_NORMAL_UPPER_BODY_IMAGE: RIDER_NORMAL_UPPER_BODY_IMAGE,
    RIDER_TIRED_UPPER_BODY_IMAGE: RIDER_TIRED_UPPER_BODY_IMAGE,
    REAR_WHEEL_RADIUS: REAR_WHEEL_RADIUS
  } );
} );

