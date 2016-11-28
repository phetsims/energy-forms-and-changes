// Copyright 2014-2015, University of Colorado Boulder

/**
 * Basic thermometer that senses temperature, has a position. The thermometer has only a point and a temperature in the model.  Its visual
 * representation is left entirely to the view.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  var Property = require( 'AXON/Property' );
  var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/UserMovableModelElement' );

  /**
   * Constructor for a Thermometer.
   *
   * @param {model} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @constructor
   */
  function Thermometer( model, initialPosition, initiallyActive ) {

    UserMovableModelElement.call( this, initialPosition );

    this.model = model;

    this.sensedTemperatureProperty = new Property( EFACConstants.ROOM_TEMPERATURE );
    this.sensedElementColorProperty = new Property( PhetColorScheme.RED_COLORBLIND );
    this.activeProperty = new Property( initiallyActive ); // controls visibility
  }

  energyFormsAndChanges.register( 'Thermometer', Thermometer );

  return inherit( UserMovableModelElement, Thermometer, {

    step: function( dt ) {
      var temperatureAndColor = this.model.getTemperatureAndColorAtLocation( this.position );
      this.sensedTemperatureProperty.set( temperatureAndColor.temperature );
      this.sensedElementColorProperty.set( temperatureAndColor.color );
    },

    reset: function() {
      this.sensedTemperatureProperty.reset();
      this.sensedElementColorProperty.reset();
      this.activeProperty.reset();
    },

    getBottomSurfaceProperty: function() {
      return null;
    }
  } );

} );

