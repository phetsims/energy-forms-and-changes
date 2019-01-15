// Copyright 2016-2018, University of Colorado Boulder

/**
 * model of a bicycle being pedaled by a rider in order to generate energy
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var Energy = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Energy' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySource' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var MAX_ANGULAR_VELOCITY_OF_CRANK = 3 * Math.PI; // In radians/sec.
  var ANGULAR_ACCELERATION = Math.PI / 2; // In radians/(sec^2).
  var MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR = EFACConstants.MAX_ENERGY_PRODUCTION_RATE; // In joules / sec
  var MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR / 5; // In joules / sec
  var CRANK_TO_REAR_WHEEL_RATIO = 1;
  var INITIAL_NUMBER_OF_ENERGY_CHUNKS = 21;
  var MECHANICAL_TO_THERMAL_CHUNK_RATIO = 5;
  var REAR_WHEEL_RADIUS = 0.021; // In meters, must be worked out with the image.
  var NUMBER_OF_LEG_IMAGES = 18; // must match number of leg images in view

  // offsets used for creating energy chunk paths and rotating images - these need to be coordinated with the images
  var BIKER_BUTTOCKS_OFFSET = new Vector2( 0.02, 0.04 );
  var TOP_TUBE_ABOVE_CRANK_OFFSET = new Vector2( 0.007, 0.015 );
  var BIKE_CRANK_OFFSET = new Vector2( 0.0052, -0.002 );
  var CENTER_OF_GEAR_OFFSET = new Vector2( 0.0058, -0.006 );
  var CENTER_OF_BACK_WHEEL_OFFSET = new Vector2( 0.035, -0.01 );
  var UPPER_CENTER_OF_BACK_WHEEL_OFFSET = new Vector2( 0.035, -0.006 ); // where the top chain meets the back wheel cassette
  var TOP_TANGENT_OF_BACK_WHEEL_OFFSET = new Vector2( 0.024, 0.007 );
  var NEXT_ENERGY_SYSTEM_OFFSET = new Vector2( 0.107, 0.066 );

  // images
  var BICYCLE_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_icon.png' );

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} mechanicalPoweredSystemIsNextProperty - is a compatible energy system currently active
   * @constructor
   */
  function Biker( energyChunksVisibleProperty, mechanicalPoweredSystemIsNextProperty ) {

    var self = this;
    EnergySource.call( this, new Image( BICYCLE_ICON ) );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.cyclist.value;

    // @public (read-only) {NumberProperty} - angle of the crank arm on the bike, in radians
    this.crankAngleProperty = new NumberProperty( 0 );

    // @public (read-only) {NumberProperty} - angle of the rear wheel on the bike, in radians
    this.rearWheelAngleProperty = new NumberProperty( 0 );

    // @public (read-only) {NumberProperty} - number of energy chunks remaining in the biker's body
    this.energyChunksRemainingProperty = new NumberProperty( 0 );

    // @public (read-only) {NumberProperty} - target angular velocity of crank, in radians
    this.targetCrankAngularVelocityProperty = new NumberProperty( 0 );

    // @private - internal variables
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.mechanicalPoweredSystemIsNextProperty = mechanicalPoweredSystemIsNextProperty;
    this.crankAngularVelocity = 0; // radians per second
    this.energyChunkMovers = [];
    this.energyProducedSinceLastChunkEmitted = EFACConstants.ENERGY_PER_CHUNK * 0.9;
    this.mechanicalChunksSinceLastThermal = 0;

    // monitor target rotation rate for validity
    if ( assert ) {
      this.targetCrankAngularVelocityProperty.link( function( omega ) {
        assert && assert( omega >= 0 && omega <= MAX_ANGULAR_VELOCITY_OF_CRANK,
          'Angular velocity out of range: ' + omega );
      } );
    }

    // add initial set of energy chunks
    this.replenishBikerEnergyChunks();

    // get the crank into a position where animation will start right away
    this.setCrankToPoisedPosition();

    // add a handler for the situation when energy chunks were in transit to the next energy system and that system is
    // swapped out
    this.mechanicalPoweredSystemIsNextProperty.link( function() {

      var movers = self.energyChunkMovers.slice();
      var hubPosition = self.positionProperty.value.plus( CENTER_OF_BACK_WHEEL_OFFSET );

      movers.forEach( function( mover ) {

        var ec = mover.energyChunk;

        if ( ec.energyTypeProperty.get() === EnergyType.MECHANICAL ) {
          if ( ec.positionProperty.get().x > hubPosition.x ) {

            // remove this energy chunk
            _.pull( self.energyChunkMovers, mover );
            self.energyChunkList.remove( ec );
          }
          else {

            // make sure that this energy chunk turns into thermal energy
            _.pull( self.energyChunkMovers, mover );

            self.energyChunkMovers.push( new EnergyChunkPathMover(
              ec,
              self.createMechanicalToThermalEnergyChunkPath( self.positionProperty.value, ec.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY
            ) );
          }
        }
      } );
    } );
  }

  energyFormsAndChanges.register( 'Biker', Biker );

  return inherit( EnergySource, Biker, {

    /**
     * step this energy producer forward in time
     * @param  {number} dt - time step in seconds
     * @returns {Energy}
     * @public
     * @override
     */
    step: function( dt ) {

      if ( !this.activeProperty.value ) {
        return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
      }

      // update property by reading how many chunks remain in the biker's body
      this.energyChunksRemainingProperty.set( this.energyChunkList.length - this.energyChunkMovers.length );

      // if there is no energy, the target speed is 0, otherwise it is the current set point
      var target = this.bikerHasEnergy() ? this.targetCrankAngularVelocityProperty.value : 0;

      // speed up or slow down the angular velocity of the crank
      var previousAngularVelocity = this.crankAngularVelocity;

      var dOmega = target - this.crankAngularVelocity;

      if ( dOmega !== 0 ) {
        var change = ANGULAR_ACCELERATION * dt;
        if ( dOmega > 0 ) {

          // accelerate
          this.crankAngularVelocity = Math.min(
            this.crankAngularVelocity + change,
            this.targetCrankAngularVelocityProperty.value
          );
        }
        else {

          // decelerate
          this.crankAngularVelocity = Math.max( this.crankAngularVelocity - change, 0 );
        }
      }

      var newAngle = ( this.crankAngleProperty.value + this.crankAngularVelocity * dt ) % ( 2 * Math.PI );
      this.crankAngleProperty.set( newAngle );

      this.rearWheelAngleProperty.set(
        ( this.rearWheelAngleProperty.value +
          this.crankAngularVelocity * dt * CRANK_TO_REAR_WHEEL_RATIO ) % ( 2 * Math.PI )
      );

      if ( this.crankAngularVelocity === 0 && previousAngularVelocity !== 0 ) {

        // set crank to a good position where animation will start right away when motion is restarted
        this.setCrankToPoisedPosition();
      }

      var fractionalVelocity = this.crankAngularVelocity / MAX_ANGULAR_VELOCITY_OF_CRANK;

      // determine how much energy is produced in this time step
      if ( this.targetCrankAngularVelocityProperty.value > 0 ) {

        // less energy is produced if not hooked up to generator
        var maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE;
        if ( this.mechanicalPoweredSystemIsNextProperty.value ) {
          maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR;
        }
        this.energyProducedSinceLastChunkEmitted += maxEnergyProductionRate * fractionalVelocity * dt;
      }

      // decide if new chem energy chunk should start on its way
      if ( this.energyProducedSinceLastChunkEmitted >= EFACConstants.ENERGY_PER_CHUNK &&
           this.targetCrankAngularVelocityProperty.value > 0 ) {

        // start a new chunk moving
        if ( this.bikerHasEnergy() ) {
          var energyChunk = this.findNonMovingEnergyChunk();
          this.energyChunkMovers.push( new EnergyChunkPathMover(
            energyChunk,
            this.createChemicalEnergyChunkPath( this.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
          this.energyProducedSinceLastChunkEmitted = 0;
        }
      }

      this.moveEnergyChunks( dt );

      var energyAmount = Math.abs( fractionalVelocity * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * dt );

      assert && assert( energyAmount >= 0, 'energyAmount is ' + energyAmount );

      return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
    },

    /**
     * @param  {number} dt timestep
     * @private
     */
    moveEnergyChunks: function( dt ) {

      // iterate through this copy while the original is mutated
      var movers = this.energyChunkMovers.slice();

      var self = this;
      movers.forEach( function( mover ) {

        mover.moveAlongPath( dt );

        if ( !mover.pathFullyTraversed ) {
          return;
        }

        var chunk = mover.energyChunk;

        // CHEMICAL --> MECHANICAL
        if ( chunk.energyTypeProperty.get() === EnergyType.CHEMICAL ) {

          // turn this into mechanical energy
          chunk.energyTypeProperty.set( EnergyType.MECHANICAL );
          _.pull( self.energyChunkMovers, mover );

          // add new mover for the mechanical energy chunk
          if ( self.mechanicalChunksSinceLastThermal >= MECHANICAL_TO_THERMAL_CHUNK_RATIO ||
               !self.mechanicalPoweredSystemIsNextProperty.get() ) {

            // make this chunk travel to the rear hub, where it will become a chunk of thermal energy
            self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createMechanicalToThermalEnergyChunkPath( self.positionProperty.value, chunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY )
            );
            self.mechanicalChunksSinceLastThermal = 0;
          }
          else {

            // send this chunk to the next energy system
            self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createMechanicalEnergyChunkPath( self.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY )
            );
            self.mechanicalChunksSinceLastThermal++;
          }
        }

        // MECHANICAL --> THERMAL
        else if ( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL &&
                  chunk.positionProperty.get().distance( self.positionProperty.value.plus( CENTER_OF_BACK_WHEEL_OFFSET ) ) < 1E-6 ) {

          // this is a mechanical energy chunk that has traveled to the hub and should now become thermal energy
          _.pull( self.energyChunkMovers, mover );
          chunk.energyTypeProperty.set( EnergyType.THERMAL );
          self.energyChunkMovers.push( new EnergyChunkPathMover( chunk,
            self.createThermalEnergyChunkPath( self.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
        }

        // THERMAL
        else if ( chunk.energyTypeProperty.get() === EnergyType.THERMAL ) {

          // this is a radiating thermal energy chunk that has reached the end of its route - delete it
          _.pull( self.energyChunkMovers, mover );
          self.energyChunkList.remove( chunk );
        }

        // MECHANICAL
        else {

          // must be mechanical energy that is being passed to the next energy system element
          self.outgoingEnergyChunks.push( chunk );
          _.pull( self.energyChunkMovers, mover );
        }
      } );
    },

    /**
     * @public
     * @override
     */
    preloadEnergyChunks: function() {

      // Return if biker is not pedaling, or is out of energy, or is not hooked up to a compatible system
      if ( this.targetCrankAngularVelocityProperty.get() === 0 ||
           !this.bikerHasEnergy() ||
           !this.mechanicalPoweredSystemIsNextProperty.get() ) {
        return;
      }

      var preloadComplete = false;
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
      var fractionalVelocity = this.crankAngularVelocity / MAX_ANGULAR_VELOCITY_OF_CRANK;

      // Simulate energy chunks moving through the system.
      while ( !preloadComplete ) {

        if ( this.outgoingEnergyChunks.length > 0 ) {

          // An energy chunk has traversed to the output of this system, completing the preload. If enough chunks are
          // already in the biker system, then we may not need to preload any, either, so check this condition before
          // adding the first pre-loaded chunk.
          preloadComplete = true;
          break;
        }

        energySinceLastChunk += MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * fractionalVelocity * dt;

        // decide if new chem energy chunk should start on its way
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // we know the biker is not out of energy, so get one of the remaining chunks
          var energyChunk = this.findNonMovingEnergyChunk();
          this.energyChunkMovers.push( new EnergyChunkPathMover(
            energyChunk,
            this.createChemicalEnergyChunkPath( this.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
          energySinceLastChunk = 0;

          // add back what we just took from the biker's energy, since we want to preserve the biker's energy state.
          this.addEnergyChunkToBiker();
        }

        // Update energy chunk positions.
        this.moveEnergyChunks( dt );
      }
    },

    /**
     * @returns {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate: function() {
      var amount = Math.abs(
        this.crankAngularVelocity / MAX_ANGULAR_VELOCITY_OF_CRANK * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR
      );
      return new Energy( EnergyType.MECHANICAL, amount, -Math.PI / 2 );
    },

    /**
     * Set the crank to a position where a very small amount of motion will cause a new image to be chosen.  This is
     * generally done when the biker stops so that the animation starts right away the next time the motion starts.
     * @private
     */
    setCrankToPoisedPosition: function() {
      var currentIndex = this.mapAngleToImageIndex( this.crankAngleProperty.value );
      var radiansPerImage = 2 * Math.PI / NUMBER_OF_LEG_IMAGES;
      this.crankAngleProperty.set( ( currentIndex % NUMBER_OF_LEG_IMAGES * radiansPerImage + ( radiansPerImage - 1E-7 ) ) );
      assert && assert( this.crankAngleProperty.value >= 0 && this.crankAngleProperty.value <= 2 * Math.PI );
    },

    /**
     * The biker is replenished each time she is reactivated. This was a fairly arbitrary decision, and can be changed
     * if desired.
     * @public
     * @override
     */
    activate: function() {
      EnergySource.prototype.activate.call( this );
      this.replenishBikerEnergyChunks();
    },

    /**
     * @public
     * @override
     */
    deactivate: function() {
      EnergySource.prototype.deactivate.call( this );
      this.targetCrankAngularVelocityProperty.reset();
      this.rearWheelAngleProperty.reset();
      this.crankAngularVelocity = this.targetCrankAngularVelocityProperty.value;
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergySource.prototype.clearEnergyChunks.call( this );
      this.energyChunkMovers.length = 0;
    },

    /**
     * add/restore initial number of energy chunks to biker
     * @public
     */
    replenishBikerEnergyChunks: function() {
      for ( var i = 0; i < INITIAL_NUMBER_OF_ENERGY_CHUNKS; i++ ) {
        this.addEnergyChunkToBiker();
      }
    },

    /**
     * add one energy chunk to biker
     * @public
     */
    addEnergyChunkToBiker: function() {
      var nominalInitialOffset = new Vector2( 0.019, 0.055 );
      var displacement = new Vector2( ( phet.joist.random.nextDouble() - 0.5 ) * 0.02, 0 ).rotated( Math.PI * 0.7 );
      var position = this.positionProperty.value.plus( nominalInitialOffset ).plus( displacement );

      var newEnergyChunk = new EnergyChunk(
        EnergyType.CHEMICAL,
        position,
        Vector2.ZERO,
        this.energyChunksVisibleProperty
      );

      this.energyChunkList.add( newEnergyChunk );
    },


    /**
     * find the image index corresponding to this angle in radians
     * @param  {number} angle
     * @returns {number} - image index
     * @private
     */
    mapAngleToImageIndex: function( angle ) {
      var i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUMBER_OF_LEG_IMAGES ) );
      assert && assert( i >= 0 && i < NUMBER_OF_LEG_IMAGES );
      return i;
    },

    /**
     * @param  {Vector2} centerPosition
     * @returns {Vector2[]}
     * @private
     */
    createChemicalEnergyChunkPath: function( centerPosition ) {
      var path = [];
      path.push( centerPosition.plus( BIKER_BUTTOCKS_OFFSET ) );
      path.push( centerPosition.plus( TOP_TUBE_ABOVE_CRANK_OFFSET ) );
      return path;
    },

    /**
     * @param  {Vector2} centerPosition
     * @returns {Vector2[]}
     * @private
     */
    createMechanicalEnergyChunkPath: function( centerPosition ) {
      var path = [];
      path.push( centerPosition.plus( BIKE_CRANK_OFFSET ) );
      path.push( centerPosition.plus( UPPER_CENTER_OF_BACK_WHEEL_OFFSET ) );
      path.push( centerPosition.plus( TOP_TANGENT_OF_BACK_WHEEL_OFFSET ) );
      path.push( centerPosition.plus( NEXT_ENERGY_SYSTEM_OFFSET ) );
      return path;
    },

    /**
     * create a path for an energy chunk that will travel to the hub and then become thermal
     * @param  {Vector2} centerPosition
     * @param  {Vector2} currentPosition
     * @returns {Vector2[]}
     * @private
     */
    createMechanicalToThermalEnergyChunkPath: function( centerPosition, currentPosition ) {
      var path = [];
      var crankPosition = centerPosition.plus( BIKE_CRANK_OFFSET );
      if ( currentPosition.y > crankPosition.y ) {

        // only add the crank position if the current position indicates that the chunk hasn't reached the crank yet
        path.push( centerPosition.plus( BIKE_CRANK_OFFSET ) );
      }
      path.push( centerPosition.plus( CENTER_OF_BACK_WHEEL_OFFSET ) );
      return path;
    },

    /**
     * @param  {Vector2} centerPosition
     * @returns {Vector2[]}
     * @private
     */
    createThermalEnergyChunkPath: function( centerPosition ) {
      var startingPoint = centerPosition.plus( CENTER_OF_BACK_WHEEL_OFFSET );
      var path = [];
      path.push( startingPoint );

      var numberOfSegments = 4;
      var segmentVector = new Vector2(
        0,
        ( EFACConstants.ENERGY_CHUNK_MAX_TRAVEL_HEIGHT - startingPoint.y ) / numberOfSegments
      );

      // the chuck needs to move up and to the right to avoid overlapping with the biker
      var nextPoint = startingPoint.plus( segmentVector.rotated( Math.PI * -0.1 ) );

      // add a set of path segments that make the chunk move up in a somewhat random path
      path.push( nextPoint );

      for ( var i = 0; i < numberOfSegments - 1; i++ ) {
        var movement = segmentVector.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 );
        nextPoint = nextPoint.plus( movement );
        path.push( nextPoint );
      }

      return path;
    },

    /**
     * find a non-moving CHEMICAL energy chunk, returns null if none are found
     * @returns {EnergyChunk}
     * @private
     */
    findNonMovingEnergyChunk: function() {
      var movingEnergyChunks = [];
      var nonMovingEnergyChunk = null;

      this.energyChunkMovers.forEach( function( mover ) {
        movingEnergyChunks.push( mover.energyChunk );
      } );

      this.energyChunkList.forEach( function( chunk ) {

        // only interested in CHEMICAL energy chunks that are not moving
        if ( chunk.energyTypeProperty.value === EnergyType.CHEMICAL && movingEnergyChunks.indexOf( chunk ) === -1 ) {
          nonMovingEnergyChunk = chunk;
        }
      } );
      return nonMovingEnergyChunk;
    },

    /**
     * Say whether the biker has energy to pedal.
     * @returns {boolean}
     * @private
     */
    bikerHasEnergy: function() {
      var nChunks = this.energyChunkList.length;
      return nChunks > 0 && nChunks > this.energyChunkMovers.length;
    }

  }, {

    // statics
    CENTER_OF_GEAR_OFFSET: CENTER_OF_GEAR_OFFSET,
    CENTER_OF_BACK_WHEEL_OFFSET: CENTER_OF_BACK_WHEEL_OFFSET,
    INITIAL_NUMBER_OF_ENERGY_CHUNKS: INITIAL_NUMBER_OF_ENERGY_CHUNKS,
    MAX_ANGULAR_VELOCITY_OF_CRANK: MAX_ANGULAR_VELOCITY_OF_CRANK,
    NUMBER_OF_LEG_IMAGES: NUMBER_OF_LEG_IMAGES,
    REAR_WHEEL_RADIUS: REAR_WHEEL_RADIUS
  } );
} );
