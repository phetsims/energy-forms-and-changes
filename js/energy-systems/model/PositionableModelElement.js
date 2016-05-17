// Copyright 2016, University of Colorado Boulder

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

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
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

  energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );

  return inherit( PropertySet, PositionableModelElement );
} );

