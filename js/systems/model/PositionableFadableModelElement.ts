// Copyright 2016-2020, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * base type for model elements that can be positioned and faded
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import PositionableModelElement from './PositionableModelElement.js';

class PositionableFadableModelElement extends PositionableModelElement {

  public readonly opacityProperty: NumberProperty;
  public readonly visibleProperty: BooleanProperty;

  public constructor( initialPosition: Vector2, initialOpacity: number, options?: IntentionalAny ) {
    super( initialPosition, options );

    this.opacityProperty = new NumberProperty( initialOpacity, {
      range: new Range( 0, 1 )
    } );
    this.visibleProperty = new BooleanProperty( initialOpacity > 0 );
  }
}

energyFormsAndChanges.register( 'PositionableFadableModelElement', PositionableFadableModelElement );
export default PositionableFadableModelElement;