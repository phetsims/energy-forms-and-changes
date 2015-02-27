// Copyright 2002-2015, University of Colorado

/**
 * Drag handler for objects that can be moved by the user.  This is constructed
 * with a constraint function that defines where the model object can go.
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
//  var Vector2 = require( 'DOT/Vector2' );
  // var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/intro/model/UserMovableModelElement' );
//  var Node = require('SCENERY/nodes/Node');
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /*
   * Constructor.  The node must be property positioned before calling
   * this, or it won't work correctly.
   */
  function ThermalElementDragHandler( modelElement, node, modelViewTransform, constraint ) {
    this.modelElement = modelElement;
    SimpleDragHandler.call( this, {

      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      // Handler that moves the particle in model space.
      translate: function( translationParams ) {
        modelElement.position = modelElement.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
        return translationParams.position;
      },

      start: function( event, trail ) {
        modelElement.userControlled = true;
      },

      end: function( event, trail ) {
        modelElement.userControlled = false;
      }
    } );
  }

  return inherit( SimpleDragHandler, ThermalElementDragHandler );
} );


//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.geom.Point2D;
//
//import edu.colorado.phet.common.phetcommon.util.function.Function1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.piccolophet.event.RelativeDragHandler;
//import edu.colorado.phet.energyformsandchanges.intro.model.UserMovableModelElement;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.event.PInputEvent;
//
///**
// * Drag handler for objects that can be moved by the user.  This is constructed
// * with a constraint function that defines where the model object can go.
// */
//public class ThermalElementDragHandler extends RelativeDragHandler {
//
//  private final UserMovableModelElement modelElement;
//
//  /*
//   * Constructor.  The node must be property positioned before calling
//   * this, or it won't work correctly.
//   */
//  public ThermalElementDragHandler( UserMovableModelElement modelElement, PNode node, ModelViewTransform modelViewTransform, Function1<Point2D, Point2D> constraint ) {
//    super( node, modelViewTransform, modelElement.position, constraint );
//    this.modelElement = modelElement;
//  }
//
//  @Override public void mousePressed( PInputEvent event ) {
//    super.mousePressed( event );
//    modelElement.userControlled.set( true );
//  }
//
//  @Override public void mouseReleased( PInputEvent event ) {
//    super.mouseReleased( event );
//    modelElement.userControlled.set( false );
//  }
//}

