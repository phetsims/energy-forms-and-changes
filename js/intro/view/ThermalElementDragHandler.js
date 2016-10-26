// Copyright 2014-2015, University of Colorado Boulder

/**
 * Drag handler for objects that can be moved by the user.  This is constructed with a constraint boundary that defines
 * where the model object can go.
 */
define( function( require ) {
  'use strict';

  var Bounds2 = require( 'DOT/Bounds2' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );

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
        modelElement.userControlledProperty.set( true );
      },

      endDrag: function( event ) {
        modelElement.userControlledProperty.set( false );
      },

      onDrag: function( event ) {
        // MovableDragHandler has set the proposed model position.
        modelElement.positionProperty.value = constraint.apply( modelElement.positionProperty.value );
      }

    } );
  }

  energyFormsAndChanges.register( 'ThermalElementDragHandler', ThermalElementDragHandler );

  return inherit( MovableDragHandler, ThermalElementDragHandler );
} );

