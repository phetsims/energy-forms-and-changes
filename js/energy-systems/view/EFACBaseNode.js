// Copyright 2014-2015, University of Colorado Boulder

/**
 * Base module for model elements whose position and opacity can change.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {PositionableFadableModelElement} modelElement
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function EFACBaseNode( modelElement, modelViewTransform ) {
    Node.call( this );

    var self = this;

    /**
     * Update the overall offset based on the model position.
     *
     * @param  {Vector2} offset
     */
    modelElement.positionProperty.link( function( offset ) {
      self.setTranslation( modelViewTransform.modelToViewPosition( offset ) );
    } );

    /**
     * Update the overall opacity base on model element opacity.
     *
     * @param  {number} opacity
     */
    modelElement.opacityProperty.link( function( opacity ) {
      self.setOpacity( opacity );
    } );
  }

  energyFormsAndChanges.register( 'EFACBaseNode', EFACBaseNode );

  return inherit( Node, EFACBaseNode );
} );
