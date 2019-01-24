// Copyright 2014-2018, University of Colorado Boulder

/**
 * a model element senses the temperature and color of the model at its current position, and can be moved around
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/UserMovableModelElement' );

  /**
   * @param {EFACIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @constructor
   */
  function TemperatureAndColorSensor( model, initialPosition, initiallyActive ) {
    UserMovableModelElement.call( this, initialPosition );

    // @private
    this.model = model;

    // @public (read-only) {Property.<number>}
    this.sensedTemperatureProperty = new Property( EFACConstants.ROOM_TEMPERATURE );

    // @public (read-only) {Property.<Color>}
    this.sensedElementColorProperty = new Property( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR );

    // @public (read-only) {Property.<boolean>} - used to control visibility in the view
    this.activeProperty = new Property( initiallyActive );
  }

  energyFormsAndChanges.register( 'TemperatureAndColorSensor', TemperatureAndColorSensor );

  return inherit( UserMovableModelElement, TemperatureAndColorSensor, {

    /**
     * @public
     */
    step: function() {
      if ( this.activeProperty.value ) {
        var temperatureAndColor = this.model.getTemperatureAndColorAtLocation( this.positionProperty.value );
        this.sensedTemperatureProperty.set( temperatureAndColor.temperature );
        this.sensedElementColorProperty.set( temperatureAndColor.color );
      }
      else {
        this.sensedTemperatureProperty.set( EFACConstants.ROOM_TEMPERATURE );
        this.sensedElementColorProperty.set( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR );
      }
    },

    /**
     * @public
     */
    reset: function() {
      this.sensedTemperatureProperty.reset();
      this.sensedElementColorProperty.reset();
      this.activeProperty.reset();
    }
  } );

} );

