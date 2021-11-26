// Copyright 2016-2021, University of Colorado Boulder

/**
 * a Scenery Node representing a belt that connects two circular items, like a fan belt in an automobile
 *
 * @author John Blanco
 */

import merge from '../../../../phet-core/js/merge.js';
import { Path } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class BeltNode extends Path {

  /**
   * @param {Belt} belt
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  constructor( belt, modelViewTransform, options ) {

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