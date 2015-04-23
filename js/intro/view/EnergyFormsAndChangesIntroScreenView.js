// Copyright 2002-2015, University of Colorado Boulder

/**
 * View for the 'Intro' screen of the Energy Forms And Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  //var Circle = require( 'SCENERY/nodes/Circle' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var CheckBox = require( 'SUN/CheckBox' );
  var LayoutBox = require( 'SCENERY/nodes/LayoutBox' );
  var Panel = require( 'SUN/Panel' );
  //var Panel = require( 'SUN/Panel' );
  var Property = require( 'AXON/Property' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
//  var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
//  var BeakerView = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BeakerView' );
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var HeaterCoolerNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/HeaterCoolerNode' );
//  var EFACIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EFACIntroModel' );
//  var ElementFollowingThermometer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ElementFollowingThermometer' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var ThermometerToolBoxNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/ThermometerToolBoxNode' );
  var MovableThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/MovableThermometerNode' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  //var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  //var SimpleDragHandler = require( 'SCENERY/input/SimpleDragHandler' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  //var PropertySet = require( 'AXON/PropertySet' );
  //var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var NormalAndFastForwardTimeControlPanel = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/NormalAndFastForwardTimeControlPanel' );

  // strings
  var energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );
  var heatString = require( 'string!ENERGY_FORMS_AND_CHANGES/heat' );
  var coolString = require( 'string!ENERGY_FORMS_AND_CHANGES/cool' );

  // images
  var mockupImage = require( 'image!ENERGY_FORMS_AND_CHANGES/mockup_intro.png' );
  var shelfImage = require( 'image!ENERGY_FORMS_AND_CHANGES/shelf_long.png' );

  // constants
  var EDGE_INSET = 10;
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.

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

    var thisScreen = this;
    this.model = model;

    //var STAGE_SIZE = this.layoutBounds;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.  The multipliers for the 2nd
    // parameter can be used to adjust where the point (0, 0) in the model, which is on the middle of the screen above the counter as located in the
    // view.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( Math.round( thisScreen.layoutBounds.width * 0.5 ), Math.round( thisScreen.layoutBounds.height * 0.85 ) ),
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
      modelViewTransform.modelToViewY( 0 ) - ( labBenchSurfaceImage.height / 2 ) + 10 ) // Slight tweak factor here due to nature of image.
    );

    // Create a rectangle that will act as the background below the lab bench surface, basically like the side of the bench.
    var benchWidth = labBenchSurfaceImage.width * 0.95;
    var benchHeight = 1000; // Arbitrary large number, user should never see the bottom of this.
    var labBenchSide = new Rectangle( labBenchSurfaceImage.centerX - benchWidth / 2, labBenchSurfaceImage.centerY, benchWidth, benchHeight, {
      fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR
    } );

    // Add the bench side and top to the scene.  The lab bench side must be behind the bench top.
    backLayer.addChild( labBenchSide );
    backLayer.addChild( labBenchSurfaceImage );

    // Calculate the vertical center between the lower edge of the top of the bench and the bottom of the canvas.  This is for layout.
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

    // Add the control for showing/hiding energy chunks.  The elements of this control are created separately to allow each to be independently
    // scaled.
    var energyChunkNode = EnergyChunkNode.createEnergyChunkNode( EnergyType.THERMAL );
    energyChunkNode.scale( 1.0 ); // TODO: Why is this here?
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
    var burnerProjectionAmount = modelViewTransform.modelToViewShape( model.leftBurner.getOutlineRect() ).width * BURNER_EDGE_TO_HEIGHT_RATIO;
    var burnerWidth = modelViewTransform.modelToViewDeltaX( model.leftBurner.getOutlineRect().width ) * 0.7;
    var burnerHeight = burnerWidth * 0.8;
    var burnerOpeningHeight = burnerHeight * 0.2;
    var burnerYPosTweak = -10; // Empirically determined for best look.

    // Set up left heater-cooler node.
    // TODO: This will require HeaterCoolerNode.  The plan is to make StoveNode of States of Matter common in scenery-phet.

    //var leftHeaterCooler = new HeaterCoolerNode( model.leftBurner.heatCoolLevelProperty, true, true,
    //  heatString, coolString, burnerWidth, burnerHeight, burnerOpeningHeight, true, model.leftBurner.energyChunkList, modelViewTransform );

    //leftHeaterCooler.setOffset( modelViewTransform.modelToViewX( model.leftBurner.getOutlineRect().centerX ) - leftHeaterCooler.holeLayer.bounds.width / 2,
    //  modelViewTransform.modelToViewY( model.leftBurner.getOutlineRect().minY ) - leftHeaterCooler.frontLayer.bounds.height - burnerYPosTweak );

    //backLayer.addChild( leftHeaterCooler.holeLayer );
    //backLayer.addChild( new BurnerStandNode( modelViewTransform.modelToViewShape( model.leftBurner.getOutlineRect() ), burnerProjectionAmount ) );
    //heaterCoolerFrontLayer.addChild( leftHeaterCooler.frontLayer );
    //leftHeaterCooler.setOffset( mvt.modelToViewX( model.getLeftBurner().getOutlineRect().getCenterX() ) - leftHeaterCooler.getHoleNode().getFullBounds().getWidth() / 2,
    //  mvt.modelToViewY( model.getLeftBurner().getOutlineRect().getMinY() ) - leftHeaterCooler.getFrontNode().getFullBounds().getHeight() - burnerYPosTweak );
    //backLayer.addChild( leftHeaterCooler.getHoleNode() );
    //backLayer.addChild( new BurnerStandNode( mvt.modelToView( model.getLeftBurner().getOutlineRect() ).getBounds2D(), burnerProjectionAmount ) );
    //heaterCoolerFrontLayer.addChild( leftHeaterCooler.getFrontNode() );


    //Show the mock-up and a slider to change its transparency
    var mockupOpacityProperty = new Property( 0.02 );
    var image = new Image( mockupImage, { pickable: false } );
    image.scale( this.layoutBounds.width / image.width, this.layoutBounds.height / image.height );
    mockupOpacityProperty.linkAttribute( image, 'opacity' );
    this.addChild( image );
    this.addChild( new HSlider( mockupOpacityProperty, { min: 0, max: 1 }, { top: 10, left: 10 } ) );

//    heaterCoolerFrontLayer.addChild( leftHeaterCooler.getFrontNode() );(


    // Add the thermometer nodes.
    var movableThermometerNodes = [];
    model.thermometers.forEach( function( thermometer ) {
      var thermometerNode = new MovableThermometerNode( thermometer, modelViewTransform );
      thermometerLayer.addChild( thermometerNode );

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
//    // Add the tool box for the thermometers.
    var thermometerBox = new HBox();
    var thermometerToolBoxNodes = [];
    movableThermometerNodes.forEach( function( movableThermometerNode ) {
      var thermometerToolBoxNode = new ThermometerToolBoxNode( movableThermometerNode, modelViewTransform );
      thermometerBox.addChild( thermometerToolBoxNode );
      thermometerToolBoxNodes.push( thermometerToolBoxNode );
    } );
    var thermometerToolBox = new Node();
//    var thermometerToolBox = new ControlPanelNode( thermometerBox, CONTROL_PANEL_BACKGROUND_COLOR, CONTROL_PANEL_OUTLINE_STROKE, CONTROL_PANEL_OUTLINE_COLOR );
//    thermometerToolBox.translation({x: EDGE_INSET, y:EDGE_INSET} );
    backLayer.addChild( thermometerBox );
    //   backLayer.addChild( thermometerToolBox );
    thermometerToolBoxNodes.forEach( function( thermometerToolBoxNode ) {
      thermometerToolBoxNode.setReturnRect( thermometerBox.bounds );
    } );

  }

  return inherit( ScreenView, EnergyFormsAndChangesIntroScreenView, {

    //   Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );

//
//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.intro.view;
//
//import java.awt.Color;
//import java.awt.Point;
//import java.awt.Shape;
//import java.awt.event.ActionEvent;
//import java.awt.event.ActionListener;
//import java.awt.geom.Dimension2D;
//import java.awt.geom.Point2D;
//import java.awt.geom.Rectangle2D;
//import java.util.ArrayList;
//
//import edu.colorado.phet.common.phetcommon.model.Resettable;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.util.SimpleObserver;
//import edu.colorado.phet.common.phetcommon.util.function.VoidFunction1;
//import edu.colorado.phet.common.phetcommon.view.controls.PropertyCheckBox;
//import edu.colorado.phet.common.phetcommon.view.graphics.transforms.ModelViewTransform;
//import edu.colorado.phet.common.phetcommon.view.util.PhetFont;
//import edu.colorado.phet.common.piccolophet.PhetPCanvas;
//import edu.colorado.phet.common.piccolophet.event.CursorHandler;
//import edu.colorado.phet.common.piccolophet.nodes.ControlPanelNode;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPPath;
//import edu.colorado.phet.common.piccolophet.nodes.PhetPText;
//import edu.colorado.phet.common.piccolophet.nodes.ResetAllButtonNode;
//import edu.colorado.phet.common.piccolophet.nodes.TextButtonNode;
//import edu.colorado.phet.common.piccolophet.nodes.layout.HBox;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesResources;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesSimSharing;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.common.model.Beaker;
//import edu.colorado.phet.energyformsandchanges.common.model.EnergyType;
//import edu.colorado.phet.energyformsandchanges.common.view.BeakerView;
//import edu.colorado.phet.energyformsandchanges.common.view.BurnerStandNode;
//import edu.colorado.phet.energyformsandchanges.common.view.EnergyChunkNode;
//import edu.colorado.phet.energyformsandchanges.energysystems.view.HeaterCoolerView;
//import edu.colorado.phet.energyformsandchanges.intro.model.EFACIntroModel;
//import edu.colorado.phet.energyformsandchanges.intro.model.ElementFollowingThermometer;
//import edu.umd.cs.piccolo.PNode;
//import edu.umd.cs.piccolo.event.PBasicInputEventHandler;
//import edu.umd.cs.piccolo.event.PInputEvent;
//import edu.umd.cs.piccolo.nodes.PImage;
//import edu.umd.cs.piccolox.pswing.PSwing;
//
//import static edu.colorado.phet.energyformsandchanges.common.EFACConstants.*;
//
///**
// * Piccolo canvas for the "Intro" tab of the Energy Forms and Changes
// * simulation.
// *
// * @author John Blanco
// */
//public class EFACIntroCanvas extends PhetPCanvas implements Resettable {
//
//  public static final Dimension2D STAGE_SIZE = CenteredStage.DEFAULT_STAGE_SIZE;
//  private static final double EDGE_INSET = 10;
//  public static final double BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.
//
//  // Boolean property for showing/hiding developer control for dumping energy levels.
//  public static final BooleanProperty showDumpEnergiesButton = new BooleanProperty( false );
//
//  private final EFACIntroModel model;
//  private final PNode thermometerToolBox;
//  private final BooleanProperty normalSimSpeed = new BooleanProperty( true );
//
//  /**
//   * Constructor.
//   *
//   * @param model Model being portrayed on this canvas.
//   */
//  public EFACIntroCanvas( final EFACIntroModel model ) {
//    this.model = model;
//
//    // Set up the canvas-screen transform.
//    setWorldTransformStrategy( new CenteredStage( this ) );
//
//    // Set up the model-canvas transform.
//    //
//    // IMPORTANT NOTES: The multiplier factors for the 2nd point can be
//    // adjusted to shift the center right or left, and the scale factor
//    // can be adjusted to zoom in or out (smaller numbers zoom out, larger
//    // ones zoom in).
//    final ModelViewTransform modelViewTransform = ModelViewTransform.createSinglePointScaleInvertedYMapping(
//      new Point2D.Double( 0, 0 ),
//      new Point( (int) Math.round( STAGE_SIZE.getWidth() * 0.5 ), (int) Math.round( STAGE_SIZE.getHeight() * 0.85 ) ),
//    2200 ); // "Zoom factor" - smaller zooms out, larger zooms in.
//
//    setBackground( FIRST_TAB_BACKGROUND_COLOR );
//
//    // Set up a root node for our scene graph.
//    final PNode rootNode = new PNode();
//    addWorldChild( rootNode );
//
//    // Create some PNodes that will act as layers in order to create the
//    // needed Z-order behavior.
//    final PNode backLayer = new PNode();
//    rootNode.addChild( backLayer );
//    final PNode beakerBackLayer = new PNode();
//    rootNode.addChild( beakerBackLayer );
//    final PNode beakerGrabLayer = new PNode();
//    rootNode.addChild( beakerGrabLayer );
//    final PNode blockLayer = new PNode();
//    rootNode.addChild( blockLayer );
//    PNode airLayer = new PNode();
//    rootNode.addChild( airLayer );
//    PNode heaterCoolerFrontLayer = new PNode();
//    rootNode.addChild( heaterCoolerFrontLayer );
//    final PNode thermometerLayer = new PNode();
//    rootNode.addChild( thermometerLayer );
//    final PNode beakerFrontLayer = new PNode();
//    rootNode.addChild( beakerFrontLayer );
//
//    // Add the lab bench surface.
//    final PNode labBenchSurface = new PImage( EnergyFormsAndChangesResources.Images.SHELF_LONG );
//    labBenchSurface.setOffset( modelViewTransform.modelToViewX( 0 ) - labBenchSurface.getFullBoundsReference().getWidth() / 2,
//        modelViewTransform.modelToViewY( 0 ) - labBenchSurface.getFullBoundsReference().getHeight() / 2 + 10 ); // Slight tweak factor here due to nature of image.
//    backLayer.addChild( labBenchSurface );
//
//    // Add a node that will act as the background below the lab bench
//    // surface, basically like the side of the bench.
//    {
//      double width = labBenchSurface.getFullBoundsReference().getWidth() * 0.95;
//      double height = 1000; // Arbitrary large number, user should never see the bottom of this.
//      Shape benchSupportShape = new Rectangle2D.Double( labBenchSurface.getFullBoundsReference().getCenterX() - width / 2,
//      labBenchSurface.getFullBoundsReference().getCenterY(),
//      width,
//      height );
//      PhetPPath labBenchSide = new PhetPPath( benchSupportShape, EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR );
//      backLayer.addChild( labBenchSide );
//      labBenchSide.moveToBack(); // Must be behind bench top.
//    }
//
//    // Calculate the vertical center between the lower edge of the top of
//    // the bench and the bottom of the canvas.  This is for layout.
//    double centerYBelowSurface = ( STAGE_SIZE.getHeight() + labBenchSurface.getFullBoundsReference().getMaxY() ) / 2;
//
//    // Add the clock controls.
//    {
//      PNode clockControl = new NormalAndFastForwardTimeControlPanel( normalSimSpeed, model.getClock() );
//      clockControl.centerFullBoundsOnPoint( STAGE_SIZE.getWidth() / 2, centerYBelowSurface );
//      normalSimSpeed.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean normalSimSpeed ) {
//        ConstantDtClock clock = model.getClock();
//        clock.setDt( normalSimSpeed ? SIM_TIME_PER_TICK_NORMAL : SIM_TIME_PER_TICK_FAST_FORWARD );
//      }
//    } );
//      backLayer.addChild( clockControl );
//    }
//
//    // Add the reset button.
//    {
//      ResetAllButtonNode resetButton = new ResetAllButtonNode( this, this, 20, Color.black, new Color( 255, 153, 0 ) );
//      resetButton.setConfirmationEnabled( false );
//      resetButton.setOffset( STAGE_SIZE.getWidth() - resetButton.getFullBoundsReference().width - 20,
//          centerYBelowSurface - resetButton.getFullBoundsReference().getHeight() / 2 );
//      backLayer.addChild( resetButton );
//    }
//
//    // Add the control for showing/hiding energy chunks.  The elements of
//    // this control are created separately to allow each to be independently scaled.
//    {
//      PNode energyChunkNode = EnergyChunkNode.createEnergyChunkNode( EnergyType.THERMAL );
//      energyChunkNode.setScale( 1.0 );
//      energyChunkNode.setPickable( false );
//      PNode label = new PhetPText( EnergyFormsAndChangesResources.Strings.ENERGY_SYMBOLS, new PhetFont( 20 ) ) {{
//      setPickable( false );
//      setChildrenPickable( false );
//    }};
//      PropertyCheckBox showEnergyCheckBox = new PropertyCheckBox( EnergyFormsAndChangesSimSharing.UserComponents.showEnergyCheckBox,
//      null,
//      model.energyChunksVisible );
//      showEnergyCheckBox.setFont( new PhetFont( 40 ) );
//      PNode checkBoxNode = new PSwing( showEnergyCheckBox ) {{
//      setScale( 1.5 );
//      setPickable( false );
//      setChildrenPickable( false );
//    }};
//      PNode hBox = new HBox( 5, checkBoxNode, label, energyChunkNode );
//      PNode controlPanel = new ControlPanelNode( hBox, CONTROL_PANEL_BACKGROUND_COLOR, CONTROL_PANEL_OUTLINE_STROKE, CONTROL_PANEL_OUTLINE_COLOR ) {{
//      setOffset( STAGE_SIZE.getWidth() - getFullBoundsReference().width - EDGE_INSET, EDGE_INSET );
//      addInputEventListener( new PBasicInputEventHandler() {
//        @Override public void mouseClicked( PInputEvent event ) {
//          model.energyChunksVisible.set( !model.energyChunksVisible.get() );
//        }
//      } );
//      addInputEventListener( new CursorHandler() );
//    }};
////            backLayer.addChild( controlPanel );
//    }
//
//    // Add developer control for printing out energy values.
//    {
//      final TextButtonNode dumpEnergiesButton = new TextButtonNode( "Dump Energies", new PhetFont( 14 ) );
//      dumpEnergiesButton.addActionListener( new ActionListener() {
//      public void actionPerformed( ActionEvent e ) {
//        model.dumpEnergies();
//      }
//    } );
//      dumpEnergiesButton.setOffset( 20, centerYBelowSurface - dumpEnergiesButton.getFullBoundsReference().getHeight() / 2 );
//      backLayer.addChild( dumpEnergiesButton );
//
//      // Control the visibility of this button.
//      showDumpEnergiesButton.addObserver( new VoidFunction1<Boolean>() {
//      public void apply( Boolean visible ) {
//        dumpEnergiesButton.setVisible( visible );
//      }
//    } );
//    }
//
//    // Add the burners.
//    double burnerProjectionAmount = modelViewTransform.modelToView( model.getLeftBurner().getOutlineRect() ).bounds.width * BURNER_EDGE_TO_HEIGHT_RATIO;
//    double burnerWidth = modelViewTransform.modelToViewDeltaX( model.getLeftBurner().getOutlineRect().getWidth() ) * 0.7;
//    double burnerHeight = burnerWidth * 0.8;
//    double burnerOpeningHeight = burnerHeight * 0.2;
//    double burnerYPosTweak = -10; // Empirically determined for best look.
//
//    // Set up left heater-cooler node.
//    HeaterCoolerView leftHeaterCooler = new HeaterCoolerView( model.getLeftBurner().heatCoolLevel, true, true,
//      EnergyFormsAndChangesResources.Strings.HEAT,
//      EnergyFormsAndChangesResources.Strings.COOL,
//      burnerWidth, burnerHeight, burnerOpeningHeight, true,
//      model.getLeftBurner().energyChunkList, modelViewTransform );
//    leftHeaterCooler.setOffset( modelViewTransform.modelToViewX( model.getLeftBurner().getOutlineRect().getCenterX() ) - leftHeaterCooler.getHoleNode().getFullBounds().getWidth() / 2,
//        modelViewTransform.modelToViewY( model.getLeftBurner().getOutlineRect().getMinY() ) - leftHeaterCooler.getFrontNode().getFullBounds().getHeight() - burnerYPosTweak );
//    backLayer.addChild( leftHeaterCooler.getHoleNode() );
//    backLayer.addChild( new BurnerStandNode( modelViewTransform.modelToView( model.getLeftBurner().getOutlineRect() ).bounds, burnerProjectionAmount ) );
//    heaterCoolerFrontLayer.addChild( leftHeaterCooler.getFrontNode() );
//
//    // Set up right heater-cooler node.
//    HeaterCoolerView rightHeaterCooler = new HeaterCoolerView( model.getRightBurner().heatCoolLevel, true, true,
//      EnergyFormsAndChangesResources.Strings.HEAT,
//      EnergyFormsAndChangesResources.Strings.COOL,
//      burnerWidth, burnerHeight, burnerOpeningHeight, true,
//      model.getRightBurner().energyChunkList, modelViewTransform );
//    rightHeaterCooler.setOffset( modelViewTransform.modelToViewX( model.getRightBurner().getOutlineRect().getCenterX() ) - rightHeaterCooler.getHoleNode().getFullBounds().getWidth() / 2,
//        modelViewTransform.modelToViewY( model.getRightBurner().getOutlineRect().getMinY() ) - rightHeaterCooler.getFrontNode().getFullBounds().getHeight() - burnerYPosTweak );
//    backLayer.addChild( rightHeaterCooler.getHoleNode() );
//    backLayer.addChild( new BurnerStandNode( modelViewTransform.modelToView( model.getRightBurner().getOutlineRect() ).bounds, burnerProjectionAmount ) );
//    heaterCoolerFrontLayer.addChild( rightHeaterCooler.getFrontNode() );
//
//    // Add the air.
//    airLayer.addChild( new AirNode( model.getAir(), modelViewTransform ) );
//
//    // Add the movable objects.
//    final BlockNode brickNode = new BlockNode( model, model.getBrick(), modelViewTransform );
//    brickNode.setApproachingEnergyChunkParentNode( airLayer );
//    blockLayer.addChild( brickNode );
//    final BlockNode ironBlockNode = new BlockNode( model, model.getIronBlock(), modelViewTransform );
//    ironBlockNode.setApproachingEnergyChunkParentNode( airLayer );
//    blockLayer.addChild( ironBlockNode );
//    BeakerView beakerView = new BeakerContainerView( model.getClock(), model, modelViewTransform );
//    beakerFrontLayer.addChild( beakerView.getFrontNode() );
//    beakerBackLayer.addChild( beakerView.getBackNode() );
//    beakerGrabLayer.addChild( beakerView.getGrabNode() );
//
//    // Add the thermometer nodes.
//    ArrayList<MovableThermometerNode> movableThermometerNodes = new ArrayList<MovableThermometerNode>();
//    for ( final ElementFollowingThermometer thermometer : model.thermometers ) {
//      final MovableThermometerNode thermometerNode = new MovableThermometerNode( thermometer, modelViewTransform );
//      thermometerLayer.addChild( thermometerNode );
//      thermometerNode.addInputEventListener( new PBasicInputEventHandler() {
//        @Override public void mouseReleased( PInputEvent event ) {
//          if ( thermometerNode.getFullBoundsReference().intersects( thermometerToolBox.getFullBoundsReference() ) ) {
//            // Released over tool box, so deactivate.
//            thermometer.active.set( false );
//          }
//        }
//      } );
//      movableThermometerNodes.add( thermometerNode );
//    }
//
//    // Add the tool box for the thermometers.
//    HBox thermometerBox = new HBox();
//    ArrayList<ThermometerToolBoxNode> thermometerToolBoxNodes = new ArrayList<ThermometerToolBoxNode>();
//    for ( MovableThermometerNode movableThermometerNode : movableThermometerNodes ) {
//      ThermometerToolBoxNode thermometerToolBoxNode = new ThermometerToolBoxNode( movableThermometerNode, modelViewTransform, this );
//      thermometerBox.addChild( thermometerToolBoxNode );
//      thermometerToolBoxNodes.add( thermometerToolBoxNode );
//    }
//    thermometerToolBox = new ControlPanelNode( thermometerBox, CONTROL_PANEL_BACKGROUND_COLOR, CONTROL_PANEL_OUTLINE_STROKE, CONTROL_PANEL_OUTLINE_COLOR );
//    thermometerToolBox.setOffset( EDGE_INSET, EDGE_INSET );
//    backLayer.addChild( thermometerToolBox );
//    for ( ThermometerToolBoxNode thermometerToolBoxNode : thermometerToolBoxNodes ) {
//      thermometerToolBoxNode.setReturnRect( thermometerBox.getFullBoundsReference() );
//    }
//
//    // Add the control for setting the specific heat of the configurable block.
//    // HCL: This was for heat capacity lab prototype, and has been removed
//    // as of 8/6/2012.  It is being left in the code in case the HCL sim is
//    // revived.
////        PNode heatCapacityControlPanel;
////        {
////            HSliderNode heatCapacitySlider = new HSliderNode( EnergyFormsAndChangesSimSharing.UserComponents.heatCapacitySlider,
////                                                              ConfigurableHeatCapacityBlock.MIN_SPECIFIC_HEAT,
////                                                              ConfigurableHeatCapacityBlock.MAX_SPECIFIC_HEAT,
////                                                              model.getConfigurableBlock().specificHeat );
////            heatCapacitySlider.setTrackFillPaint( new GradientPaint( new Point2D.Double( 0, 0 ),
////                                                                     ConfigurableHeatCapacityBlock.HIGH_SPECIFIC_HEAT_COLOR,
////                                                                     new Point2D.Double( 0, VSliderNode.DEFAULT_TRACK_LENGTH ),
////                                                                     ConfigurableHeatCapacityBlock.LOW_SPECIFIC_HEAT_COLOR ) );
////            Font sliderLabelFont = new PhetFont( 16 );
////            heatCapacitySlider.addLabel( ConfigurableHeatCapacityBlock.MIN_SPECIFIC_HEAT, new PhetPText( "low", sliderLabelFont ) );
////            heatCapacitySlider.addLabel( ConfigurableHeatCapacityBlock.MAX_SPECIFIC_HEAT, new PhetPText( "high", sliderLabelFont ) );
////            heatCapacityControlPanel = new ControlPanelNode( new VBox( new HBox( new BlockIconNode( model.getConfigurableBlock().color ),
////                                                                                 new PhetPText( "Heat Capacity", new PhetFont( 18 ) ) ),
////                                                                       heatCapacitySlider ),
////                                                             EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR );
////            heatCapacityControlPanel.setOffset( thermometerToolBox.getFullBoundsReference().getMaxX() + EDGE_INSET, EDGE_INSET );
////            backLayer.addChild( heatCapacityControlPanel );
////        }
//
//    // Create an observer that updates the Z-order of the blocks when the
//    // user controlled state changes.
//    SimpleObserver blockChangeObserver = new SimpleObserver() {
//      public void update() {
//        if ( model.getIronBlock().isStackedUpon( model.getBrick() ) ) {
//          brickNode.moveToBack();
//        }
//        else if ( model.getBrick().isStackedUpon( model.getIronBlock() ) ) {
//          ironBlockNode.moveToBack();
//        }
//        else if ( model.getIronBlock().getRect().getMinX() >= model.getBrick().getRect().getMaxX() ||
//                  model.getIronBlock().getRect().getMinY() >= model.getBrick().getRect().getMaxY() ) {
//          ironBlockNode.moveToFront();
//        }
//        else if ( model.getBrick().getRect().getMinX() >= model.getIronBlock().getRect().getMaxX() ||
//                  model.getBrick().getRect().getMinY() >= model.getIronBlock().getRect().getMaxY() ) {
//          brickNode.moveToFront();
//        }
//      }
//    };
//
//    // Create an observer that moves the grab node of the beaker behind
//    // the blocks when one or more blocks are in the beaker so that the
//    // blocks can be extracted.
//    model.getBeaker().fluidLevel.addObserver( new VoidFunction1<Double>() {
//      public void apply( Double fluidLevel ) {
//        if ( fluidLevel !== Beaker.INITIAL_FLUID_LEVEL ) {
//          beakerGrabLayer.moveInBackOf( blockLayer );
//        }
//        else {
//          beakerGrabLayer.moveInFrontOf( blockLayer );
//        }
//      }
//    } );
//
//    // Update the Z-order of the blocks whenever the "userControlled" state
//    // of either changes.
//    model.getBrick().position.addObserver( blockChangeObserver );
//    model.getIronBlock().position.addObserver( blockChangeObserver );
//  }
//
//  public void reset() {
//    model.reset();
//    normalSimSpeed.reset();
//    model.getClock().setPaused( false );
//  }
//}
//
