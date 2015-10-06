// Copyright 2002-2015, University of Colorado Boulder

/**
 * Drag handler for objects that can be moved by the user.  This is constructed with a constraint boundary that defines
 * where the model object can go.
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler =  require( 'SCENERY_PHET/input/MovableDragHandler' );
  var Bounds2 = require( 'DOT/Bounds2' );

  /**
   * Constructor for the ThermalElementDragHandler.  The node must be property positioned before calling this, or it
   * won't work correctly.
   *
   * @param {UserMovableModelElement} modelElement
   * @param {Node} node
   * @param {ModelViewTransform2} modelViewTransform
   * @param {ThermalItemMotionConstraint} constraint
   */
  function ThermalElementDragHandler( modelElement, node, modelViewTransform, constraint ) {
    this.modelElement = modelElement;

    MovableDragHandler.call( this, modelElement.positionProperty, {

      // Allow moving a finger (touch) across a node to pick it up.
      allowTouchSnag: true,

      modelViewTransform: modelViewTransform,

      //dragBounds: constraint.modelBounds,
      dragBounds: modelViewTransform.viewToModelBounds( new Bounds2( 0, 0, 1024, 618 ) ),

      startDrag: function( event ) {
        modelElement.userControlled = true;
      },

      endDrag: function( event ) {
        modelElement.userControlled = false;
      },

      onDrag: function( event ) {
        // MovableDragHandler has set the proposed model position.
        modelElement.position = constraint.apply( modelElement.position );
      }

      //// Handler that moves the particle in model space.
      //translate: function( translationParams ) {
      //  modelElement.position = constraint.apply( modelElement.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) ) );
      //  //modelElement.position = modelElement.position.plus( modelViewTransform.viewToModelDelta( translationParams.delta ) );
      //  return translationParams.position;
      //},

      //start: function( event, trail ) {
      //  MovableDragHandler.prototype.start.call( this );
      //  modelElement.userControlled = true;
      //},
      //
      //end: function( event, trail ) {
      //  SimpleDragHandler.prototype.end.call( this );
        //modelElement.userControlled = false;

    } );
  }

  return inherit( MovableDragHandler, ThermalElementDragHandler );
} );