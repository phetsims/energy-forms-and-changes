// Copyright 2002-2015, University of Colorado

/**
 * Node that represents a burner stand in the view.  A burner stand is a faux-
 * 3D representation of an object upon which other objects may be placed in
 * order to be heated or cooled.  The burner is not included.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LineStyles = require( 'KITE/util/LineStyles' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

// constants
  var BURNER_STAND_STROKE_LINEWIDTH = 4;
  var BURNER_STAND_STROKE_COLOR = 'black';
  var PERSPECTIVE_ANGLE = Math.PI / 4; // Positive is counterclockwise, a value of 0 produces a non-skewed rectangle.
//
  /**
   *
   * @param {Rectangle} rect from DOT
   * @param {number} projectedEdgeLength
   * @constructor
   */
  function BurnerStandNode( rect, projectedEdgeLength ) {

    Node.call( this );
    // Add the left and right sides of the stand.

    this.addChild( new BurnerStandSide( new Vector2( rect.getX(), rect.getY() ), rect.height, projectedEdgeLength ) );
    this.addChild( new BurnerStandSide( new Vector2( rect.maxX, rect.getY() ), rect.height, projectedEdgeLength ) );
    /// Add the top of the burner stand.
    this.addChild( new BurnerStandTop( new Vector2( rect.getX(), rect.getY() ), rect.width, projectedEdgeLength ) );


    function BurnerStandSide( topCenter, height, edgeLength ) {

      // Draw the side as a parallelogram.
      var upperLeftCorner = topCenter.plus( new Vector2( -edgeLength / 2, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
      var lowerLeftCorner = upperLeftCorner.plus( new Vector2( 0, height ) );
      var lowerRightCorner = lowerLeftCorner.plus( new Vector2( edgeLength, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
      var upperRightCorner = lowerRightCorner.plus( new Vector2( 0, -height ) );

      var shape = new Shape();
      shape.moveToPoint( topCenter )
        .lineToPoint( upperLeftCorner )
        .lineToPoint( lowerLeftCorner )
        .lineToPoint( lowerRightCorner )
        .lineToPoint( upperRightCorner )
        .close();

      var strokeStyles = new LineStyles( {
        lineWidth: BURNER_STAND_STROKE_LINEWIDTH,
        lineCap: 'butt',
        lineJoin: 'bevel'
      } );
      shape = shape.getStrokedShape( strokeStyles );

      var burnerStandSidePath = new Path( shape, {
        stroke: BURNER_STAND_STROKE_COLOR,
        lineWidth: BURNER_STAND_STROKE_LINEWIDTH
      } );

      return burnerStandSidePath;

    }

    function BurnerStandTop( leftCenter, width, edgeLength ) {
      // Create the points for the outline of the perspective rectangle.
      var upperLeftCorner = leftCenter.plus( new Vector2( edgeLength / 2, 0 ).rotated( -PERSPECTIVE_ANGLE ) );
      var upperRightCorner = upperLeftCorner.plus( new Vector2( width, 0 ) );
      var lowerRightCorner = upperRightCorner.plus( new Vector2( -edgeLength, 0 ).rotate( -PERSPECTIVE_ANGLE ) );
      var lowerLeftCorner = lowerRightCorner.plus( new Vector2( -width, 0 ) );

      // Create the points for the circular opening in the top.
      var upperLeftCircularOpeningCorner = upperLeftCorner.plus( new Vector2( width * 0.25, 0 ) );
      var upperRightCircularOpeningCorner = upperLeftCorner.plus( new Vector2( width * 0.75, 0 ) );
      var lowerLeftCircularOpeningCorner = lowerLeftCorner.plus( new Vector2( width * 0.25, 0 ) );
      var lowerRightCircularOpeningCorner = lowerLeftCorner.plus( new Vector2( width * 0.75, 0 ) );

      // Create the control points for the circular opening in the top.
      var circularOpeningPerspectiveVector = new Vector2( edgeLength * 0.5, 0 ).rotate( -PERSPECTIVE_ANGLE );
      var shape = new Shape();
      shape.moveToPoint( upperLeftCorner )
        .lineToPoint( upperLeftCircularOpeningCorner )
        .cubicCurveToPoint( upperLeftCircularOpeningCorner.plus( circularOpeningPerspectiveVector ), upperRightCircularOpeningCorner.plus( circularOpeningPerspectiveVector ), upperRightCircularOpeningCorner )
        .lineToPoint( upperRightCorner )
        .lineToPoint( lowerRightCorner )
        .lineToPoint( lowerRightCircularOpeningCorner )
        .cubicCurveToPoint( lowerRightCircularOpeningCorner.minus( circularOpeningPerspectiveVector ), lowerLeftCircularOpeningCorner.minus( circularOpeningPerspectiveVector ), lowerLeftCircularOpeningCorner )
        .lineToPoint( lowerLeftCorner )
        .close();

      var strokeStyles = new LineStyles( {
        lineWidth: BURNER_STAND_STROKE_LINEWIDTH,
        lineCap: 'butt',
        lineJoin: 'bevel'
      } );
      shape = shape.getStrokedShape( strokeStyles );


      var burnerStandTopPath = new Path( shape, {
        stroke: BURNER_STAND_STROKE_COLOR,
        lineWidth: BURNER_STAND_STROKE_LINEWIDTH
      } );

      return burnerStandTopPath;
    }
  }

  return inherit( Node, BurnerStandNode );
} );


//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.common.view;
//
//import java.awt.BasicStroke;
//import java.awt.Color;
//import java.awt.Stroke;
//import java.awt.geom.Rectangle2D;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.view.util.DoubleGeneralPath;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.umd.cs.piccolo.PNode;
//
///**
// * Node that represents a burner stand in the view.  A burner stand is a faux-
// * 3D representation of an object upon which other objects may be placed in
// * order to be heated or cooled.  The burner is not included.
// *
// * @author John Blanco
// */
//public class BurnerStandNode extends PNode {
//
//  //-------------------------------------------------------------------------
//  // Class Data
//  //-------------------------------------------------------------------------
//
//  // Constants that control some aspect of appearance.  These can be made
//  // into constructor params if it is ever desirable to do so.
//  private static final Stroke BURNER_STAND_STROKE = new BasicStroke( 4, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL );
//  private static final Color BURNER_STAND_STROKE_COLOR = Color.BLACK;
//  public static final double PERSPECTIVE_ANGLE = Math.PI / 4; // Positive is counterclockwise, a value of 0 produces a non-skewed rectangle.
//
//  //-------------------------------------------------------------------------
//  // Instance Data
//  //-------------------------------------------------------------------------
//
//  //-------------------------------------------------------------------------
//  // Constructor(s)
//  //-------------------------------------------------------------------------
//
//  public BurnerStandNode( Rectangle2D rect, double projectedEdgeLength ) {
//
//    // Add the left and right sides of the stand.
//    addChild( new BurnerStandSide( new Vector2D( rect.getX(), rect.getY() ), rect.getHeight(), projectedEdgeLength ) );
//    addChild( new BurnerStandSide( new Vector2D( rect.maxX, rect.getY() ), rect.getHeight(), projectedEdgeLength ) );
//
//    // Add the top of the burner stand.
//    addChild( new BurnerStandTop( new Vector2D( rect.getX(), rect.getY() ), rect.getWidth(), projectedEdgeLength ) );
//  }
//
//  //-------------------------------------------------------------------------
//  // Methods
//  //-------------------------------------------------------------------------
//
//  //-------------------------------------------------------------------------
//  // Inner Classes and Interfaces
//  //-------------------------------------------------------------------------
//
//  private static class BurnerStandSide extends PNode {
//
//    private BurnerStandSide( Vector2D topCenter, double height, double edgeLength ) {
//      // Draw the side as a parallelogram.
//      Vector2D upperLeftCorner = topCenter.plus( new Vector2D( -edgeLength / 2, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE ) );
//      Vector2D lowerLeftCorner = upperLeftCorner.plus( new Vector2D( 0, height ) );
//      Vector2D lowerRightCorner = lowerLeftCorner.plus( new Vector2D( edgeLength, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE ) );
//      Vector2D upperRightCorner = lowerRightCorner.plus( new Vector2D( 0, -height ) );
//      DoubleGeneralPath path = new DoubleGeneralPath( topCenter );
//      path.lineTo( upperLeftCorner );
//      path.lineTo( lowerLeftCorner );
//      path.lineTo( lowerRightCorner );
//      path.lineTo( upperRightCorner );
//      path.closePath();
//      addChild( new PhetPPath( path.getGeneralPath(), BURNER_STAND_STROKE, BURNER_STAND_STROKE_COLOR ) );
//    }
//  }
//
//  private static class BurnerStandTop extends PNode {
//
//    private BurnerStandTop( Vector2D leftCenter, double width, double edgeLength ) {
//
//      // Create the points for the outline of the perspective rectangle.
//      Vector2D upperLeftCorner = leftCenter.plus( new Vector2D( edgeLength / 2, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE ) );
//      Vector2D upperRightCorner = upperLeftCorner.plus( new Vector2D( width, 0 ) );
//      Vector2D lowerRightCorner = upperRightCorner.plus( new Vector2D( -edgeLength, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE ) );
//      Vector2D lowerLeftCorner = lowerRightCorner.plus( new Vector2D( -width, 0 ) );
//
//      // Create the points for the circular opening in the top.
//      Vector2D upperLeftCircularOpeningCorner = upperLeftCorner.plus( new Vector2D( width * 0.25, 0 ) );
//      Vector2D upperRightCircularOpeningCorner = upperLeftCorner.plus( new Vector2D( width * 0.75, 0 ) );
//      Vector2D lowerLeftCircularOpeningCorner = lowerLeftCorner.plus( new Vector2D( width * 0.25, 0 ) );
//      Vector2D lowerRightCircularOpeningCorner = lowerLeftCorner.plus( new Vector2D( width * 0.75, 0 ) );
//
//      // Create the control points for the circular opening in the top.
//      Vector2D circularOpeningPerspectiveVector = new Vector2D( edgeLength * 0.5, 0 ).getRotatedInstance( -PERSPECTIVE_ANGLE );
//
//      DoubleGeneralPath path = new DoubleGeneralPath();
//      path.moveTo( upperLeftCorner );
//      path.lineTo( upperLeftCircularOpeningCorner );
//      path.curveTo( upperLeftCircularOpeningCorner.plus( circularOpeningPerspectiveVector ),
//        upperRightCircularOpeningCorner.plus( circularOpeningPerspectiveVector ),
//        upperRightCircularOpeningCorner );
//      path.lineTo( upperRightCorner );
//      path.lineTo( lowerRightCorner );
//      path.lineTo( lowerRightCircularOpeningCorner );
//      path.curveTo( lowerRightCircularOpeningCorner.minus( circularOpeningPerspectiveVector ),
//        lowerLeftCircularOpeningCorner.minus( circularOpeningPerspectiveVector ),
//        lowerLeftCircularOpeningCorner );
//      path.lineTo( lowerLeftCorner );
//      path.closePath();
//      addChild( new PhetPPath( path.getGeneralPath(), BURNER_STAND_STROKE, BURNER_STAND_STROKE_COLOR ) );
//    }
//  }
//
//
//}
