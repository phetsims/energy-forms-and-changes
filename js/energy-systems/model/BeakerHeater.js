// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var HeatTransferConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/model/HeatTransferConstants' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Image = require( 'SCENERY/nodes/Image' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Random = require( 'DOT/Random' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var WATER_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/water_icon.png' );
  var WIRE_BLACK_62 = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_62.png' );
  var WIRE_BLACK_RIGHT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_right.png' );
  var ELEMENT_BASE_BACK = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var ELEMENT_BASE_FRONT = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var HEATER_ELEMENT = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element.png' );
  var HEATER_ELEMENT_DARK = require( 'image!ENERGY_FORMS_AND_CHANGES/heater_element_dark.png' );

  var HEATER_ELEMENT_OFFSET = new Vector2( -0.002, 0.022 );

  var WIRE_STRAIGHT_IMAGE = new EFACModelImage( WIRE_BLACK_62, new Vector2( -0.036, -0.04 ) );
  var WIRE_CURVE_IMAGE = new EFACModelImage( WIRE_BLACK_RIGHT, new Vector2( -0.009, -0.016 ) );
  var ELEMENT_BASE_BACK_IMAGE = new EFACModelImage( ELEMENT_BASE_BACK, new Vector2( 0, 0 ) );
  var ELEMENT_BASE_FRONT_IMAGE = new EFACModelImage( ELEMENT_BASE_FRONT, new Vector2( 0, 0.0005 ) );
  var HEATER_ELEMENT_OFF_IMAGE = new EFACModelImage( HEATER_ELEMENT_DARK, HEATER_ELEMENT_OFFSET );
  var HEATER_ELEMENT_ON_IMAGE = new EFACModelImage( HEATER_ELEMENT, HEATER_ELEMENT_OFFSET );

  var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.04 );
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0005, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0, -0.01 );
  var OFFSET_TO_CONVERSION_POINT = new Vector2( 0, 0.012 );

  var RAND = new Random();
  var BEAKER_WIDTH = 0.075; // In meters.
  var BEAKER_HEIGHT = BEAKER_WIDTH * 0.9;
  // var BEAKER_OFFSET = new Vector2( 0, 0.025 ); // Original Java coords
  var BEAKER_OFFSET = new Vector2( 0.089, 0.025 );
  var THERMOMETER_OFFSET = new Vector2( 0.033, 0.035 );
  var HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY = 0.0075; // In meters/sec, quite slow.
  var HEATER_ELEMENT_2D_HEIGHT = HEATER_ELEMENT_OFF_IMAGE.getHeight();
  var MAX_HEAT_GENERATION_RATE = 5000; // Joules/sec, not connected to incoming energy.
  var RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE = 0.2; // In meters.
  var HEAT_ENERGY_CHANGE_RATE = 0.5; // In proportion per second.

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function BeakerHeater( energyChunksVisibleProperty ) {

    EnergyUser.call( this, new Image( WATER_ICON ) );
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // var self = this;

    this.addProperty( 'heatProportion', 0 );
    this.electricalEnergyChunkMovers = [];
    this.heatingElementEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
    this.radiatedEnergyChunkList = new ObservableArray();

    this.beaker = new Beaker( BEAKER_OFFSET, BEAKER_WIDTH, BEAKER_HEIGHT, energyChunksVisibleProperty );

  }

  energyFormsAndChanges.register( 'BeakerHeater', BeakerHeater );

  return inherit( EnergyUser, BeakerHeater, {

    /**
     * @param  {Number} dt - timestep
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      if ( !this.active ) {
        return;
      }

      var self = this;

      // Handle any incoming energy chunks.
      if ( this.incomingEnergyChunks.length > 0 ) {
        this.incomingEnergyChunks.forEach( function( chunk ) {
          if ( chunk.energyType === EnergyType.ELECTRICAL ) {

            // Add the energy chunk to the list of those under management.
            self.energyChunkList.push( chunk );

            // Add a "mover" that will move this energy chunk through
            // the wire to the heating element.
            self.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( chunk,
              self.createElectricalEnergyChunkPath( self.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
          } else {
            // By design, this shouldn't happen, so warn if it does.
            console.warn( 'Ignoring energy chunk with unexpected type ' + chunk.energyType );
          }

        } );

        // Clear incoming chunks array
        this.incomingEnergyChunks.length = 0;
      }
      this.moveElectricalEnergyChunks( dt );
      this.moveThermalEnergyChunks( dt );

      var energyFraction = incomingEnergy.amount / ( EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt );

      // Set the proportion of max heat being generated by the heater element.
      if ( ( this.energyChunksVisibleProperty.get() && this.heatingElementEnergyChunkMovers.length > 0 ) ||
        ( !this.energyChunksVisibleProperty.get() && incomingEnergy.type === EnergyType.ELECTRICAL ) ) {
        this.heatProportionProperty.set( Math.min( energyFraction, this.heatProportion + HEAT_ENERGY_CHANGE_RATE * dt ) );
      } else {
        this.heatProportionProperty.set( Math.max( 0, this.heatProportion - HEAT_ENERGY_CHANGE_RATE * dt ) );
      }

      // Add energy to the beaker based on heat coming from heat element.
      this.beaker.changeEnergy( this.heatProportion * MAX_HEAT_GENERATION_RATE * dt );

      // Remove energy from the beaker based on loss of heat to the
      // surrounding air.
      var temperatureGradient = this.beaker.getTemperature() - EFACConstants.ROOM_TEMPERATURE;
      if ( Math.abs( temperatureGradient ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {
        var beakerRect = this.beaker.getRawOutlineRect();
        var thermalContactArea = ( beakerRect.width * 2 ) + ( beakerRect.height * 2 ) * this.beaker.fluidLevel;
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
        // Remove an energy chunk from the beaker and start it floating
        // away, a.k.a. make it "radiate".
        var bounds = this.beaker.getBounds();
        var extractionX = bounds.minX + RAND.nextDouble() * bounds.width;
        var extractionY = bounds.minY + RAND.nextDouble() * ( bounds.height * this.beaker.fluidLevelProperty.get() );
        var extractionPoint = new Vector2( extractionX, extractionY );
        var ec = this.beaker.extractClosestEnergyChunk( extractionPoint );
        if ( ec !== null ) {
          ec.zPositionProperty.set( 0.0 ); // Move to front of z order.
          this.radiatedEnergyChunkList.push( ec );
          this.radiatedEnergyChunkMovers.push(
            new EnergyChunkPathMover( ec, this.createRadiatedEnergyChunkPath( ec.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        }
      }

      this.moveRadiatedEnergyChunks( dt );
    },

    /**
     * @param  {Number} dt timestep
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.radiatedEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // Remove this energy chunk entirely.
          self.radiatedEnergyChunkList.remove( mover.energyChunk );

          _.remove( self.radiatedEnergyChunkMovers, mover );

        }
      } );
    },

    /**
     * @param  {Number} dt timestep
     * @private
     */
    moveThermalEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.heatingElementEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // The chunk is ready to move to the beaker.  We remove it
          // from here, and the beaker takes over management of the
          // chunk.
          self.beaker.addEnergyChunk( mover.energyChunk );

          self.energyChunkList.remove( mover.energyChunk );

          _.remove( self.heatingElementEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     * @param  {Number} dt timestep
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // The electrical energy chunk has reached the burner, so
          // it needs to change into thermal energy.
          _.remove( self.electricalEnergyChunkMovers, mover );
          mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

          // Have the thermal energy move a little on the element
          // before moving into the beaker.
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
    preLoadEnergyChunks: function( incomingEnergyRate ) {
      this.clearEnergyChunks();

      if ( incomingEnergyRate.amount === 0 || incomingEnergyRate.type !== EnergyType.ELECTRICAL ) {
        // No energy chunk pre-loading needed.
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // Simulate energy chunks moving through the system.
      var preLoadComplete = false;
      while ( !preLoadComplete ) {
        energySinceLastChunk += incomingEnergyRate.amount * dt;

        // Determine if time to add a new chunk.
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

          // Create and add a new chunk
          var newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.positionProperty.get().plus( OFFSET_TO_LEFT_SIDE_OF_WIRE ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty );
          this.energyChunkList.push( newEnergyChunk );

          // Add a "mover" that will move this energy chunk through
          // the wire to the heating element.
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( newEnergyChunk,
            this.createElectricalEnergyChunkPath( this.positionProperty.get() ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );

          // Update energy since last chunk.
          energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );

        if ( this.heatingElementEnergyChunkMovers.length > 0 ) {
          // An energy chunk has made it to the heating element, which completes the preload.
          preLoadComplete = true;
        }
      }
    },

    /**
     * Reset some variables/properties when deactivated by carousel
     * @public
     * @override
     */
    deactivate: function() {
      EnergyUser.prototype.deactivate.call( this );
      this.heatProportionProperty.set( 0 );
      this.beaker.reset();
    },

    clearEnergyChunks: function() {
      EnergyUser.prototype.clearEnergyChunks.call( this );

      this.electricalEnergyChunkMovers.length = 0;
      this.heatingElementEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;

      this.radiatedEnergyChunkList.clear();
    },

    /**
     * @param  {Vector2} startingPoint
     *
     * @return {Vector2[]}
     * @private
     */
    createHeaterElementEnergyChunkPath: function( startingPoint ) {
      var path = [];

      // The path for the thermal energy chunks is meant to look like it
      // is moving on the burner element.  This must be manually
      // coordinated with the burner element image.
      var angle = RAND.nextBoolean() ? RAND.nextDouble() * Math.PI * 0.45 : -RAND.nextDouble() * Math.PI * 0.3;
      path.push( startingPoint.plus( new Vector2( 0, HEATER_ELEMENT_2D_HEIGHT ).rotated( angle ) ) );
      return path;
    },

    /**
     * @param  {Vector2} center
     *
     * @return {Vector2[]}
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
     * Path for chunks to take when radiated from the beaker
     *
     * @param  {Vector2} startingPoint
     * @return {Vector2[]}
     * @private
     */
    createRadiatedEnergyChunkPath: function( startingPoint ) {
      var path = [];
      var numDirectionChanges = 4; // Empirically chosen.
      var nominalTravelVector = new Vector2( 0, RADIATED_ENERGY_CHUNK_TRAVEL_DISTANCE / numDirectionChanges );

      // The first point is straight above the start point.  This just looks
      // good, making the chunk move straight up out of the beaker.
      var currentPosition = startingPoint.plus( nominalTravelVector );
      path.push( currentPosition );

      // Add the remaining points in the path.
      for ( var i = 0; i < numDirectionChanges - 1; i++ ) {
        var movement = nominalTravelVector.rotated( ( RAND.nextDouble() - 0.5 ) * Math.PI / 4 );
        currentPosition = currentPosition.plus( movement );
        path.push( currentPosition );
      }

      return path;
    }

  }, {
    WIRE_STRAIGHT_IMAGE: WIRE_STRAIGHT_IMAGE,
    WIRE_CURVE_IMAGE: WIRE_CURVE_IMAGE,
    ELEMENT_BASE_BACK_IMAGE: ELEMENT_BASE_BACK_IMAGE,
    HEATER_ELEMENT_OFF_IMAGE: HEATER_ELEMENT_OFF_IMAGE,
    HEATER_ELEMENT_ON_IMAGE: HEATER_ELEMENT_ON_IMAGE,
    ELEMENT_BASE_FRONT_IMAGE: ELEMENT_BASE_FRONT_IMAGE
  } );
} );

