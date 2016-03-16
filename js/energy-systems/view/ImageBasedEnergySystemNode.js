// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base class for Nodes that represent energy system elements in the view
 * that use images as part of their representation.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );

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
     * @param {EFACModelImage} modelElementImage [description]
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
