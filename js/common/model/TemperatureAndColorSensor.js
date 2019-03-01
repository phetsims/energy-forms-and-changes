// Copyright 2014-2019, University of Colorado Boulder

/**
 * a model element senses the temperature and color of the model at its current position, and can be moved around
 *
 * @author John Blanco
 */

define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Property = require( 'AXON/Property' );
  const UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/UserMovableModelElement' );

  class TemperatureAndColorSensor extends UserMovableModelElement {

    /**
     * @param {EFACIntroModel} model
     * @param {Vector2} initialPosition
     * @param {boolean} initiallyActive
     */
    constructor( model, initialPosition, initiallyActive ) {
      super( initialPosition );

      // @private
      this.model = model;

      // @public (read-only) {Property.<number>}
      this.sensedTemperatureProperty = new Property( EFACConstants.ROOM_TEMPERATURE );

      // @public (read-only) {Property.<Color>}
      this.sensedElementColorProperty = new Property( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR );

      // @public (read-only) {Property.<boolean>} - used to control visibility in the view
      this.activeProperty = new Property( initiallyActive );
    }

    /**
     * @public
     */
    step() {
      if ( this.activeProperty.value ) {
        const temperatureAndColor = this.model.getTemperatureAndColorAtLocation( this.positionProperty.value );
        this.sensedTemperatureProperty.set( temperatureAndColor.temperature );
        this.sensedElementColorProperty.set( temperatureAndColor.color );
      }
      else {
        this.sensedTemperatureProperty.set( EFACConstants.ROOM_TEMPERATURE );
        this.sensedElementColorProperty.set( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR );
      }
    }

    /**
     * @public
     */
    reset() {
      this.sensedTemperatureProperty.reset();
      this.sensedElementColorProperty.reset();
      this.activeProperty.reset();
    }
  }

  return energyFormsAndChanges.register( 'TemperatureAndColorSensor', TemperatureAndColorSensor );
} );

