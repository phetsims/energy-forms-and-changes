// Copyright 2014-2018, University of Colorado Boulder

/**
 * a Scenery node that is used to represent thermometers in the toolbox and that controls the initial movement of
 * thermometers in and out of the tool box
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var TemperatureAndColorSensorNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/TemperatureAndColorSensorNode' );

  /**
   * @param {TemperatureAndColorSensorNode} thermometerNode
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ThermometerToolboxNode( thermometerNode, modelViewTransform ) {

    var self = this;
    TemperatureAndColorSensorNode.call( this );

    // TODO: I (jbphet) am not sure this is used or needed, update when sure.
    this.modelViewTransform = modelViewTransform;
    var thermometer = thermometerNode.thermometer;
    //var positioningOffset = modelViewTransform.viewToModelDelta( thermometerNode.getOffsetCenterShaftToTriangleTip() );
    this.setSensedTemperature( EFACConstants.ROOM_TEMPERATURE );
    this.setSensedColor( 'white' );
    // This node's visibility is the inverse of the thermometer's.

    thermometer.activeProperty.link( function( active ) {
      self.visible = !active;
    } );

    var parentScreenView = null;
    this.addInputListener( new SimpleDragHandler( {

      // allow moving a finger (touch) across a node to pick it up
      allowTouchSnag: true,

      start: function( event, trail ) {
        thermometer.userControlledProperty.set( true );
        thermometer.activeProperty.set( true );

        if ( !parentScreenView ) {

          // find the parent screen view by moving up the scene graph
          var testNode = self;
          while ( testNode !== null ) {
            if ( testNode instanceof ScreenView ) {
              parentScreenView = testNode;
              break;
            }
            testNode = testNode.parents[ 0 ]; // move up the scene graph by one level
          }
          assert && assert( parentScreenView, 'unable to find parent screen view' );
        }

        // determine the initial position of the new element as a function of the event position and this node's bounds
        var triangleTipGlobal = self.parentToGlobalPoint(
          self.rightCenter.plus( thermometerNode.getOffsetCenterShaftToTriangleTip() )
        );
        var initialPosition = parentScreenView.globalToLocalPoint( triangleTipGlobal );

        thermometer.positionProperty.set( modelViewTransform.viewToModelPosition( initialPosition ) );
      },

      // handler that moves the shape in model space
      translate: function( translationParams ) {
        thermometer.positionProperty.set(
          thermometer.positionProperty.value.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) )
        );
      },

      end: function( event, trail ) {
        thermometer.userControlledProperty.set( false );
        if ( self.returnRect !== null && thermometerNode.bounds.intersectsBounds( self.returnRect ) ) {

          // released over toolbox, so return it
          thermometer.activeProperty.set( false );
        }
      }
    } ) );
  }

  energyFormsAndChanges.register( 'ThermometerToolboxNode', ThermometerToolboxNode );

  return inherit( TemperatureAndColorSensorNode, ThermometerToolboxNode );
} );

