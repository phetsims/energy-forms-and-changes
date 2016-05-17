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
  var EnergyChunkWanderController = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkWanderController' );
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
     * Update the fluid level in the beaker based upon any displacement that could be caused by the given rectangles.
     * This algorithm is strictly two dimensional, even though displacement is more of the 3D concept.
     *
     * @param {Rectangle[]} potentiallyDisplacingRectangles
     *
     */
    updateFluidLevel: function( potentiallyDisplacingRectangles ) {

      // Calculate the amount of overlap between the rectangle that represents the fluid and the displacing rectangles.
      var fluidRectangle = new Rectangle( this.getRectangleBounds().minX, this.getRectangleBounds().minY, this.width, this.height * this.fluidLevel );
      var overlappingArea = 0;
      potentiallyDisplacingRectangles.forEach( function( rectangle ) {
        if ( rectangle.intersectsBounds( fluidRectangle ) ) {
          var intersection = rectangle.intersection( fluidRectangle );
          overlappingArea += intersection.width * intersection.height;
        }
      } );

      // Map the overlap to a new fluid height.  The scaling factor was empirically determined to look good.
      var newFluidLevel = Math.min( EFACConstants.INITIAL_FLUID_LEVEL + overlappingArea * 120, 1 );
      var proportionateIncrease = newFluidLevel / this.fluidLevel;
      this.fluidLevel = newFluidLevel;

      // Update the shapes of the energy chunk slices.
      this.slices.forEach( function( slice ) {

        var originalShape = slice.shape;
        var expandedOrCompressedShape = originalShape.transformed( Matrix3.scaling( 1, proportionateIncrease ) );
        var translationTransform = Matrix3.translation( originalShape.bounds.minX - expandedOrCompressedShape.bounds.minX,
          originalShape.bounds.y - expandedOrCompressedShape.bounds.y );
        slice.shape = expandedOrCompressedShape.transformed( translationTransform );

      } );
    },

    /**
     * *
     * @private
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
     */
    isEnergyChunkObscured: function( energyChunk ) {
      this.potentiallyContainedElements.forEach( function( element ) {
        if ( this.getThermalContactArea().containsBounds( element.getRectangleBounds() ) && element.getProjectedShape().contains( energyChunk.position ) ) {
          return true;
        }
      } );
      return false;
    },

    /**
     *
     * @param {number} dt
     */
    animateNonContainedEnergyChunks: function( dt ) {
      this.energyChunkWanderControllers.slice( 0 ).forEach( function( energyChunkWanderController ) {
        var energyChunk = energyChunkWanderController.getEnergyChunk();
        if ( this.isEnergyChunkObscured( energyChunk ) ) {
          // beaker to the fluid, so move it sideways.
          var xVel = 0.05 * dt * ( this.getCenterPoint().getX() > energyChunk.position.x ? -1 : 1 );
          var motionVector = new Vector2( xVel, 0 );
          energyChunk.translate( motionVector );
        } else {
          energyChunkWanderController.updatePosition( dt );
        }
        if ( !this.isEnergyChunkObscured( energyChunk ) && this.getSliceBounds().contains( energyChunk.position ) ) {
          // stop moving.
          this.moveEnergyChunkToSlices( energyChunkWanderController.getEnergyChunk() );
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
        this.energyChunkWanderControllers.add( new EnergyChunkWanderController( energyChunk, this.positionProperty, null /* no motion restraint */ ) );
      } else {
        this.addEnergyChunk( energyChunk );
      }
    }
  } );
} );

