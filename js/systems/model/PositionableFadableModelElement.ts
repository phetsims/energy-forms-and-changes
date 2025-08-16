// Copyright 2016-2025, University of Colorado Boulder

/**
 * base type for model elements that can be positioned and faded
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import PositionableModelElement, { PositionableModelElementOptions } from './PositionableModelElement.js';

export type PositionableFadableModelElementOptions = PositionableModelElementOptions;

class PositionableFadableModelElement extends PositionableModelElement {

  public readonly opacityProperty: NumberProperty;
  public readonly visibleProperty: BooleanProperty;

  public constructor( initialPosition: Vector2, initialOpacity: number, options?: PositionableFadableModelElementOptions ) {
    super( initialPosition, options );

    this.opacityProperty = new NumberProperty( initialOpacity, {
      range: new Range( 0, 1 )
    } );
    this.visibleProperty = new BooleanProperty( initialOpacity > 0 );
  }
}

energyFormsAndChanges.register( 'PositionableFadableModelElement', PositionableFadableModelElement );
export default PositionableFadableModelElement;