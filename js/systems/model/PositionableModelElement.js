// Copyright 2016-2020, University of Colorado Boulder

/**
 * a model element that has a position which can be changed
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class PositionableModelElement extends PhetioObject {

  /**
   * @param {Vector2} initialPosition
   * @param {Object} [options]
   */
  constructor( initialPosition, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // @public {Vector2Property}
    this.positionProperty = new Vector2Property( initialPosition, {
      units: 'm',
      tandem: options.tandem.createTandem( 'positionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the position of the system element'
    } );
  }
}

energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );
export default PositionableModelElement;
