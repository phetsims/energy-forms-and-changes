// Copyright 2016, University of Colorado Boulder

/**
 * Class that represents an image-based model element, or a piece thereof, in
 * the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {EFACModelImage} modelImage     [description]
   * @param {ModelViewTransform} modelViewTransform [description]
   * @constructor
   */
  function EFACModelImageNode( modelImage, modelViewTransform ) {

    Node.call( this );

    var img = new Image( modelImage.image );
    var offset = modelViewTransform.modelToViewDelta( modelImage.centerToCenterOffset );

    // TODO: This scales node up x2200, but x1 looks about right.
    // var scale = modelViewTransform.modelToViewDeltaX( modelImage.width ) / modelImage.image.width;
    // if ( scale !== 1 ) {
    //   img.setScaleMagnitude( scale );
    // }

    img.setCenterX( offset.x );
    img.setCenterY( offset.y );
    this.addChild( img );
  }

  return inherit( Node, EFACModelImageNode );
} );