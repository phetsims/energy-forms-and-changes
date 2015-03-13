// Copyright 2002-2015, University of Colorado

/**
 * Object that represents a beaker in the view.  This representation is split
 * between a front node and a back node, which must be separately added to the
 * canvas.  This is done to allow a layering effect.  Hence, this cannot be
 * added directly to the canvas, and the client must add each layer separately.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ColorUtils = require( 'edu.colorado.phet.common.phetcommon.view.util.ColorUtils' );
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EnergyChunkContainerSliceNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyChunkContainerSliceNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Range = require( 'DOT/Range' );
  var Shape = require( 'KITE/Shape' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Util = require( 'DOT/Util' );
  var Vector2 = require( 'DOT/Vector2' );


// constants
  var OUTLINE_LINEWIDTH = 3;
  var OUTLINE_COLOR = Color.LIGHT_GRAY;
  var PERSPECTIVE_PROPORTION = -EFACConstants.Z_TO_Y_OFFSET_MULTIPLIER;
  var LABEL_FONT = new PhetFont( 32, false );
  var SHOW_MODEL_RECT = false;
  var BEAKER_COLOR = new Color( 250, 250, 250, 0.5 );

  /**
   *
   * @param {Beaker} beaker
   * @param {boolean} energyChunksVisible
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BeakerView( beaker, energyChunksVisible, modelViewTransform ) {
    this.modelViewTransform = modelViewTransform;

    var frontNode = new Node();
    var backNode = new Node();
    var grabNode = new Node();

    // location in the view.
    var beakerViewRect = modelViewTransform.modelToViewBounds( beaker.getRawOutlineRect() ); //{Bounds2}
    // ellipses in order to create a 3D-ish look.
    var ellipseHeight = beakerViewRect.width * PERSPECTIVE_PROPORTION;
    //   Shape.ellipse = function( centerX, centerY, radiusX, radiusY, rotation )
    var topEllipse = new Ellipse2D.Number( beakerViewRect.minX, beakerViewRect.minY - ellipseHeight / 2, beakerViewRect.width, ellipseHeight );
    var bottomEllipse = new Ellipse2D.Number( beakerViewRect.minX, beakerViewRect.maxY - ellipseHeight / 2, beakerViewRect.width, ellipseHeight );
    // Add the bottom ellipse.
    backNode.addChild( new Path( bottomEllipse, {
      fill: BEAKER_COLOR,
      lineWidth: OUTLINE_LINEWIDTH,
      stroke: OUTLINE_COLOR
    } ) );
    // Add the water.  It will adjust its size based on the fluid level.
    var water = new PerspectiveWaterNode( beakerViewRect, beaker.fluidLevel, beaker.temperature );
    frontNode.addChild( water );
    // Create and add the shape for the body of the beaker.
    var beakerBody = new Area( beakerViewRect );
    beakerBody.add( new Area( bottomEllipse ) );
    beakerBody.subtract( new Area( topEllipse ) );
    frontNode.addChild( new Path( beakerBody, {
      fill: BEAKER_COLOR,
      lineWidth: OUTLINE_LINEWIDTH,
      stroke: OUTLINE_COLOR
    } ) );
    // Add the top ellipse.  It is behind the water for proper Z-order behavior.
    backNode.addChild( new Path( topEllipse, {
      fill: BEAKER_COLOR,
      lineWidth: OUTLINE_LINEWIDTH,
      stroke: OUTLINE_COLOR
    } ) );
    // grab the beaker.
    backNode.addChild( new Path( beakerViewRect, new Color( 0, 0, 0, 0 ) ) );
    // remove things from the beaker.
    frontNode.setPickable( false );
    frontNode.setChildrenPickable( false );
    backNode.setPickable( false );
    backNode.setChildrenPickable( false );
    // Add the label.  Position it just below the front, top water line.
    var label = new Text( EnergyFormsAndChangesResources.Strings.WATER );
    label.setFont( LABEL_FONT );
    label.setOffset( beakerViewRect.centerX - label.bounds.width / 2, beakerViewRect.maxY - beakerViewRect.height * beaker.fluidLevel.get() + topEllipse.getHeight() / 2 );
    label.setPickable( false );
    label.setChildrenPickable( false );
    frontNode.addChild( label );
    // other model elements.
    var energyChunkRootNode = new Node();
    backNode.addChild( energyChunkRootNode );
    var energyChunkClipNode = new Node();
    // Not sure that this is what is needed here. Bigger for chunks that are leaving? Needs thought.
    energyChunkClipNode.shape = beakerViewRect;
    energyChunkRootNode.addChild( energyChunkClipNode );
    energyChunkClipNode.setStroke( null );
    for ( var i = beaker.getSlices().size() - 1; i >= 0; i-- ) {
      energyChunkClipNode.addChild( new EnergyChunkContainerSliceNode( beaker.getSlices().get( i ), modelViewTransform ) );
    }
    // this model element and add/remove them as needed.
    beaker.approachingEnergyChunks.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      energyChunkRootNode.addChild( energyChunkNode );
      beaker.approachingEnergyChunks.removeItemAddedListener( function( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          energyChunkRootNode.removeChild( energyChunkNode );
          beaker.approachingEnergyChunks.removeItemRemovedListener( this );
        }
      } );
    } );
    // Add the node that can be used to grab and move the beaker.
    var grabNodeShape = new Area( beakerBody );
    grabNodeShape.add( new Area( topEllipse ) );
    // Invisible, yet pickable.
    grabNode.addChild( new Path( grabNodeShape, new Color( 0, 0, 0, 0 ) ) );
    // beaker's position in the model.
    if ( SHOW_MODEL_RECT ) {
      frontNode.addChild( new Path( beakerViewRect, { lineWidth: 1, stroke: Color.RED } ) );
    }
    // Update the offset if and when the model position changes.
    beaker.positionProperty.link( function( position ) {
        frontNode.setOffset( modelViewTransform.modelToView( position ) );
        backNode.setOffset( modelViewTransform.modelToView( position ) );
        grabNode.setOffset( modelViewTransform.modelToView( position ) );
        // nodes can handle their own positioning.
        energyChunkRootNode.setOffset( modelViewTransform.modelToView( position ).rotate( Math.PI ) );
      }
    );
    // chunk visibility.
    energyChunksVisibleProperty.link( function( energyChunksVisible ) {
      label.setTransparency( energyChunksVisible ? 0.5 : 1.0 );
      water.setTransparency( energyChunksVisible ? EFACConstants.NOMINAL_WATER_OPACITY / 2 : EFACConstants.NOMINAL_WATER_OPACITY );
    } );
  }

  return inherit( Object, BeakerView, {
//private
    define( function( require ) {
      'use strict';
      var inherit = require( 'PHET_CORE/inherit' );

      var Rectangle = require( 'KITE/Rectangle' );
      var Vector2 = require( 'DOT/Vector2' );
      var Property = require( 'AXON/Property' );

      var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/EnergyFormsAndChangesResources' );
      var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/common/EFACConstants' );
      var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/common/model/Beaker' );
      var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/common/model/EnergyChunk' );
      var EnergyChunkContainerSliceNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-forms-and-changes/intro/model/EnergyChunkContainerSliceNode' );
      var Node = require( 'SCENERY/nodes/Node' );

      /*
       * Constructor.
       */

