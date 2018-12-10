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
    this.velocity = initialVelocity;
  }

  energyFormsAndChanges.register( 'EnergyChunk', EnergyChunk );

  return inherit( Object, EnergyChunk, {

    /**
     * translate the energy chunk by amount specified
     * @param {number} x
     * @param {number} y
     * @public
     */
    translate: function( x, y ) {

      // for optimal sim performance we use vector pooling, since there are lots of energy chunks and they move frequently
      var oldPosition = this.positionProperty.get();
      this.positionProperty.set( Vector2.createFromPool( oldPosition.x + x, oldPosition.y + y ) );
      oldPosition.freeToPool();
    },

    /**
     * translate the energy chunk based on its velocity
     * @param {number} dt - delta time
     */
    translateBasedOnVelocity: function( dt ) {
      this.translate( this.velocity.times( dt ) );
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

