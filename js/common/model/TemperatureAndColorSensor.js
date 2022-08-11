// Copyright 2014-2022, University of Colorado Boulder

/**
 * a model element that senses the temperature and color of the model at its current position, and can be moved around
 *
 * @author John Blanco
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import { Color } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';
import UserMovableModelElement from './UserMovableModelElement.js';

class TemperatureAndColorSensor extends UserMovableModelElement {

  /**
   * @param {EFACIntroModel} model
   * @param {Vector2} initialPosition
   * @param {boolean} initiallyActive
   * @param {Object} [options]
   */
  constructor( model, initialPosition, initiallyActive, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      positionPropertyOptions: {
        phetioDocumentation: 'the position of the tip of the thermometer\'s color sensor'
      },
      phetioDocumentation: 'thermometer that can sense the temperature, color, and phet-io ID of an element'
    }, options );

    super( initialPosition, options );

    // @private
    this.model = model;

    // @public (read-only) {NumberProperty}
    this.sensedTemperatureProperty = new NumberProperty( EFACConstants.ROOM_TEMPERATURE, {
      range: new Range( EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700 ), // in kelvin, empirically determined max
      units: 'K',
      tandem: options.tandem.createTandem( 'sensedTemperatureProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the temperature of the sensed element'
    } );

    // @public (read-only) {Property.<Color>}
    this.sensedElementColorProperty = new Property( EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR, {
      phetioValueType: Color.ColorIO,
      tandem: options.tandem.createTandem( 'sensedElementColorProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'the color of the sensed element'
    } );

    this.sensedElementNameProperty = new StringProperty( '', {
      tandem: options.tandem.createTandem( 'sensedElementNameProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'the phet-io ID of the sensed element'
    } );

    // @public (read-only) {BooleanProperty} - used to control visibility in the view
    this.activeProperty = new BooleanProperty( initiallyActive, {
      tandem: options.tandem.createTandem( 'activeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the thermometer is active. thermometers are active when not in the storage ' +
                           'area, regardless of whether the sim is paused'
    } );
  }

  /**
   * @public
   */
  step() {
    if ( this.activeProperty.value ) {
      this.model.updateTemperatureAndColorAndNameAtPosition(
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

energyFormsAndChanges.register( 'TemperatureAndColorSensor', TemperatureAndColorSensor );
export default TemperatureAndColorSensor;
