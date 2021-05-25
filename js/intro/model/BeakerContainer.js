// Copyright 2014-2021, University of Colorado Boulder

/**
 * Model element that represents a beaker that can contain other thermal model elements.
 *
 * @author John Blanco
 */

import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import required from '../../../../phet-core/js/required.js';
import EFACConstants from '../../common/EFACConstants.js';
import Beaker from '../../common/model/Beaker.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// counter used by constructor to create unique IDs
let idCounter = 0;

class BeakerContainer extends Beaker {

  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {Array.<Block>} potentiallyContainedElements
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} config
   */
  constructor( initialPosition,
               width,
               height,
               potentiallyContainedElements,
               energyChunksVisibleProperty,
               energyChunkGroup,
               config ) {

    required( config.energyChunkWanderControllerGroup );

    super( initialPosition, width, height, energyChunksVisibleProperty, energyChunkGroup, config );

    // @public (read-only) {string} - id of this beaker
    this.id = `beaker-container-${idCounter++}`;

    // @private
    this.potentiallyContainedElements = potentiallyContainedElements;
  }

  /**
   * Update the fluid level in the beaker based upon any displacement that could be caused by the given rectangles.
   * This algorithm is strictly two dimensional, even though displacement is more of the 3D concept.
   * @param {Rectangle[]} potentiallyDisplacingRectangles
   * @public
   */
  updateFluidDisplacement( potentiallyDisplacingRectangles ) {

    // calculate the amount of overlap between the rectangle that represents the fluid and the displacing rectangles
    const fluidRectangle = new Rectangle(
      this.getBounds().minX,
      this.getBounds().minY,
      this.width,
      this.height * this.fluidProportionProperty.value
    );

    let overlappingArea = 0;
    potentiallyDisplacingRectangles.forEach( rectangle => {
      if ( rectangle.intersectsBounds( fluidRectangle ) ) {
        const intersection = rectangle.intersection( fluidRectangle );
        overlappingArea += intersection.width * intersection.height;
      }
    } );

    // Map the overlap to a new fluid level.  The scaling factor was empirically determined to look good.
    const newFluidProportion = Math.min( EFACConstants.INITIAL_FLUID_PROPORTION + overlappingArea * 120, 1 );
    this.fluidProportionProperty.set( newFluidProportion );
  }

  /**
   * @param {EnergyChunk} energyChunk
   * @returns {boolean}
   * @private
   */
  isEnergyChunkObscured( energyChunk ) {
    let isObscured = false;

    this.potentiallyContainedElements.forEach( element => {
      if ( this.thermalContactArea.containsBounds( element.getBounds() ) &&
           element.getProjectedShape().containsPoint( energyChunk.positionProperty.value ) ) {
        isObscured = true;
      }
    } );

    return isObscured;
  }

  /**
   * @param {number} dt
   * @override
   * @private
   */
  animateNonContainedEnergyChunks( dt ) {
    const controllers = this.energyChunkWanderControllers.slice();

    controllers.forEach( controller => {
      const ec = controller.energyChunk;

      // this chunk is being transferred from a container in the beaker to the fluid, so move it sideways
      if ( this.isEnergyChunkObscured( ec ) ) {
        const xVel = 0.05 * dt * ( this.getCenterPoint().x > ec.positionProperty.value.x ? -1 : 1 );
        ec.translate( xVel, 0 );
      }

      // wander chunk towards the container
      else {
        controller.updatePosition( dt );
      }

      // chunk is in a place where it can migrate to the slices and stop moving
      if ( !this.isEnergyChunkObscured( ec ) && this.getSliceBounds().containsPoint( ec.positionProperty.value ) ) {
        this.moveEnergyChunkToSlices( controller.energyChunk );
      }
    } );
  }

  /**
   * @param {EnergyChunk} energyChunk
   * @override
   * @public
   */
  addEnergyChunk( energyChunk ) {
    if ( this.isEnergyChunkObscured( energyChunk ) ) {

      // the chunk is obscured by a model element in the beaker, so move it to the front of the z-order
      energyChunk.zPositionProperty.set( 0 );
      this.approachingEnergyChunks.push( energyChunk );
      this.energyChunkWanderControllers.push(
        this.energyChunkWanderControllerGroup.createNextElement( energyChunk, this.positionProperty )
      );
    }
    else {
      super.addEnergyChunk( energyChunk );

      // If the energy chunk is above the beaker, it's coming from the air, and must be constrained to the width of
      // the beaker to avoid being clipped.
      const ecPosition = energyChunk.positionProperty.get();
      const beakerBounds = this.getBounds();
      if ( ecPosition.y > beakerBounds.maxY &&
           ecPosition.x > beakerBounds.minX &&
           ecPosition.x < beakerBounds.maxX ) {

        const wanderController = _.find( this.energyChunkWanderControllers.getArray(), controller => {
          return controller.energyChunk === energyChunk;
        } );

        assert && assert( wanderController, 'no wander controller found for energy chunk' );

        // Set the horizontal motion constraint to be slightly narrower than the beaker to account for the width of
        // the energy chunk nodes.
        wanderController.setHorizontalWanderConstraint( new Range(
          beakerBounds.minX + beakerBounds.width * 0.1,
          beakerBounds.maxX - beakerBounds.width * 0.1
        ) );
      }
    }
  }
}

energyFormsAndChanges.register( 'BeakerContainer', BeakerContainer );
export default BeakerContainer;