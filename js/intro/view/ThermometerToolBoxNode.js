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
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var ThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermometerNode' );

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


//
//// Copyright 2002-2015, University of Colorado Boulder

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.*;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.piccolophet.PhetPCanvas;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.common.model.Thermometer;
//import edu.umd.cs.piccolo.event.PBasicInputEventHandler;
//import edu.umd.cs.piccolo.event.PInputEvent;
//
///**
// * PNode that is used to represent thermometers in the tool box and that
// * controls the initial movement of thermometers in and out of the tool
// * box.
// *
// * @author John Blanco
// */
//public class ThermometerToolBoxNode extends ThermometerNode {
//
//  private final PhetPCanvas canvas;
//  private final ModelViewTransform modelViewTransform;
//  private Rectangle2D returnRect = null;
//
//  public ThermometerToolBoxNode( final MovableThermometerNode thermometerNode, ModelViewTransform modelViewTransform, PhetPCanvas canvas ) {
//    this.canvas = canvas;
//    this.modelViewTransform = modelViewTransform;
//    final Thermometer thermometer = thermometerNode.getThermometer();
//    final Vector2D positioningOffset = modelViewTransform.viewToModelDelta( thermometerNode.getOffsetCenterShaftToTriangleTip() );
//
//    setSensedTemperature( EFACConstants.ROOM_TEMPERATURE );
//    setSensedColor( Color.WHITE );
//
//    // This node's visibility is the inverse of the thermometer's.
//    thermometer.active.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean active ) {
//        setVisible( !active );
//      }
//    } );
//
//    addInputEventListener( new PBasicInputEventHandler() {
//      @Override public void mousePressed( PInputEvent event ) {
//        thermometer.active.set( true );
//        thermometer.userControlled.set( true );
//        thermometer.position.set( new Vector2D( getModelPosition( event.getCanvasPosition() ) ).plus( positioningOffset ) );
//      }
//
//      @Override public void mouseDragged( PInputEvent event ) {
//        thermometer.position.set( new Vector2D( getModelPosition( event.getCanvasPosition() ) ).plus( positioningOffset ) );
//      }
//
//      @Override public void mouseReleased( PInputEvent event ) {
//        thermometer.userControlled.set( false );
//        if ( returnRect !== null && thermometerNode.getFullBoundsReference().intersects( returnRect ) ){
//          // Released over tool box, so return it.
//          thermometer.active.set( false );
//        }
//      }
//    } );
//  }
//
//  /**
//   * Convert the canvas position to the corresponding location in the model.
//   */
//  private Point2D getModelPosition( Point2D canvasPos ) {
//    Point2D worldPos = new Point2D.Double( canvasPos.getX(), canvasPos.getY() );
//    canvas.getPhetRootNode().screenToWorld( worldPos );
//    Point2D adjustedWorldPos = new Point2D.Double( worldPos.getX(), worldPos.getY() );
//    return modelViewTransform.viewToModel( adjustedWorldPos );
//  }
//
//  public void setReturnRect( Rectangle2D returnRect ) {
//    this.returnRect = returnRect;
//  }
//}