//
      var LIQUID_WATER_OUTLINE_COLOR = ColorUtils.darkerColor( EFACConstants.WATER_COLOR_IN_BEAKER, 0.2 );
      var WATER_OUTLINE_STROKE = 2;
      var STEAMING_RANGE = 10; // Number of degrees Kelvin over which steam is visible.
      var STEAM_BUBBLE_SPEED_RANGE = new Range( 100, 125 ); // In screen coords (basically pixels) per second.
      var STEAM_BUBBLE_DIAMETER_RANGE = new Range( 20, 50 ); // In screen coords (basically pixels).
      var MAX_STEAM_BUBBLE_HEIGHT = 300;
      var STEAM_BUBBLE_PRODUCTION_RATE_RANGE = new Range( 20, 40 ); // Bubbles per second.
      var STEAM_BUBBLE_GROWTH_RATE = 0.2; // Proportion per second.
      var MAX_STEAM_BUBBLE_OPACITY = 0.7; // Proportion, 1 is max.
//
//    // Nodes that comprise this node.
//    private final PhetPPath liquidWaterTopNode = new PhetPPath( EFACConstants.WATER_COLOR_IN_BEAKER, WATER_OUTLINE_STROKE, LIQUID_WATER_OUTLINE_COLOR );
//    private final PhetPPath liquidWaterBodyNode = new PhetPPath( EFACConstants.WATER_COLOR_IN_BEAKER, WATER_OUTLINE_STROKE, LIQUID_WATER_OUTLINE_COLOR );
//    private final List<SteamBubble> steamBubbles = new ArrayList<SteamBubble>();
//    private final PNode steamNode;
//
//    // Miscellaneous other variables.
//    private double bubbleProductionRemainder;
//private
      /**
       * *
       * @param {Rectangle} beakerOutlineRect
       * @param waterLevel
       * @param temperature
       * @constructor
       */
      function PerspectiveWaterNode( beakerOutlineRect, waterLevel, temperature ) {

        Node.call( this );
        this.addChild( liquidWaterBodyNode );
        this.addChild( liquidWaterTopNode );
        this.steamNode = new Node();
        this.addChild( this.steamNode );
        clock.addClockListener( new ClockAdapter().withAnonymousClassBody( {
          clockTicked: function( clockEvent ) {
            updateAppearance( waterLevel.get(), beakerOutlineRect, temperature.get(), clockEvent.getSimulationTimeChange() );
          },
          simulationTimeReset: function( clockEvent ) {
            // Get rid of steam when a reset occurs.
            steamBubbles.clear();
            steamNode.removeAllChildren();
          }
        } ) );
        updateAppearance( waterLevel.get(), beakerOutlineRect, temperature.get(), 1 / EFACConstants.FRAMES_PER_SECOND );
      }

      return inherit( Node, PerspectiveWaterNode, {
//private
        updateAppearance: function( fluidLevel, beakerOutlineRect, temperature, dt ) {
          var waterHeight = beakerOutlineRect.height * fluidLevel;
          var liquidWaterRect = new Rectangle.Number( beakerOutlineRect.getX(), beakerOutlineRect.maxY - waterHeight, beakerOutlineRect.width, waterHeight );
          var ellipseWidth = beakerOutlineRect.width;
          var ellipseHeight = PERSPECTIVE_PROPORTION * ellipseWidth;

          var liquidWaterTopEllipse = new Ellipse2D.Number( liquidWaterRect.minX, liquidWaterRect.minY - ellipseHeight / 2, liquidWaterRect.width, ellipseHeight );
          var bottomEllipse = new Ellipse2D.Number( liquidWaterRect.minX, liquidWaterRect.maxY - ellipseHeight / 2, liquidWaterRect.width, ellipseHeight );
          // Update shape of the the liquid water.
          var liquidWaterBodyArea = new Area( liquidWaterRect );
          liquidWaterBodyArea.add( new Area( bottomEllipse ) );
          liquidWaterBodyArea.subtract( new Area( liquidWaterTopEllipse ) );
          liquidWaterBodyNode.setPathTo( liquidWaterBodyArea );
          liquidWaterTopNode.setPathTo( liquidWaterTopEllipse );
          var steamingProportion = 0;
          var bubbleProductionRemainder;
          if ( EFACConstants.BOILING_POINT_TEMPERATURE - temperature < STEAMING_RANGE ) {
            // Water is emitting some amount of steam.  Set the proportionate amount.
            steamingProportion = MathUtil.clamp( 0, 1 - ((EFACConstants.BOILING_POINT_TEMPERATURE - temperature) / STEAMING_RANGE), 1 );
          }
          if ( steamingProportion > 0 ) {
            // Add any new steam bubbles.
            var bubblesToProduceCalc = (STEAM_BUBBLE_PRODUCTION_RATE_RANGE.getMin() + STEAM_BUBBLE_PRODUCTION_RATE_RANGE.getLength() * steamingProportion) * dt;
            var bubblesToProduce = Math.floor( bubblesToProduceCalc );
            bubbleProductionRemainder += bubblesToProduceCalc - bubblesToProduce;
            if ( bubbleProductionRemainder >= 1 ) {
              bubblesToProduce += Math.floor( bubbleProductionRemainder );
              bubbleProductionRemainder -= Math.floor( bubbleProductionRemainder );
            }
            for ( var i = 0; i < bubblesToProduce; i++ ) {
              var steamBubbleDiameter = STEAM_BUBBLE_DIAMETER_RANGE.getMin() + Math.random() * STEAM_BUBBLE_DIAMETER_RANGE.getLength();
              var steamBubbleCenterXPos = beakerOutlineRect.centerX + (Math.random() - 0.5) * (beakerOutlineRect.width - steamBubbleDiameter);
              var steamBubble = new SteamBubble( steamBubbleDiameter, steamingProportion );
              // Invisible to start, will fade in.
              steamBubble.setOffset( steamBubbleCenterXPos, liquidWaterRect.minY );
              steamBubble.setOpacity( 0 );
              steamBubbles.add( steamBubble );
              this.steamNode.addChild( steamBubble );
            }
          }
          // Update the position and appearance of the existing steam bubbles.
          var steamBubbleSpeed = STEAM_BUBBLE_SPEED_RANGE.getMin() + steamingProportion * STEAM_BUBBLE_SPEED_RANGE.getLength();
          var unfilledBeakerHeight = beakerOutlineRect.height - waterHeight;

          steamBubbles.copy().forEach( function( steamBubble ) {
            steamBubble.setOffset( steamBubble.getXOffset(), steamBubble.getYOffset() + dt * (-steamBubbleSpeed) );
            if ( beakerOutlineRect.minY - steamBubble.getYOffset() > MAX_STEAM_BUBBLE_HEIGHT ) {
              steamBubbles.remove( steamBubble );
              this.steamNode.removeChild( steamBubble );
            }
            else if ( steamBubble.getYOffset() < beakerOutlineRect.minY ) {
              steamBubble.setDiameter( steamBubble.getDiameter() * (1 + (STEAM_BUBBLE_GROWTH_RATE * dt)) );
              var distanceFromCenterX = steamBubble.getXOffset() - beakerOutlineRect.centerX;
              steamBubble.setOffset( steamBubble.getXOffset() + (distanceFromCenterX * 0.2 * dt), steamBubble.getYOffset() );
              // Fade the bubble as it reaches the end of its range.
              steamBubble.setOpacity( (1 - (beakerOutlineRect.minY - steamBubble.getYOffset()) / MAX_STEAM_BUBBLE_HEIGHT) * MAX_STEAM_BUBBLE_OPACITY );
            }
            else {
              // Fade the bubble in.
              var distanceFromWater = liquidWaterRect.minY - steamBubble.getYOffset();
              steamBubble.setOpacity( MathUtil.clamp( 0, distanceFromWater / (unfilledBeakerHeight / 4), 1 ) * MAX_STEAM_BUBBLE_OPACITY );
            }
          } );
        },
//private
        define( function( require ) {
          'use strict';


          /**
           *
           * @param initialDiameter
           * @param initialOpacity
           * @constructor
           */
          function SteamBubble( initialDiameter, initialOpacity ) {
            Path.call( this, new Ellipse2D.Number( -initialDiameter / 2, -initialDiameter / 2, initialDiameter, initialDiameter ), new Color( 255, 255, 255, (initialOpacity * 255) ) );
          }

          return inherit( Path, SteamBubble, {
            setOpacity: function( opacity ) {
              assert && assert( opacity <= 1.0 );
              this.fill = new Color( 255, 255, 255, opacity );
            },
            getDiameter: function() {
              return this.bounds.width;
            },
            setDiameter: function( newDiameter ) {
              this.setPathTo( new Ellipse2D.Number( -newDiameter / 2, -newDiameter / 2, newDiameter, newDiameter ) );
            }
          } );
        } );

      getFrontNode: function() {
        return this.frontNode;
      }
      ,
      getBackNode: function() {
        return this.backNode;
      }
      ,
      getGrabNode: function() {
        return this.grabNode;
      }
    })
    ;
} )
;
