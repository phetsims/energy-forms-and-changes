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
  const Color = require( 'SCENERY/util/Color' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Property = require( 'AXON/Property' );
  const Shape = require( 'KITE/Shape' );
  const ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // constants
  const TRIANGLE_SIDE_LENGTH = 18; // in screen coordinates

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

      // Add the triangle that will display the sensed color.  The leftmost point of this triangle will correspond to the
      // position of the sensor in the model.
      const triangleShape = new Shape();
      triangleShape.moveTo( 0, 0 )
        .lineTo( Math.cos( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH, -Math.sin( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH )
        .lineTo( Math.cos( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH, Math.sin( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH )
        .close();

      // @public (read-only) {Path} - color indicator, public so that it can be used for bounds intersection testing
      this.colorIndicatorNode = new Path( triangleShape, {
        fill: new Color( 0, 0, 0, 0 ),
        lineWidth: 2,
        stroke: 'black',
        lineJoin: 'round'
      } );
      this.addChild( this.colorIndicatorNode );

      // set the fill color of the triangle as the 'sensed color' changes
      Property.multilink(
        [
          temperatureAndColorSensor.activeProperty,
          temperatureAndColorSensor.sensedElementColorProperty
        ],
        ( active, color ) => {
          this.colorIndicatorNode.fill = active ? color : EFACConstants.TEMPERATURE_SENSOR_INACTIVE_COLOR;
        }
      );

      // @public (read-only) {ThermometerNode} - thermometer node, public so that it can be used for bounds intersection
      // testing
      this.thermometerNode = new ThermometerNode(
        EFACConstants.WATER_FREEZING_POINT_TEMPERATURE,
        EFACConstants.OLIVE_OIL_BOILING_POINT_TEMPERATURE,
        temperatureAndColorSensor.sensedTemperatureProperty,
        {
          bulbDiameter: 30,
          tubeWidth: 18,
          lineWidth: 2,
          tickSpacingTemperature: 25,
          majorTickLength: 10,
          minorTickLength: 5,
          backgroundFill: new Color( 256, 256, 256, 0.67 ),
          left: this.colorIndicatorNode.right + 3,
          bottom: this.colorIndicatorNode.bottom + 5
        }
      );
      this.addChild( this.thermometerNode );

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
