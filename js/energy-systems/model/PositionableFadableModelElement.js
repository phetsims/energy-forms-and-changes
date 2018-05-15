// Copyright 2016-2018, University of Colorado Boulder

/**
 * base type for model elements that can be positioned and faded
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var NumberProperty = require( 'AXON/NumberProperty' );
  var PositionableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/PositionableModelElement' );

  /**
   * @param {Vector2} initialPosition
   * @param {number} initialOpacity
   * @constructor
   */
  function PositionableFadableModelElement( initialPosition, initialOpacity ) {
    PositionableModelElement.call( this, initialPosition );

    // @public {NumberProperty}
    this.opacityProperty = new NumberProperty( initialOpacity );
  }

  energyFormsAndChanges.register( 'PositionableFadableModelElement', PositionableFadableModelElement );

  return inherit( Object, PositionableFadableModelElement, {

    /**
     * restore initial state
     * @public
     */
    reset: function() {
      this.opacityProperty.reset();
    }
  } );
} );

