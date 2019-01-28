// Copyright 2014-2018, University of Colorado Boulder

/**
 * drag handler for objects that can be moved by the user, used to constrain objects to the play area and to prevent
 * them from being dragged through one another
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var DragListener = require( 'SCENERY/listeners/DragListener' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {UserMovableModelElement} modelElement
   * @param {Node} screenViewChildNode - the node that will be used to convert pointer positions to global coordinates
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} constrainPosition
   * @param {BooleanProperty} simIsPlayingProperty
   */
  function ThermalElementDragHandler(
    modelElement,
    screenViewChildNode,
    modelViewTransform,
    constrainPosition,
    simIsPlayingProperty
  ) {

    var dragStartOffset = new Vector2();
    var currentTarget = null;

    DragListener.call( this, {

      // allow moving a finger (touch) across a screenViewChildNode to pick it up
      allowTouchSnag: true,

      start: function( event ) {

        // make sure the sim is playing when an element is grabbed - this will resume the sim if it is paused
        simIsPlayingProperty.value = true;
        modelElement.userControlledProperty.set( true );
        var modelElementViewPosition = modelViewTransform.modelToViewPosition( modelElement.positionProperty.get() );
        currentTarget = event.currentTarget;
        var dragStartPosition = currentTarget.globalToParentPoint( event.pointer.point );
        dragStartOffset.setXY(
          dragStartPosition.x - modelElementViewPosition.x,
          dragStartPosition.y - modelElementViewPosition.y
        );
      },

      drag: function( event ) {
        var dragPosition = currentTarget.globalToParentPoint( event.pointer.point );
        var modelElementViewPosition = dragPosition.minus( dragStartOffset );
        var modelElementPosition = modelViewTransform.viewToModelPosition( modelElementViewPosition );
        modelElement.positionProperty.set( constrainPosition( modelElement, modelElementPosition ) );
      },

      end: function( event ) {
        modelElement.userControlledProperty.set( false );
        currentTarget = null;
      }

    } );
  }

  energyFormsAndChanges.register( 'ThermalElementDragHandler', ThermalElementDragHandler );

  return inherit( DragListener, ThermalElementDragHandler );
} );
