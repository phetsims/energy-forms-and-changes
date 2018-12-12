// Copyright 2016-2018, University of Colorado Boulder

/**
 * model of a heating element with a beaker on it
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyUser' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var TemperatureAndColor = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/TemperatureAndColor' );
  var TemperatureAndColorSensor = require( 'ENERGY_FORMS_AND_CHANGES/common/model/TemperatureAndColorSensor' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var WATER_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/water_icon.png' );

  // position and size constants, empirically determined
  var BEAKER_WIDTH = 0.075; // In meters.
  var BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;
  var BEAKER_OFFSET = new Vector2( 0, 0.025 );
  var HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY = 0.0075; // in meters/sec, quite slow
  var HEATER_ELEMENT_2D_HEIGHT = 0.027; // height of image
  var MAX_HEAT_GENERATION_RATE = 5000; // Joules/sec, not connected to incoming energy
  var RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.2; // in meters
  var HEAT_ENERGY_CHANGE_RATE = 0.5; // in proportion per second

  // energy chunk path offsets, empirically determined such that they move through the view in a way that looks good
  var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.041 );
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.041 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0003, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0.0002, -0.01 );
  var OFFSET_TO_CONVERSION_POINT = new Vector2( 0, 0.012 );

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function BeakerHeater( energyChunksVisibleProperty ) {
    var self = this;

    EnergyUser.call( this, new Image( WATER_ICON ) );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.beakerOfWater.value;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @public (read-only) {NumberProperty} - proportion, from 0 to 1, of the max amount of heat that can be applied to
    // the beaker
    this.heatProportionProperty = new Property( 0 );

    // @private {EnergyChunkPathMover[]} - arrays that move the energy chunks as they move into, within, and out of the
    // beaker
    this.electricalEnergyChunkMovers = [];
    this.heatingElementEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];

    // @public (read-only) {ObservableArray} - energy chunks that are radiated by this beaker
    this.radiatedEnergyChunkList = new ObservableArray();

    // @public {Beaker} (read-only) - note that the position is absolute, not relative to the "parent" model element
    this.beaker = new Beaker(
      this.positionProperty.value.plus( BEAKER_OFFSET ),
      BEAKER_WIDTH,
      BEAKER_HEIGHT,
      energyChunksVisibleProperty
    );

    // @public {TemperatureAndColorSensor} (read-only)
    this.temperatureAndColorSensor = new TemperatureAndColorSensor(
      this,
      new Vector2( BEAKER_WIDTH * 0.45, BEAKER_HEIGHT * 0.6 ), // position is relative, not absolute
      true
    );

    // @private, for convenience
    this.random = phet.joist.random;

    // move the beaker as the overall position changes
    this.positionProperty.link( function( position ) {
      self.beaker.positionProperty.value = position.plus( BEAKER_OFFSET );
    } );
  }

  energyFormsAndChanges.register( 'BeakerHeater', BeakerHeater );

  return inherit( EnergyUser, BeakerHeater, {

    /**
     * @param  {number} dt - time step, in seconds
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      if ( !this.activeProperty.value ) {
        return;
      }

      var self = this;

      // handle any incoming energy chunks
      if ( this.incomingEnergyChunks.length > 0 ) {
        this.incomingEnergyChunks.forEach( function( chunk ) {

          assert && assert(
            chunk.energyTypeProperty.value === EnergyType.ELECTRICAL,
            'Energy chunk type should be ELECTRICAL but is ' + chunk.energyTypeProperty.value
          );

          // add the energy chunk to the list of those under management
          self.energyChunkList.push( chunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          self.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( chunk,
            self.createElectricalEnergyChunkPath( self.positionProperty.get() ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        } );

        // clear incoming chunks array
        this.incomingEnergyChunks.length = 0;
      }
      this.moveElectricalEnergyChunks( dt );
      this.moveThermalEnergyChunks( dt );

      var energyFraction = incomingEnergy.amount / ( EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt );

      // set the proportion of max heat being generated by the heater element
      if ( ( this.energyChunksVisibleProperty.get() && this.heatingElementEnergyChunkMovers.length > 0 ) ||
           ( !this.energyChunksVisibleProperty.get() && incomingEnergy.type === EnergyType.ELECTRICAL ) ) {
        this.heatProportionProperty.set(
          Math.min( energyFraction, this.heatProportionProperty.value + HEAT_ENERGY_CHANGE_RATE * dt )
        );
      }
      else {
        this.heatProportionProperty.set(
          Math.max( 0, this.heatProportionProperty.value - HEAT_ENERGY_CHANGE_RATE * dt )
        );
      }

      // add energy to the beaker based on heat coming from heat element
      this.beaker.changeEnergy( this.heatProportionProperty.value * MAX_HEAT_GENERATION_RATE * dt );

      // remove energy from the beaker based on loss of heat to the surrounding air
      var temperatureGradient = this.beaker.getTemperature() - EFACConstants.ROOM_TEMPERATURE;
      if ( Math.abs( temperatureGradient ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {
        var beakerRect = this.beaker.getRawOutlineRect();
        var thermalContactArea = ( beakerRect.width * 2 ) + ( beakerRect.height * 2 ) * this.beaker.fluidLevelProperty.value;
        var transferFactor = HeatTransferConstants.getHeatTransferFactor( 'water', 'air' );
        var thermalEnergyLost = temperatureGradient * transferFactor * thermalContactArea * dt;

        this.beaker.changeEnergy( -thermalEnergyLost );

        if ( this.beaker.getEnergyBeyondMaxTemperature() > 0 ) {
          // Prevent the water from going beyond the boiling point.
          this.beaker.changeEnergy( -this.beaker.getEnergyBeyondMaxTemperature() );
        }
      }

      this.beaker.step( dt );

      if ( this.beaker.getEnergyChunkBalance() > 0 ) {

        // remove an energy chunk from the beaker and start it floating away, a.k.a. make it "radiate"
        var bounds = this.beaker.getBounds();
        var extractionPoint = new Vector2( bounds.minX + phet.joist.random.nextDouble() * bounds.width, bounds.maxY );
        var ec = this.beaker.extractEnergyChunkClosestToPoint( extractionPoint );

        if ( ec ) {
          ec.zPositionProperty.set( 0.0 ); // move to front of z order
          this.radiatedEnergyChunkList.push( ec );
          this.radiatedEnergyChunkMovers.push(
            new EnergyChunkPathMover(
              ec,
              this.createRadiatedEnergyChunkPath( ec.positionProperty.value ),
              EFACConstants.ENERGY_CHUNK_VELOCITY
            )
          );
        }
      }

      this.moveRadiatedEnergyChunks( dt );

      // step sub-elements
      this.temperatureAndColorSensor.step();
    },

    /**
     * get the temperature and color at the specified location within the beaker
     * @param {Vector2} location
     */
    getTemperatureAndColorAtLocation: function( location ) {

      // validate that the specified location is inside the beaker, since that's the only supported location
      assert && assert(
      location.x >= BEAKER_OFFSET.x - BEAKER_WIDTH / 2 && location.x <= BEAKER_OFFSET.x + BEAKER_WIDTH / 2,
        'location is not inside of beaker'
      );
      assert && assert(
      location.y >= BEAKER_OFFSET.y - BEAKER_HEIGHT / 2 && location.y <= BEAKER_OFFSET.y + BEAKER_HEIGHT / 2,
        'location is not inside of beaker'
      );

      return new TemperatureAndColor( this.beaker.getTemperature(), EFACConstants.WATER_COLOR_OPAQUE );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {
      var self = this;
      var movers = this.radiatedEnergyChunkMovers.slice();

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // remove this energy chunk entirely
          self.radiatedEnergyChunkList.remove( mover.energyChunk );
          _.pull( self.radiatedEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveThermalEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.heatingElementEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // This chunk is ready to move to the beaker.  We remove it from here, and the beaker takes over management of
          // the chunk.
          self.beaker.addEnergyChunk( mover.energyChunk );
          self.energyChunkList.remove( mover.energyChunk );
          _.pull( self.heatingElementEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // the electrical energy chunk has reached the burner, so it needs to change into thermal energy
          _.pull( self.electricalEnergyChunkMovers, mover );
          mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

          // have the thermal energy move a little on the element before moving into the beaker
          self.heatingElementEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
            self.createHeaterElementEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
            HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY ) );
        }
      } );
    },

    /**
     * @param  {Energy} incomingEnergyRate
     * @public
     * @override
     */
    preloadEnergyChunks: function( incomingEnergyRate ) {
      this.clearEnergyChunks();

      if ( incomingEnergyRate.amount === 0 || incomingEnergyRate.type !== EnergyType.ELECTRICAL ) {
        // no energy chunk pre-loading needed
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // simulate energy chunks moving through the system
      var preloadComplete = false;
      while ( !preloadComplete ) {
        energySinceLastChunk += incomingEnergyRate.amount * dt;

        // determine if time to add a new chunk
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // create and add a new chunk
          var newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.positionProperty.get().plus( OFFSET_TO_LEFT_SIDE_OF_WIRE ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );
          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( newEnergyChunk,
            this.createElectricalEnergyChunkPath( this.positionProperty.get() ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );

          // update energy since last chunk
          energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );

        if ( this.heatingElementEnergyChunkMovers.length > 0 ) {

          // an energy chunk has made it to the heating element, which completes the preload
          preloadComplete = true;
        }
      }
    },

    /**
     * reset some variables/properties when deactivated by carousel
     * @public
     * @override
     */
    deactivate: function() {
      EnergyUser.prototype.deactivate.call( this );
      this.beaker.reset();
      this.beaker.positionProperty.value = this.positionProperty.value.plus( BEAKER_OFFSET );
      this.heatProportionProperty.set( 0 );
    },

    /**
     * remove all energy chunks
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergyUser.prototype.clearEnergyChunks.call( this );
      this.electricalEnergyChunkMovers.length = 0;
      this.heatingElementEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkList.clear();
    },

    /**
     * @param  {Vector2} startingPoint
     * @returns {Vector2[]}
     * @private
     */
    createHeaterElementEnergyChunkPath: function( startingPoint ) {
      var path = [];

      // The path for the thermal energy chunks is meant to look like it
      // is moving on the burner element.  This must be manually
      // coordinated with the burner element image.
      var angle = this.random.nextBoolean() ? this.random.nextDouble() * Math.PI * 0.45 :
                  -this.random.nextDouble() * Math.PI * 0.3;
      path.push( startingPoint.plus( new Vector2( 0, HEATER_ELEMENT_2D_HEIGHT ).rotated( angle ) ) );
      return path;
    },

    /**
     * @param  {Vector2} center
     * @returns {Vector2[]}
     * @private
     */
    createElectricalEnergyChunkPath: function( center ) {
      var path = [];

      path.push( center.plus( OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND ) );
      path.push( center.plus( OFFSET_TO_FIRST_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SECOND_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_THIRD_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_BOTTOM_OF_CONNECTOR ) );
      path.push( center.plus( OFFSET_TO_CONVERSION_POINT ) );

      return path;
    },

    /**
     * create a path for chunks to follow when radiated from the beaker
     * @param  {Vector2} startingPoint
     * @returns {Vector2[]}
     * @private
     */
    createRadiatedEnergyChunkPath: function( startingPoint ) {
      var energyChunkTravelPath = [];
      var numDirectionChanges = 4; // empirically chosen
      var segmentVector = new Vector2( 0, RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE / numDirectionChanges );

      // The first segment is is straight above the starting point.  This is done because it looks good, making the
      // chunk move straight up out of the beaker.
      var nextPoint = startingPoint.plus( segmentVector );
      energyChunkTravelPath.push( nextPoint );

      // add the remaining points in the path
      for ( var i = 0; i < numDirectionChanges - 1; i++ ) {
        var movement = segmentVector.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 );
        nextPoint = nextPoint.plus( movement );
        energyChunkTravelPath.push( nextPoint );
      }

      return energyChunkTravelPath;
    }

  }, {

    // statics
    HEATER_ELEMENT_2D_HEIGHT: HEATER_ELEMENT_2D_HEIGHT
  } );
} );
