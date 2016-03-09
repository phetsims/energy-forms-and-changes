// Copyright 2002-2012, University of Colorado

/**
 * A model element that has a position (a.k.a. a location) which can be
 * changed.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * Abstract positionable model element class
   *
   * @param {Vector2} initialPosition Initial position of element
   * @constructor
   */
  function PositionableModelElement( initialPosition ) {
    PropertySet.call( this, {
      position: initialPosition
    } );
  }

} );
