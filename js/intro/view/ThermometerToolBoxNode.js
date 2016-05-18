// Copyright 2014-2015, University of Colorado Boulder

/**
 * Scenery Node that is used to represent thermometers in the tool box and that
 * controls the initial movement of thermometers in and out of the tool
 * box.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var ThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/ThermometerNode' );

  /**
   *
   * @param {ThermometerNode} thermometerNode
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function ThermometerToolBoxNode( thermometerNode, modelViewTransform ) {
    ThermometerNode.call( this );
    var self = this;
    this.modelViewTransform = modelViewTransform;
    // getThermometer is defined in  sensing Thermometer Node
    var thermometer = thermometerNode.getThermometer();
    //var positioningOffset = modelViewTransform.viewToModelDelta( thermometerNode.getOffsetCenterShaftToTriangleTip() );
    this.setSensedTemperature( EFACConstants.ROOM_TEMPERATURE );
    this.setSensedColor( 'white' );
    // This node's visibility is the inverse of the thermometer's.

    thermometer.activeProperty.link( function( active ) {
      self.visible = !active;
    } );

    var parentScreenView = null;
    this.addInputListener( new SimpleDragHandler( {

      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      start: function( event, trail ) {
        thermometer.userControlled = true;
        thermometer.active = true;

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

        // Determine the initial position of the new element as a function of the event position and this node's bounds.
        var triangleTipGlobal = self.parentToGlobalPoint( self.rightCenter.plus( thermometerNode.getOffsetCenterShaftToTriangleTip() ) );
        var initialPosition = parentScreenView.globalToLocalPoint( triangleTipGlobal );

        thermometer.position = modelViewTransform.viewToModelPosition( initialPosition );
      },

      // Handler that moves the shape in model space.
      translate: function( translationParams ) {
        thermometer.position = thermometer.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      },

      end: function( event, trail ) {
        thermometer.userControlled = false;
        if ( self.returnRect !== null && thermometerNode.bounds.intersectsBounds( self.returnRect ) ) {
          // Released over tool box, so return it.
          thermometer.active = false;
        }
      }
    } ) );

  }

  energyFormsAndChanges.register( 'ThermometerToolBoxNode', ThermometerToolBoxNode );

  return inherit( ThermometerNode, ThermometerToolBoxNode, {
    /**
     * @public
     * @param {Rectangle} returnRect
     */
    setReturnRect: function( returnRect ) {
      this.returnRect = returnRect;
    }
  } );
} );
