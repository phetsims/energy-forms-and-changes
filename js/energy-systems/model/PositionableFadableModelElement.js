// Copyright 2016, University of Colorado Boulder

/**
 * Base class for model elements that can be positioned and faded.
 *
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var PositionableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/PositionableModelElement' );

  /**
   * Abstract positionable fadable model element class
   *
   * @param {Vector2} initialPosition Initial position of element
   * @constructor
   */
  function PositionableFadableModelElement( initialPosition, initialOpacity ) {

    PositionableModelElement.call( this, initialPosition );

    this.addProperty( 'opacity', initialOpacity );
  }

  energyFormsAndChanges.register( 'PositionableFadableModelElement', PositionableFadableModelElement );

  return inherit( PropertySet, PositionableFadableModelElement );
} );

