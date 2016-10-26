// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model element that represents a beaker that can contain other thermal model elements.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunkWanderController' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Rectangle = require( 'DOT/Rectangle' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {Vector2} initialPosition
   * @param {number} width
   * @param {number} height
   * @param potentiallyContainedElements
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function BeakerContainer( initialPosition, width, height, potentiallyContainedElements, energyChunksVisibleProperty ) {
    Beaker.call( this, initialPosition, width, height, energyChunksVisibleProperty );
    this.potentiallyContainedElements = potentiallyContainedElements;
  }

  energyFormsAndChanges.register( 'BeakerContainer', BeakerContainer );

  return inherit( Beaker, BeakerContainer, {

    /**
     * Update the fluid level in the beaker based upon any displacement that
     * could be caused by the given rectangles. This algorithm is strictly
     * two dimensional, even though displacement is more of the 3D concept.
     *
     * @param {Rectangle[]} potentiallyDisplacingRectangles
     *
     */
    updateFluidLevel: function( potentiallyDisplacingRectangles ) {

      // Calculate the amount of overlap between the rectangle that
      // represents the fluid and the displacing rectangles.
      var fluidRectangle = new Rectangle(
        this.getBounds().minX,
        this.getBounds().minY,
        this.width,
        this.height * this.fluidLevel );

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
      this.fluidLevel = newFluidLevel;

      // Update the shapes of the energy chunk slices.
      this.slices.forEach( function( slice ) {

        var originalShape = slice.shape;
        var expandedOrCompressedShape = originalShape.transformed( Matrix3.scaling( 1, proportionateIncrease ) );
        var translationTransform = Matrix3.translation(
          originalShape.bounds.minX - expandedOrCompressedShape.bounds.minX,
          originalShape.bounds.y - expandedOrCompressedShape.bounds.y );
        slice.shape = expandedOrCompressedShape.transformed( translationTransform );

      } );
    },

    /**
     * @private
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
     */
    isEnergyChunkObscured: function( energyChunk ) {
      var self = this;
      var isObscured = false;

      this.potentiallyContainedElements.forEach( function( element ) {
        if ( self.getThermalContactArea().containsBounds( element.getBounds() ) &&
          element.getProjectedShape().contains( energyChunk.positionProperty.value ) ) {
          isObscured = true;
          return;
        }
      } );

      return isObscured;
    },

    /**
     *
     * @param {number} dt
     */
    animateNonContainedEnergyChunks: function( dt ) {

      var self = this;
      var controllers = this.energyChunkWanderControllers.slice( 0 );

      controllers.forEach( function( controller ) {
        var ec = controller.getEnergyChunk();

        // This chunk is being transferred from a container in the
        // beaker to the fluid, so move it sideways.
        if ( self.isEnergyChunkObscured( ec ) ) {
          var xVel = 0.05 * dt * ( self.getCenterPoint().getX() > ec.position.x ? -1 : 1 );
          var motionVector = new Vector2( xVel, 0 );
          ec.translate( motionVector );
        }

        // Wander chunk towards the container
        else {
          controller.updatePosition( dt );
        }

        // Chunk is in a place where it can migrate to the slices and
        // stop moving.
        if ( !self.isEnergyChunkObscured( ec ) && self.getSliceBounds().containsPoint( ec.position ) ) {
          self.moveEnergyChunkToSlices( controller.getEnergyChunk() );
        }
      } );
    },

    /**
     * *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      if ( this.isEnergyChunkObscured( energyChunk ) ) {
        // because the chunk just came from the model element.
        energyChunk.zPosition.set( 0.0 );
        this.approachingEnergyChunks.add( energyChunk );
        this.energyChunkWanderControllers.add(
          new EnergyChunkWanderController( energyChunk, this.positionProperty, null /* no motion restraint */ ) );
      } else {
        Beaker.prototype.addEnergyChunk.call( this, energyChunk );
      }
    }
  } );
} );

