// Copyright 2016-2018, University of Colorado Boulder

/**
 * model of a cloud that can block energy coming from the sun
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
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var CLOUD_WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
  var CLOUD_HEIGHT = CLOUD_WIDTH;

  // images
  // TODO: I (jbphet) have seen this in some other places, and I should investigate: Why are images here and not in the view?
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

    // @public {NumberProperty} - existence strength, which basically translates to opacity, of the cloud
    this.existenceStrengthProperty = new NumberProperty( 1.0 );

    // @public (read-only) {number} - offset position for this cloud
    this.offsetFromParent = offsetFromParent;

    // @private {number} - used to calculate this cloud's position
    this.parentPositionProperty = parentPositionProperty;
  }

  energyFormsAndChanges.register( 'Cloud', Cloud );

  return inherit( Object, Cloud, {

    /**
     * return ellipse with size of this cloud
     * @returns {Shape.ellipse} - ellipse with axes sized to width and height of cloud
     * @public
     */
    getCloudAbsorptionReflectionShape: function() {
      var center = this.getCenterPosition().minusXY( CLOUD_WIDTH / 2, CLOUD_HEIGHT / 2 );
      return Shape.ellipse( center.x, center.y, CLOUD_WIDTH/2, CLOUD_HEIGHT/2, 0, 0, 0, false );
    },

    /**
     * @returns {Vector2} Center position of cloud
     * @public
     */
    getCenterPosition: function() {
      return this.parentPositionProperty.get().plus( this.offsetFromParent );
    },

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      this.existenceStrengthProperty.reset();
    }

  }, {

    // statics
    CLOUD_1: CLOUD_1,
    CLOUD_IMAGE: CLOUD_IMAGE
  } );
} );

