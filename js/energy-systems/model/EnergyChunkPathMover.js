// Copyright 2016, University of Colorado Boulder

/**
 * Class that is used to move an energy chunk along a path.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {EnergyChunk} energyChunk - chunk to be moved
   * @param {Vector2[]} path - points along energy chunk path
   * @param {Number} speed - velocity magnitude
   * @constructor
   */
  function EnergyChunkPathMover( energyChunk, path, speed ) {

    // Validate args
    assert && assert( energyChunk instanceof EnergyChunk, 'energyChunk is not of correct type: ' + energyChunk );
    assert && assert( path.length > 0, 'Path must have at least one point' );
    assert && assert( speed >= 0, 'speed must be a non-negative scalar. Received: ' + speed );

    // @public
    this.energyChunk = energyChunk;
    this.path = path;
    this.speed = speed;
    this.pathFullyTraversed = false;

    this.nextPoint = path[ 0 ];
  }

  energyFormsAndChanges.register( 'EnergyChunkPathMover', EnergyChunkPathMover );

  return inherit( Object, EnergyChunkPathMover, {
    /**
     * Advance chunk position on path
     * @param  {Number} dt timestep
     */
    moveAlongPath: function( dt ) {

      var distanceToTravel = dt * this.speed;

      while ( distanceToTravel > 0 && !this.pathFullyTraversed ) {

        var chunkPosition = this.energyChunk.positionProperty.get();

        assert && assert( chunkPosition instanceof Vector2,
          'Expected a Vector2, got this: ' + chunkPosition );

        var distanceToNextPoint = chunkPosition.distance( this.nextPoint );

        if ( distanceToTravel < distanceToNextPoint ) {
          // Not arriving at destination next point yet, so just move towards it.

          var phi = this.nextPoint.minus( this.energyChunk.positionProperty.get() ).angle();
          var velocity = new Vector2( distanceToTravel, 0 ).rotated( phi );

          this.energyChunk.positionProperty.set( this.energyChunk.positionProperty.get().plus( velocity ) );

          distanceToTravel = 0; // No remaining distance.
        } else {
          // Arrived at next destination point.

          distanceToTravel -= this.energyChunk.positionProperty.get().distance( this.nextPoint );
          this.energyChunk.positionProperty.set( this.nextPoint );

          if ( this.nextPoint === this.path[ this.path.length - 1 ] ) {
            // At the end.
            this.pathFullyTraversed = true;
          } else {
            // Set the next destination point.
            this.nextPoint = this.path[ this.path.indexOf( this.nextPoint ) + 1 ];
          }
        }
      }

    },

    getFinalDestination: function() {
      return this.path.get[ this.path.length - 1 ];
    }

  } );
} );

