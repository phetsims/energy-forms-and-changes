// Copyright 2016, University of Colorado Boulder

/**
 * Class that provides information about an image that is used in the view
 * representation of a model element.
 *
 * @author John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var inherit = require( 'PHET_CORE/inherit' );

  // Constants
  // This is not used, but could be used to scale image.getImageWidth() to set
  // this.width.
  var DEFAULT_SCALE_FACTOR = 1 / EFACConstants.ENERGY_SYSTEMS_MVT_SCALE_FACTOR;

  /**
   * @param {Image}   image
   * @param {Vector2} centerToCenterOffset
   * @param {Object} options
   * @constructor
   */
  function EFACModelImage( image, centerToCenterOffset, options ) {

    options = _.extend( {
      width: image.width * DEFAULT_SCALE_FACTOR,
      scale: 1.0
    }, options );

    this.image = image;

    // Width of the image in model units (meters).
    // Height is derived from aspect ratio of image.
    this.width = options.width;

    this.scale = options.scale;

    // Offset in model units (meters) from the center of the position of the
    // model element that owns this image to the center of the image.
    this.centerToCenterOffset = centerToCenterOffset;
  }

  energyFormsAndChanges.register( 'EFACModelImage', EFACModelImage );

  return inherit( Object, EFACModelImage, {
    getHeight: function() {
      return ( this.width / this.image.width * this.image.height );
    }
  } );
} );
