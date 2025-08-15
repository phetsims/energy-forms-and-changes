// Copyright 2014-2023, University of Colorado Boulder

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
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import ModelElement from './ModelElement.js';

class HorizontalSurface extends PhetioObject {

  public readonly positionProperty: Vector2Property;

  // The model element that is currently on the surface of this one, null if nothing there, use the API below to update
  public readonly elementOnSurfaceProperty: Property<ModelElement | null>;
  public readonly width: number;

  // The range of space in the horizontal direction occupied by this surface
  public readonly xRange: Range;

  // This should be accessed through getter/setter methods
  public readonly owner: ModelElement;

  /**
   * @param initialPosition
   * @param width
   * @param owner
   * @param tandem
   * @param initialElementOnSurface - model element that is already on this surface
   */
  public constructor( initialPosition: Vector2, width: number, owner: ModelElement, tandem: Tandem, initialElementOnSurface?: ModelElement ) {
    super( {
      tandem: tandem,
      phetioState: false
    } );

    this.positionProperty = new Vector2Property( initialPosition, {
      valueComparisonStrategy: 'equalsFunction',
      tandem: tandem.createTandem( 'positionProperty' )
    } );
    this.elementOnSurfaceProperty = new Property( initialElementOnSurface ? initialElementOnSurface : null, {
      valueType: [ ModelElement, null ],
      tandem: tandem.createTandem( 'elementOnSurfaceProperty' ),
      phetioValueType: NullableIO( ReferenceIO( IOType.ObjectIO ) )
    } );

    // monitor the element on the surface for legitimate settings
    assert && this.elementOnSurfaceProperty.link( ( elementOnSurface, previousElementOnSurface ) => {
      affirm( elementOnSurface === null || elementOnSurface instanceof ModelElement );
      // @ts-expect-error
      affirm( elementOnSurface !== this, 'can\'t sit on top of ourself' );
    } );

    this.width = width;
    this.xRange = new Range( initialPosition.x - this.width / 2, initialPosition.x + this.width / 2 );
    this.positionProperty.link( position => {
      this.xRange.setMinMax( position.x - this.width / 2, position.x + this.width / 2 );
    } );
    this.owner = owner;
  }
}

energyFormsAndChanges.register( 'HorizontalSurface', HorizontalSurface );
export default HorizontalSurface;