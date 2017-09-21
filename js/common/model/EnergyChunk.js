// Copyright 2014-2016, University of Colorado Boulder

/**
 * Class that represents a chunk of energy in the view.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  //static data
  var instanceCount = 0; // Base count for the unique ID of this slice.

  /**
   *
   * @param {EnergyType} initialEnergyType
   * @param {Vector2} initialPosition
   * @param {Vector2} initialVelocity
   * @param {Property.<boolean>} visibleProperty
   * @constructor
   */
  function EnergyChunk( initialEnergyType, initialPosition, initialVelocity, visibleProperty ) {

    assert && assert( initialPosition instanceof Vector2,
      'Expected a Vector2, got this: ' + initialPosition );

    this.positionProperty = new Property( initialPosition );
    this.zPositionProperty = new Property( 0 );   // For simple 3D layering effects
    this.energyTypeProperty = new Property( initialEnergyType );
    this.visibleProperty = visibleProperty;

    // add a unique for the hash map that will call on these slices
    this.uniqueID = instanceCount++;

    this.velocity = initialVelocity;
  }

  energyFormsAndChanges.register( 'EnergyChunk', EnergyChunk );

  return inherit( Object, EnergyChunk, {
    /**
     * Function that translate the energy chunk by a vector movement
     * @param {Vector2} movement
     */
    translate: function( movement ) {
      this.positionProperty.value = this.positionProperty.value.plus( movement );
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
    },

    reset: function() {
      this.positionProperty.reset();
      this.zPositionProperty.reset();
      this.energyTypeProperty.reset();
      this.visibleProperty.reset();
    }

  } );
} );

