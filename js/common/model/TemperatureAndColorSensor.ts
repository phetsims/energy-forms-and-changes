// Copyright 2014-2025, University of Colorado Boulder

/**
 * a model element that senses the temperature and color of the model at its current position, and can be moved around
 *
 * @author John Blanco (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import StringProperty from '../../../../axon/js/StringProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import Color from '../../../../scenery/js/util/Color.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACIntroModel from '../../intro/model/EFACIntroModel.js';
import EFACConstants from '../EFACConstants.js';
import UserMovableModelElement, { UserMovableModelElementOptions } from './UserMovableModelElement.js';

type SelfOptions = EmptySelfOptions;

export type TemperatureAndColorSensorOptions = SelfOptions & UserMovableModelElementOptions; // Using Object since parent options are not exported

class TemperatureAndColorSensor extends UserMovableModelElement {

  private readonly model: EFACIntroModel;
  public readonly sensedTemperatureProperty: NumberProperty;
  public readonly sensedElementColorProperty: Property<Color>;
  public readonly sensedElementNameProperty: StringProperty;

  // Used to control visibility in the view
  public readonly activeProperty: BooleanProperty;

  public constructor( model: EFACIntroModel, initialPosition: Vector2, initiallyActive: boolean, providedOptions?: TemperatureAndColorSensorOptions ) {

    const options = optionize<TemperatureAndColorSensorOptions, SelfOptions, UserMovableModelElementOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioState: false,
      positionPropertyOptions: {
        phetioDocumentation: 'the position of the tip of the thermometer\'s color sensor'
      },
      phetioDocumentation: 'thermometer that can sense the temperature, color, and phet-io ID of an element'
    }, providedOptions );

    super( initialPosition, options );

    this.model = model;

    this.sensedTemperatureProperty = new NumberProperty( EFACConstants.ROOM_TEMPERATURE, {
      range: new Range( EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, 700 ), // in kelvin, empirically determined max
      units: 'K',
      tandem: options.tandem.createTandem( 'sensedTemperatureProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the temperature of the sensed element'
    } );

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

    this.activeProperty = new BooleanProperty( initiallyActive, {
      tandem: options.tandem.createTandem( 'activeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the thermometer is active. thermometers are active when not in the storage ' +
                           'area, regardless of whether the sim is paused'
    } );
  }

  public step(): void {
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

  public override reset(): void {
    this.sensedTemperatureProperty.reset();
    this.sensedElementColorProperty.reset();
    this.sensedElementNameProperty.reset();
    this.activeProperty.reset();
  }
}

energyFormsAndChanges.register( 'TemperatureAndColorSensor', TemperatureAndColorSensor );
export default TemperatureAndColorSensor;