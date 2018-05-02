// Copyright 2016-2018, University of Colorado Boulder

/**
 * Base class for Nodes that represent energy system elements in the view
 * that use images as part of their representation.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {EnergySystemElement} element
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function ImageBasedEnergySystemNode( element, modelViewTransform ) {
    EFACBaseNode.call( this, element, modelViewTransform );
    this.modelViewTransform = modelViewTransform;
  }

  return inherit( EFACBaseNode, ImageBasedEnergySystemNode, {

    /**
     * [addImageNode description]
     *
     * @param {EFACModelImage} modelElementImage
     */
    addImageNode: function( modelElementImage ) {
      var imageNode = new Image( modelElementImage.image );
      var widthInView = this.modelViewTransform( modelElementImage.width );
      imageNode.setScale( widthInView / imageNode.getBounds().getWidth() );
      var offset = this.ModelViewTransform.modelToViewDelta( modelElementImage.centerToCenterOffset );
      imageNode.setCenterX( offset.x );
      imageNode.setCenterY( offset.y );
      return imageNode;
    }

  } );
} );
