// Copyright 2016-2021, University of Colorado Boulder

/**
 * base type for a Scenery Node that moves as the associated model element moves and and fades in and out as the opacity
 * Property changes
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import { Node } from '../../../../scenery/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class MoveFadeModelElementNode extends Node {

  /**
   * @param {PositionableFadableModelElement} modelElement
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( modelElement, modelViewTransform, tandem ) {
    super( {
      tandem: tandem,
      phetioInputEnabledPropertyInstrumented: true,
      inputEnabledPropertyOptions: {
        phetioFeatured: false // see exceptions in the overrides
      },
      visiblePropertyOptions: {
        phetioReadOnly: true
      }
    } );

    // update our position as the model element moves
    modelElement.positionProperty.link( offset => {
      this.setTranslation( modelViewTransform.modelToViewPosition( offset ) );
    } );

    // update our opacity as the model element fades in and out
    modelElement.opacityProperty.link( opacity => {
      this.opacity = opacity;
    } );

    // update the visibility as the model element's visibility changes
    modelElement.visibleProperty.link( visible => {
      this.visible = visible;
    } );
  }
}

energyFormsAndChanges.register( 'MoveFadeModelElementNode', MoveFadeModelElementNode );
export default MoveFadeModelElementNode;