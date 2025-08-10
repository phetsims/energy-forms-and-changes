// Copyright 2019-2022, University of Colorado Boulder

/**
 * A singleton that encapsulates the information and algorithms necessary to constrain the motion of model elements such
 * that they can't be dragged through one another.
 *
 * @author John Blanco
 * @author Chris Klusendorf
 */

import Bounds2 from '../../../../dot/js/Bounds2.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerContainer from './BeakerContainer.js';
import Block from './Block.js';

// constants

// minimum distance allowed between two objects, used to prevent floating point issues
const MIN_INTER_ELEMENT_DISTANCE = 1E-9; // in meters

// reusable items, avoids allocations
const reusableBounds = Bounds2.NOTHING.copy();

// the main singleton object definition
const efacPositionConstrainer = {

  /**
   * Evaluate whether the provided model element can be moved to the provided position without overlapping with other
   * solid model elements. If overlap would occur, adjust the position to one that works. Note that this is not
   * very general due to a number of special requirements for the Energy Forms and Changes sim, so it would likely not
   * be easy to reuse.
   * @param {RectangularThermalMovableModelElement} modelElement - element whose position is being checked
   * @param {Vector2} proposedPosition - the position where the model element would like to go
   * @param {PhetioGroup.<BeakerContainer>} beakerGroup - the beakers that are present in the model
   * @param {PhetioGroup.<Block>} blockGroup - the blocks that are present in the model
   * @param {Bounds2} burnerBlockingRect - the space occupied by the burners in the model
   * @returns {Vector2} the original proposed position if valid, or alternative position if not
   * @public
   */
  constrainPosition: ( modelElement, proposedPosition, beakerGroup, blockGroup, burnerBlockingRect ) => {

    assert && assert( beakerGroup instanceof PhetioGroup, 'invalid beakerGroup' );
    assert && assert( blockGroup instanceof PhetioGroup, 'invalid blockGroup' );

    const modelElementPosition = modelElement.positionProperty.get();

    // calculate the proposed motion
    let allowedTranslation = Vector2.pool.create(
      proposedPosition.x - modelElementPosition.x,
      proposedPosition.y - modelElementPosition.y
    );

    // get the current composite bounds of the model element
    const modelElementBounds = modelElement.getCompositeBoundsForPosition(
      modelElementPosition,
      reusableBounds
    );

    // create bounds that use the perspective compensation that is necessary for evaluating burner interaction
    const modelElementBoundsWithSidePerspective = Bounds2.pool.create(
      modelElementBounds.minX - modelElement.perspectiveCompensation.x,
      modelElementBounds.minY,
      modelElementBounds.maxX + modelElement.perspectiveCompensation.x,
      modelElementBounds.maxY
    );

    // validate against burner boundaries
    allowedTranslation = determineAllowedTranslation(
      modelElementBoundsWithSidePerspective,
      burnerBlockingRect,
      allowedTranslation.x,
      allowedTranslation.y,
      true,
      allowedTranslation
    );

    // now check the model element's motion against each of the beakers
    beakerGroup.forEach( beaker => {

      if ( beaker === modelElement ) {

        // don't test against self
        return;
      }

      // get the bounds set that describes the shape of the beaker
      const beakerBoundsList = beaker.translatedPositionTestingBoundsList;

      // if the modelElement is a block, it has x and y perspective comp that need to be used
      const modelElementBoundsWithTopAndSidePerspective = Bounds2.pool.create(
        modelElementBounds.minX - modelElement.perspectiveCompensation.x,
        modelElementBounds.minY - modelElement.perspectiveCompensation.y,
        modelElementBounds.maxX + modelElement.perspectiveCompensation.x,
        modelElementBounds.maxY + modelElement.perspectiveCompensation.y
      );

      // don't restrict the motion based on the beaker if the beaker is on top of this model element
      if ( !beaker.isStackedUpon( modelElement ) ) {

        // the code below assumes that the bounds list is in the order: left side, bottom, right side. this assertion
        // verifies that.
        assert && assert(
        beakerBoundsList[ 0 ].centerX < beakerBoundsList[ 1 ].centerX &&
        beakerBoundsList[ 1 ].centerX < beakerBoundsList[ 2 ].centerX,
          'beaker bounds list is out of order'
        );

        allowedTranslation = determineAllowedTranslation(
          modelElementBoundsWithTopAndSidePerspective,
          beakerBoundsList[ 0 ],
          allowedTranslation.x,
          allowedTranslation.y,
          true,
          allowedTranslation
        );
        allowedTranslation = determineAllowedTranslation(
          modelElementBoundsWithSidePerspective,
          beakerBoundsList[ 1 ],
          allowedTranslation.x,
          allowedTranslation.y,
          true,
          allowedTranslation
        );
        allowedTranslation = determineAllowedTranslation(
          modelElementBoundsWithTopAndSidePerspective,
          beakerBoundsList[ 2 ],
          allowedTranslation.x,
          allowedTranslation.y,
          true,
          allowedTranslation
        );
      }
      else {

        // if beaker A is stacked on the current modelElement, get beaker B directly as otherBeaker because currently
        // there can't be more than two beakers. this will need to be generalized to check for each other beaker that is not
        // stacked on this modelElement if the time comes when more than two beakers can exist.
        const otherBeaker = beakerGroup.getElement( 1 - beakerGroup.indexOf( beaker ) );

        // a second beaker may not exist
        if ( otherBeaker ) {

          // get the bounds of the other beaker and the bounds of the beaker stacked on top of this modelElement
          const otherBeakerBoundsList = otherBeaker.translatedPositionTestingBoundsList;
          const currentBeakerBounds = beaker.getBounds();

          allowedTranslation = determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 0 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
          allowedTranslation = determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 1 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
          allowedTranslation = determineAllowedTranslation(
            currentBeakerBounds,
            otherBeakerBoundsList[ 2 ],
            allowedTranslation.x,
            allowedTranslation.y,
            true,
            allowedTranslation
          );
        }
      }

      modelElementBoundsWithTopAndSidePerspective.freeToPool();
    } );

    // now check the model element's motion against each of the blocks
    blockGroup.forEach( block => {

      if ( block === modelElement ) {

        // don't test against self
        return;
      }

      const blockBounds = block.getBounds();

      // Do not restrict the model element's motion in positive Y direction if the tested block is sitting on top of
      // the model element - the block will simply be lifted up.
      const isBlockStackedInBeaker = block.isStackedUpon( modelElement );

      if ( modelElement instanceof Block ) {

        allowedTranslation = determineAllowedTranslation(
          modelElement.getBounds(),
          blockBounds,
          allowedTranslation.x,
          allowedTranslation.y,
          !isBlockStackedInBeaker, // don't restrict in Y direction if this block is sitting in the beaker
          allowedTranslation
        );
      }
      else {

        // make sure this is a beaker before going any further
        assert && assert( modelElement instanceof BeakerContainer, 'unrecognized model element type' );

        // Test to see if the beaker's motion needs to be constrained due to the block's position, but *don't* do this
        // if the block is sitting inside the beaker, since it will be dragged along with the beaker's motion.
        if ( !isBlockStackedInBeaker ) {

          // Use the perspective-compensated edge of the block instead of the model edge in order to simplify z-order
          // handling.
          const perspectiveBlockBounds = Bounds2.pool.create(
            blockBounds.minX - blockGroup.getElement( 0 ).perspectiveCompensation.x,
            blockBounds.minY,
            blockBounds.maxX + blockGroup.getElement( 0 ).perspectiveCompensation.x,
            blockBounds.maxY
          );

          // Clamp the translation of the beaker based on the test block's position.  This uses the sides of the beaker
          // and not it's outline so that the block can go inside.
          modelElement.translatedPositionTestingBoundsList.forEach( beakerEdgeBounds => {
            allowedTranslation = determineAllowedTranslation(
              beakerEdgeBounds,
              perspectiveBlockBounds,
              allowedTranslation.x,
              allowedTranslation.y,
              !isBlockStackedInBeaker,
              allowedTranslation
            );
          } );

          perspectiveBlockBounds.freeToPool();
        }
      }
    } );

    const newPosition = modelElementPosition.plus( allowedTranslation );

    // free reusable vectors and bounds
    allowedTranslation.freeToPool();
    modelElementBoundsWithSidePerspective.freeToPool();

    return newPosition;
  }
};

