// Copyright 2016-2019, University of Colorado Boulder

/**
 * base type for a Scenery Node that moves as the associated model element moves and and fades in and out as the opacity
 * property changes
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Node = require( 'SCENERY/nodes/Node' );

  class MoveFadeModelElementNode extends Node {

    /**
     * @param {PositionableFadableModelElement} modelElement
     * @param {ModelViewTransform} modelViewTransform
     */
    constructor( modelElement, modelViewTransform ) {
      super();

      // update our position as the model element moves
      modelElement.positionProperty.link( offset => {
        this.setTranslation( modelViewTransform.modelToViewPosition( offset ) );
      } );

      // TODO: The model shouldn't have opacity, it should have something like a selection proportion.
      // update our opacity as the model element fades in and out
      modelElement.opacityProperty.link( opacity => {
        this.setOpacity( opacity );
        if ( opacity === 0 && this.visible ) {
          this.visible = false;
        }
        else if ( opacity > 0 && !this.visible ) {
          this.visible = true;
        }
      } );
    }
  }

  return energyFormsAndChanges.register( 'MoveFadeModelElementNode', MoveFadeModelElementNode );
} );
