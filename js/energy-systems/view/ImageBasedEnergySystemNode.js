// Copyright 2016-2018, University of Colorado Boulder

// TODO: This doesn't seem to do much, so I (jbphet) am unsure why it is needed.  If this is still the case when the
// development is further along, it should be removed.  May 16 2018

/**
 * base type for Scenery Nodes that represent energy system elements in the view that use images as part of their
 * depiction
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {EnergySystemElement} element
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function ImageBasedEnergySystemNode( element, modelViewTransform ) {
    MoveFadeModelElementNode.call( this, element, modelViewTransform );
    this.modelViewTransform = modelViewTransform;
  }

  return inherit( MoveFadeModelElementNode, ImageBasedEnergySystemNode, {

    /**
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