/**
 * Helper function to determine the portion of a proposed translation that may occur given a moving rectangle and a
 * stationary rectangle that can block the moving one.
 * @param {Bounds2} movingElementBounds
 * @param {Bounds2} stationaryElementBounds
 * @param {number} proposedTranslationX
 * @param {number} proposedTranslationY
 * @param {boolean} restrictPosY        Flag that controls whether the positive Y direction is restricted.  This
 *                                      is often set false if there is another model element on top of the one
 *                                      being tested.
 * @param {Vector2} [result] - optional vector to be reused
 * @returns {Vector2}
 */
function determineAllowedTranslation( movingElementBounds, stationaryElementBounds, proposedTranslationX,
                                      proposedTranslationY, restrictPosY, result ) {

  result = result || new Vector2();

  // test for case where rectangles already overlap
  if ( exclusiveIntersectsBounds( movingElementBounds, stationaryElementBounds ) && restrictPosY ) {

    // determine the motion in the X & Y directions that will "cure" the overlap
    let xOverlapCure = 0;
    if ( movingElementBounds.maxX >= stationaryElementBounds.minX &&
         movingElementBounds.minX <= stationaryElementBounds.minX ) {

      xOverlapCure = stationaryElementBounds.minX - movingElementBounds.maxX;
    }
    else if ( stationaryElementBounds.maxX >= movingElementBounds.minX &&
              stationaryElementBounds.minX <= movingElementBounds.minX ) {

      xOverlapCure = stationaryElementBounds.maxX - movingElementBounds.minX;
    }
    let yOverlapCure = 0;
    if ( movingElementBounds.maxY >= stationaryElementBounds.minY &&
         movingElementBounds.minY <= stationaryElementBounds.minY ) {

      yOverlapCure = stationaryElementBounds.minY - movingElementBounds.maxY;
    }
    else if ( stationaryElementBounds.maxY >= movingElementBounds.minY &&
              stationaryElementBounds.minY <= movingElementBounds.minY ) {

      yOverlapCure = stationaryElementBounds.maxY - movingElementBounds.minY;
    }

    // Something is wrong with algorithm if both values are zero, since overlap was detected by the "intersects"
    // method.
    assert && assert(
      !( xOverlapCure === 0 && yOverlapCure === 0 ),
      'xOverlap and yOverlap should not both be zero'
    );

    // return a vector with the smallest valid "cure" value, leaving the other translation value unchanged
    if ( xOverlapCure !== 0 && Math.abs( xOverlapCure ) < Math.abs( yOverlapCure ) ) {
      return result.setXY( xOverlapCure, proposedTranslationY );
    }
    else {
      return result.setXY( proposedTranslationX, yOverlapCure );
    }
  }

  let xTranslation = proposedTranslationX;
  let yTranslation = proposedTranslationY;
  const motionTestBounds = Bounds2.pool.fetch();

  // X direction
  if ( proposedTranslationX > 0 ) {

    // check for collisions moving right
    motionTestBounds.setMinMax(
      movingElementBounds.maxX,
      movingElementBounds.minY,
      movingElementBounds.maxX + xTranslation,
      movingElementBounds.maxY
    );

    if ( exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

      // collision detected, limit motion in this direction
      xTranslation = stationaryElementBounds.minX - movingElementBounds.maxX - MIN_INTER_ELEMENT_DISTANCE;
    }
  }
  else if ( proposedTranslationX < 0 ) {

    // check for collisions moving left
    motionTestBounds.setMinMax(
      movingElementBounds.minX + xTranslation,
      movingElementBounds.minY,
      movingElementBounds.minX,
      movingElementBounds.maxY
    );

    if ( exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

      // collision detected, limit motion in this direction
      xTranslation = stationaryElementBounds.maxX - movingElementBounds.minX + MIN_INTER_ELEMENT_DISTANCE;
    }
  }

  // Y direction.
  if ( proposedTranslationY > 0 && restrictPosY ) {

    // check for collisions moving up
    motionTestBounds.setMinMax(
      movingElementBounds.minX,
      movingElementBounds.maxY,
      movingElementBounds.maxX,
      movingElementBounds.maxY + yTranslation
    );

    if ( exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

      // collision detected, limit motion
      yTranslation = stationaryElementBounds.minY - movingElementBounds.maxY - MIN_INTER_ELEMENT_DISTANCE;
    }
  }
  else if ( proposedTranslationY < 0 ) {

    // check for collisions moving down
    motionTestBounds.setMinMax(
      movingElementBounds.minX,
      movingElementBounds.minY + yTranslation,
      movingElementBounds.maxX,
      movingElementBounds.minY
    );

    if ( exclusiveIntersectsBounds( motionTestBounds, stationaryElementBounds ) ) {

      // collision detected, limit motion
      yTranslation = stationaryElementBounds.maxY - movingElementBounds.minY - MIN_INTER_ELEMENT_DISTANCE;
    }
  }

  return result.setXY( xTranslation, yTranslation );
}

/**
 * a version of Bounds2.intersectsBounds that doesn't count equal edges as intersection
 * @param {Bounds2} bounds1
 * @param {Bounds2} bounds2
 * @returns {boolean}
 * @public
 */
function exclusiveIntersectsBounds( bounds1, bounds2 ) {
  const minX = Math.max( bounds1.minX, bounds2.minX );
  const minY = Math.max( bounds1.minY, bounds2.minY );
  const maxX = Math.min( bounds1.maxX, bounds2.maxX );
  const maxY = Math.min( bounds1.maxY, bounds2.maxY );
  return ( maxX - minX ) > 0 && ( maxY - minY > 0 );
}

energyFormsAndChanges.register( 'efacPositionConstrainer', efacPositionConstrainer );
export default efacPositionConstrainer;