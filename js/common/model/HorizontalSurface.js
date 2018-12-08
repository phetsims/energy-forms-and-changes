// Copyright 2014-2018, University of Colorado Boulder


/**
 * A simple, level horizontal surface in a 2D model space.  This is represented by a range of x values and a single y
 * value.  The best way to thing of this is that it is much like a Vector2 in that it represents a small piece of
 * information that is generally immutable and is often wrapped in a Property.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/ModelElement' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );

  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {ModelElement} owner
   * @param {ModelElement} [initialElementOnSurface] - model element that is already on this surface
   * @constructor
   */
  function HorizontalSurface( initialPosition, width, owner, initialElementOnSurface ) {
    var self = this;

    // @public (read-write) {Property.<Vector2>}
    this.positionProperty = new Property( initialPosition );

    // @public (read-only) {Property.<ModelElement>|null} - the model element that is currently on the surface of this
    // one, null if nothing there, use the API below to update
    this.elementOnSurfaceProperty = new Property( initialElementOnSurface ? initialElementOnSurface : null );

    // monitor the element on the surface for legitimate settings
    assert && this.elementOnSurfaceProperty.link( function( elementOnSurface, previousElementOnSurface ) {
      assert( elementOnSurface === null || elementOnSurface instanceof ModelElement );
      assert( elementOnSurface !== self, 'can\'t sit on top of ourself' );

      // TODO: The following assertion is commented out because it fails during fuzz testing.  We should figure out why,
      // but this is lower priority than most of the other work at the moment.  -jbphet, 12/7/2018
      assert(
        elementOnSurface === null || previousElementOnSurface === null,
        'one element should be removed before another is added'
      );
    } );

    // @public (read-only) {number}
    this.width = width;

    // @public (read-only) {Range} - the range of space in the horizontal direction occupied by this surface
    this.xRange = new Range( initialPosition.x - this.width / 2, initialPosition.x + this.width / 2 );
    this.positionProperty.link( function( position ) {
      self.xRange.setMinMax( position.x - self.width / 2, position.x + self.width / 2 );
    } );

    // @public (read-only) {ModelElement} - this should be accessed through getter/setter methods
    this.owner = owner;
  }

  energyFormsAndChanges.register( 'HorizontalSurface', HorizontalSurface );

  return inherit( Object, HorizontalSurface );
} );

