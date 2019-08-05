// Copyright 2018-2019, University of Colorado Boulder

/**
 * A Scenery Node that portrays a thermometer and a triangular indicator of the precise location where the temperature
 * is being sensed. The triangular indicator can be filled with a color to make it more clear what exactly is being
 * measured.
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Property = require( 'AXON/Property' );
  const TemperatureAndColorSensorNode = require( 'SCENERY_PHET/TemperatureAndColorSensorNode' );

  class EFACTemperatureAndColorSensorNode extends Node {

    /**
     * @param {TemperatureAndColorSensor} temperatureAndColorSensor - model element that measures temperature and color
     * at a position in model space
     * @param {Object} [options]
     */
    constructor( temperatureAndColorSensor, options ) {
      super( { cursor: 'pointer' } );

      options = _.extend( {
        modelViewTransform: ModelViewTransform2.createIdentity(),
        draggable: false,
        dragBounds: Bounds2.EVERYTHING
      }, options );

      // @public (read-only) {TemperatureAndColorSensorNode} - public so getBounds functions can be called
      this.temperatureAndColorSensorNode = new TemperatureAndColorSensorNode(
        EFACConstants.WATER_FREEZING_POINT_TEMPERATURE,
        EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE,
        temperatureAndColorSensor.sensedTemperatureProperty
      );
      this.addChild( this.temperatureAndColorSensorNode );

      // set the fill color of the triangle as the 'sensed color' changes
      Property.multilink(
        [
          temperatureAndColorSensor.activeProperty,
          temperatureAndColorSensor.sensedElementColorProperty
        ],
        ( active, color ) => {
          const fillColor = active ? color : EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR;
          this.temperatureAndColorSensorNode.changeColor( fillColor );
        }
      );

      // move this node when the model element moves
      temperatureAndColorSensor.positionProperty.link( position => {
        this.translation = options.modelViewTransform.modelToViewPosition( position );
      } );

      // add a drag handler if needed
      if ( options.draggable ) {
        this.addInputListener( new MovableDragHandler( temperatureAndColorSensor.positionProperty, {
          modelViewTransform: options.modelViewTransform,
          dragBounds: options.dragBounds.withMaxX(
            options.dragBounds.right - options.modelViewTransform.viewToModelDeltaX( this.width )
          ),
          attach: true,
          startDrag: () => {
            temperatureAndColorSensor.userControlledProperty.set( true );
          },
          endDrag: () => {
            temperatureAndColorSensor.userControlledProperty.set( false );
          }
        } ) );
      }
    }
  }

  return energyFormsAndChanges.register( 'EFACTemperatureAndColorSensorNode', EFACTemperatureAndColorSensorNode );
} );
