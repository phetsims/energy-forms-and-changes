// Copyright 2014-2018, University of Colorado Boulder

/**
 * type that represents a chunk of energy in the view
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

  // static data
  var instanceCount = 0; // counter for creating unique IDs

  /**
   * @param {EnergyType} initialEnergyType
   * @param {Vector2} initialPosition
   * @param {Vector2} initialVelocity
   * @param {Property.<boolean>} visibleProperty
   * @constructor
   */
  function EnergyChunk( initialEnergyType, initialPosition, initialVelocity, visibleProperty ) {

    // @public - properties of this energy chunk
    this.positionProperty = new Property( initialPosition );
    this.zPositionProperty = new Property( 0 );   // for simple 3D layering effects
    this.energyTypeProperty = new Property( initialEnergyType );
    this.visibleProperty = visibleProperty;

    // @public (read-only) {number} - an ID that will be used to track this energy chunk
    this.id = instanceCount++;

    // @public {Vector2}
    this.velocity = new Vector2( initialVelocity.x, initialVelocity.y );
  }

  energyFormsAndChanges.register( 'EnergyChunk', EnergyChunk );

  return inherit( Object, EnergyChunk, {

    /**
     * set the position, uses pooled vectors so the user should be careful to use this consistently
     * @param {number} x
     * @param {number} y
     * @public
     */
    setPosition: function( x, y ) {
      this.positionProperty.set( new Vector2( x, y ) );
    },

    /**
     * translate the energy chunk by amount specified
     * @param {number} x
     * @param {number} y
     * @public
     */
    translate: function( x, y ) {
      var oldPosition = this.positionProperty.get();
      this.positionProperty.set( new Vector2( oldPosition.x + x, oldPosition.y + y ) );
    },

    /**
     * translate the energy chunk based on its velocity
     * @param {number} dt - delta time
     */
    translateBasedOnVelocity: function( dt ) {
      this.translate( this.velocity.x * dt, this.velocity.y * dt );
    },

    /**
     * Function that returns the velocity of the energy chunk
     * @returns {Vector2}
     * @public
     */
    getVelocity: function() {
      return this.velocity.copy();
    },

    /**
     * set the X and Y velocity of the energy chunk
     * @param {number} x
     * @param {number} y
     * @public
     */
    setVelocityXY: function( x, y ) {
      this.velocity.setXY( x, y );
    },

    /**
     * set the velocity of the energy chunk (using a vector)
     * @param {Vector2} newVelocity
     * @public
     */
    setVelocity: function( newVelocity ) {
      this.velocity.set( newVelocity );
    },

    /**
     * @public
     */
    reset: function() {
      this.positionProperty.reset();
      this.zPositionProperty.reset();
      this.energyTypeProperty.reset();
      this.visibleProperty.reset();
    }

  } );
} );

