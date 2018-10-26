// Copyright 2016, University of Colorado Boulder

/**
 * a model element that has a position (a.k.a. a location) which can be changed
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
   * @param {Vector2} initialPosition
   * @constructor
   */
  function PositionableModelElement( initialPosition ) {

    // @public {Property.<Vector>}
    this.positionProperty = new Property( initialPosition );
  }

  energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );

  return inherit( Object, PositionableModelElement );
} );

