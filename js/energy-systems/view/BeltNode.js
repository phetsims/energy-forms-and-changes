// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node representing a belt that connects two circular items, like a fan belt in an automobile
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {Belt} belt
   * @param {modelViewTransform2} modelViewTransform
   */
  function BeltNode( belt, modelViewTransform ) {

    Node.call( this );

    // create the wheel shape parameters
    var wheel1Radius = modelViewTransform.modelToViewDeltaX( belt.wheel1Radius );
    var wheel1Center = modelViewTransform.modelToViewPosition( belt.wheel1Center );
    var wheel2Radius = modelViewTransform.modelToViewDeltaX( belt.wheel2Radius );
    var wheel2Center = modelViewTransform.modelToViewPosition( belt.wheel2Center );

    var wheel1CenterToWheelTwoCenter = wheel2Center.minus( wheel1Center );
    var wheel1ToOneEdge = wheel1CenterToWheelTwoCenter.perpendicular().withMagnitude( wheel1Radius );
    var wheel2ToOneEdge = wheel1CenterToWheelTwoCenter.perpendicular().withMagnitude( wheel2Radius );

    // create a shape that will connect the two circles in a belt-like shape
    var points = [];
    points.push( wheel1Center.plus( wheel1ToOneEdge ) );
    points.push( wheel1Center.minus( wheel1ToOneEdge ) );
    points.push( wheel2Center.minus( wheel2ToOneEdge ) );
    points.push( wheel2Center.plus( wheel2ToOneEdge ) );

    var beltShape = new Shape();
    var arcAngle = wheel1ToOneEdge.angle() + Math.PI;

    // arc around bike wheel
    beltShape.arc( wheel1Center.x, wheel1Center.y, wheel1Radius, arcAngle, arcAngle + Math.PI, false );
    beltShape.moveToPoint( points[ 1 ] ); // bottom of bike wheel
    beltShape.lineToPoint( points[ 2 ] ); // bottom of generator wheel

    // arc around generator wheel
    beltShape.arc( wheel2Center.x, wheel2Center.y, wheel2Radius, arcAngle, arcAngle + Math.PI, true );
    beltShape.moveToPoint( points[ 3 ] ); // top of generator wheel
    beltShape.lineToPoint( points[ 0 ] ); // top of bike wheel

    // create the actual node
    var beltPath = new Path( beltShape, {
      stroke: 'black',
      lineWidth: 5,
      lineCap: 'butt',
      lineJoin: 'round'
    } );

    this.addChild( beltPath );

    // control visibility of the belt
    var self = this;
    belt.isVisibleProperty.link( function( isVisible ) {
      self.setVisible( isVisible );
    } );
  }

  energyFormsAndChanges.register( 'BeltNode', BeltNode );

  return inherit( Node, BeltNode );
} );
