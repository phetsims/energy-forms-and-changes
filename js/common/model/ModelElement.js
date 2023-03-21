// Copyright 2014-2023, University of Colorado Boulder

/**
 * Base class for all model elements in the Energy Forms and Changes simulation that can be moved around by the user.
 * At the time of this writing, this includes blocks, beakers, burners, and thermometers.
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class ModelElement extends PhetioObject {

  /**
   * @param {Vector2} initialPosition
   * @param {Object} [options]
   */
  constructor( initialPosition, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioType: ReferenceIO( IOType.ObjectIO ),
      phetioState: false,
      positionPropertyOptions: {
        units: 'm',
        phetioHighFrequency: true,
        phetioDocumentation: 'the center-bottom position of the element'
      }
    }, options );

    super( options );

    // @public
    this.positionProperty = new Vector2Property( initialPosition, merge( {
      hasListenerOrderDependencies: true, // TODO: https://github.com/phetsims/energy-forms-and-changes/issues/421
      tandem: options.tandem.createTandem( 'positionProperty' )
    }, options.positionPropertyOptions ) );

    // @public (read-only)
    this.tandemName = options.tandem.name;

    // @public {HorizontalSurface|null} - The top surface of this model element, the value will be
    // null if other elements can't rest upon the surface.  Its position is updated when the model element is moved.
    this.topSurface = null;

    // @protected {HorizontalSurface|null} - The bottom surface of this model element, the value will be null if
    // this model element can't rest on another surface.
    this.bottomSurface = null;

    // @public (read-only) {ObservableArrayDef.<Bounds2>} - A list of bounds that are used for determining if this model
    // element is in a valid position, i.e. whether it is within the play area and is not overlapping other model
    // elements.  In many cases, this list will contain a single Bounds2 instance, e.g. for a block.  For more elaborate
    // shapes, like a beaker, it may contain several Bounds2 instances.  These bounds are defined relative to the
    // element's position, which by convention in this sim is at the center bottom of the model element.
    this.relativePositionTestingBoundsList = createObservableArray();

    // @public (read-only) {Bounds2[]} - The bounds from relativePositionTestingBoundsList translated to this element's
    // current position.  These are maintained so that they don't have to be recalculated every time we need to test if
    // model elements are overlapping one another.
    this.translatedPositionTestingBoundsList = [];

    // Watch the relative position list and add translated positions and now bounds instances are added.  This listener
    // should only be fired during constructor execution of sub-types, since the bounds list shouldn't be changing after
    // that.
    this.relativePositionTestingBoundsList.addItemAddedListener( positionTestingBounds => {
      this.translatedPositionTestingBoundsList.push(
        positionTestingBounds.shiftedXY( this.positionProperty.get().x, this.positionProperty.get().y )
      );
    } );

    // update the translated bounds when the position changes
    this.positionProperty.link( position => {
      this.translatedPositionTestingBoundsList = this.getBoundsListForPosition(
        position,
        this.translatedPositionTestingBoundsList
      );
    } );

    // @public {Vector2} - compensation for evaluating positions of elements that have perspective in the view
    this.perspectiveCompensation = new Vector2( 0, 0 );
  }

  /**
   * method to test whether this element is stacked upon another, always false for non-movable model elements,
   * override as needed in descendant types
   * @param {ModelElement} element - model element to be checked
   * @returns {boolean}
   * @public
   */
  isStackedUpon( element ) {
    return false;
  }

  /**
   * get the bounds list, which represents the model space occupied by this model element, translated to the supplied
   * position
   * @param {Vector2} position
   * @param {Bounds2[]} [boundsList] - can be provided to reduce memory allocations
   * @private
   */
  getBoundsListForPosition( position, boundsList ) {

    // allocate a bounds list if not provided
    if ( !boundsList ) {
      boundsList = [];
      this.relativePositionTestingBoundsList.forEach( bounds => {
        boundsList.push( bounds.copy() );
      } );
    }

    // parameter checking
    assert && assert(
      boundsList.length === this.relativePositionTestingBoundsList.length,
      'provided bounds list is not the correct size'
    );

    for ( let i = 0; i < boundsList.length; i++ ) {
      const relativeBounds = this.relativePositionTestingBoundsList.get( i );
      boundsList[ i ].setMinMax(
        relativeBounds.minX + position.x,
        relativeBounds.minY + position.y,
        relativeBounds.maxX + position.x,
        relativeBounds.maxY + position.y
      );
    }

    return boundsList;
  }

  /**
   * Reset the model element to its original state. Subclasses must add reset functionality for any state that they
   * add.
   * @public
   */
  reset() {
    this.positionProperty.reset();

    // note - the top and bottom surface Properties are NOT reset here since they are managed by sub-types
  }
}

energyFormsAndChanges.register( 'ModelElement', ModelElement );
export default ModelElement;