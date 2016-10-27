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
  var Property = require( 'AXON/Property' );

  /**
   * Abstract positionable model element class
   *
   * @param {Vector2} initialPosition Initial position of element
   * @constructor
   */
  function PositionableModelElement( initialPosition ) {
    this.positionProperty = new Property( initialPosition );
  }

  energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );

  return inherit( Object, PositionableModelElement, {

    reset: function() {
      this.positionProperty.reset();
    }

  } );
} );

