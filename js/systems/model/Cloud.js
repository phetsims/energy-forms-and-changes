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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var Shape = require( 'KITE/Shape' );

  // constants
  var WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
  var HEIGHT = WIDTH * 0.55; // determined from the approximate aspect ratio of the image

  /**
   * @param {Vector2} offsetFromParent
   * @param {Property.<Vector2>} parentPositionProperty
   * @constructor
   */
  function Cloud( offsetFromParent, parentPositionProperty ) {
    var self = this;

    // @public {NumberProperty} - existence strength, which basically translates to opacity, of the cloud
    this.existenceStrengthProperty = new NumberProperty( 1.0 );

    // @public (read-only) {number} - offset position for this cloud
    this.offsetFromParent = offsetFromParent;

    // @private {number} - used to calculate this cloud's position
    this.parentPositionProperty = parentPositionProperty;

    this.cloudEllipse = null;

    this.parentPositionProperty.link( function( parentPosition ) {
      var center = parentPosition.plus( self.offsetFromParent );
      self.cloudEllipse = Shape.ellipse( center.x, center.y, WIDTH / 2, HEIGHT / 2, 0, 0, 0, false );
    } );
  }

  energyFormsAndChanges.register( 'Cloud', Cloud );

  return inherit( Object, Cloud, {

    /**
     * return ellipse with size of this cloud
     * @returns {Shape.ellipse} - ellipse with axes sized to width and height of cloud
     * @public
     */
    getCloudAbsorptionReflectionShape: function() {
      return this.cloudEllipse;
    },

    /**
     * @returns {Vector2} Center position of cloud
     * @public
     */
    getCenterPosition: function() {
      return this.parentPositionProperty.get().plus( this.offsetFromParent );
    }

  }, {

    // statics
    WIDTH: WIDTH,
    HEIGHT: HEIGHT
  } );
} );

