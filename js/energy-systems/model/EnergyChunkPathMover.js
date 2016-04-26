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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {EnergyChunk} energyChunk [description]
   * @param {Array<Vector2>} path        [description]
   * @param {Number} velocity    [description]
   * @constructor
   */
  function EnergyChunkPathMover( energyChunk, path, velocity ) {
    this.energyChunk = energyChunk;
    this.path = path;
    this.velocity = velocity;
    this.pathFullyTraversed = false;

    assert && assert( path.length > 0, 'Path must have at least one point' );

    this.nextPoint = path[ 0 ];

  }

  energyFormsAndChanges.register( 'EnergyChunkPathMover', EnergyChunkPathMover );

  return inherit( Object, EnergyChunkPathMover, {
    /**
     * Advance chunk position on path
     * @param  {Number} dt timestep
     */
    moveAlongPath: function( dt ) {
      var distanceToTravel = dt * this.velocity;
      while ( this.distanceToTravel > 0 && !this.pathFullyTraversed ) {
        if ( this.distanceToTravel < this.energyChunk.positionProperty.get().distance( this.nextPoint ) ) {
          // Not arriving at destination next point yet, so just move towards it.
          var phi = this.nextPoint.minus( this.energyChunk.positionProperty.get() ).angle();
          var velocity = new Vector2( this.distanceToTravel, 0 ).rotated( phi );
          this.energyChunk.position.set( this.energyChunk.position.get().plus( velocity ) );
          distanceToTravel = 0; // No remaining distance.
        } else {
          // Arrived at next destination point.
          distanceToTravel -= this.energyChunk.position.get().distance( this.nextPoint );
          this.energyChunk.position.set( this.nextPoint );
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

