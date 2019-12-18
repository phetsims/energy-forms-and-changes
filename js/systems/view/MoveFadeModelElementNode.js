// Copyright 2016-2019, University of Colorado Boulder

/**
 * base type for a Scenery Node that moves as the associated model element moves and and fades in and out as the opacity
 * Property changes
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
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Tandem} tandem
     */
    constructor( modelElement, modelViewTransform, tandem ) {
      super( {
        tandem: tandem,
        phetioComponentOptions: { opacityProperty: { phetioReadOnly: true } }
      } );

      // update our position as the model element moves
      modelElement.positionProperty.link( offset => {
        this.setTranslation( modelViewTransform.modelToViewPosition( offset ) );
      } );

      // update our opacity as the model element fades in and out
      modelElement.opacityProperty.link( opacity => {
        this.setOpacity( opacity );
      } );
    }
  }

  return energyFormsAndChanges.register( 'MoveFadeModelElementNode', MoveFadeModelElementNode );
} );
