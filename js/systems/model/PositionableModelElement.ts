// Copyright 2016-2024, University of Colorado Boulder

/**
 * a model element that has a position which can be changed
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

export type PositionableModelElementOptions = PhetioObjectOptions;

class PositionableModelElement extends PhetioObject {

  public readonly positionProperty: Vector2Property;

  public constructor( initialPosition: Vector2, providedOptions?: PositionableModelElementOptions ) {

    const options = optionize<PositionableModelElementOptions, EmptySelfOptions, PhetioObjectOptions>()( {
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( options );

    this.positionProperty = new Vector2Property( initialPosition, {
      valueComparisonStrategy: 'equalsFunction',
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