// Copyright 2014-2015, University of Colorado Boulder

/**
 * View for the 'Intro' screen of the Energy Forms And Changes simulation.
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
  var CheckBox = require( 'SUN/CheckBox' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  var HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var MovableThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/MovableThermometerNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var NormalAndFastForwardTimeControlPanel = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/NormalAndFastForwardTimeControlPanel' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var ThermometerToolBoxNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermometerToolBoxNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );

  // images
  var mockupImage = require( 'image!ENERGY_FORMS_AND_CHANGES/mockup_intro.png' );
  var shelfImage = require( 'image!ENERGY_FORMS_AND_CHANGES/shelf_long.png' );

  // constants
  var EDGE_INSET = 10;
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.
  var SHOW_LAYOUT_BOUNDS = false;
  var SHOW_MOCKUP = false;

  // Boolean property for showing/hiding developer control for dumping energy levels.
  // var showDumpEnergiesButton = new Property( false );

  /**
   * Constructor for the Energy Forms and Changes Intro Screen.
   *
   * @param {EnergyFormsAndChangesIntroModel} model
   * @constructor
   */
  function EnergyFormsAndChangesIntroScreenView( model ) {

    ScreenView.call( this, { layoutBounds: new Bounds2( 0, 0, 1024, 618 ) } );

    var thisScreenView = this;
    this.model = model;

    // Create the model-view transform.  The primary units used in the model are
    // meters, so significant zoom is used.  The multipliers for the 2nd
    // parameter can be used to adjust where the point (0, 0) in the model,
    // which is on the middle of the screen above the counter as located in the
    // view.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2(
        Math.round( thisScreenView.layoutBounds.width * 0.5 ),
        Math.round( thisScreenView.layoutBounds.height * 0.85 ) ),
      2200 ); // "Zoom factor" - smaller zooms out, larger zooms in.

    // Create some nodes that will act as layers in order to create the needed Z-order behavior.
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
    var thermometerLayer = new Node();
    this.addChild( thermometerLayer );
    var beakerFrontLayer = new Node();
    this.addChild( beakerFrontLayer );

    // Create the lab bench surface image.
    var labBenchSurfaceImage = new Image( shelfImage );
    labBenchSurfaceImage.leftTop = ( new Vector2(
      modelViewTransform.modelToViewX( 0 ) - labBenchSurfaceImage.width / 2,

      // Slight tweak factor here due to nature of image.
      modelViewTransform.modelToViewY( 0 ) - ( labBenchSurfaceImage.height / 2 ) + 10 ) );

    // Create a rectangle that will act as the background below the lab bench
    // surface, basically like the side of the bench.
    var benchWidth = labBenchSurfaceImage.width * 0.95;
    var benchHeight = 1000; // Arbitrary large number, user should never see the bottom of this.
    var labBenchSide = new Rectangle(
      labBenchSurfaceImage.centerX - benchWidth / 2,
      labBenchSurfaceImage.centerY,
      benchWidth,
      benchHeight, { fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR } );

    // Add the bench side and top to the scene.  The lab bench side must be behind the bench top.
    backLayer.addChild( labBenchSide );
    backLayer.addChild( labBenchSurfaceImage );

    // Calculate the vertical center between the lower edge of the top of the
    // bench and the bottom of the canvas.  This is for layout.
    var centerYBelowSurface = ( this.layoutBounds.height + labBenchSurfaceImage.bottom ) / 2;

    // Add the clock controls.
    var clockControlPanel = new NormalAndFastForwardTimeControlPanel( model );
    clockControlPanel.center = new Vector2( this.layoutBounds.width / 2, centerYBelowSurface );
    backLayer.addChild( clockControlPanel );

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
      },
      radius: 20
    } );
    resetAllButton.center = new Vector2( this.layoutBounds.width - 2 * resetAllButton.width, centerYBelowSurface );
    this.addChild( resetAllButton );

    // Add the control for showing/hiding energy chunks.  The elements of this
    // control are created separately to allow each to be independently scaled.
    var energyChunkNode = EnergyChunkNode.createEnergyChunkNode( EnergyType.THERMAL );
    energyChunkNode.scale( 1.0 );
    energyChunkNode.pickable = false;
    var label = new Text( energySymbolsString, { font: new PhetFont( 20 ) } );
    var showEnergyCheckBox = new CheckBox( new LayoutBox( {
      children: [ label, energyChunkNode ],
      orientation: 'horizontal',
      spacing: 5
    } ), model.energyChunksVisibleProperty );
    var controlPanel = new Panel( showEnergyCheckBox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH
    } );
    controlPanel.rightTop = new Vector2( this.layoutBounds.width - EDGE_INSET, EDGE_INSET );
    this.addChild( controlPanel );


    // Add the burners.
    var burnerProjectionAmount =
      modelViewTransform.modelToViewShape( model.leftBurner.getOutlineRect() ).width * BURNER_EDGE_TO_HEIGHT_RATIO;
    var burnerYPosTweak = -10; // Empirically determined for best look.

    // Set up left heater-cooler node. Front and back are added separately so support layering of energy chunks.
    var leftHeaterCoolerBack = new HeaterCoolerBack( {
      heatCoolLevelProperty: model.leftBurner.heatCoolLevelProperty
    } );
    var leftHeaterCoolerFront = new HeaterCoolerFront( {
      heatCoolLevelProperty: model.leftBurner.heatCoolLevelProperty
    } );
    leftHeaterCoolerBack.leftTop = new Vector2(
      modelViewTransform.modelToViewX( model.leftBurner.getOutlineRect().centerX ) -
      leftHeaterCoolerBack.bounds.width / 2,
      modelViewTransform.modelToViewY( model.leftBurner.getOutlineRect().minY ) -
      leftHeaterCoolerBack.bounds.union( leftHeaterCoolerFront.bounds ).height - burnerYPosTweak );
    leftHeaterCoolerFront.leftTop = leftHeaterCoolerBack.getHeaterFrontPosition();
    heaterCoolerFrontLayer.addChild( leftHeaterCoolerFront );
    backLayer.addChild( leftHeaterCoolerBack );
    backLayer.addChild( new BurnerStandNode(
      modelViewTransform.modelToViewShape( model.leftBurner.getOutlineRect() ),
      burnerProjectionAmount ) );

    // Set up right heater-cooler node.
    var rightHeaterCoolerBack = new HeaterCoolerBack( {
      heatCoolLevelProperty: model.rightBurner.heatCoolLevelProperty
    } );
    var rightHeaterCoolerFront = new HeaterCoolerFront( {
      heatCoolLevelProperty: model.rightBurner.heatCoolLevelProperty
    } );
    rightHeaterCoolerBack.leftTop = new Vector2(
      modelViewTransform.modelToViewX( model.rightBurner.getOutlineRect().centerX ) -
      rightHeaterCoolerBack.bounds.width / 2,
      modelViewTransform.modelToViewY( model.rightBurner.getOutlineRect().minY ) -
      rightHeaterCoolerBack.bounds.union( rightHeaterCoolerFront.bounds ).height - burnerYPosTweak );
    rightHeaterCoolerFront.leftTop = rightHeaterCoolerBack.getHeaterFrontPosition();
    heaterCoolerFrontLayer.addChild( rightHeaterCoolerFront );
    backLayer.addChild( rightHeaterCoolerBack );
    backLayer.addChild( new BurnerStandNode(
      modelViewTransform.modelToViewShape( model.rightBurner.getOutlineRect() ),
      burnerProjectionAmount ) );

    // Add the air.
    airLayer.addChild( new AirNode( model.air, modelViewTransform ) );

    if ( SHOW_LAYOUT_BOUNDS ) {
      this.addChild( new Rectangle( this.layoutBounds, { stroke: 'rgba( 255, 0, 0, 0.9 )' } ) );
    }

    // Add the movable objects.
    var brickNode = new BlockNode( model, model.brick, this.layoutBounds, modelViewTransform );
    brickNode.setApproachingEnergyChunkParentNode( airLayer );
    blockLayer.addChild( brickNode );
    var ironBlockNode = new BlockNode( model, model.ironBlock, this.layoutBounds, modelViewTransform );
    ironBlockNode.setApproachingEnergyChunkParentNode( airLayer );
    blockLayer.addChild( ironBlockNode );
    var beakerView = new BeakerContainerView( model, this.layoutBounds, modelViewTransform );
    this.addChild( beakerView );

    //Show the mock-up and a slider to change its transparency
    if ( SHOW_MOCKUP ) {
      var mockupOpacityProperty = new Property( 0.02 );
      var image = new Image( mockupImage, { pickable: false } );
      image.scale( this.layoutBounds.width / image.width, this.layoutBounds.height / image.height );
      mockupOpacityProperty.linkAttribute( image, 'opacity' );
      this.addChild( image );
      this.addChild( new HSlider( mockupOpacityProperty, { min: 0, max: 1 }, { top: 10, left: 10 } ) );
    }

    // Add the thermometer nodes.
    var movableThermometerNodes = [];
    model.thermometers.forEach( function( thermometer ) {
      var thermometerNode = new MovableThermometerNode( thermometer, thisScreenView.layoutBounds, modelViewTransform );
      thermometerLayer.addChild( thermometerNode );

      // TODO: this is not working - why?
      thermometerNode.addInputListener( new SimpleDragHandler( {
        up: function( event ) {

          console.log( 'up' );

          // Released over tool box, so deactivate.
          if ( thermometerNode.intersectsBounds( thermometerToolBox.bounds ) ) {
            thermometer.activeProperty.set( false );
          }
        }
      } ) );

      //      thermometerNode.addInputEventListener( new PBasicInputEventHandler().withAnonymousClassBody( {
      //        mouseReleased: function( event ) {
      //          if ( thermometerNode.bounds.intersects( thermometerToolBox.bounds ) ) {
      //            // Released over tool box, so deactivate.
      //            thermometer.active.set( false );
      //          }
      //        }
      //      } ) );
      movableThermometerNodes.push( thermometerNode );
    } );

    // Add the tool box for the thermometers.
    var thermometerBox = new HBox();
    var thermometerToolBoxNodes = [];
    movableThermometerNodes.forEach( function( movableThermometerNode ) {
      var thermometerToolBoxNode = new ThermometerToolBoxNode( movableThermometerNode, modelViewTransform );
      thermometerBox.addChild( thermometerToolBoxNode );
      thermometerToolBoxNodes.push( thermometerToolBoxNode );
    } );

    var thermometerToolBox = new Panel( thermometerBox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR
    } );

    thermometerToolBox.translation = new Vector2( EDGE_INSET, EDGE_INSET );
    // backLayer.addChild( thermometerBox );
    backLayer.addChild( thermometerToolBox );
    thermometerToolBoxNodes.forEach( function( thermometerToolBoxNode ) {
      thermometerToolBoxNode.returnRect = thermometerBox.bounds;
    } );

    // Create a function that updates the Z-order of the blocks when the user controlled state changes.
    var blockChangeObserver = function() {

      if ( model.ironBlock.isStackedUpon( model.brick ) ) {
        brickNode.moveToBack();
      } else if ( model.brick.isStackedUpon( model.ironBlock ) ) {
        ironBlockNode.moveToBack();
      } else if ( model.ironBlock.getBounds().minX >= model.brick.getBounds().maxX ||
        model.ironBlock.getBounds().minY >= model.brick.getBounds().maxY ) {
        ironBlockNode.moveToFront();
      } else if ( model.brick.getBounds().minX >= model.ironBlock.getBounds().maxX ||
        model.brick.getBounds().minY >= model.ironBlock.getBounds().maxY ) {
        brickNode.moveToFront();
      }

    };

    // Update the Z-order of the blocks whenever the "userControlled" state of either changes.
    model.brick.positionProperty.link( blockChangeObserver );
    model.ironBlock.positionProperty.link( blockChangeObserver );

    // This is a hack to deal with issue #23.
    model.reset();
  }

  energyFormsAndChanges.register( 'EnergyFormsAndChangesIntroScreenView', EnergyFormsAndChangesIntroScreenView );

  return inherit( ScreenView, EnergyFormsAndChangesIntroScreenView );

} );

