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
  const merge = require( 'PHET_CORE/merge' );
  const Property = require( 'AXON/Property' );
  const PropertyIO = require( 'AXON/PropertyIO' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Range = require( 'DOT/Range' );
  const StringProperty = require( 'AXON/StringProperty' );
  const UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/common/model/UserMovableModelElement' );
  const Tandem = require( 'TANDEM/Tandem' );

  class TemperatureAndColorSensor extends UserMovableModelElement {

    /**
     * @param {EFACIntroModel} model
     * @param {Vector2} initialPosition
     * @param {boolean} initiallyActive
     * @param {Object} [options]
     */
    constructor( model, initialPosition, initiallyActive, options ) {

      options = merge( {
        tandem: Tandem.required
      }, options );

      super( initialPosition, options );

      // @private
      this.model = model;

      // @public (read-only) {NumberProperty}
      this.sensedTemperatureProperty = new NumberProperty( EFACConstants.ROOM_TEMPERATURE, {
        range: new Range( EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700 ), // in kelvin, empirically determined max
        units: 'K',
        tandem: options.tandem.createTandem( 'sensedTemperatureProperty' ),
        phetioReadOnly: true
      } );

      // @public (read-only) {Property.<Color>}
      this.sensedElementColorProperty = new Property( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR, {
        phetioType: PropertyIO( ColorIO ),
        tandem: options.tandem.createTandem( 'sensedElementColorProperty' ),
        phetioReadOnly: true
      } );

      this.sensedElementNameProperty = new StringProperty( '', {
        tandem: options.tandem.createTandem( 'sensedElementNameProperty' ),
        phetioReadOnly: true
      } );

      // @public (read-only) {BooleanProperty} - used to control visibility in the view
      this.activeProperty = new BooleanProperty( initiallyActive, {
        tandem: options.tandem.createTandem( 'activeProperty' ),
        phetioReadOnly: true
      } );
    }

    /**
     * @public
     */
    step() {
      if ( this.activeProperty.value ) {
        this.model.updateTemperatureAndColorAndNameAtLocation(
          this.positionProperty.value,
          this.sensedTemperatureProperty,
          this.sensedElementColorProperty,
          this.sensedElementNameProperty
        );
      }
      else {
        this.sensedTemperatureProperty.reset();
        this.sensedElementColorProperty.reset();
        this.sensedElementNameProperty.reset();
      }
    }

    /**
     * @public
     */
    reset() {
      this.sensedTemperatureProperty.reset();
      this.sensedElementColorProperty.reset();
      this.sensedElementNameProperty.reset();
      this.activeProperty.reset();
    }
  }

  return energyFormsAndChanges.register( 'TemperatureAndColorSensor', TemperatureAndColorSensor );
} );

