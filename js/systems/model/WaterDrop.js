// Copyright 2016-2018, University of Colorado Boulder

/**
 * a model of a drop of water, generally used to create a stream of water coming from, say, a faucet
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // the following constant is used to adjust the way in which the drop elongates as its velocity increases
  var WIDTH_CHANGE_TWEAK_FACTOR = 0.05;

  /**
   * @param {Vector2} initialPosition - (x,y) position in model space
   * @param {Vector2} initialVelocity - 2D velocity at initialization
   * @param {Dimension2} size - droplet dimensions
   */
  function WaterDrop( initialPosition, initialVelocity, size ) {

    var self = this;

    // @public {Vector2} - after being transformed to view coordinates, this position is the distance from the faucet head
    this.position = initialPosition;

    // @public {Property.<Vector2>}
    this.velocityProperty = new Property( initialVelocity );

    // @public (read-only) {Dimension2}
    this.size = size;

    // adjust the size as the velocity changes, mimicking how water drops thin out as they fall through air
    this.velocityProperty.link( function( velocity ) {
      var newWidth = ( 1 / ( 1 + velocity.magnitude() * WIDTH_CHANGE_TWEAK_FACTOR ) ) * self.size.width;
      var newHeight = ( self.size.height * self.size.width ) / newWidth;
      self.size.set( new Dimension2( newWidth, newHeight ) );
    } );
  }

  energyFormsAndChanges.register( 'WaterDrop', WaterDrop );

  return inherit( Object, WaterDrop );
} );
