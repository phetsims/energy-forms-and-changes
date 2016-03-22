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
    var scale = modelViewTransform.modelToViewDeltaX( modelImage.width ) / this.width;
    var offset = modelViewTransform.modelToViewDelta( modelImage.centerToCenterOffset );

    if ( scale !== 1 ) {
      this.setScaleMagnitude( scale );
    }

    this.setCenterX( offset.x );
    this.setCenterY( offset.y );

    this.addChild( img );
  }

  return inherit( Node, EFACModelImageNode );
} );