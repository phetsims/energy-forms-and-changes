// Copyright 2014-2018, University of Colorado Boulder

/**
 * drag handler for objects that can be moved by the user, used to constrain objects to the play area and to prevent
 * them from being dragged through one another
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );

  /**
   * @param {UserMovableModelElement} modelElement
   * @param {Node} node TODO: I (jbphet) don't think I need node, right?
   * @param {ModelViewTransform2} modelViewTransform
   * @param {function} constrainPosition
   */
  function ThermalElementDragHandler( modelElement, node, modelViewTransform, constrainPosition ) {

    var dragStartOffset = null;

    SimpleDragHandler.call( this, {

      // allow moving a finger (touch) across a node to pick it up
      allowTouchSnag: true,

      start: function( event, trail ) {
        modelElement.userControlledProperty.set( true );
        var modelElementViewPosition = modelViewTransform.modelToViewPosition( modelElement.positionProperty.get() );
        var dragStartPosition = trail.globalToLocalPoint( event.pointer.point );
        dragStartOffset = dragStartPosition.minus( modelElementViewPosition );
      },

      drag: function( event, trail ) {
        var dragPosition = trail.globalToLocalPoint( event.pointer.point );
        var modelElementViewPosition = dragPosition.minus( dragStartOffset );
        var modelElementPosition = modelViewTransform.viewToModelPosition( modelElementViewPosition );
        modelElement.positionProperty.set( constrainPosition( modelElement, modelElementPosition ) );
      },

      end: function( event ) {
        modelElement.userControlledProperty.set( false );
      }

    } );
  }

  energyFormsAndChanges.register( 'ThermalElementDragHandler', ThermalElementDragHandler );

  return inherit( SimpleDragHandler, ThermalElementDragHandler );
} );
