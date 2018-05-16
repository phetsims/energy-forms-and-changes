// Copyright 2016-2018, University of Colorado Boulder

/**
 * base type for a Scenery Node that moves as the associated model element moves and and fades in and out as the opacity
 * property changes
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
  function MoveFadeModelElementNode( modelElement, modelViewTransform ) {
    Node.call( this );

    var self = this;

    // update our position as the model element moves
    modelElement.positionProperty.link( function( offset ) {
      self.setTranslation( modelViewTransform.modelToViewPosition( offset ) );
    } );

    // TODO: The model shouldn't have opacity, it should have something like a selection proportion.
    // update our opacity as the model element fades in and out
    modelElement.opacityProperty.link( function( opacity ) {
      self.setOpacity( opacity );
      if ( opacity === 0 && self.visible ) {
        self.visible = false;
      }
      else if ( opacity > 0 && !self.visible ) {
        self.visible = true;
      }
    } );
  }

  energyFormsAndChanges.register( 'MoveFadeModelElementNode', MoveFadeModelElementNode );

  return inherit( Node, MoveFadeModelElementNode );
} );
