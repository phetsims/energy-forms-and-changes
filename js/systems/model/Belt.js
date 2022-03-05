// Copyright 2016-2022, University of Colorado Boulder

/**
 * A model element that represents a belt that connects two rotating wheels together, like a fan belt in an automobile
 * engine.
 *
 * Note to anyone who would like to reuse this: It was written to be reasonably general, but there wasn't a lot of
 * testing done to make sure it handles all cases of different wheel size and positions.  If this is ever moved into
 * common code, such testing should be done and any non-general behavior remedied. -jbphet, 11/2/2018
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import { Shape } from '../../../../kite/js/imports.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class Belt {

  /**
   * @param {number} wheel1Radius
   * @param {Vector2} wheel1Center
   * @param {number} wheel2Radius
   * @param {Vector2} wheel2Center
   */
  constructor( wheel1Radius, wheel1Center, wheel2Radius, wheel2Center ) {

    // Calculate the angle needed to make the belt look like it contacts the wheels at the right places, see
    // https://github.com/phetsims/energy-forms-and-changes/issues/98.
    const contactAngle = Math.asin( ( wheel2Radius - wheel1Radius ) / wheel1Center.distance( wheel2Center ) );

    // vectors needed to create the belt shape
    const wheel1CenterToWheelTwoCenter = wheel2Center.minus( wheel1Center );
    const wheel1CenterToArcEnd =
      wheel1CenterToWheelTwoCenter.perpendicular.withMagnitude( wheel1Radius ).rotated( -contactAngle );
    const wheel1CenterToArcStart = wheel1CenterToArcEnd.rotated( Math.PI + 2 * contactAngle );
    const wheel2CenterToArcStart =
      wheel1CenterToWheelTwoCenter.perpendicular.withMagnitude( wheel2Radius ).rotated( -contactAngle );
    const wheel2CenterToArcEnd = wheel2CenterToArcStart.rotated( Math.PI + 2 * contactAngle );

    // create the shape of the belt
    const beltShape = new Shape();
    beltShape.moveToPoint( wheel1Center.plus( wheel1CenterToArcStart ) );
    beltShape.arcPoint(
      wheel1Center,
      wheel1Radius,
      wheel1CenterToArcStart.angle,
      wheel1CenterToArcEnd.angle,
      false
    );
    beltShape.lineToPoint( wheel2Center.plus( wheel2CenterToArcStart ) );
    beltShape.arcPoint(
      wheel2Center,
      wheel2Radius,
      wheel2CenterToArcStart.angle,
      wheel2CenterToArcEnd.angle
    );
    beltShape.lineToPoint( wheel1Center.plus( wheel1CenterToArcStart ) );
    beltShape.close();

    // @public (read-only) {Shape}
    this.beltShape = beltShape;

    // @public {BooleanProperty}
    this.isVisibleProperty = new BooleanProperty( false );
  }
}

energyFormsAndChanges.register( 'Belt', Belt );
export default Belt;