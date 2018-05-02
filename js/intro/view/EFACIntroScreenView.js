// Copyright 2014-2018, University of Colorado Boulder

/**
 * main view for the 'Intro' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var AirNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/AirNode' );
  var BeakerContainerView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/BeakerContainerView' );
  var BlockNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/BlockNode' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var Checkbox = require( 'SUN/Checkbox' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  var HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/MovableThermometerNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NormalAndFastForwardTimeControlPanel = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/NormalAndFastForwardTimeControlPanel' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Text = require( 'SCENERY/nodes/Text' );
  var ThermometerToolboxNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermometerToolboxNode' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );

  // images
  var shelfImage = require( 'image!ENERGY_FORMS_AND_CHANGES/shelf_long.png' );

  // constants
  var EDGE_INSET = 10;
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // multiplier empirically determined for best look
  var SHOW_LAYOUT_BOUNDS = false;

  // TODO: I (jbphet) came across the code immediately below during code cleanup in early May 2018, not sure what it is or whether it is still needed.
  // Boolean property for showing/hiding developer control for dumping energy levels.
  // var showDumpEnergiesButton = new Property( false );

  /**
   * @param {EFACIntroModel} model
   * @constructor
   */
  function EFACIntroScreenView( model ) {

    ScreenView.call( this, {
      layoutBounds: new Bounds2( 0, 0, 1024, 618 )
    } );

    var self = this;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model appears in the
    // view.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2(
        Math.round( self.layoutBounds.width * 0.5 ),
        Math.round( self.layoutBounds.height * 0.85 )
      ),
      2200 // zoom factor - smaller zooms out, larger zooms in
    );

    // create nodes that will act as layers in order to create the needed Z-order behavior
    var backLayer = new Node();
    this.addChild( backLayer );
    var beakerBackLayer = new Node();
    this.addChild( beakerBackLayer );
    var beakerGrabLayer = new Node();
    this.addChild( beakerGrabLayer );
    var blockLayer = new Node();
    this.addChild( blockLayer );
    var airLayer = new Node();
    this.addChild( airLayer );
    var heaterCoolerFrontLayer = new Node();
    this.addChild( heaterCoolerFrontLayer );
    var beakerFrontLayer = new Node();
    this.addChild( beakerFrontLayer );

    // create the lab bench surface image
    var labBenchSurfaceImage = new Image( shelfImage );
    labBenchSurfaceImage.leftTop = ( new Vector2(
        modelViewTransform.modelToViewX( 0 ) - labBenchSurfaceImage.width / 2,

        // slight tweak factor here due to nature of image
        modelViewTransform.modelToViewY( 0 ) - ( labBenchSurfaceImage.height / 2 ) + 10 )
    );

    // create a rectangle that will act as the background below the lab bench surface, basically like the side of the
    // bench
    var benchWidth = labBenchSurfaceImage.width * 0.95;
    var benchHeight = 1000; // arbitrary large number, user should never see the bottom of this
    var labBenchSide = new Rectangle(
      labBenchSurfaceImage.centerX - benchWidth / 2,
      labBenchSurfaceImage.centerY,
      benchWidth,
      benchHeight,
      { fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR }
    );

    // add the bench side and top to the scene - the lab bench side must be behind the bench top
    backLayer.addChild( labBenchSide );
    backLayer.addChild( labBenchSurfaceImage );

    // Determine the vertical center between the lower edge of the top of the bench and the bottom of the canvas, used
    // for layout.
    var centerYBelowSurface = ( this.layoutBounds.height + labBenchSurfaceImage.bottom ) / 2;

    // add the clock controls
    var clockControlPanel = new NormalAndFastForwardTimeControlPanel( model );
    clockControlPanel.center = new Vector2( this.layoutBounds.width / 2, centerYBelowSurface );
    backLayer.addChild( clockControlPanel );

    // create and add the "Reset All" button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
      },
      radius: 20,
      right: this.layoutBounds.maxX - EDGE_INSET,
      centerY: ( labBenchSurfaceImage.bounds.maxY + this.layoutBounds.maxY ) / 2
    } );
    this.addChild( resetAllButton );

    // Add the control for showing/hiding energy chunks.  The elements of this control are created separately to allow
    // each to be independently scaled.
    var energyChunkNode = EnergyChunkNode.createEnergyChunkNode( EnergyType.THERMAL );
    energyChunkNode.pickable = false;
    var label = new Text( energySymbolsString, {
      font: new PhetFont( 20 )
    } );
    var showEnergyCheckbox = new Checkbox( new LayoutBox( {
        children: [ label, energyChunkNode ],
        orientation: 'horizontal',
        spacing: 5
      } ), model.energyChunksVisibleProperty
    );
    var controlPanel = new Panel( showEnergyCheckbox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      rightTop: new Vector2( this.layoutBounds.width - EDGE_INSET, EDGE_INSET )
    } );
    this.addChild( controlPanel );

    // add the burners
    var burnerProjectionAmount =
      modelViewTransform.modelToViewShape( model.leftBurner.getOutlineRect() ).width * BURNER_EDGE_TO_HEIGHT_RATIO;

    // set up left heater-cooler node, front and back are added separately to support layering of energy chunks
    var leftHeaterCoolerBack = new HeaterCoolerBack( {
      heatCoolAmountProperty: model.leftBurner.heatCoolLevelProperty,
      centerX: modelViewTransform.modelToViewX( model.leftBurner.getOutlineRect().centerX ),
      bottom: modelViewTransform.modelToViewY( model.leftBurner.getOutlineRect().minY )
    } );
    var leftHeaterCoolerFront = new HeaterCoolerFront( {
      heatCoolAmountProperty: model.leftBurner.heatCoolLevelProperty,
      leftTop: leftHeaterCoolerBack.getHeaterFrontPosition()
    } );
    heaterCoolerFrontLayer.addChild( leftHeaterCoolerFront );
    backLayer.addChild( leftHeaterCoolerBack );
    backLayer.addChild( new BurnerStandNode(
      modelViewTransform.modelToViewShape( model.leftBurner.getOutlineRect() ),
      burnerProjectionAmount )
    );

    // set up right heater-cooler node
    var rightHeaterCoolerBack = new HeaterCoolerBack( {
      heatCoolAmountProperty: model.rightBurner.heatCoolLevelProperty,
      centerX: modelViewTransform.modelToViewX( model.rightBurner.getOutlineRect().centerX ),
      bottom: modelViewTransform.modelToViewY( model.rightBurner.getOutlineRect().minY )
    } );
    var rightHeaterCoolerFront = new HeaterCoolerFront( {
      heatCoolAmountProperty: model.rightBurner.heatCoolLevelProperty,
      leftTop: rightHeaterCoolerBack.getHeaterFrontPosition()
    } );
    heaterCoolerFrontLayer.addChild( rightHeaterCoolerFront );
    backLayer.addChild( rightHeaterCoolerBack );
    backLayer.addChild( new BurnerStandNode(
      modelViewTransform.modelToViewShape( model.rightBurner.getOutlineRect() ),
      burnerProjectionAmount )
    );

    // add the air
    airLayer.addChild( new AirNode( model.air, modelViewTransform ) );

    // TODO: convert this into a query parameter
    if ( SHOW_LAYOUT_BOUNDS ) {
      this.addChild( new Rectangle( this.layoutBounds, {
        stroke: 'rgba( 255, 0, 0, 0.9 )'
      } ) );
    }

    // add the blocks
    var brickNode = new BlockNode( model.brick, this.layoutBounds, modelViewTransform, {
      setApproachingEnergyChunkParentNode: airLayer
    } );
    blockLayer.addChild( brickNode );
    var ironBlockNode = new BlockNode( model.ironBlock, this.layoutBounds, modelViewTransform, {
      setApproachingEnergyChunkParentNode: airLayer
    } );
    blockLayer.addChild( ironBlockNode );
    var beakerView = new BeakerContainerView( model, this.layoutBounds, modelViewTransform );

    // add the beaker, which is composed of several pieces
    beakerFrontLayer.addChild( beakerView.frontNode );
    beakerBackLayer.addChild( beakerView.backNode );
    beakerGrabLayer.addChild( beakerView.grabNode );

    // the thermometer layer needs to be above the movable objects
    var thermometerLayer = new Node();
    this.addChild( thermometerLayer );

    // add the thermometer nodes
    var movableThermometerNodes = [];
    model.thermometers.forEach( function( thermometer ) {
      var thermometerNode = new MovableThermometerNode( thermometer, self.layoutBounds, modelViewTransform );
      thermometerLayer.addChild( thermometerNode );

      // TODO: this listener implement some initial drag and drop functionality, but needs more work for the correct behavior
      thermometerNode.addInputListener( new SimpleDragHandler( {
        up: function( event ) {

          console.log( 'up' );

          // Released over toolbox, so deactivate.
          if ( thermometerNode.intersectsBounds( thermometerToolbox.bounds ) ) {
            thermometer.activeProperty.set( false );
          }
        }
      } ) );

      movableThermometerNodes.push( thermometerNode );
    } );

    // TODO: In the orignal Java sim, there were separate nodes for the thermometors in the tool box versus those in
    // the play area.  I (jbphet) want to simplify this in the HTML5 version, and below is the code that will be revised
    // in order to do this.

    // add the toolbox for the thermometers
    var thermometerBox = new HBox();
    var thermometerToolboxNodes = [];
    movableThermometerNodes.forEach( function( movableThermometerNode ) {
      var thermometerToolboxNode = new ThermometerToolboxNode( movableThermometerNode, modelViewTransform );
      thermometerBox.addChild( thermometerToolboxNode );
      thermometerToolboxNodes.push( thermometerToolboxNode );
    } );

    var thermometerToolbox = new Panel( thermometerBox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR
    } );

    thermometerToolbox.translation = new Vector2( EDGE_INSET, EDGE_INSET );
    // backLayer.addChild( thermometerBox );
    backLayer.addChild( thermometerToolbox );
    thermometerToolboxNodes.forEach( function( thermometerToolboxNode ) {
      thermometerToolboxNode.returnRect = thermometerBox.bounds;
    } );

    // create a function that updates the Z-order of the blocks when the user-controlled state changes
    var blockChangeListener = function() {
      if ( model.ironBlock.isStackedUpon( model.brick ) ) {
        brickNode.moveToBack();
      }
      else if ( model.brick.isStackedUpon( model.ironBlock ) ) {
        ironBlockNode.moveToBack();
      }
      else if ( model.ironBlock.getBounds().minX >= model.brick.getBounds().maxX ||
                model.ironBlock.getBounds().minY >= model.brick.getBounds().maxY ) {
        ironBlockNode.moveToFront();
      }
      else if ( model.brick.getBounds().minX >= model.ironBlock.getBounds().maxX ||
                model.brick.getBounds().minY >= model.ironBlock.getBounds().maxY ) {
        brickNode.moveToFront();
      }
    };

    // update the Z-order of the blocks whenever the "userControlled" state of either changes
    model.brick.positionProperty.link( blockChangeListener );
    model.ironBlock.positionProperty.link( blockChangeListener );
  }

  energyFormsAndChanges.register( 'EFACIntroScreenView', EFACIntroScreenView );

  return inherit( ScreenView, EFACIntroScreenView );
} );
