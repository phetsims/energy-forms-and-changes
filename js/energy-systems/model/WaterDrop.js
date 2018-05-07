// Copyright 2016, University of Colorado Boulder

/**
 * A drop of water, generally used to create a stream of water.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // The following constant is used to adjust the way in which the drop
  // elongates as its velocity increases.
  var WIDTH_CHANGE_TWEAK_FACTOR = 2;

  /**
   * @param {Vector2} initialOffsetFromParent (x,y) offset in model space
   * @param {Vector2} initialVelocity         2-D velocity at initialization
   * @param {Dimension2} size                 Droplet dimensions
   */
  function WaterDrop( initialOffsetFromParent, initialVelocity, size ) {

    this.offsetFromParentProperty = new Property( initialOffsetFromParent );
    this.velocityProperty = new Property( initialVelocity );
    this.sizeProperty = new Property( size );

    var self = this;

    this.velocityProperty.link( function( velocity ) {
      var size = self.sizeProperty.value;
      var newWidth = ( 1 / ( 1 + velocity.magnitude() * WIDTH_CHANGE_TWEAK_FACTOR ) ) * size.width;
      var newHeight = ( size.height * size.width ) / newWidth;
      self.sizeProperty.set( new Dimension2( newWidth, newHeight ) );
    } );
  }

  energyFormsAndChanges.register( 'WaterDrop', WaterDrop );

  return inherit( Object, WaterDrop, {

    reset: function() {
      this.offsetFromParentProperty.reset();
      this.velocityProperty.reset();
      this.sizeProperty.reset();
    }

  } );
} );
