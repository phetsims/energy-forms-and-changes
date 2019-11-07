// Copyright 2014-2019, University of Colorado Boulder

/**
 * a model element that senses the temperature and color of the model at its current position, and can be moved around
 *
 * @author John Blanco
 */

define( require => {
  'use strict';

  // modules
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const ColorIO = require( 'SCENERY/util/ColorIO' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/UserMovableModelElement' );

  class TemperatureAndColorSensor extends UserMovableModelElement {

    /**
     * @param {EFACIntroModel} model
     * @param {Vector2} initialPosition
     * @param {boolean} initiallyActive
     * @param {Tandem} tandem
     */
    constructor( model, initialPosition, initiallyActive, tandem ) {
      super( initialPosition, tandem );

      // @private
      this.model = model;

      // @public (read-only) {NumberProperty}
      this.sensedTemperatureProperty = new NumberProperty( EFACConstants.ROOM_TEMPERATURE, {
        range: new Range( EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700 ), // in kelvin, empirically determined max
        tandem: tandem.createTandem( 'sensedTemperatureProperty' )
      } );

      // @public (read-only) {Property.<Color>}
      this.sensedElementColorProperty = new Property( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR, {
        phetioType: PropertyIO( ColorIO ),
        tandem: tandem.createTandem( 'sensedElementColorProperty' )
      } );

      // @public (read-only) {BooleanProperty} - used to control visibility in the view
      this.activeProperty = new BooleanProperty( initiallyActive, {
        tandem: tandem.createTandem( 'activeProperty' )
      } );
    }

    /**
     * @public
     */
    step() {
      if ( this.activeProperty.value ) {
        this.model.updateTemperatureAndColorAtLocation(
          this.positionProperty.value,
          this.sensedTemperatureProperty,
          this.sensedElementColorProperty
        );
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

