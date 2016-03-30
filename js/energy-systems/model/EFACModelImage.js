// Copyright 2016, University of Colorado Boulder

/**
 * NOTE (AA): ModelElementImage is an EFAC Java class, but I have my doubts about
 * whether it really belongs here. It appears to be completely general.
 * TODO: Check with other devs about this. For now, rename to EFACModelImage and
 * tentatively make use of it.
 *
 * Class that provides information about an image that is used in the view
 * representation of a model element.
 *
 * @author John Blanco
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var inherit = require( 'PHET_CORE/inherit' );
  // var Image = require( 'SCENERY/nodes/Image' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  // var Vector2 = require( 'DOT/Vector2' );

  // Constants
  // This is not used, but could be used to scale image.getImageWidth() to set
  // this.width.
  var DEFAULT_SCALE_FACTOR = 1 / EFACConstants.ENERGY_SYSTEMS_MVT_SCALE_FACTOR;

  /**
   * @param {Image}   image
   * @param {Vector2} centerToCenterOffset
   * @param {object} options
   * @constructor
   */
  function EFACModelImage( image, centerToCenterOffset, options ) {

    options = _.extend( {
      width: image.width * DEFAULT_SCALE_FACTOR
    }, options );

    this.image = image;

    // Width of the image in model units (meters).
    // Height is derived from aspect ratio of image.
    this.width = options.width;

    // Offset in model units (meters) from the center of the position of the
    // model element that owns this image to the center of the image.
    this.centerToCenterOffset = centerToCenterOffset;
  }

  return inherit( Object, EFACModelImage, {
    getHeight: function() {
      return ( this.width / this.image.getImageWidth() * this.image.getImageHeight() );
    }
  } );
} );
