// Copyright 2002-2015, University of Colorado Boulder

/**
 * This class defines the motion constraints for the model elements that can be moved on and off the burners.
 * These elements are prevented from overlapping one another.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */

define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * Constructor for the ThermalItemMotionConstraint
   *
   * @param {EnergyFormsAndChangesIntroModel} model
   * @param {RectangularThermalMovableModelElement} modelElement
   * @param {Node} node
   * @param {Bounds2} stageBounds
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Vector2} offsetPosToNodeCenter
   * @constructor
   */
  function ThermalItemMotionConstraint( model, modelElement, node, stageBounds, modelViewTransform, offsetPosToNodeCenter ) {

    // TODO: modelBounds calculations are now handled in MovableDragHandler.  These calculations are no longer necessary.
    // Consider restructuring/removing this constraint object entirely and calling validatePosition directly without
    // apply().

    this.model = model; // @private
    this.modelElement = modelElement; // @private

    //var nodeSize = new Dimension2( node.bounds.width, node.bounds.height );
    var nodeSize = node.bounds.copy();

    // Calculate the bounds based on the stage size of the canvas and the nature of the provided node.
    var boundsMinX = modelViewTransform.viewToModelX( nodeSize.width / 2 - offsetPosToNodeCenter.x );
    var boundsMaxX = modelViewTransform.viewToModelX( stageBounds.width - nodeSize.width / 2 - offsetPosToNodeCenter.x );
    var boundsMinY = modelViewTransform.viewToModelY( stageBounds.height - offsetPosToNodeCenter.y - nodeSize.height / 2 );
    var boundsMaxY = modelViewTransform.viewToModelY( -offsetPosToNodeCenter.y + nodeSize.height / 2 );

    // @private
    this.modelBounds = new Bounds2( boundsMinX, boundsMinY, boundsMaxX - boundsMinX, boundsMaxY - boundsMinY );

  }

  return inherit( Object, ThermalItemMotionConstraint, {

    apply: function( proposedModelPos ) {
      // Make sure the proposed position is on the stage.
      //var constrainedXPos = Util.clamp( this.modelBounds.minX, proposedModelPos.x, this.modelBounds.maxX );
      //var constrainedYPos = Util.clamp( this.modelBounds.minY, proposedModelPos.y, this.modelBounds.maxY );
      var boundedToStagePos = new Vector2( proposedModelPos.x, proposedModelPos.y );
      //var boundedToStagePos = new Vector2( constrainedXPos, constrainedYPos );

      // Return a position that is also validated by the model.
      return this.model.validatePosition( this.modelElement, boundedToStagePos );
    }
  } );

} );