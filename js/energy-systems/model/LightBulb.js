// Copyright 2016-2018, University of Colorado Boulder

/**
 * base class for light bulbs in the model
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  var OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.041 );
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.041 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0003, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0.0002, -0.01 );
  var OFFSET_TO_RADIATE_POINT = new Vector2( 0.0002, 0.066 );

  var RADIATED_ENERGY_CHUNK_MAX_DISTANCE = 0.5;
  var THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range( 2, 2.5 );
  var ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
  var LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
  var LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

  /**
   * @param {Image} iconImage
   * @param {boolean} hasFilament
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function LightBulb( iconImage, hasFilament, energyChunksVisibleProperty ) {

    EnergyUser.call( this, iconImage );

    // @public (read-only) {NumberProperty}
    this.litProportionProperty = new Property( 0 );

    // @private
    this.hasFilament = hasFilament;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private {number} - fewer thermal energy chunks are radiated for bulbs without a filament
    this.proportionOfThermalChunksRadiated = hasFilament ? 0.35 : 0.2;

    // @private - movers and flags that control how the energy chunks move through the light bulb
    this.electricalEnergyChunkMovers = [];
    this.filamentEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];
    this.goRightNextTime = true;
  }

  energyFormsAndChanges.register( 'LightBulb', LightBulb );

  return inherit( EnergyUser, LightBulb, {

    /**
     * @param  {number} dt - time step, in seconds
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      var self = this;
      if ( this.activeProperty.value ) {

        // handle any incoming energy chunks
        if ( this.incomingEnergyChunks.length > 0 ) {

          var incomingChunks = _.clone( this.incomingEnergyChunks );

          incomingChunks.forEach( function( incomingChunk ) {

            if ( incomingChunk.energyTypeProperty.get() === EnergyType.ELECTRICAL ) {

              // add the energy chunk to the list of those under management
              self.energyChunkList.push( incomingChunk );

              // add a "mover" that will move this energy chunk through the wire to the bulb
              self.electricalEnergyChunkMovers.push(
                new EnergyChunkPathMover(
                  incomingChunk,
                  self.createElectricalEnergyChunkPath( self.positionProperty.value ),
                  EFACConstants.ENERGY_CHUNK_VELOCITY )
              );
            }

            // yy design, this shouldn't happen, so warn if it does
            else {
              assert && assert(
                false,
                'Encountered energy chunk with unexpected type: ' + self.incomingEnergyChunk.energyTypeProperty.get()
              );
            }
          } );

          self.incomingEnergyChunks.length = 0;
        }

        // move all of the energy chunks
        this.moveElectricalEnergyChunks( dt );
        this.moveFilamentEnergyChunks( dt );
        this.moveRadiatedEnergyChunks( dt );

        // set how lit the bulb is
        if ( this.energyChunksVisibleProperty.get() ) {

          // energy chunks are visible, so the lit proportion is dependent upon whether light energy chunks are present
          var lightChunksInLitRadius = 0;

          this.radiatedEnergyChunkMovers.forEach( function( mover ) {
            var distance = mover.energyChunk.positionProperty.value.distance( self.positionProperty.value.plus( OFFSET_TO_RADIATE_POINT ) );
            if ( distance < LIGHT_CHUNK_LIT_BULB_RADIUS ) {
              lightChunksInLitRadius++;
            }
          } );

          if ( lightChunksInLitRadius > 0 ) {

            // light is on
            this.litProportionProperty.set( Math.min( 1, this.litProportionProperty.get() + LIGHT_CHANGE_RATE * dt ) );
          } else {

            // light is off
            this.litProportionProperty.set( Math.max( 0, this.litProportionProperty.get() - LIGHT_CHANGE_RATE * dt ) );
          }
        }

        // energy chunks not currently visible
        else {
          if ( this.activeProperty.value && incomingEnergy.type === EnergyType.ELECTRICAL ) {
            this.litProportionProperty.set( Util.clamp( incomingEnergy.amount / ( ENERGY_TO_FULLY_LIGHT * dt ), 0, 1 ) );
          } else {
            this.litProportionProperty.set( 0.0 );
          }
        }
      }
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveRadiatedEnergyChunks: function( dt ) {

      // iterate over a copy to mutate original without problems
      var movers = _.clone( this.radiatedEnergyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        // remove the chunk and its mover
        if ( mover.pathFullyTraversed ) {
          self.energyChunkList.remove( mover.energyChunk );
          _.pull( self.radiatedEnergyChunkMovers, mover );
        }
      } );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveFilamentEnergyChunks: function( dt ) {

      // iterate over a copy to mutate original without problems
      var movers = _.clone( this.filamentEnergyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        // cause this energy chunk to be radiated from the bulb
        if ( mover.pathFullyTraversed ) {
          _.pull( self.filamentEnergyChunkMovers, mover );
          self.radiateEnergyChunk( mover.energyChunk );
        }
      } );
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {

      // iterate over a copy to mutate original without problems
      var movers = _.clone( this.electricalEnergyChunkMovers );

      var self = this;

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {
          _.pull( self.electricalEnergyChunkMovers, mover );

          // turn this energy chunk into thermal energy on the filament
          if ( self.hasFilament ) {
            mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
            var path = self.createThermalEnergyChunkPath( mover.energyChunk.positionProperty.value );
            var speed = self.getTotalPathLength( mover.energyChunk.positionProperty.value, path ) /
              self.generateThermalChunkTimeOnFilament();

            self.filamentEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk, path, speed ) );
          } else {

            // there is no filament, so just radiate the chunk
            self.radiateEnergyChunk( mover.energyChunk );
          }
        }
      } );
    },

    /**
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    preLoadEnergyChunks: function( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( incomingEnergy.amount < EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 10 ||
        incomingEnergy.type !== EnergyType.ELECTRICAL ) {

        // no energy chunk pre-loading needed
        return;
      }

      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      var energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

      // simulate energy chunks moving through the system
      var preLoadComplete = false;
      while ( !preLoadComplete ) {
        this.energySinceLastChunk += incomingEnergy.amount * dt;

        // determine if time to add a new chunk
        if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          var newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.positionProperty.value.plus( OFFSET_TO_LEFT_SIDE_OF_WIRE ),
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover(
            newEnergyChunk,
            this.createElectricalEnergyChunkPath( this.positionProperty.value ),
            EFACConstants.ENERGY_CHUNK_VELOCITY
          ) );

          // update energy since last chunk
          energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );
        this.moveFilamentEnergyChunks( dt );

        if ( this.radiatedEnergyChunkMovers.length > 1 ) {

          // a couple of chunks are radiating, which completes the pre-load
          preLoadComplete = true;
        }
      }
    },

    /**
     * @param  {EnergyChunk} energyChunk
     * @private
     */
    radiateEnergyChunk: function( energyChunk ) {
      if ( phet.joist.random.nextDouble() > this.proportionOfThermalChunksRadiated ) {
        energyChunk.energyTypeProperty.set( EnergyType.LIGHT );
      } else {
        energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
      }

      // path of radiated light chunks
      var path = [];

      path.push( this.positionProperty.value
        .plus( OFFSET_TO_RADIATE_POINT )
        .plus( new Vector2( 0, RADIATED_ENERGY_CHUNK_MAX_DISTANCE )
          .rotated( ( phet.joist.random.nextDouble() - 0.5 ) * ( Math.PI / 2 ) )
        )
      );

      this.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover(
        energyChunk,
        path,
        EFACConstants.ENERGY_CHUNK_VELOCITY )
      );
    },

    /**
     * @param  {Vector2} startingPoint
     * @returns {Vector2[]}
     * @private
     */
    createThermalEnergyChunkPath: function( startingPoint ) {
      var path = [];
      var filamentWidth = 0.03;
      var x = (0.5 + phet.joist.random.nextDouble() / 2) * filamentWidth / 2 * (this.goRightNextTime ? 1 : -1);

      path.push( startingPoint.plus( new Vector2( x, 0 ) ) );
      this.goRightNextTime = !this.goRightNextTime;

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
      path.push( center.plus( OFFSET_TO_RADIATE_POINT ) );

      return path;
    },

    /**
     * @returns {number} time
     * @private
     */
    generateThermalChunkTimeOnFilament: function() {
      return THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.min +
             phet.joist.random.nextDouble() * THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.getLength();
    },

    /**
     * @param {Vector2} startingLocation
     * @param {Vector2[]} pathPoints
     * @returns {number}
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
     * deactivate the light bulb
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
      this.incomingEnergyChunks.length = 0;
    }
  } );
} );

