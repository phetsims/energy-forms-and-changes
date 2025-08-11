// Copyright 2016-2025, University of Colorado Boulder

/**
 * a Scenery Node representing a belt that connects two circular items, like a fan belt in an automobile
 *
 * @author John Blanco
 */

import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import Path, { PathOptions } from '../../../../scenery/js/nodes/Path.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Belt from '../model/Belt.js';

type SelfOptions = EmptySelfOptions;
export type BeltNodeOptions = SelfOptions & PathOptions;

class BeltNode extends Path {

  public constructor( belt: Belt, modelViewTransform: ModelViewTransform2, providedOptions?: BeltNodeOptions ) {

    const options = optionize<BeltNodeOptions, SelfOptions, PathOptions>()( {
      stroke: 'black',
      lineWidth: 4,

      // phet-io
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( modelViewTransform.modelToViewShape( belt.beltShape ), options );

    // control visibility of the belt
    belt.isVisibleProperty.link( isVisible => {
      this.setVisible( isVisible );
    } );
  }
}

energyFormsAndChanges.register( 'BeltNode', BeltNode );
export default BeltNode;