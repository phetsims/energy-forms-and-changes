// Copyright 2016-2020, University of Colorado Boulder

/**
 * a model element that has a position which can be changed
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import Vector2Property from '../../../../dot/js/Vector2Property.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class PositionableModelElement {

  /**
   * @param {Vector2} initialPosition
   * @param {Tandem} tandem
   */
  constructor( initialPosition, tandem ) {

    // @public {Vector2Property}
    this.positionProperty = new Vector2Property( initialPosition, {
      units: 'm',
      tandem: tandem.createTandem( 'positionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the position of the system element'
    } );
  }
}

energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );
export default PositionableModelElement;
