// Copyright 2016, University of Colorado Boulder

/**
 * a model element that represents a belt that connects two rotating wheels together, like a fan belt in an automobile
 * engine
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Shape = require( 'KITE/Shape' );

  /**
   * @param {number} wheel1Radius
   * @param {Vector2} wheel1Center
   * @param {number} wheel2Radius
   * @param {Vector2} wheel2Center
   * @constructor
   */
  function Belt( wheel1Radius, wheel1Center, wheel2Radius, wheel2Center ) {

    // vectors needed to create the shape
    var wheel1CenterToWheelTwoCenter = wheel2Center.minus( wheel1Center );
    var wheel1CenterToArcEnd = wheel1CenterToWheelTwoCenter.perpendicular().withMagnitude( wheel1Radius );
    var wheel1CenterToArcStart = wheel1CenterToArcEnd.rotated( Math.PI );
    var wheel2CenterToArcStart = wheel1CenterToWheelTwoCenter.perpendicular().withMagnitude( wheel2Radius );
    var wheel2CenterToArcEnd = wheel2CenterToArcStart.rotated( Math.PI );

    // create the shape of the belt
    var beltShape = new Shape();
    beltShape.moveToPoint( wheel1Center.plus( wheel1CenterToArcStart ) );
    beltShape.arcPoint(
      wheel1Center,
      wheel1Radius,
      wheel1CenterToArcStart.angle(),
      wheel1CenterToArcEnd.angle(),
      false
    );
    beltShape.lineToPoint( wheel2Center.plus( wheel2CenterToArcStart ) );
    beltShape.arcPoint(
      wheel2Center,
      wheel2Radius,
      wheel2CenterToArcStart.angle(),
      wheel2CenterToArcEnd.angle()
    );
    beltShape.lineToPoint( wheel1Center.plus( wheel1CenterToArcStart ) );
    beltShape.close();

    // @public (read-only) {Shape}
    this.beltShape = beltShape;

    // @public {BooleanProperty}
    this.isVisibleProperty = new Property( false );
  }

  energyFormsAndChanges.register( 'Belt', Belt );

  return inherit( Object, Belt );
} );
