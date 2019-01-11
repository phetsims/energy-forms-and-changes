// Copyright 2014-2018, University of Colorado Boulder

/**
 * Base class for all model elements in the Energy Forms and Changes simulation that can be moved around by the user.
 * At the time of this writing, this includes blocks, beakers, burners, and thermometers.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Vector2} initialPosition
   * @constructor
   */
  function ModelElement( initialPosition ) {

    var self = this;

    // @public {Property.<Vector2>} - position of the center bottom of this model element
    this.positionProperty = new Property( initialPosition );

    // @public {HorizontalSurface|null} - The top surface of this model element, the value will be
    // null if other elements can't rest upon the surface.  Its position is updated when the model element is moved.
    this.topSurface = null;

    // @protected {HorizontalSurface|null} - The bottom surface of this model element, the value will be null if
    // this model element can't rest on another surface.
    this.bottomSurface = null;

    // @public (read-only) {ObservableArray.<Bounds2>} - A list of bounds that are used for determining if this model
    // element is in a valid position, i.e. whether it is within the play area and is not overlapping other model
    // elements.  In many cases, this list will contain a single Bounds2 instance, e.g. for a block.  For more elaborate
    // shapes, like a beaker, it may contain several Bounds2 instances.  These bounds are defined relative to the
    // element's position, which by convention in this sim is at the center bottom of the model element.
    this.relativePositionTestingBoundsList = new ObservableArray();

    // @public (read-only) {Bounds2[]} - The bounds from relativePositionTestingBoundsList translated to this element's
    // current position.  These are maintained so that they don't have to be recalculated every time we need to test if
    // model elements are overlapping one another.
    this.translatedPositionTestingBoundsList = [];

    // Watch the relative position list and add translated positions and now bounds instances are added.  This listener
    // should only be fired during constructor execution of sub-types, since the bounds list shouldn't be changing after
    // that.
    this.relativePositionTestingBoundsList.addItemAddedListener( function( positionTestingBounds ) {
      self.translatedPositionTestingBoundsList.push(
        positionTestingBounds.shifted( self.positionProperty.get().x, self.positionProperty.get().y )
      );
    } );

    // update the translated bounds when the position changes
    this.positionProperty.link( function( position ) {
      self.translatedPositionTestingBoundsList = self.getBoundsListForPosition(
        position,
        self.translatedPositionTestingBoundsList
      );
    } );

    // @private {Bounds2} - composite relative bounds for this model element, cached after first calculation
    this.relativeCompositeBounds = null;

    // @public {Vector2} - compensation for evaluating positions of elements that have perspective in the view
    this.perspectiveCompensation = new Vector2( 0, 0 );
  }

  energyFormsAndChanges.register( 'ModelElement', ModelElement );

  return inherit( Object, ModelElement, {

    get position() {
      return this.positionProperty.get();
    },
    set position( newPosition ) {
      this.positionProperty.set( newPosition );
    },

    // TODO: Consider making these properties set directly instead of through methods when the port is nearly complete.

    /**
     * Get the bottom surface of this model element.  Only model elements that can rest on top of other model elements
     * have bottom surfaces.
     * @public read-only
     * @returns {HorizontalSurface|null} The bottom surface of this model element, null if this element never
     * rests upon other model elements.
     */
    getBottomSurface: function() {
      return this.bottomSurface;
    },

    /**
     * @returns {HorizontalSurface|null} Surface upon which this element is resting, null if there is none.
     * @public
     */
    getTopSurface: function() {
      return this.topSurface;
    },

    /**
     * method to test whether this element is stacked upon another, always false for non-movable model elements,
     * override as needed in descendant types
     * @param {ModelElement} element - model element to be checked
     * @returns {boolean}
     * @public
     */
    isStackedUpon: function( element ) {
      return false;
    },

    /**
     * get any element that is on top of this one, null if nothing there
     * @returns {ModelElement|null}
     */
    getElementOnTop: function() {
      return this.topSurface.elementOnSurfaceProperty.get();
    },

    /**
     * get the bounds list, which represents the model space occupied by this model element, translated to the supplied
     * position
     * @param {Vector2} position
     * @param {Bounds2[]} [boundsList] - can be provided to reduce memory allocations
     */
    getBoundsListForPosition: function( position, boundsList ) {

      // allocate a bounds list if not provided
      if ( !boundsList ) {
        boundsList = [];
        this.relativePositionTestingBoundsList.forEach( function( bounds ) {
          boundsList.push( bounds.copy() );
        } );
      }

      // parameter checking
      assert && assert(
        boundsList.length === this.relativePositionTestingBoundsList.length,
        'provided bounds list is not the correct size'
      );

      for ( var i = 0; i < boundsList.length; i++ ) {
        var relativeBounds = this.relativePositionTestingBoundsList.get( i );
        boundsList[ i ].setMinMax(
          relativeBounds.minX + position.x,
          relativeBounds.minY + position.y,
          relativeBounds.maxX + position.x,
          relativeBounds.maxY + position.y
        );
      }

      return boundsList;
    },

    /**
     * get the composition bounds, meaning the total rectangular bounds occupied by this model element, for the provided
     * position
     * @param {Vector2} position
     * @param {Bounds2} [bounds] - an option pre-allocated bounds instance, saves memory allocations
     */
    getCompositeBoundsForPosition: function( position, bounds ) {

      // if the relative composite bounds have not yet been calculated do it now - should only be necessary once
      if ( !this.relativeCompositeBounds ) {

        var relativeCompositeBounds = Bounds2.NOTHING.copy();

        this.relativePositionTestingBoundsList.forEach( function( relativePositionTestingBounds ) {
          relativeCompositeBounds.includeBounds( relativePositionTestingBounds );
        } );
        this.relativeCompositeBounds = relativeCompositeBounds;
      }

      // allocate a Bounds2 instance if none was provided
      if ( !bounds ) {
        bounds = Bounds2.NOTHING.copy();
      }

      bounds.setMinMax(
        this.relativeCompositeBounds.minX + position.x,
        this.relativeCompositeBounds.minY + position.y,
        this.relativeCompositeBounds.maxX + position.x,
        this.relativeCompositeBounds.maxY + position.y
      );

      return bounds;
    },

    // TODO: Document if kept, but consider maintaining these bounds as the model element moves for efficiency
    getCompositeBounds: function() {
      return this.getCompositeBoundsForPosition( this.positionProperty.get() );
    },

    /**
     * Reset the model element to its original state.  Subclasses must add reset functionality for any state that they
     * add.
     * @public
     */
    reset: function() {

      this.positionProperty.reset();

      // note - the top and bottom surface properties are NOT reset here since they are managed by sub-types
    }
  } );
} );
