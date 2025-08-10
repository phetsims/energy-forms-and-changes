// Copyright 2016-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * a Scenery Node representing a belt that connects two circular items, like a fan belt in an automobile
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Belt from '../model/Belt.js';

class BeltNode extends Path {

  public constructor( belt: Belt, modelViewTransform: ModelViewTransform2, options?: IntentionalAny ) {

    options = merge( {
      stroke: 'black',
      lineWidth: 4,

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    super( modelViewTransform.modelToViewShape( belt.beltShape ), options );

    // control visibility of the belt
    belt.isVisibleProperty.link( isVisible => {
      this.setVisible( isVisible );
    } );
  }
}

energyFormsAndChanges.register( 'BeltNode', BeltNode );
export default BeltNode;