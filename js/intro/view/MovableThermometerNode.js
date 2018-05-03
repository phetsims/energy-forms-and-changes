// Copyright 2014-2018, University of Colorado Boulder

/**
 * a node that represents a thermometer in the view that can be positioned by the user
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MovableDragHandler = require( 'SCENERY_PHET/input/MovableDragHandler' );
  var SensingThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/SensingThermometerNode' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Thermometer} thermometer
   * @param {Dimension2} dragBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function MovableThermometerNode( thermometer, dragBounds, modelViewTransform ) {

    var self = this;
    SensingThermometerNode.call( this, thermometer );

    this.addInputListener( new MovableDragHandler( thermometer.positionProperty, {
      modelViewTransform: modelViewTransform,
      dragBounds: modelViewTransform.viewToModelBounds( dragBounds )
    } ) );

    // update the offset when the model position changes
    thermometer.positionProperty.link( function( position ) {
      self.translation = new Vector2(
        modelViewTransform.modelToViewX( position.x ),
        modelViewTransform.modelToViewY( position.y ) - ( self.height / 2 + self.triangleTipOffset.height )
      );
    } );
  }

  energyFormsAndChanges.register( 'MovableThermometerNode', MovableThermometerNode );

  return inherit( SensingThermometerNode, MovableThermometerNode );
} );
