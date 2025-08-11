// Copyright 2016-2025, University of Colorado Boulder

/**
 * base type for a Scenery Node that moves as the associated model element moves and fades in and out as the opacity
 * Property changes
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import PositionableFadableModelElement from '../model/PositionableFadableModelElement.js';

class MoveFadeModelElementNode extends Node {

  public constructor( modelElement: PositionableFadableModelElement, modelViewTransform: ModelViewTransform2, tandem: Tandem ) {
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