// Copyright 2002-2015, University of Colorado

/**
 * Model element that represents a beaker that can contain other thermal
 * model elements.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/common/model/Beaker' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Rectangle = require( 'KITE/Rectangle' );
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

  return inherit( Beaker, BeakerContainer, {

    /*
     * Update the fluid level in the beaker based upon any displacement that
     * could be caused by the given rectangles.  This algorithm is strictly
     * two dimensional, even though displacement is more of the 3D concept.
     *
     * @param potentiallyDisplacingRectangles
     *
     */
    updateFluidLevel: function( potentiallyDisplacingRectangles ) {
      // represents the fluid and the displacing rectangles.
      var fluidRectangle = new Rectangle( this.getRect().getX(), this.getRect().getY(), this.width, this.height * this.fluidLevel );
      var overlappingArea = 0;
      for ( var rectangle in potentiallyDisplacingRectangles ) {
        if ( rectangle.intersects( fluidRectangle ) ) {
          var intersection = rectangle.createIntersection( fluidRectangle );
          overlappingArea += intersection.getWidth() * intersection.getHeight();
        }
      }
      // empirically determined to look good.
      var newFluidLevel = Math.min( INITIAL_FLUID_LEVEL + overlappingArea * 120, 1 );
      var proportionateIncrease = newFluidLevel / this.fluidLevel;
      this.fluidLevel.set( newFluidLevel );
      // Update the shapes of the energy chunk slices.
      slices.forEach( function( slice )
      {
        var originalShape = slice.shape;
        var expandedOrCompressedShape = AffineTransform.getScaleInstance( 1, proportionateIncrease ).createTransformedShape( originalShape );
        var translationTransform = AffineTransform.getTranslateInstance( originalShape.bounds.getX() - expandedOrCompressedShape.bounds.getX(), originalShape.bounds.getY() - expandedOrCompressedShape.bounds.getY() );
        slice.setShape( translationTransform.createTransformedShape( expandedOrCompressedShape ) );
      } );
    },

    /**
     * *
     * @private
     * @param {EnergyChunk} energyChunk
     * @returns {boolean}
     */
    isEnergyChunkObscured: function( energyChunk ) {
      for ( var i = 0; i < this.potentiallyContainedElements.length; i++ ) {
        element = this.potentiallyContainedElements[ i ];
        if ( this.getThermalContactArea().getBounds().contains( element.getRect() ) && element.getProjectedShape().contains( energyChunk.position ) ) {
          return true;
        }
      }
      return false;
    },

    /**
     *
     * @param {number} dt
     */
    animateNonContainedEnergyChunks: function( dt ) {
      for ( var energyChunkWanderController in new ArrayList( energyChunkWanderControllers ) ) {
        var energyChunk = energyChunkWanderController.getEnergyChunk();
        if ( this.isEnergyChunkObscured( energyChunk ) ) {
          // beaker to the fluid, so move it sideways.
          var xVel = 0.05 * dt * ( this.getCenterPoint().getX() > energyChunk.position.x ? -1 : 1);
          var motionVector = new Vector2( xVel, 0 );
          energyChunk.translate( motionVector );
        }
        else {
          energyChunkWanderController.updatePosition( dt );
        }
        if ( !this.isEnergyChunkObscured( energyChunk ) && getSliceBounds().contains( energyChunk.position ) ) {
          // stop moving.
          moveEnergyChunkToSlices( energyChunkWanderController.getEnergyChunk() );
        }
      }
    },

    /**
     * *
     * @param {EnergyChunk} energyChunk
     */
    addEnergyChunk: function( energyChunk ) {
      if ( this.isEnergyChunkObscured( energyChunk ) ) {
        // because the chunk just came from the model element.
        energyChunk.zPosition.set( 0.0 );
        approachingEnergyChunks.add( energyChunk );
        energyChunkWanderControllers.add( new EnergyChunkWanderController( energyChunk, position ) );
      }
      else {
        this.addEnergyChunk( energyChunk );
      }
    }
  } );
} );
