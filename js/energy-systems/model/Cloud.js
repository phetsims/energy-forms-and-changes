// Copyright 2016, University of Colorado Boulder

/**
 * Module representing a cloud to block energy from the sun.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Shape = require( 'KITE/Shape' );

  // Constants
  var CLOUD_WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
  var CLOUD_HEIGHT = CLOUD_WIDTH; // TODO: Java code uses ModelElementImage. Equivalent in JS?

  function Cloud( offsetFromParent, parentPosition ) {
    PropertySet.call( this, {
      existenceStrength: 1.0
    } );

    this.offsetFromParent = offsetFromParent;
    this.parentPosition = parentPosition;
  }

  return inherit( PropertySet, Cloud, {

    /**
     * Return ellipse with size of Cloud
     *
     * @return {Shape.ellipse} Ellipse with axes sized to width and height of cloud
     */
    getCloudAbsorptionReflectionShape: function() {
      var x = this.parentPosition.x + this.offsetFromParent.x - CLOUD_WIDTH / 2;
      var y = this.parentPosition.y + this.offsetFromParent.y - CLOUD_HEIGHT / 2;
      return Shape.ellipse( x, y, CLOUD_WIDTH, CLOUD_HEIGHT, 0, 0, 0, false );
    },

    /**
     * Return (x,y) position of center of cloud
     *
     * @return {Vector2} Center position of cloud
     */
    getCenterPosition: function() {
      return this.parentPosition.plus( this.offsetFromParent );
    }

  } );
} );
