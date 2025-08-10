// Copyright 2014-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

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
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ModelElement from './ModelElement.js';

class HorizontalSurface extends PhetioObject {

  /**
   * @param initialElementOnSurface - model element that is already on this surface
   */
  public constructor( initialPosition: Vector2, width: number, owner: ModelElement, tandem: Tandem, initialElementOnSurface?: ModelElement ) {
    super( {
      tandem: tandem,
      phetioState: false
    } );

    // @public (read-write)
    this.positionProperty = new Vector2Property( initialPosition, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'positionProperty' )
    } );

    // @public (read-only) {Property.<ModelElement>|null} - the model element that is currently on the surface of this
    // one, null if nothing there, use the API below to update
    this.elementOnSurfaceProperty = new Property( initialElementOnSurface ? initialElementOnSurface : null, {
      valueType: [ ModelElement, null ],
      tandem: tandem.createTandem( 'elementOnSurfaceProperty' ),
      phetioValueType: NullableIO( ReferenceIO( IOType.ObjectIO ) )
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