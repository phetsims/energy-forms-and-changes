// Copyright 2016, University of Colorado Boulder

/**
 * Object that represents a beaker in the view.  This representation is split
 * between a front node and a back node, which must be separately added to the
 * canvas.  This is done to allow a layering effect.  Hence, this cannot be added
 * directly to the canvas, and the client must add each layer separately.
 *
 * @author John Blanco
 * @author Andrew Adare
 */

define( function( require ) {
  'use strict';

  // modules
  var Circle = require( 'SCENERY/nodes/Circle' );
  var DotRectangle = require( 'DOT/Rectangle' ); // eslint-disable-line require-statement-match
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkContainerSliceNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EnergyChunkContainerSliceNode' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Random = require( 'DOT/Random' );
  var Range = require( 'DOT/Range' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Transform3 = require( 'DOT/Transform3' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var waterString = require( 'string!ENERGY_FORMS_AND_CHANGES/water' );

  // constants
  var RAND = new Random();
  var OUTLINE_COLOR = 'lightgrey';
  var PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;
  var LABEL_FONT = new PhetFont( 32 );
  var SHOW_MODEL_RECT = false;
  var BEAKER_COLOR = 'rgba( 250, 250, 250, 0.39 )'; // alpha value chosen empirically

  // constants for the PerspectiveWaterNode
  var LIQUID_WATER_OUTLINE_COLOR = EFACConstants.WATER_COLOR_IN_BEAKER.colorUtilsDarker( 0.2 );
  var WATER_LINE_WIDTH = 2;
  var STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is visible.
  var STEAM_BUBBLE_SPEED_RANGE = new Range( 100, 125 ); // In screen coords (~ pixels) / second
  var STEAM_BUBBLE_DIAMETER_RANGE = new Range( 20, 50 ); // In screen coords (~ pixels)
  var MAX_STEAM_BUBBLE_HEIGHT = 300;
  var STEAM_BUBBLE_RATE_RANGE = new Range( 20, 40 ); // Bubbles per second.
  var STEAM_BUBBLE_GROWTH_RATE = 0.2; // Proportion per second.
  var MAX_STEAM_BUBBLE_OPACITY = 0.7; // Proportion, 1 is max.

  /**
   * Constructor for the PerspectiveWaterNode.
   *
   * @param {Rectangle} beakerOutlineRect
   * @param {Property} waterLevelProperty
   * @param {Property} temperatureProperty
   */
  function PerspectiveWaterNode( beakerOutlineRect, waterLevelProperty, temperatureProperty ) {

    Node.call( this );
    var thisNode = this; // Extend scope for nested callbacks.

    // Nodes that comprise this node.
    this.liquidWaterTopNode = new Path( null, {
      fill: EFACConstants.WATER_COLOR_IN_BEAKER,
      lineWidth: WATER_LINE_WIDTH,
      stroke: LIQUID_WATER_OUTLINE_COLOR
    } );
    this.liquidWaterBodyNode = new Path( null, {
      fill: EFACConstants.WATER_COLOR_IN_BEAKER,
      lineWidth: WATER_LINE_WIDTH,
      stroke: LIQUID_WATER_OUTLINE_COLOR
    } );

    this.steamBubbles = new ObservableArray(); // TODO: Perhaps an array is sufficient.
    this.steamNode = new Node();
    this.waterLevelProperty = waterLevelProperty;
    this.temperatureProperty = temperatureProperty;
    this.beakerOutlineRect = beakerOutlineRect;

    // Miscellaneous other variables.
    this.bubbleProductionRemainder = 0; //@private

    this.addChild( this.liquidWaterBodyNode );
    this.addChild( this.liquidWaterTopNode );
    //this.addChild( this.liquidWaterBottomNode );
    this.addChild( this.steamNode );

    this.waterLevelProperty.link( function( waterLevel ) {
      var temperature = thisNode.temperatureProperty.get();
      var dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      thisNode.updateAppearance( waterLevel, beakerOutlineRect, temperature, dt );
    } );

  }

  inherit( Node, PerspectiveWaterNode, {

    reset: function() {
      this.steamBubbles.clear();
      this.steamNode.removeAllChildren();
    },

    /**
     * Step function for the water.
     * @param dt - The change in time.
     */
    step: function( dt ) {
      this.updateAppearance( this.waterLevelProperty.value, this.beakerOutlineRect, this.temperatureProperty.value, dt );
    },

    /**
     * Update the appearance of the water in the beaker.
     *
     * @param {number} fluidLevel
     * @param {Rectangle} beakerOutlineRect
     * @param {number} temperature
     * @param {number} dt
     */
    updateAppearance: function( fluidLevel, beakerOutlineRect, temperature, dt ) {

      var thisNode = this; // extend scope for nested callbacks.

      var waterHeight = beakerOutlineRect.height * fluidLevel;

      var liquidWaterRect = new DotRectangle( beakerOutlineRect.minX,
        beakerOutlineRect.maxY - waterHeight,
        beakerOutlineRect.width,
        waterHeight );
      var ellipseWidth = beakerOutlineRect.width;
      var ellipseHeight = PERSPECTIVE_PROPORTION * ellipseWidth;
      var liquidWaterTopEllipse = Shape.ellipse( liquidWaterRect.centerX, liquidWaterRect.minY,
        ellipseWidth / 2, ellipseHeight / 2, 0, 0, Math.PI / 2, false );

      //----------------------------------------------------------------
      // Update the liquid water.
      //----------------------------------------------------------------

      var halfWidth = liquidWaterRect.width / 2;
      var halfHeight = ellipseHeight / 2;
      var liquidWaterBodyShape = new Shape()
        .moveTo( liquidWaterRect.minX, liquidWaterRect.minY ) // Top left of the beaker body.
        .ellipticalArc( liquidWaterRect.centerX, liquidWaterRect.minY, halfWidth, halfHeight, 0, Math.PI, 0, false )
        .lineTo( liquidWaterRect.maxX, liquidWaterRect.maxY ) // Bottom right of the beaker body.
        .ellipticalArc( liquidWaterRect.centerX, liquidWaterRect.maxY, halfWidth, halfHeight, 0, 0, Math.PI, false )
        .close();

      this.liquidWaterBodyNode.setShape( liquidWaterBodyShape );
      this.liquidWaterTopNode.setShape( liquidWaterTopEllipse );

      //----------------------------------------------------------------
      // Update the steam.
      //----------------------------------------------------------------

      var steamingProportion = 0;
      if ( EFACConstants.BOILING_POINT_TEMPERATURE - temperature < STEAMING_RANGE ) {
        // Water is emitting some amount of steam.  Set the proportionate amount.
        steamingProportion = 1 - ( ( EFACConstants.BOILING_POINT_TEMPERATURE - temperature ) / STEAMING_RANGE );
        steamingProportion = Util.clamp( steamingProportion, 0, 1 );
      }

      // Add any new steam bubbles.
      if ( steamingProportion > 0 ) {

        var bubblesToProduceCalc =
          ( STEAM_BUBBLE_RATE_RANGE.min + STEAM_BUBBLE_RATE_RANGE.getLength() * steamingProportion ) * dt;
        var bubblesToProduce = Math.floor( bubblesToProduceCalc );

        this.bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;

        if ( this.bubbleProductionRemainder >= 1 ) {
          bubblesToProduce += Math.floor( this.bubbleProductionRemainder );
          this.bubbleProductionRemainder -= Math.floor( this.bubbleProductionRemainder );
        }

        for ( var i = 0; i < bubblesToProduce; i++ ) {
          var steamBubbleDiameter = STEAM_BUBBLE_DIAMETER_RANGE.min +
            RAND.nextDouble() * STEAM_BUBBLE_DIAMETER_RANGE.getLength();
          var steamBubbleCenterXPos = beakerOutlineRect.centerX +
            ( RAND.nextDouble() - 0.5 ) * ( beakerOutlineRect.width - steamBubbleDiameter );

          var steamBubble = new Circle( steamBubbleDiameter / 2, {
            fill: 'white',
            opacity: steamingProportion
          } );

          // Bubbles are invisible to start; they will fade in.
          steamBubble.center = new Vector2( steamBubbleCenterXPos, liquidWaterRect.getMinY() );
          steamBubble.opacity = 0;
          this.steamBubbles.push( steamBubble );
          this.steamNode.addChild( steamBubble );
        }
      }

      // Update the position and appearance of the existing steam bubbles.
      var steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.min + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();
      var unfilledBeakerHeight = beakerOutlineRect.height - waterHeight;

      this.steamBubbles.forEach( function( steamBubble ) {

        // Float the bubbles upward from the beaker
        steamBubble.translate( 0, -dt * steamBubbleSpeed );

        // Remove bubbles that have floated out of view
        if ( beakerOutlineRect.minY - steamBubble.y > MAX_STEAM_BUBBLE_HEIGHT ) {
          thisNode.steamBubbles.remove( steamBubble );
          thisNode.steamNode.removeChild( steamBubble );
        }

        // Update position of floating bubbles
        else if ( steamBubble.y < beakerOutlineRect.minY ) {
          steamBubble.setRadius( steamBubble.bounds.width * ( 1 + ( STEAM_BUBBLE_GROWTH_RATE * dt ) ) / 2 );
          var distanceFromCenterX = steamBubble.x - beakerOutlineRect.centerX;

          // Give bubbles some lateral drift motion
          steamBubble.translate( distanceFromCenterX * 0.2 * dt, 0 );

          // Fade the bubble as it reaches the end of its range.
          var heightFraction = ( beakerOutlineRect.minY - steamBubble.y ) / MAX_STEAM_BUBBLE_HEIGHT;
          steamBubble.opacity = ( 1 - heightFraction ) * MAX_STEAM_BUBBLE_OPACITY;
        }

        // Fade new bubbles in
        else {
          var distanceFromWater = liquidWaterRect.y - steamBubble.y;
          var opacityFraction = Util.clamp( distanceFromWater / ( unfilledBeakerHeight / 4 ), 0, 1 );
          steamBubble.opacity = opacityFraction * MAX_STEAM_BUBBLE_OPACITY;
        }

      } );
    }
  } );

  /**
   * Constructor for the BeakerView.
   *
   * @param {Beaker} beaker
   * @param {Property} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BeakerView( beaker, energyChunksVisibleProperty, modelViewTransform ) {

    Node.call( this );
    var thisNode = this; // Extend scope for nested callbacks.
    this.modelViewTransform = modelViewTransform;
    this.energyChunkClipNode = new Node();

    // These layer nodes are public so that the proper z-order can be established in the screen view.
    this.frontNode = new Node(); // @public
    this.backNode = new Node(); // @public
    this.grabNode = new Node(); // @public

    this.addChild(this.frontNode);
    this.addChild(this.backNode);
    this.addChild(this.grabNode);

    // Extract the scale transform from the MVT so that we can separate the shape from the position.
    var scaleTransform = new Transform3( Matrix3.scaling( modelViewTransform.matrix.m00(), modelViewTransform.matrix.m11() ) );

    // Get a Bounds2 object defining the beaker size and location in the view.
    var beakerBounds = scaleTransform.transformShape( beaker.getRawOutlineRect() );

    // Create the shapes for the top and bottom of the beaker.  These are
    // ellipses in order to create a 3D-ish look.
    var ellipseHeight = beakerBounds.getWidth() * PERSPECTIVE_PROPORTION;
    var halfWidth = beakerBounds.width / 2;
    var halfHeight = ellipseHeight / 2;
    var topEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.minY, halfWidth, halfHeight, 0 );
    var bottomEllipse = new Shape().ellipse( beakerBounds.centerX, beakerBounds.maxY, halfWidth, halfHeight, 0 );

    // Add the water.  It will adjust its size based on the fluid level.
    this.water = new PerspectiveWaterNode( beakerBounds, beaker.fluidLevelProperty, beaker.temperatureProperty );
    this.frontNode.addChild( this.water );

    // Create and add the shape for the body of the beaker.
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

    // Add the bottom ellipse.
    this.frontNode.addChild( new Path( bottomEllipse, {
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

    // Add a rectangle to the back that is invisible but allows the user to grab the beaker.
    this.backNode.addChild( new Rectangle( beakerBounds, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) );

    // Make the front and back nodes non-pickable so that the grab node can be used for grabbing.
    // Makes it possible to remove things from the beaker.
    this.frontNode.pickable = false;
    this.backNode.pickable = false;

    // Add the label.  Position it just below the front, top water line.
    var label = new Text( waterString, {
      font: LABEL_FONT
    } );
    label.translation = new Vector2( beakerBounds.centerX - label.bounds.width / 2,
      beakerBounds.maxY - beakerBounds.height * beaker.fluidLevel + topEllipse.bounds.height );
    label.pickable = false;
    this.frontNode.addChild( label );

    // Create the layers where the contained energy chunks will be placed.
    // A clipping node is used to enable occlusion when interacting with other model elements.
    // TODO: Work this one out with BeakerContainerView.
    var energyChunkRootNode = new Node();
    this.backNode.addChild( energyChunkRootNode );

    // TODO (AMA): I added the slices to the root node, but this apparently duplicated the radiatedEnergyChunkList chunks with an offset, and they don't get removed.
    // they should be added to the clip node when available.
    ////energyChunkClipNode.setPathTo( beakerBounds ); // Not sure that this is what is needed here. Bigger for chunks that are leaving? Needs thought.
    //energyChunkRootNode.addChild( energyChunkClipNode );
    ////energyChunkClipNode.setStroke( null );

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

    // Add the node that can be used to grab and move the beaker.
    var grabNodeShape = beakerBody;
    this.grabNode.addChild( new Path( grabNodeShape, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) ); // Invisible, yet pickable.
    this.grabNode.addChild( new Path( topEllipse, {
      fill: 'rgba( 0, 0, 0, 0 )'
    } ) );

    // If enabled, show the outline of the rectangle that represents the beaker's position in the model.
    if ( SHOW_MODEL_RECT ) {
      this.frontNode.addChild( new Rectangle( beakerBounds, {
        fill: 'red',
        lineWidth: 2
      } ) );
    }

    // Update the offset if and when the model position changes.
    beaker.positionProperty.link( function( position ) {

      var offset = modelViewTransform.modelToViewPosition( position );

      thisNode.frontNode.translation = offset;
      thisNode.backNode.translation = offset;
      thisNode.grabNode.translation = offset;

      // Compensate the energy chunk layer so that the energy chunk nodes can handle their own positioning.
      energyChunkRootNode.translation = modelViewTransform.modelToViewPosition( position ).rotated( Math.PI );
    } );

    // Adjust the transparency of the water and label based on energy chunk visibility.
    energyChunksVisibleProperty.link( function( energyChunksVisible ) {
      label.opacity = energyChunksVisible ? 0.5 : 1;
      var opacity = EFACConstants.NOMINAL_WATER_OPACITY;
      thisNode.water.opacity = energyChunksVisible ? opacity / 2 : opacity;
    } );

  }

  energyFormsAndChanges.register( 'BeakerView', BeakerView );

  return inherit( Node, BeakerView );

} );

