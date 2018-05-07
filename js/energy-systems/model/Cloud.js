// Copyright 2016-2018, University of Colorado Boulder

/**
 * Module representing a cloud to block energy from the sun.
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACModelImage = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EFACModelImage' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var CLOUD_WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
  var CLOUD_HEIGHT = CLOUD_WIDTH;

  // Cloud image
  var CLOUD_1 = require( 'image!ENERGY_FORMS_AND_CHANGES/cloud_1.png' );

  var CLOUD_IMAGE = new EFACModelImage( CLOUD_1, new Vector2( 0, 0 ), {
    width: CLOUD_WIDTH,
    scale: 0.5
  } );

  /**
   * @param {Vector2} offsetFromParent
   * @param {Property.<Vector2>} parentPositionProperty
   * @constructor
   */
  function Cloud( offsetFromParent, parentPositionProperty ) {

    this.existenceStrengthProperty = new Property( 1.0 );

    this.offsetFromParent = offsetFromParent;
    this.parentPositionProperty = parentPositionProperty;
  }

  energyFormsAndChanges.register( 'Cloud', Cloud );

  return inherit( Object, Cloud, {

    /**
     * Return ellipse with size of Cloud
     *
     * @returns {Shape.ellipse} Ellipse with axes sized to width and height of cloud
     */
    getCloudAbsorptionReflectionShape: function() {
      var center = this.getCenterPosition().minusXY( CLOUD_WIDTH / 2, CLOUD_HEIGHT / 2 );
      return Shape.ellipse( center.x, center.y, CLOUD_WIDTH/2, CLOUD_HEIGHT/2, 0, 0, 0, false );
    },

    /**
     * Return (x,y) position of center of cloud
     *
     * @returns {Vector2} Center position of cloud
     */
    getCenterPosition: function() {
      return this.parentPositionProperty.get().plus( this.offsetFromParent );
    },

    reset: function() {
      this.existenceStrengthProperty.reset();
    }

  }, {
    CLOUD_1: CLOUD_1,
    CLOUD_IMAGE: CLOUD_IMAGE
  } );
} );

