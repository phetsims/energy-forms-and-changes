// Copyright 2018-2023, University of Colorado Boulder

/**
 * A Scenery Node that portrays a thermometer and a triangular indicator of the precise position where the temperature
 * is being sensed. The triangular indicator can be filled with a color to make it more clear what exactly is being
 * measured.
 *
 * @author John Blanco
 */

import Property from '../../../../axon/js/Property.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import merge from '../../../../phet-core/js/merge.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import TemperatureAndColorSensorNode from '../../../../scenery-phet/js/TemperatureAndColorSensorNode.js';
import { DragListener, Node } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EFACConstants from '../EFACConstants.js';

class EFACTemperatureAndColorSensorNode extends Node {

  /**
   * @param {TemperatureAndColorSensor} temperatureAndColorSensor - model element that measures temperature and color
   * at a position in model space
   * @param {Object} [options]
   */
  constructor( temperatureAndColorSensor, options ) {
    options = merge( {
      modelViewTransform: ModelViewTransform2.createIdentity(),
      draggable: false,
      dragBounds: Bounds2.EVERYTHING,
      cursor: 'pointer',
      phetioInputEnabledPropertyInstrumented: true,

      // phet-io
      tandem: Tandem.REQUIRED
    }, options );

    super( options );

    // @public (read-only) {TemperatureAndColorSensorNode} - public so getBounds functions can be called
    this.temperatureAndColorSensorNode = new TemperatureAndColorSensorNode(
      temperatureAndColorSensor.sensedTemperatureProperty,
      new Range( EFACConstants.WATER_FREEZING_POINT_TEMPERATURE, EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE ),
      temperatureAndColorSensor.sensedElementColorProperty );
    this.addChild( this.temperatureAndColorSensorNode );

    // move this node when the model element moves
    temperatureAndColorSensor.positionProperty.link( position => {
      this.translation = options.modelViewTransform.modelToViewPosition( position );
    } );

    // add a drag handler if needed
    if ( options.draggable ) {
      this.addInputListener( new DragListener( {
        positionProperty: temperatureAndColorSensor.positionProperty,
        transform: options.modelViewTransform,
        dragBoundsProperty: new Property( options.dragBounds.withMaxX(
          options.dragBounds.right - options.modelViewTransform.viewToModelDeltaX( this.width )
        ) ),
        attach: true,
        start: () => {
          temperatureAndColorSensor.userControlledProperty.set( true );
        },
        end: () => {
          temperatureAndColorSensor.userControlledProperty.set( false );
        },
        tandem: options.tandem.createTandem( 'dragListener' )
      } ) );
    }
  }
}

energyFormsAndChanges.register( 'EFACTemperatureAndColorSensorNode', EFACTemperatureAndColorSensorNode );
export default EFACTemperatureAndColorSensorNode;
