// Copyright 2016-2019, University of Colorado Boulder

/**
 * base type for model elements that can be positioned and faded
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const PositionableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/PositionableModelElement' );

  class PositionableFadableModelElement extends PositionableModelElement {

    /**
     * @param {Vector2} initialPosition
     * @param {number} initialOpacity
     */
    constructor( initialPosition, initialOpacity ) {
      super( initialPosition );

      // @public {NumberProperty}
      this.opacityProperty = new NumberProperty( initialOpacity );
    }
  }

  return energyFormsAndChanges.register( 'PositionableFadableModelElement', PositionableFadableModelElement );
} );

