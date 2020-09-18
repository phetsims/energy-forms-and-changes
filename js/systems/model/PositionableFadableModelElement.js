// Copyright 2016-2020, University of Colorado Boulder

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
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import PositionableModelElement from './PositionableModelElement.js';

class PositionableFadableModelElement extends PositionableModelElement {

  /**
   * @param {Vector2} initialPosition
   * @param {number} initialOpacity
   * @param {Object} [options]
   */
  constructor( initialPosition, initialOpacity, options ) {
    super( initialPosition, options );

    // @public {NumberProperty}
    this.opacityProperty = new NumberProperty( initialOpacity, {
      range: new Range( 0, 1 )
    } );

    // @public {BooleanProperty}
    this.visibleProperty = new BooleanProperty( initialOpacity > 0 );
  }
}

energyFormsAndChanges.register( 'PositionableFadableModelElement', PositionableFadableModelElement );
export default PositionableFadableModelElement;