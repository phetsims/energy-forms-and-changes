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
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  var CLOUD_WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
  var CLOUD_HEIGHT = CLOUD_WIDTH; // TODO: Java code uses ModelElementImage. Equivalent in JS?

  // Cloud image
  var CLOUD_1 = require( 'image!ENERGY_FORMS_AND_CHANGES/cloud_1.png' );

  var CLOUD_IMAGE = new EFACModelImage( CLOUD_1, new Vector2( 0, 0 ), {
    width: CLOUD_WIDTH,
    scale: 0.5
  } );

  /**
   * @param {Vector2} offsetFromParent
   * @param {Vector2} parentPosition
   * @constructor
   */
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

  }, {
    CLOUD_IMAGE: CLOUD_IMAGE
  } );
} );

