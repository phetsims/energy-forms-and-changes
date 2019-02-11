// Copyright 2016-2019, University of Colorado Boulder

/**
 * base class for light bulbs in the model
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyChunkPathMover' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergyUser' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Util = require( 'DOT/Util' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT = new Range( 2, 2.5 );
  const ENERGY_TO_FULLY_LIGHT = EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
  const LIGHT_CHUNK_LIT_BULB_RADIUS = 0.1; // In meters.
  const LIGHT_CHANGE_RATE = 0.5; // In proportion per second.

  // energy chunk path offsets
  const OFFSET_TO_LEFT_SIDE_OF_WIRE = new Vector2( -0.04, -0.041 );
  const OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.041 );
  const OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  const OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  const OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( -0.0003, -0.0175 );
  const OFFSET_TO_BOTTOM_OF_CONNECTOR = new Vector2( 0.0002, -0.01 );
  const OFFSET_TO_RADIATE_POINT = new Vector2( 0.0002, 0.066 );
  const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [
    OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND,
    OFFSET_TO_FIRST_WIRE_CURVE_POINT,
    OFFSET_TO_SECOND_WIRE_CURVE_POINT,
    OFFSET_TO_THIRD_WIRE_CURVE_POINT,
    OFFSET_TO_BOTTOM_OF_CONNECTOR,
    OFFSET_TO_RADIATE_POINT
  ];

  class LightBulb extends EnergyUser {

    /**
     * @param {Image} iconImage
     * @param {boolean} hasFilament
     * @param {Property.<boolean>} energyChunksVisibleProperty
     */
    constructor( iconImage, hasFilament, energyChunksVisibleProperty ) {
      super( iconImage );

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

    /**
     * @param  {number} dt - time step, in seconds
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    step( dt, incomingEnergy ) {
      if ( this.activeProperty.value ) {

        // handle any incoming energy chunks
        if ( this.incomingEnergyChunks.length > 0 ) {

          const incomingChunks = _.clone( this.incomingEnergyChunks );

          incomingChunks.forEach( incomingChunk => {

            if ( incomingChunk.energyTypeProperty.get() === EnergyType.ELECTRICAL ) {

              // add the energy chunk to the list of those under management
              this.energyChunkList.push( incomingChunk );

              // add a "mover" that will move this energy chunk through the wire to the bulb
              this.electricalEnergyChunkMovers.push(
                new EnergyChunkPathMover(
                  incomingChunk,
                  EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
                  EFACConstants.ENERGY_CHUNK_VELOCITY )
              );
            }

            // yy design, this shouldn't happen, so warn if it does
            else {
              assert && assert(
                false,
                'Encountered energy chunk with unexpected type: ' + this.incomingEnergyChunk.energyTypeProperty.get()
              );
            }
          } );

          this.incomingEnergyChunks.length = 0;
        }

        // move all of the energy chunks
        this.moveElectricalEnergyChunks( dt );
        this.moveFilamentEnergyChunks( dt );
        this.moveRadiatedEnergyChunks( dt );

        // set how lit the bulb is
        if ( this.energyChunksVisibleProperty.get() ) {

          // energy chunks are visible, so the lit proportion is dependent upon whether light energy chunks are present
          let lightChunksInLitRadius = 0;

          this.radiatedEnergyChunkMovers.forEach( mover => {
            const distance = mover.energyChunk.positionProperty.value.distance( this.positionProperty.value.plus( OFFSET_TO_RADIATE_POINT ) );
            if ( distance < LIGHT_CHUNK_LIT_BULB_RADIUS ) {
              lightChunksInLitRadius++;
            }
          } );

          if ( lightChunksInLitRadius > 0 ) {

            // light is on
            this.litProportionProperty.set( Math.min( 1, this.litProportionProperty.get() + LIGHT_CHANGE_RATE * dt ) );
          }
          else {

            // light is off
            this.litProportionProperty.set( Math.max( 0, this.litProportionProperty.get() - LIGHT_CHANGE_RATE * dt ) );
          }
        }

        // energy chunks not currently visible
        else {
          if ( this.activeProperty.value && incomingEnergy.type === EnergyType.ELECTRICAL ) {
            this.litProportionProperty.set( Util.clamp( incomingEnergy.amount / ( ENERGY_TO_FULLY_LIGHT * dt ), 0, 1 ) );
          }
          else {
            this.litProportionProperty.set( 0.0 );
          }
        }
      }
    }

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveRadiatedEnergyChunks( dt ) {

      // iterate over a copy to mutate original without problems
      const movers = _.clone( this.radiatedEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        // remove the chunk and its mover
        if ( mover.pathFullyTraversed ) {
          this.energyChunkList.remove( mover.energyChunk );
          _.pull( this.radiatedEnergyChunkMovers, mover );
        }
      } );
    }

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveFilamentEnergyChunks( dt ) {

      // iterate over a copy to mutate original without problems
      const movers = _.clone( this.filamentEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        // cause this energy chunk to be radiated from the bulb
        if ( mover.pathFullyTraversed ) {
          _.pull( this.filamentEnergyChunkMovers, mover );
          this.radiateEnergyChunk( mover.energyChunk );
        }
      } );
    }

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks( dt ) {

      // iterate over a copy to mutate original without problems
      const movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( mover => {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {
          _.pull( this.electricalEnergyChunkMovers, mover );

          // turn this energy chunk into thermal energy on the filament
          if ( this.hasFilament ) {
            mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
            const path = this.createPathOnFilament( mover.energyChunk.positionProperty.value );
            const speed = this.getTotalPathLength( mover.energyChunk.positionProperty.value, path ) /
                          this.generateThermalChunkTimeOnFilament();
            this.filamentEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk, path, speed ) );
          }
          else {

            // there is no filament, so just radiate the chunk
            this.radiateEnergyChunk( mover.energyChunk );
          }
        }
      } );
    }

    /**
     * @param  {Energy} incomingEnergy
     * @public
     * @override
     */
    preloadEnergyChunks( incomingEnergy ) {

      this.clearEnergyChunks();

      if ( incomingEnergy.amount < EFACConstants.MAX_ENERGY_PRODUCTION_RATE / 10 ||
           incomingEnergy.type !== EnergyType.ELECTRICAL ) {

        // no energy chunk pre-loading needed
        return;
      }

      const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99; // prime the pump

      // simulate energy chunks moving through the system
      let preloadComplete = false;
      while ( !preloadComplete ) {
        energySinceLastChunk += incomingEnergy.amount * dt;

        // determine if time to add a new chunk
        if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          const newEnergyChunk = new EnergyChunk(
            EnergyType.ELECTRICAL,
            this.positionProperty.value.plus( OFFSET_TO_LEFT_SIDE_OF_WIRE ),
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );

          this.energyChunkList.push( newEnergyChunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover(
            newEnergyChunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
            EFACConstants.ENERGY_CHUNK_VELOCITY
          ) );

          // update energy since last chunk
          energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        this.moveElectricalEnergyChunks( dt );
        this.moveFilamentEnergyChunks( dt );

        if ( this.radiatedEnergyChunkMovers.length > 1 ) {

          // a couple of chunks are radiating, which completes the pre-load
          preloadComplete = true;
        }
      }
    }

    /**
     * @param  {EnergyChunk} energyChunk
     * @private
     */
    radiateEnergyChunk( energyChunk ) {
      if ( phet.joist.random.nextDouble() > this.proportionOfThermalChunksRadiated ) {
        energyChunk.energyTypeProperty.set( EnergyType.LIGHT );
      }
      else {
        energyChunk.energyTypeProperty.set( EnergyType.THERMAL );
      }

      this.radiatedEnergyChunkMovers.push( new EnergyChunkPathMover(
        energyChunk,
        EnergyChunkPathMover.createRandomStraightPath(
          this.positionProperty.value,
          new Range( Math.PI / 3, Math.PI / 3 * 2 ) ),
        EFACConstants.ENERGY_CHUNK_VELOCITY )
      );
    }

    /**
     * @param  {Vector2} startingPoint
     * @returns {Vector2[]}
     * @private
     */
    createPathOnFilament( startingPoint ) {
      const path = [];
      const filamentWidth = 0.03;
      const x = ( 0.5 + phet.joist.random.nextDouble() / 2 ) * filamentWidth / 2 * ( this.goRightNextTime ? 1 : -1 );

      path.push( startingPoint.plus( new Vector2( x, 0 ) ) );
      this.goRightNextTime = !this.goRightNextTime;

      return path;
    }

    /**
     * @returns {number} time
     * @private
     */
    generateThermalChunkTimeOnFilament() {
      return THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.min +
             phet.joist.random.nextDouble() * THERMAL_ENERGY_CHUNK_TIME_ON_FILAMENT.getLength();
    }

    /**
     * @param {Vector2} startingLocation
     * @param {Vector2[]} pathPoints
     * @returns {number}
     * @private
     */
    getTotalPathLength( startingLocation, pathPoints ) {
      if ( pathPoints.length === 0 ) {
        return 0;
      }

      let pathLength = startingLocation.distance( pathPoints[ 0 ] );
      for ( let i = 0; i < pathPoints.length - 1; i++ ) {
        pathLength += pathPoints[ i ].distance( pathPoints[ i + 1 ] );
      }

      return pathLength;
    }

    /**
     * deactivate the light bulb
     * @public
     * @override
     */
    deactivate() {
      super.deactivate();
      this.litProportionProperty.set( 0 );
    }

    /**
     * @public
     * @override
     */
    clearEnergyChunks() {
      super.clearEnergyChunks();
      this.electricalEnergyChunkMovers.length = 0;
      this.filamentEnergyChunkMovers.length = 0;
      this.radiatedEnergyChunkMovers.length = 0;
      this.incomingEnergyChunks.length = 0;
    }
  }

  return energyFormsAndChanges.register( 'LightBulb', LightBulb );
} );

