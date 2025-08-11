// Copyright 2016-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * model of a cloud that can block energy coming from the sun
 *
 * @author  John Blanco
 * @author  Andrew Adare
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// constants
const WIDTH = 0.035; // In meters, though obviously not to scale.  Empirically determined.
const HEIGHT = WIDTH * 0.55; // determined from the approximate aspect ratio of the image

class Cloud {

  // Existence strength, which basically translates to opacity, of the cloud
  public readonly existenceStrengthProperty: NumberProperty;

  // Offset position for this cloud
  public readonly offsetFromParent: Vector2;

  // Used to calculate this cloud's position
  private readonly parentPositionProperty: Property<Vector2>;

  // The ellipse that defines the shape of this cloud. only null until the parent position is linked
  private cloudEllipse: Shape | null;

  public constructor( offsetFromParent: Vector2, parentPositionProperty: Property<Vector2> ) {

    this.existenceStrengthProperty = new NumberProperty( 1, {
      range: new Range( 0, 1 )
    } );

    this.offsetFromParent = offsetFromParent;

    this.parentPositionProperty = parentPositionProperty;

    this.cloudEllipse = null;

    this.parentPositionProperty.link( parentPosition => {
      const center = parentPosition.plus( this.offsetFromParent );
      this.cloudEllipse = Shape.ellipse( center.x, center.y, WIDTH / 2, HEIGHT / 2, 0, 0, 0, false );
    } );
  }

  /**
   * return ellipse with size of this cloud
   * @returns ellipse with axes sized to width and height of cloud
   */
  public getCloudAbsorptionReflectionShape(): Shape {
    return this.cloudEllipse;
  }

  /**
   * @returns Center position of cloud
   */
  public getCenterPosition(): Vector2 {
    return this.parentPositionProperty.get().plus( this.offsetFromParent );
  }

}

// statics
Cloud.WIDTH = WIDTH;
Cloud.HEIGHT = HEIGHT;

energyFormsAndChanges.register( 'Cloud', Cloud );
export default Cloud;