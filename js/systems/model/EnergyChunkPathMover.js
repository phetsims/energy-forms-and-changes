// Copyright 2016-2018, University of Colorado Boulder

/**
 * a type that is used to move an energy chunk along a pre-defined path
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {EnergyChunk} energyChunk - energy chunk to be moved
   * @param {Vector2[]} path - points along energy chunk path
   * @param {number} speed - in meters per second
   * @constructor
   */
  function EnergyChunkPathMover( energyChunk, path, speed ) {

    // validate args
    assert && assert( energyChunk instanceof EnergyChunk, 'energyChunk is not of correct type: ' + energyChunk );
    assert && assert( path.length > 0, 'Path must have at least one point' );
    assert && assert( speed >= 0, 'speed must be a non-negative scalar. Received: ' + speed );

    // @public (read-only) {EnergyChunk}
    this.energyChunk = energyChunk;

    // @private
    this.path = path;
    this.speed = speed;
    this.pathFullyTraversed = false;
    this.nextPoint = path[ 0 ];
  }

  energyFormsAndChanges.register( 'EnergyChunkPathMover', EnergyChunkPathMover );

  return inherit( Object, EnergyChunkPathMover, {

    /**
     * advance chunk position along the path
     * @param  {number} dt - time step in seconds
     */
    moveAlongPath: function( dt ) {

      var distanceToTravel = dt * this.speed;

      while ( distanceToTravel > 0 && !this.pathFullyTraversed ) {

        var chunkPosition = this.energyChunk.positionProperty.get();

        assert && assert(
          chunkPosition instanceof Vector2,
          'Expected a Vector2, got this: ' + chunkPosition
        );

        var distanceToNextPoint = chunkPosition.distance( this.nextPoint );

        if ( distanceToTravel < distanceToNextPoint ) {

          // the energy chunk will not reach the next destination point during this step, so just move that direction
          var phi = this.nextPoint.minus( this.energyChunk.positionProperty.get() ).angle();
          var velocity = new Vector2( distanceToTravel, 0 ).rotated( phi );
          this.energyChunk.positionProperty.set( this.energyChunk.positionProperty.get().plus( velocity ) );
          distanceToTravel = 0; // no remaining distance
        } else {

          // arrived at next destination point
          distanceToTravel -= this.energyChunk.positionProperty.get().distance( this.nextPoint );
          this.energyChunk.positionProperty.set( this.nextPoint );

          if ( this.nextPoint === this.path[ this.path.length - 1 ] ) {

            // the end of the path has been reached
            this.pathFullyTraversed = true;
          } else {

            // set the next destination point
            this.nextPoint = this.path[ this.path.indexOf( this.nextPoint ) + 1 ];
          }
        }
      }
    },

    /**
     * get the last point in the path that the energy chunk will follow
     * @returns {Vector2}
     * @public
     */
    getFinalDestination: function() {
      return this.path[ this.path.length - 1 ];
    }
  } );
} );

