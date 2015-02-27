// Copyright 2002-2015, University of Colorado

/**
 * Thermometer node that the user can drag around and that updates its
 * temperature reading based on the reading from the supplied model element.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  //modules
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
//  var EnergyFormsAndChangesIntroScreenView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EnergyFormsAndChangesIntroScreenView' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'DOT/Rectangle' );
  var SensingThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/SensingThermometerNode' );
  var ThermalElementDragHandler = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermalElementDragHandler' );
  var Thermometer = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Thermometer' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );


  /**
   * *
   * @param thermometer
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function MovableThermometerNode( thermometer, modelViewTransform ) {
    var movableThermometerNode = this;
    SensingThermometerNode.call( this, thermometer );
    // Update the offset if and when the model position changes.
    thermometer.positionProperty.link( function( position ) {
      //TODO check if ok
      movableThermometerNode.translation = new Vector2( modelViewTransform.modelToViewX( position.x ), modelViewTransform.modelToViewY( position.y ) - (movableThermometerNode.height / 2 + movableThermometerNode.triangleTipOffset.height) );
//        movableThermometerNode.translation = new Vector2( modelViewTransform.modelToViewX( position.x ), modelViewTransform.modelToViewY( position.y ) );
    } );
    // Add the drag handler.
    var offsetPosToCenter = new Vector2( this.centerX - modelViewTransform.modelToViewX( thermometer.position.x ), this.centerY - modelViewTransform.modelToViewY( thermometer.position.y ) );
    this.addInputListener( new ThermalElementDragHandler( thermometer, this, modelViewTransform, new ThermometerLocationConstraint( modelViewTransform, this, offsetPosToCenter ) ) );
  }

  // Class that constrains the valid locations for a thermometer.
  function ThermometerLocationConstraint( modelViewTransform, node, offsetPosToNodeCenter ) {
    var nodeSize = new Dimension2( node.width, node.height );
    // the nature of the provided node.

    //TODO get STAGE_SIZE
    var boundsMinX = modelViewTransform.viewToModelX( nodeSize.width / 2 - offsetPosToNodeCenter.x );
//    var boundsMaxX = modelViewTransform.viewToModelX( EFACIntroCanvas.STAGE_SIZE.width - nodeSize.width / 2 - offsetPosToNodeCenter.x );
//    var boundsMinY = modelViewTransform.viewToModelY( EFACIntroCanvas.STAGE_SIZE.height - offsetPosToNodeCenter.y - nodeSize.height / 2 );
    var boundsMaxX = modelViewTransform.viewToModelX( 1000 - nodeSize.width / 2 - offsetPosToNodeCenter.x );
    var boundsMinY = modelViewTransform.viewToModelY( 600 - offsetPosToNodeCenter.y - nodeSize.height / 2 );

    var boundsMaxY = modelViewTransform.viewToModelY( -offsetPosToNodeCenter.y + nodeSize.height / 2 );
    this.modelBounds = new Rectangle( boundsMinX, boundsMinY, boundsMaxX - boundsMinX, boundsMaxY - boundsMinY );
  }

  return inherit( SensingThermometerNode, MovableThermometerNode, {
    apply: function( proposedModelPosition ) {
      var constrainedXPos = Util.clamp( this.modelBounds.minX, proposedModelPosition.x, this.modelBounds.maxX );
      var constrainedYPos = Util.clamp( this.modelBounds.minY, proposedModelPosition.y, this.modelBounds.maxY );
      return new Vector2( constrainedXPos, constrainedYPos );
    }
  } );
} );

//
//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.math.MathUtil;
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.util.function.Function1;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.energyformsandchanges.common.model.Thermometer;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.util.PDimension;
//
///**
// * Thermometer node that the user can drag around and that updates its
// * temperature reading based on the reading from the supplied model element.
// *
// * @author John Blanco
// */
//public class MovableThermometerNode extends SensingThermometerNode {
//
//  public MovableThermometerNode( final Thermometer thermometer, final ModelViewTransform modelViewTransform ) {
//    super( thermometer );
//
//    // Update the offset if and when the model position changes.
//    thermometer.position.addObserver( new VoidFunction1<Vector2D>() {
//      public void apply( Vector2D position ) {
//        setOffset( modelViewTransform.modelToViewX( position.x ),
//            modelViewTransform.modelToViewY( position.y ) - ( getFullBoundsReference().height / 2 + triangleTipOffset.getHeight() ) );
//      }
//    } );
//
//    // Add the drag handler.
//    Vector2D offsetPosToCenter = new Vector2D( getFullBoundsReference().getCenterX() - modelViewTransform.modelToViewX( thermometer.position.x ),
//        getFullBoundsReference().getCenterY() - modelViewTransform.modelToViewY( thermometer.position.y ) );
//    addInputEventListener( new ThermalElementDragHandler( thermometer, this, modelViewTransform, new ThermometerLocationConstraint( modelViewTransform, this, offsetPosToCenter ) ) );
//  }
//
//  // Class that constrains the valid locations for a thermometer.
//  private static class ThermometerLocationConstraint implements Function1<Point2D, Point2D> {
//
//    private final Rectangle2D modelBounds;
//
//  private ThermometerLocationConstraint( ModelViewTransform modelViewTransform, PNode node, Vector2D offsetPosToNodeCenter ) {
//
//    Dimension2D nodeSize = new PDimension( node.getFullBoundsReference().width, node.getFullBoundsReference().height );
//
//    // Calculate the bounds based on the stage size of the canvas and
//    // the nature of the provided node.
//    double boundsMinX = modelViewTransform.viewToModelX( nodeSize.getWidth() / 2 - offsetPosToNodeCenter.getX() );
//    double boundsMaxX = modelViewTransform.viewToModelX( EFACIntroCanvas.STAGE_SIZE.getWidth() - nodeSize.getWidth() / 2 - offsetPosToNodeCenter.getX() );
//    double boundsMinY = modelViewTransform.viewToModelY( EFACIntroCanvas.STAGE_SIZE.getHeight() - offsetPosToNodeCenter.getY() - nodeSize.getHeight() / 2 );
//    double boundsMaxY = modelViewTransform.viewToModelY( -offsetPosToNodeCenter.getY() + nodeSize.getHeight() / 2 );
//    modelBounds = new Rectangle2D.Double( boundsMinX, boundsMinY, boundsMaxX - boundsMinX, boundsMaxY - boundsMinY );
//  }
//
//  public Point2D apply( Point2D proposedModelPos ) {
//    double constrainedXPos = MathUtil.clamp( modelBounds.getMinX(), proposedModelPos.getX(), modelBounds.getMaxX() );
//    double constrainedYPos = MathUtil.clamp( modelBounds.getMinY(), proposedModelPos.getY(), modelBounds.getMaxY() );
//    return new Point2D.Double( constrainedXPos, constrainedYPos );
//  }
//}
//}

