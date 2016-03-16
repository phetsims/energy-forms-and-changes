// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base module for model elements whose position and opacity can change.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {PositionableFadableModelElement} modelElement
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function EFACBaseNode( modelElement, modelViewTransform ) {
    Node.call( this );

    var thisNode = this;

    /**
     * Update the overall offset based on the model position.
     *
     * @param  {Vector2} offset
     */
    modelElement.positionProperty.link( function( offset ) {
      thisNode.setTranslation( modelViewTransform.modelToViewPosition( offset ) );
    } );

    /**
     * Update the overall opacity base on model element opacity.
     *
     * @param  {Number} opacity
     */
    modelElement.opacityProperty.link( function( opacity ) {
      thisNode.setOpacity( opacity );
    } );
  }

  return inherit( Node, EFACBaseNode );
} );
