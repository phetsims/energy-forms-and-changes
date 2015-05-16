// Copyright 2002-2015, University of Colorado

/**
 * Class that represents a chunk of energy in the view.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  //static data
  var instanceCount = 0; // Base count for the unique ID of this slice.

  /**
   *
   * @param {EnergyType} initialEnergyType
   * @param {Vector2} initialPosition
   * @param {Vector2} initialVelocity
   * @param {boolean} visibilityControl
   * @constructor
   */
  function EnergyChunk( initialEnergyType, initialPosition, initialVelocity, visibilityControl ) {

    PropertySet.call( this, {
      position: initialPosition,
      zPosition: 0,  // Used for some simple 3D layering effects.
      energyType: initialEnergyType,
      visible: visibilityControl
    } );

    // add a unique for the hash map that will call on these slices
    this.uniqueID = instanceCount++;

    //this.visibleProperty = visibilityControl;
    this.velocity = initialVelocity;
  }

  return inherit( PropertySet, EnergyChunk, {
    /**
     * Function that translate the energy chunk by a vector movement
     * @param {Vector2} movement
     */
    translate: function( movement ) {
      this.position = this.position.plus( movement );
    },

    /**
     * Function that translates the energy chunk based on its velocity
     * @param {number} time
     */
    translateBasedOnVelocity: function( time ) {
      this.translate( this.velocity.times( time ) );
    },

    /**
     * Function that returns the velocity of the energy chunk
     * @returns {Vector2}
     */
    getVelocity: function() {
      return this.velocity.copy();
    },

    /**
     * Function that sets the X and Y velocity of the energy chunk
     * @param {number} x
     * @param {number} y
     */
    setVelocityXY: function( x, y ) {
      this.velocity.setXY( x, y );
    },

    /**
     * Function that sets the velocity of the energy chunk (using a vector)
     * @param {Vector2} newVelocity
     */
    setVelocity: function( newVelocity ) {
      this.velocity.set( newVelocity );
    }

  } );
} );
