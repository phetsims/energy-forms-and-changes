// Copyright 2014-2018, University of Colorado Boulder

/**
 * Scenery node that represents a beaker in the view. This representation is split between a front node and a back
 * node, which must be separately added to the scene graph. This is done to allow a layering effect. Hence, this cannot
 * be added directly to the scene graph, and the client must add each layer separately.
 *
 * @author John Blanco
 * @author Andrew Adare
 */

define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  var EnergyChunkContainerSliceNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EnergyChunkContainerSliceNode' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PerspectiveWaterNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/PerspectiveWaterNode' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Transform3 = require( 'DOT/Transform3' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var waterString = require( 'string!ENERGY_FORMS_AND_CHANGES/water' );

  // constants
  var OUTLINE_COLOR = 'rgb( 160, 160, 160 )';
  var PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;
  var LABEL_FONT = new PhetFont( 26 );
  var BEAKER_COLOR = 'rgba( 250, 250, 250, 0.39 )'; // alpha value chosen empirically
  var NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK = 4; // number of minor ticks between each major tick. Generalize if needed.

  /**
   * @param {Beaker} beaker - model of a beaker
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   * @constructor
   */
  function BeakerView( beaker, energyChunksVisibleProperty, modelViewTransform, options ) {

    options = _.extend( {
      label: waterString,

      // This option controls whether this is being constructed as a standalone node that will itself be added as a
      // child to another node, or as a set of individual nodes that are added separately as children to an external
      // parent.  The latter is used when it is necessary to put portions of the beaker on separate layers.
      composited: true
    }, options );

    Node.call( this );
    var self = this;

    // @private
    this.modelViewTransform = modelViewTransform;
    this.followPosition = true;

    // @public (read-only) {Node} - layer nodes, public so that they can be layered correctly by the screen view, see
    // the header comment for info about how these are used.
    this.frontNode = new Node();
    this.backNode = new Node();
    this.grabNode = new Node( { cursor: 'pointer' } );

    if ( options.composited ) {
      this.addChild( this.frontNode );
      this.addChild( this.backNode );
      this.addChild( this.grabNode );
    }

    // extract the scale transform from the MVT so that we can separate the shape from the position
    var scaleTransform = new Transform3(
      Matrix3.scaling( modelViewTransform.matrix.m00(), modelViewTransform.matrix.m11() )
    );

    // get a Bounds2 object defining the beaker size and location in the view
    var beakerBounds = scaleTransform.transformShape( beaker.getRawOutlineRect() );

    // Create the shapes for the top and bottom of the beaker.  These are ellipses in order to create a 3D-ish look.
    var ellipseHeight = beakerBounds.getWidth() * PERSPECTIVE_PROPORTION;
    var beakerHalfWidth = beakerBounds.width / 2;
    var beakerEllipseHalfHeight = ellipseHeight / 2;
    var topEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.minY, beakerHalfWidth, beakerEllipseHalfHeight, 0 );
    var bottomEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.maxY, beakerHalfWidth, beakerEllipseHalfHeight, 0 );

    // Add the fluid.  It will adjust its size based on the fluid level.
    this.fluid = new PerspectiveWaterNode(
      beakerBounds,
      beaker.fluidLevelProperty,
      beaker.temperatureProperty,
      beaker.fluidBoilingPoint,
      beaker.fluidColor,
      beaker.steamColor
    );
    this.frontNode.addChild( this.fluid );

    // create and add the node for the body of the beaker
    var beakerBody = new Shape()
      .moveTo( beakerBounds.minX, beakerBounds.minY ) // Top left of the beaker body.
      .ellipticalArc( beakerBounds.centerX, beakerBounds.minY, beakerHalfWidth, beakerEllipseHalfHeight, 0, Math.PI, 0, true )
      .lineTo( beakerBounds.maxX, beakerBounds.maxY ) // Bottom right of the beaker body.
      .ellipticalArc( beakerBounds.centerX, beakerBounds.maxY, beakerHalfWidth, beakerEllipseHalfHeight, 0, 0, Math.PI, false )
      .close();

    this.frontNode.addChild( new Path( beakerBody, {
      fill: BEAKER_COLOR,
      lineWidth: 3,
      stroke: OUTLINE_COLOR
    } ) );

    // vars used for drawing the tick marks
    var numberOfMajorTicks = Math.floor( beaker.height / beaker.majorTickMarkDistance );
    var numberOfTicks = numberOfMajorTicks * ( NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK + 1 ); // total number of ticks
    var majorTickLengthAngle = 0.13 * Math.PI; // empirically determined
    var minorTickLengthAngle = majorTickLengthAngle / 2; // empirically determined
    var spaceBetweenEachTickMark = Math.abs( modelViewTransform.modelToViewDeltaY( beaker.majorTickMarkDistance ) /
                                             ( NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK + 1 ) );

    // x-distance between the left edge of the beaker and the start of the ticks along an ellipse, in radians
    var xOriginAngle = 0.1 * Math.PI;
    var yPosition = beakerBounds.maxY;

    // create the tick marks shape
    var tickMarks = new Shape().moveTo( beakerBounds.minX, beakerBounds.maxY ); // bottom left of the beaker body

    // draw the tick marks
    for ( var tickIndex = 0; tickIndex < numberOfTicks; tickIndex++ ) {
      yPosition -= spaceBetweenEachTickMark;
      var startAngle = Math.PI - xOriginAngle;
      var tickLengthAngle = ( tickIndex + 1 ) % ( NUMBER_OF_MINOR_TICKS_PER_MAJOR_TICK + 1 ) === 0 ? majorTickLengthAngle : minorTickLengthAngle;
      var endAngle = startAngle - tickLengthAngle;

      tickMarks.newSubpath(); // don't connect the tick marks with additional lines
      tickMarks.ellipticalArc(
        beakerBounds.centerX,
        yPosition,
        beakerHalfWidth,
        beakerEllipseHalfHeight,
        0,
        startAngle,
        endAngle,
        true
      );
    }

    // add the tick marks
    this.frontNode.addChild( new Path( tickMarks, {
      lineWidth: 1,
      stroke: 'black'
    } ) );

    // add the bottom ellipse
    this.backNode.addChild( new Path( bottomEllipse, {
      fill: BEAKER_COLOR,
      lineWidth: 3,
      stroke: OUTLINE_COLOR
    } ) );

    // Add the top ellipse.  It is behind the water for proper Z-order behavior.
    this.backNode.addChild( new Path( topEllipse, {
      fill: BEAKER_COLOR,
      stroke: OUTLINE_COLOR,
      lineWidth: 3
    } ) );

    // add a rectangle to the back that is invisible but allows the user to grab the beaker
    this.backNode.addChild( new Rectangle( beakerBounds, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) );

    // Make the front and back nodes non-pickable so that the grab node can be used for grabbing. This makes it possible
    // to remove things from the beaker.
    this.frontNode.pickable = false;
    this.backNode.pickable = false;

    // add the label, positioning it just below the front, top water line
    var label = new Text( options.label, {
      font: LABEL_FONT,
      maxWidth: beakerBounds.width * 0.7 // empirically determined to look nice
    } );
    label.translation = new Vector2(
      beakerBounds.centerX - label.bounds.width / 2,
      beakerBounds.maxY - beakerBounds.height * beaker.fluidLevelProperty.value + topEllipse.bounds.height * 1.1
    );
    label.pickable = false;
    this.frontNode.addChild( label );

    // @protected {Node} - the layer where the contained energy chunk nodes will be placed
    this.energyChunkRootNode = new Node();
    this.backNode.addChild( this.energyChunkRootNode );

    // add the energy chunk container slice nodes to the energy chunk layer
    beaker.slices.forEach( function( slice ) {
      self.energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( slice, modelViewTransform ) );
    } );

    // Watch for coming and going of energy chunks that are approaching this model element and add/remove them as
    // needed.
    beaker.approachingEnergyChunks.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      self.energyChunkRootNode.addChild( energyChunkNode );

      beaker.approachingEnergyChunks.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          self.energyChunkRootNode.removeChild( energyChunkNode );
          energyChunkNode.dispose();
          beaker.approachingEnergyChunks.removeItemRemovedListener( removalListener );
        }
      } );
    } );

    // add the node that can be used to grab and move the beaker
    var grabNodeShape = beakerBody;
    this.grabNode.addChild( new Path( grabNodeShape, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) ); // invisible, yet pickable
    this.grabNode.addChild( new Path( topEllipse, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) );

    // if enabled (for debug), show the outline of the rectangle that represents the beaker's position in the model
    if ( EFACQueryParameters.show2DBeakerBounds ) {
      this.frontNode.addChild( new Rectangle( beakerBounds, {
        fill: 'red',
        stroke: 'lime',
        lineWidth: 2
      } ) );
    }

    // update the offset if and when the model position changes
    beaker.positionProperty.link( function( position ) {

      if ( self.followPosition ) {
        var offset = modelViewTransform.modelToViewPosition( position );

        self.frontNode.translation = offset;
        self.backNode.translation = offset;
        self.grabNode.translation = offset;
      }

      // compensate the energy chunk layer so that the energy chunk nodes can handle their own positioning
      self.energyChunkRootNode.translation = modelViewTransform.modelToViewPosition( position ).rotated( Math.PI );
    } );

    // adjust the transparency of the water and label based on energy chunk visibility
    energyChunksVisibleProperty.link( function( energyChunksVisible ) {
      label.opacity = energyChunksVisible ? 0.5 : 1;
      var opacity = EFACConstants.NOMINAL_WATER_OPACITY;
      self.fluid.opacity = energyChunksVisible ? opacity / 2 : opacity;
    } );

    // listen to the resetEmitter in the beaker model
    beaker.resetEmitter.addListener( function() {
      self.reset();
    } );
  }

  energyFormsAndChanges.register( 'BeakerView', BeakerView );

  return inherit( Node, BeakerView, {

    /**
     * @public
     */
    reset: function() {
      this.fluid.reset();
    },

    /**
     * step this view element
     * @param dt - time step, in seconds
     * @public
     */
    step: function( dt ) {
      this.fluid.step( dt );
    },

    /**
     * set whether this node should follow its beaker position. this is useful for the case where its parent node is
     * handling its position
     * @param {boolean} followPosition
     * @public
     */
    setFollowPosition: function( followPosition ) {
      this.followPosition = followPosition;
    }
  } );
} );