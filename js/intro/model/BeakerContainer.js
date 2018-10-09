// Copyright 2014-2018, University of Colorado Boulder

/**
 * Model element that represents a beaker that can contain other thermal model elements.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  // counter used by constructor to create unique IDs
  var idCounter = 0;

  /**
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param {Array.<Block>} potentiallyContainedElements
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {Object} [options]
   * @constructor
   */
  function BeakerContainer(
    initialPosition,
    width,
    height,
    potentiallyContainedElements,
    energyChunksVisibleProperty,
    options
  ) {
    Beaker.call( this, initialPosition, width, height, energyChunksVisibleProperty, options );

    // @public (read-only) {string} - id of this beaker
    this.id = 'beaker-container-' + idCounter++;

    // @private
    this.potentiallyContainedElements = potentiallyContainedElements;
  }

  energyFormsAndChanges.register( 'BeakerContainer', BeakerContainer );

  return inherit( Beaker, BeakerContainer, {

    /**
     * Update the fluid level in the beaker based upon any displacement that could be caused by the given rectangles.
     * This algorithm is strictly two dimensional, even though displacement is more of the 3D concept.
     * @param {Rectangle[]} potentiallyDisplacingRectangles
     * @public
     *
     */
    updateFluidLevel: function( potentiallyDisplacingRectangles ) {
      var self = this;

      // calculate the amount of overlap between the rectangle that represents the fluid and the displacing rectangles
      var fluidRectangle = new Rectangle(
        this.getBounds().minX,
        this.getBounds().minY,
        this.width,
        this.height * this.fluidLevelProperty.value
      );

      var overlappingArea = 0;
      potentiallyDisplacingRectangles.forEach( function( rectangle ) {
        if ( rectangle.intersectsBounds( fluidRectangle ) ) {
          var intersection = rectangle.intersection( fluidRectangle );
          overlappingArea += intersection.width * intersection.height;
        }
      } );

      // Map the overlap to a new fluid height.  The scaling factor was empirically determined to look good.
      var newFluidLevel = Math.min( EFACConstants.INITIAL_FLUID_LEVEL + overlappingArea * 120, 1 );
      var proportionateIncrease = newFluidLevel / this.fluidLevelProperty.value;
      this.fluidLevelProperty.set( newFluidLevel );

      // update the shapes of the energy chunk slices
      this.slices.forEach( function( slice ) {
        var originalShape = slice.shape;
        var expandedOrCompressedShape = originalShape.transformed( Matrix3.scaling( 1, proportionateIncrease ) );
        if ( expandedOrCompressedShape.bounds.height < self.height ) {
          var translationTransform = Matrix3.translation(
            originalShape.bounds.minX - expandedOrCompressedShape.bounds.minX,
            originalShape.bounds.y - expandedOrCompressedShape.bounds.y
          );
          slice.shape = expandedOrCompressedShape.transformed( translationTransform );
        }
      } );
    },

    /**
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
     * @private
     */
    isEnergyChunkObscured: function( energyChunk ) {
      var self = this;
      var isObscured = false;

      this.potentiallyContainedElements.forEach( function( element ) {
        if ( self.thermalContactArea.containsBounds( element.getBounds() ) &&
             element.getProjectedShape().containsPoint( energyChunk.positionProperty.value ) ) {
          isObscured = true;
        }
      } );

      return isObscured;
    },

    /**
     * @param {number} dt
     * @override
     */
    animateNonContainedEnergyChunks: function( dt ) {

      var self = this;
      var controllers = this.energyChunkWanderControllers.slice( 0 );

      controllers.forEach( function( controller ) {
        var ec = controller.energyChunk;

        // this chunk is being transferred from a container in the beaker to the fluid, so move it sideways
        if ( self.isEnergyChunkObscured( ec ) ) {
          var xVel = 0.05 * dt * ( self.getCenterPoint().getX() > ec.positionProperty.value.x ? -1 : 1 );
          var motionVector = new Vector2( xVel, 0 );
          ec.translate( motionVector );
        }

        // wander chunk towards the container
        else {
          controller.updatePosition( dt );
        }

        // chunk is in a place where it can migrate to the slices and stop moving
        if ( !self.isEnergyChunkObscured( ec ) && self.getSliceBounds().containsPoint( ec.positionProperty.value ) ) {
          self.moveEnergyChunkToSlices( controller.energyChunk );
        }
      } );
    },

    /**
     * @param {EnergyChunk} energyChunk
     * @override
     */
    addEnergyChunk: function( energyChunk ) {
      if ( this.isEnergyChunkObscured( energyChunk ) ) {

        // the chunk is obscured by a model element in the beaker, so move it to the front of the z-order
        energyChunk.zPositionProperty.set( 0.0 );
        this.approachingEnergyChunks.add( energyChunk );
        this.energyChunkWanderControllers.add(
          new EnergyChunkWanderController( energyChunk, this.positionProperty, null /* no motion restraint */ )
        );
      } else {
        Beaker.prototype.addEnergyChunk.call( this, energyChunk );
      }
    }
  } );
} );

