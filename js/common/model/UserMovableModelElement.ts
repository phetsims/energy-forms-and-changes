// Copyright 2014-2023, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * base class for model elements that can be moved around by the user
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NullableIO from '../../../../tandem/js/types/NullableIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import HorizontalSurface from './HorizontalSurface.js';
import ModelElement from './ModelElement.js';

class UserMovableModelElement extends ModelElement {

  public constructor( initialPosition: Vector2, options?: IntentionalAny ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: UserMovableModelElement.UserMovableModelElementIO,
      phetioState: true,
      userControllable: true
    }, options );

    super( initialPosition, options );

    // @protected {HorizontalSurface|null} - The surface upon which this model element is resting.  This is null if the
    // element is not resting on a movable surface.  This should only be set through the getter/setter methods below.
    this.supportingSurface = null;

    // @public {NumberProperty} - in meters/second
    this.verticalVelocityProperty = new NumberProperty( 0, {
      range: new Range( -4, 0 ), // empirically determined
      tandem: options.tandem.createTandem( 'verticalVelocityProperty' )
    } );

    // @public (read-only) - for phet-io: assign tandem in the model so the corresponding names can be leveraged in
    // the view
    this.tandem = options.tandem;

    // create userControlledProperty unless opted out
    if ( options.userControllable ) {

      // @public {BooleanProperty}
      this.userControlledProperty = new BooleanProperty( false, {
        tandem: options.tandem.createTandem( 'userControlledProperty' ),
        phetioReadOnly: true,
        phetioDocumentation: 'whether the element is being directly held or moved by a user'
      } );

      // update internal state when the user picks up this model element
      this.userControlledProperty.link( userControlled => {
        if ( userControlled ) {

          // the user has picked up this model element, so it is no longer sitting on any surface
          this.clearSupportingSurface();
        }
      } );
    }

    // @private - observer that moves this model element if and when the surface that is supporting it moves
    this.surfaceMotionObserver = position => {
      this.positionProperty.value = position;
    };
  }

  /**
   * restore initial state
   */
  public reset(): void {
    this.clearSupportingSurface();
    this.userControlledProperty && this.userControlledProperty.reset();
    this.verticalVelocityProperty.reset();
    super.reset();
  }

  /**
   * Set the supporting surface of this model element
   */
  public override setSupportingSurface( supportingSurface: HorizontalSurface ): void {

    // state and parameter checking
    assert && assert(
      supportingSurface !== null,
      'this method should not be used to clear the supporting surface'
    );
    assert && assert(
      this.supportingSurface === null,
      'a supporting surface was already set'
    );

    // TODO: likely this check should not be graceful and should actually be right, https://github.com/phetsims/energy-forms-and-changes/issues/424
    if ( !supportingSurface.positionProperty.hasListener( this.surfaceMotionObserver ) ) {
      supportingSurface.positionProperty.link( this.surfaceMotionObserver );
    }
    this.supportingSurface = supportingSurface;
  }

  /**
   * clear the supporting surface so that this model element is no longer sitting on a surface
   */
  private clearSupportingSurface(): void {

    // only do something if the supporting surface was set
    if ( this.supportingSurface !== null ) {

      // TODO: likely this check should not be graceful and should actually be right, https://github.com/phetsims/energy-forms-and-changes/issues/424
      if ( this.supportingSurface.positionProperty.hasListener( this.surfaceMotionObserver ) ) {
        this.supportingSurface.positionProperty.unlink( this.surfaceMotionObserver );
      }
      this.supportingSurface.elementOnSurfaceProperty.set( null );
      this.supportingSurface = null;
    }
  }

  /**
   * get a value that indicates whether this element is stacked upon the given model element
   * @param element - model element to be checked
   * @returns true if this model element is stacked anywhere on top of the provided element, which
   * includes cases where one or more elements are in between.
   */
  public override isStackedUpon( element: ModelElement ): boolean {
    const surface = this.supportingSurface ? this.supportingSurface : null;
    return ( surface !== null ) && ( surface.owner === element || surface.owner.isStackedUpon( element ) );
  }
}

UserMovableModelElement.UserMovableModelElementIO = new IOType( 'UserMovableModelElementIO', {
  valueType: UserMovableModelElement,
  stateSchema: {
    supportingSurface: NullableIO( ReferenceIO( IOType.ObjectIO ) )
  },
  applyState: ( userMovableModelElement, stateObject ) => {
    const supportingSurface = NullableIO( ReferenceIO( IOType.ObjectIO ) ).fromStateObject(
      stateObject.supportingSurface
    );
    if ( supportingSurface ) {

      if ( userMovableModelElement.supportingSurface ) {
        userMovableModelElement.clearSupportingSurface();
      }

      userMovableModelElement.setSupportingSurface( supportingSurface );
    }
    else {
      userMovableModelElement.clearSupportingSurface();
    }
  }
} );

energyFormsAndChanges.register( 'UserMovableModelElement', UserMovableModelElement );
export default UserMovableModelElement;