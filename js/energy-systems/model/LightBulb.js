// Copyright 2016, University of Colorado Boulder

/**
 * Base class for light bulbs in the model.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Random = require( 'DOT/Random' );
  var Range = require( 'DOT/Range' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // Images
  var ELEMENT_BASE_BACK = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_back.png' );
  var ELEMENT_BASE_FRONT = require( 'image!ENERGY_FORMS_AND_CHANGES/element_base_front.png' );
  var WIRE_BLACK_62 = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_62.png' );
  var WIRE_BLACK_RIGHT = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_black_right.png' );

  // Constants - uncomment as needed
  var WIRE_FLAT_IMAGE = new EFACModelImage( WIRE_BLACK_62, new Vector2( -0.036, -0.04 ) );
  var WIRE_CURVE_IMAGE = new EFACModelImage( WIRE_BLACK_RIGHT, new Vector2( -0.009, -0.016 ) );
  var ELEMENT_BASE_FRONT_IMAGE = new EFACModelImage( ELEMENT_BASE_FRONT, new Vector2( 0, 0.0 ) );
  var ELEMENT_BASE_BACK_IMAGE = new EFACModelImage( ELEMENT_BASE_BACK, new Vector2( 0, 0.0 ) );

  var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.04 );
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0005, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0, -0.01 );
  var OFFSET_TO_RADIATE_POINT = new Vector2( 0, 0.066 );

  var RADIATED_ENERGY_CHUNK_MAX_DISTANCE = 0.5;
  var RAND = new Random();
  var THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range( 2, 2.5 );
  var ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
  var LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
  var LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

  /**
   * @param {Image} iconImage
   * @param {Boolean} hasFilament
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function LightBulb( iconImage, hasFilament, energyChunksVisibleProperty ) {

    EnergyUser.call( this, iconImage );

    this.hasFilament = hasFilament;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // Fewer thermal energy chunks are radiated for bulbs without a filament.
    this.proportionOfThermalChunksRadiated = hasFilament ? 0.35 : 0.2;

    this.addProperty( 'litProportion', 0 );
    this.electricalEnergyChunkMovers = [];
    this.filamentEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
    this.goRightNextTime = true; // @private
  }

  energyFormsAndChanges.register( 'LightBulb', LightBulb );

  return inherit( EnergyUser, LightBulb, {

    /**
     * @param  {Number} dt - timestep
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      var self = this;
      if ( this.active ) {

        // Handle any incoming energy chunks.
        if ( this.incomingEnergyChunks.length > 0 ) {

          var incomingChunks = _.clone( this.incomingEnergyChunks );

          incomingChunks.forEach( function( incomingChunk ) {

            if ( incomingChunk.energyTypeProperty.get() === EnergyType.ELECTRICAL ) {

              // Add the energy chunk to the list of those under management.
              self.energyChunkList.push( incomingChunk );

              // And a "mover" that will move this energy chunk through
              // the wire to the bulb.
              self.electricalEnergyChunkMovers.push(
                new EnergyChunkPathMover(
                  incomingChunk,
                  self.createElectricalEnergyChunkPath( self.position ),
                  EFACConstants.ENERGY_CHUNK_VELOCITY ) );
            }

            // By design, this shouldn't happen, so warn if it does.
            else {
              assert && assert( false, 'Encountered energy chunk with unexpected type: ' +
                self.incomingEnergyChunk.energyTypeProperty.get() );
            }
          } );

          self.incomingEnergyChunks.length = 0;
        }

        // Move all of the energy chunks.
        this.moveElectricalEnergyChunks( dt );
        this.moveFilamentEnergyChunks( dt );
        this.moveRadiatedEnergyChunks( dt );

        // Set how lit the bulb is.
        if ( this.energyChunksVisibleProperty.get() ) {

          // Energy chunks are visible, so the lit proportion is
          // dependent upon whether light energy chunks are present.
          var lightChunksInLitRadius = 0;

          var movers = _.clone( this.radiatedEnergyChunkMovers );

          movers.forEach( function( mover ) {
            var distance = mover.energyChunk.position.distance( self.position.plus( OFFSET_TO_RADIATE_POINT ) );
            if ( distance < LIGHT_CHUNK_LIT_BULB_RADIUS ) {
              lightChunksInLitRadius++;
            }
          } );

          if ( lightChunksInLitRadius > 0 ) {
            // Light is on.
            this.litProportionProperty.set( Math.min( 1, this.litProportionProperty.get() + LIGHT_CHANGE_RATE * dt ) );
          } else {
            // Light is off.
            this.litProportionProperty.set( Math.max( 0, this.litProportionProperty.get() - LIGHT_CHANGE_RATE * dt ) );
          }
        } else {
          if ( this.active && incomingEnergy.type === EnergyType.ELECTRICAL ) {
            this.litProportionProperty.set( Util.clamp( 0, incomingEnergy.amount / ( ENERGY_TO_FULLY_LIGHT * dt ), 1 ) );
          } else {
            this.litProportionProperty.set( 0.0 );
          }
        }
      }
    },

    /**
     * Utility method to remove object from array.
     *
     * @param  {*[]} list
     * @param  {*} element
     * @private
     */
    removeElement: function( list, element ) {
      _.remove( list, function( e ) {
        return e === element;
      } );
    },

    /**
     *
     *
     * @param  {Number} dt - timestep
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {
      // Iterate over a copy to mutate original without problems
      var movers = _.clone( this.radiatedEnergyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        // Remove the chunk and its mover.
        if ( mover.pathFullyTraversed ) {
          self.removeElement( self.energyChunkList, mover.energyChunk );
          self.removeElement( self.radiatedEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     *
     *
     * @param  {Number} dt - timestep
     * @private
     */
    moveFilamentEnergyChunks: function( dt ) {
      // Iterate over a copy to mutate original without problems
      var movers = _.clone( this.filamentEnergyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        // Cause this energy chunk to be radiated from the bulb.
        if ( mover.pathFullyTraversed ) {
          self.removeElement( self.filamentEnergyChunkMovers, mover );
          self.radiateEnergyChunk( mover.energyChunk );
        }
      } );
    },

    /**
     *
     *
     * @param  {Number} dt - timestep
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {

      // Iterate over a copy to mutate original without problems
      var movers = _.clone( this.electricalEnergyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {
          self.removeElement( self.electricalEnergyChunkMovers, mover );

          // Turn this energy chunk into thermal energy on the filament.
          if ( self.hasFilament ) {
            mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
            var path = self.createThermalEnergyChunkPath( mover.energyChunk.position );
            var speed = self.getTotalPathLength( mover.energyChunk.position, path ) /
              self.generateThermalChunkTimeOnFilament();

            self.filamentEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk, path, speed ) );
          } else {
            // There is no filament, so just radiate the chunk.
            self.radiateEnergyChunk( mover.energyChunk );
          }
        }
      } );
    },

    /**
     * [preLoadEnergyChunks description]
     *
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    preLoadEnergyChunks: function( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( incomingEnergy.amount < EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 10 ||
        incomingEnergy.type !== EnergyType.ELECTRICAL ) {
        // No energy chunk pre-loading needed.
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // Simulate energy chunks moving through the system.
      var preLoadComplete = false;
      while ( !preLoadComplete ) {
        this.energySinceLastChunk += incomingEnergy.amount * dt;

        // Determine if time to add a new chunk.
        if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.position.plus( OFFSET_TO_LEFT_SIDE_OF_WIRE ),
            this.energyChunksVisibleProperty );

          this.energyChunkList.push( newEnergyChunk );
          // Add a 'mover' for this energy chunk.
          // And a "mover" that will move this energy chunk through
          // the wire to the heating element.
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( newEnergyChunk,
            this.createElectricalEnergyChunkPath( this.position ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );

          // Update energy since last chunk.
          energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );
        this.moveFilamentEnergyChunks( dt );

        if ( this.radiatedEnergyChunkMovers.length > 1 ) {
          // A couple of chunks are radiating, which completes the pre-load.
          preLoadComplete = true;
        }
      }
    },

    /**
     * @param  {EnergyChunk} energyChunk
     * @private
     */
    radiateEnergyChunk: function( energyChunk ) {
      if ( RAND.nextDouble() > this.proportionOfThermalChunksRadiated ) {
        energyChunk.energyTypeProperty.set( EnergyType.LIGHT );
      } else {
        energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
      }

      // Path of radiated light chunks
      var path = [];

      path.push( this.position
        .plus( OFFSET_TO_RADIATE_POINT )
        .plus( new Vector2( 0, RADIATED_ENERGY_CHUNK_MAX_DISTANCE )
          .rotated( ( RAND.nextDouble() - 0.5 ) * ( Math.PI / 2 ) ) ) );

      this.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover(
        energyChunk,
        path,
        EFACConstants.ENERGY_CHUNK_VELOCITY ) );
    },

    /**
     * @param  {Vector2} startingPoint
     *
     * @return {Vector2[]}
     * @private
     */
    createThermalEnergyChunkPath: function( startingPoint ) {
      var path = [];
      var filamentWidth = 0.03;
      var x = ( 0.5 + RAND.nextDouble() / 2 ) * filamentWidth / 2 * ( this.goRightNextTime ? 1 : -1 );

      path.push( new Vector2( x, 0 ) );
      this.goRightNextTime = !this.goRightNextTime;

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
      path.push( center.plus( OFFSET_TO_RADIATE_POINT ) );

      return path;
    },

    /**
     * @return {Number} time
     * @private
     */
    generateThermalChunkTimeOnFilament: function() {
      return THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.min +
        RAND.nextDouble() * THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.getLength();
    },

    /**
     * @param {Vector2} startingLocation
     * @param {Vector2[]} pathPoints
     * @return {Number}
     * @private
     */
    getTotalPathLength: function( startingLocation, pathPoints ) {
      if ( pathPoints.length === 0 ) {
        return 0;
      }

      var pathLength = startingLocation.distance( pathPoints[ 0 ] );
      for ( var i = 0; i < pathPoints.length - 1; i++ ) {
        pathLength += pathPoints[ i ].distance( pathPoints[ i + 1 ] );
      }

      return pathLength;
    },

    /**
     * Deactivate the light bulb.
     * @public
     * @override
     */
    deactivate: function() {
      EnergyUser.prototype.deactivate.call( this );
      this.litProportionProperty.set( 0 );
    },

    /**
     * @public
     * @override
     */
    clearEnergyChunks: function() {
      EnergyUser.prototype.clearEnergyChunks.call( this );
      this.electricalEnergyChunkMovers.length = 0;
      this.filamentEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;
    }

  }, {
    // Export module-scope consts for static access
    WIRE_BLACK_RIGHT: WIRE_BLACK_RIGHT,
    WIRE_BLACK_62: WIRE_BLACK_62,
    ELEMENT_BASE_FRONT: ELEMENT_BASE_FRONT,
    ELEMENT_BASE_BACK: ELEMENT_BASE_BACK,

    WIRE_FLAT_IMAGE: WIRE_FLAT_IMAGE,
    WIRE_CURVE_IMAGE: WIRE_CURVE_IMAGE,
    ELEMENT_BASE_FRONT_IMAGE: ELEMENT_BASE_FRONT_IMAGE,
    ELEMENT_BASE_BACK_IMAGE: ELEMENT_BASE_BACK_IMAGE
  } );
} );

