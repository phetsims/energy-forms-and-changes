// Copyright 2016-2019, University of Colorado Boulder

/**
 * a model element that has a position (a.k.a. a location) which can be changed
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Property = require( 'AXON/Property' );

  class PositionableModelElement {

    /**
     * @param {Vector2} initialPosition
     */
    constructor( initialPosition ) {

      // @public {Property.<Vector>}
      this.positionProperty = new Property( initialPosition );
    }
  }

  return energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );
} );

