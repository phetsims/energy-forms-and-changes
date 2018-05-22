// Copyright 2018, University of Colorado Boulder

/**
 * A Scenery Node that portrays a thermometer and a triangular indicator of the precise location where the temperature
 * is being sensed. The triangular indicator can be filled with a color to make it more clear what exactly is being
 * measured.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );
  var ThermometerNode = require( 'SCENERY_PHET/ThermometerNode' );

  // constants
  var TRIANGLE_SIDE_LENGTH = 20; // in screen coordinates
  var INACTIVE_COLOR = new Color( 'white' );

  /**
   * @param {TemperatureAndColorSensor} temperatureAndColorSensor - model element that measures temperature and color
   * at a position in model space
   * @param {Object} [options]
   * @constructor
   */
  function TemperatureAndColorSensorNode( temperatureAndColorSensor, options ) {

    var self = this;
    Node.call( this, { cursor: 'pointer' } );

    options = _.extend( {
      modelViewTransform: ModelViewTransform2.createIdentity(),
      draggable: false,
      dragBounds: Bounds2.EVERYTHING
    }, options );

    // Add the triangle that will display the sensed color.  The leftmost point of this triangle will correspond to the
    // position of the sensor in the model.
    var triangleShape = new Shape();
    triangleShape.moveTo( 0, 0 )
      .lineTo( Math.cos( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH, -Math.sin( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH )
      .lineTo( Math.cos( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH, Math.sin( Math.PI / 6 ) * TRIANGLE_SIDE_LENGTH )
      .close();

    var triangle = new Path( triangleShape, {
      fill: new Color( 0, 0, 0, 0 ),
      lineWidth: 2,
      stroke: 'black'
    } );
    this.addChild( triangle );

    // set the fill color of the triangle as the 'sensed color' changes
    Property.multilink(
      [
        temperatureAndColorSensor.activeProperty,
        temperatureAndColorSensor.sensedElementColorProperty
      ],
      function( active, color ) {
        triangle.fill = active ? color : INACTIVE_COLOR;
      }
    );

    // add the thermometer node - its position relative to the triangle is empirically determined for optimal look
    this.addChild( new ThermometerNode(
      EFACConstants.FREEZING_POINT_TEMPERATURE,
      EFACConstants.BOILING_POINT_TEMPERATURE,
      temperatureAndColorSensor.sensedTemperatureProperty,
      {
        left: triangle.right + 10,
        bottom: triangle.bottom + 12
      }
    ) );

    // move this node when the model element moves
    temperatureAndColorSensor.positionProperty.link( function( position ) {
      self.translation = options.modelViewTransform.modelToViewPosition( position );
    } );

    // add a drag handler if needed
    if ( options.draggable ) {
      this.addInputListener( new MovableDragHandler( temperatureAndColorSensor.positionProperty, {
        modelViewTransform: options.modelViewTransform,
        dragBounds: options.dragBounds,
        startDrag: function() {
          temperatureAndColorSensor.userControlledProperty.set( true );
        },
        endDrag: function() {
          temperatureAndColorSensor.userControlledProperty.set( false );
        }
      } ) );
    }
  }

  energyFormsAndChanges.register( 'TemperatureAndColorSensorNode', TemperatureAndColorSensorNode );

  return inherit( Node, TemperatureAndColorSensorNode );
} );
