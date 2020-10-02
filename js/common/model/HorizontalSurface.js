// Copyright 2014-2020, University of Colorado Boulder

/**
 * A simple, level horizontal surface in a 2D model space.  This is represented by a range of x values and a single y
 * value.  The best way to thing of this is that it is much like a Vector2 in that it represents a small piece of
 * information that is generally immutable and is often wrapped in a Property.
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../../../axon/js/Property.js';
import Range from '../../../../dot/js/Range.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ModelElement from './ModelElement.js';

class HorizontalSurface {

  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {ModelElement} owner
   * @param {ModelElement} [initialElementOnSurface] - model element that is already on this surface
   */
  constructor( initialPosition, width, owner, initialElementOnSurface ) {

    // @public (read-write)
    this.positionProperty = new Vector2Property( initialPosition );

    // @public (read-only) {Property.<ModelElement>|null} - the model element that is currently on the surface of this
    // one, null if nothing there, use the API below to update
    this.elementOnSurfaceProperty = new Property( initialElementOnSurface ? initialElementOnSurface : null, {
      valueType: [ ModelElement, null ]
    } );

    // monitor the element on the surface for legitimate settings
    assert && this.elementOnSurfaceProperty.link( ( elementOnSurface, previousElementOnSurface ) => {
      assert( elementOnSurface === null || elementOnSurface instanceof ModelElement );
      assert( elementOnSurface !== this, 'can\'t sit on top of ourself' );
    } );

    // @public (read-only) {number}
    this.width = width;

    // @public (read-only) {Range} - the range of space in the horizontal direction occupied by this surface
    this.xRange = new Range( initialPosition.x - this.width / 2, initialPosition.x + this.width / 2 );
    this.positionProperty.link( position => {
      this.xRange.setMinMax( position.x - this.width / 2, position.x + this.width / 2 );
    } );

    // @public (read-only) {ModelElement} - this should be accessed through getter/setter methods
    this.owner = owner;
  }
}

energyFormsAndChanges.register( 'HorizontalSurface', HorizontalSurface );
export default HorizontalSurface;