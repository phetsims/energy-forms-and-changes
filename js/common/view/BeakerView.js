// Copyright 2014-2018, University of Colorado Boulder

/**
 * Scenery node that represents a beaker in the view.  This representation is split between a front node and a back
 * node, which must be separately added to the canvas.  This is done to allow a layering effect.  Hence, this cannot be
 * added directly to the scene graph, and the client must add each layer separately.
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
  var LABEL_FONT = new PhetFont( 32 );
  var BEAKER_COLOR = 'rgba( 250, 250, 250, 0.39 )'; // alpha value chosen empirically

  /**
   * @param {Beaker} beaker - model of a beaker
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BeakerView( beaker, energyChunksVisibleProperty, modelViewTransform ) {

    Node.call( this );
    var self = this;

    // @private
    this.modelViewTransform = modelViewTransform;
    this.energyChunkClipNode = new Node();

    // @public (read-only) {Node} - layer nodes, public so that they can be layered correctly by the screen view, see
    // the header comment for info about how these are used.
    this.frontNode = new Node();
    this.backNode = new Node();
    this.grabNode = new Node( { cursor: 'pointer' } );

    this.addChild( this.frontNode );
    this.addChild( this.backNode );
    this.addChild( this.grabNode );

    // extract the scale transform from the MVT so that we can separate the shape from the position
    var scaleTransform = new Transform3(
      Matrix3.scaling( modelViewTransform.matrix.m00(), modelViewTransform.matrix.m11() )
    );

    // get a Bounds2 object defining the beaker size and location in the view
    var beakerBounds = scaleTransform.transformShape( beaker.getRawOutlineRect() );

    // Create the shapes for the top and bottom of the beaker.  These are ellipses in order to create a 3D-ish look.
    var ellipseHeight = beakerBounds.getWidth() * PERSPECTIVE_PROPORTION;
    var halfWidth = beakerBounds.width / 2;
    var halfHeight = ellipseHeight / 2;
    var topEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.minY, halfWidth, halfHeight, 0 );
    var bottomEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.maxY, halfWidth, halfHeight, 0 );

    // Add the water.  It will adjust its size based on the fluid level.
    this.water = new PerspectiveWaterNode( beakerBounds, beaker.fluidLevelProperty, beaker.temperatureProperty );
    this.frontNode.addChild( this.water );

    // create and add the node for the body of the beaker
    var beakerBody = new Shape()
      .moveTo( beakerBounds.minX, beakerBounds.minY ) // Top let of the beaker body.
      .ellipticalArc( beakerBounds.centerX, beakerBounds.minY, halfWidth, halfHeight, 0, Math.PI, 0, true )
      .lineTo( beakerBounds.maxX, beakerBounds.maxY ) // Bottom right of the beaker body.
      .ellipticalArc( beakerBounds.centerX, beakerBounds.maxY, halfWidth, halfHeight, 0, 0, Math.PI, false )
      .close();

    this.frontNode.addChild( new Path( beakerBody, {
      fill: BEAKER_COLOR,
      lineWidth: 3,
      stroke: OUTLINE_COLOR
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
    var label = new Text( waterString, {
      font: LABEL_FONT
    } );
    label.translation = new Vector2(
      beakerBounds.centerX - label.bounds.width / 2,
      beakerBounds.maxY - beakerBounds.height * beaker.fluidLevelProperty.value + topEllipse.bounds.height * 1.1
    );
    label.pickable = false;
    this.frontNode.addChild( label );

    // Create the layers where the contained energy chunks will be placed. A clipping node is used to enable occlusion
    // when interacting with other model elements.
    // TODO: Work this one out with BeakerContainerView.
    var energyChunkRootNode = new Node();
    this.backNode.addChild( energyChunkRootNode );

    // The original Java code used a PClip. Not clear what that was for, so adding the sliceNodes directly to the root node instead.
    for ( var i = beaker.slices.length - 1; i >= 0; i-- ) {
      energyChunkRootNode.addChild( new EnergyChunkContainerSliceNode( beaker.slices[ i ], modelViewTransform ) );
    }

    // Watch for coming and going of energy chunks that are approaching this model element and add/remove them as
    // needed.
    beaker.approachingEnergyChunks.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      energyChunkRootNode.addChild( energyChunkNode );

      beaker.approachingEnergyChunks.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          energyChunkRootNode.removeChild( energyChunkNode );
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

      var offset = modelViewTransform.modelToViewPosition( position );

      self.frontNode.translation = offset;
      self.backNode.translation = offset;
      self.grabNode.translation = offset;

      // compensate the energy chunk layer so that the energy chunk nodes can handle their own positioning
      energyChunkRootNode.translation = modelViewTransform.modelToViewPosition( position ).rotated( Math.PI );
    } );

    // adjust the transparency of the water and label based on energy chunk visibility
    energyChunksVisibleProperty.link( function( energyChunksVisible ) {
      label.opacity = energyChunksVisible ? 0.5 : 1;
      var opacity = EFACConstants.NOMINAL_WATER_OPACITY;
      self.water.opacity = energyChunksVisible ? opacity / 2 : opacity;
    } );
  }

  energyFormsAndChanges.register( 'BeakerView', BeakerView );

  return inherit( Node, BeakerView );
} );