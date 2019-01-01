// Copyright 2018, University of Colorado Boulder

/**
 * a motion strategy for moving energy chunks in a straight line
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {EnergyChunk} energyChunk
   * @param {Property.<Vector2>} destinationProperty
   * @param {Object} options
   * @constructor
   */
  function EnergyChunkStraightLineMotionStrategy( energyChunk, destinationProperty, options ) {

    options = _.extend( {

      // {number} - in meters/second
      speed: 0.075
    }, options );

    // @public (read-only) {EnergyChunk)
    this.energyChunk = energyChunk;

    // @private
    this.destinationProperty = destinationProperty;
    var currentPosition = energyChunk.positionProperty.get();
    this.velocity = new Vector2(
      destinationProperty.get().x - currentPosition.x,
      destinationProperty.get().y - currentPosition.y ).setMagnitude( options.speed );
  }

  energyFormsAndChanges.register( 'EnergyChunkStraightLineMotionStrategy', EnergyChunkStraightLineMotionStrategy );

  return inherit( Object, EnergyChunkStraightLineMotionStrategy, {

    /**
     * update the position of this energy chunk for a given change in time
     * @param {number} dt - delta time
     * @public
     */
    updatePosition: function( dt ) {

      var distanceToDestination = this.energyChunk.positionProperty.value.distance( this.destinationProperty.value );

      // check if destination reached
      if ( distanceToDestination < this.velocity.magnitude() * dt &&
           !this.energyChunk.positionProperty.value.equals( this.destinationProperty.value ) ) {

        this.energyChunk.positionProperty.set( this.destinationProperty.value );
        this.velocity.setMagnitude( 0 );
      }

      this.energyChunk.positionProperty.value = this.energyChunk.positionProperty.value.plus( this.velocity.times( dt ) );
    },

    /**
     * returns true if the energy chunk has reached its destination, false if not
     * @returns {boolean}
     * @public
     */
    isDestinationReached: function() {
      return this.energyChunk.positionProperty.value.equals( this.destinationProperty.value );
    }
  } );
} );