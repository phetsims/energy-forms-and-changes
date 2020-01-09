// Copyright 2016-2020, University of Colorado Boulder

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
  const Vector2Property = require( 'DOT/Vector2Property' );

  class PositionableModelElement {

    /**
     * @param {Vector2} initialPosition
     * @param {Tandem} tandem
     */
    constructor( initialPosition, tandem ) {

      // @public {Vector2Property}
      this.positionProperty = new Vector2Property( initialPosition, {
        units: 'm',
        tandem: tandem.createTandem( 'positionProperty' ),
        phetioReadOnly: true,
        phetioHighFrequency: true,
        phetioDocumentation: 'the position of the system element'
      } );
    }
  }

  return energyFormsAndChanges.register( 'PositionableModelElement', PositionableModelElement );
} );

