// Copyright 2014-2018, University of Colorado Boulder

/**
 * drag handler for objects that can be moved by the user
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
   * @param {UserMovableModelElement} modelElement
   * @param {Node} node
   * @param {ModelViewTransform2} modelViewTransform
   */
  function ThermalElementDragHandler( modelElement, node, modelViewTransform ) {
    this.modelElement = modelElement;

    MovableDragHandler.call( this, modelElement.positionProperty, {

      // allow moving a finger (touch) across a node to pick it up
      allowTouchSnag: true,

      modelViewTransform: modelViewTransform,

      dragBounds: modelViewTransform.viewToModelBounds( new Bounds2( 0, 0, 1024, 618 ) ),

      startDrag: function( event ) {
        modelElement.userControlledProperty.set( true );
      },

      endDrag: function( event ) {
        modelElement.userControlledProperty.set( false );
      },

      onDrag: function( event ) {
      }

    } );
  }

  energyFormsAndChanges.register( 'ThermalElementDragHandler', ThermalElementDragHandler );

  return inherit( MovableDragHandler, ThermalElementDragHandler );
} );
