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
  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  var LinkableHeaterCoolerFront = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/LinkableHeaterCoolerFront' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PlayPauseAndSpeedControlPanel = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/PlayPauseAndSpeedControlPanel' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );
  var ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var TemperatureAndColorSensorNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/TemperatureAndColorSensorNode' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );

  // strings
  var energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );
  var linkHeatersString = require( 'string!ENERGY_FORMS_AND_CHANGES/linkHeaters' );
  var oliveOilString = require( 'string!ENERGY_FORMS_AND_CHANGES/oliveOil' );

  // images
  var shelfImage = require( 'image!ENERGY_FORMS_AND_CHANGES/shelf_long.png' );
  var flameImage = require( 'image!SCENERY_PHET/flame.png' );

  // constants
  var EDGE_INSET = 10;
  var SENSOR_JUMP_ON_EXTRACTION = new Vector2( 5, 5 ); // in screen coordinates

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

    // @private
    this.model = model;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model appears in the
    // view.
    var modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2(
        Math.round( self.layoutBounds.width * 0.5 ),
        Math.round( self.layoutBounds.height * 0.85 )
      ),
      1700 // zoom factor - smaller zooms out, larger zooms in
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
    var leftBurnerEnergyChunkLayer = new EnergyChunkLayer( model.leftBurner.energyChunkList, modelViewTransform );
    this.addChild( leftBurnerEnergyChunkLayer );
    var rightBurnerEnergyChunkLayer = new EnergyChunkLayer( model.rightBurner.energyChunkList, modelViewTransform );
    this.addChild( rightBurnerEnergyChunkLayer );
    var heaterCoolerFrontLayer = new Node();
    this.addChild( heaterCoolerFrontLayer );
    var beakerFrontLayer = new Node();
    this.addChild( beakerFrontLayer );

    // create the lab bench surface image
    var labBenchSurfaceImage = new Image( shelfImage, {
      centerX: modelViewTransform.modelToViewX( 0 ),
      centerY: modelViewTransform.modelToViewY( 0 ) + 10 // slight tweak required due to nature of the image
    } );

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
    var playPauseAndSpeedControlPanel = new PlayPauseAndSpeedControlPanel( model );
    playPauseAndSpeedControlPanel.center = new Vector2( this.layoutBounds.width / 2, centerYBelowSurface );
    backLayer.addChild( playPauseAndSpeedControlPanel );

    // add the burners
    var burnerProjectionAmount = modelViewTransform.modelToViewDeltaX(
      model.leftBurner.getCompositeBounds().height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO
    );

    // create left burner node
    var leftBurnerStand = new BurnerStandNode(
      modelViewTransform.modelToViewShape( model.leftBurner.getCompositeBounds() ),
      burnerProjectionAmount
    );

    // set up left heater-cooler node, front and back are added separately to support layering of energy chunks
    var leftHeaterCoolerBack = new HeaterCoolerBack( model.leftBurner.heatCoolLevelProperty, {
      centerX: modelViewTransform.modelToViewX( model.leftBurner.getCompositeBounds().centerX ),
      bottom: modelViewTransform.modelToViewY( model.leftBurner.getCompositeBounds().minY ),
      minWidth: leftBurnerStand.width / 1.7,
      maxWidth: leftBurnerStand.width / 1.7
    } );
    var leftLinkableHeaterCoolerFront = new LinkableHeaterCoolerFront( model.leftBurner.heatCoolLevelProperty, {
      leftTop: leftHeaterCoolerBack.getHeaterFrontPosition(),
      minWidth: leftBurnerStand.width / 1.7,
      maxWidth: leftBurnerStand.width / 1.7
    } );
    heaterCoolerFrontLayer.addChild( leftLinkableHeaterCoolerFront );
    backLayer.addChild( leftHeaterCoolerBack );
    backLayer.addChild( leftBurnerStand );

    // create right burner node
    var rightBurnerStand = new BurnerStandNode(
      modelViewTransform.modelToViewShape( model.rightBurner.getCompositeBounds() ),
      burnerProjectionAmount );

    // set up right heater-cooler node
    var rightHeaterCoolerBack = new HeaterCoolerBack( model.rightBurner.heatCoolLevelProperty, {
      centerX: modelViewTransform.modelToViewX( model.rightBurner.getCompositeBounds().centerX ),
      bottom: modelViewTransform.modelToViewY( model.rightBurner.getCompositeBounds().minY ),
      minWidth: rightBurnerStand.width / 1.7,
      maxWidth: rightBurnerStand.width / 1.7
    } );
    var rightLinkableHeaterCoolerFront = new LinkableHeaterCoolerFront( model.rightBurner.heatCoolLevelProperty, {
      leftTop: rightHeaterCoolerBack.getHeaterFrontPosition(),
      minWidth: rightBurnerStand.width / 1.7,
      maxWidth: rightBurnerStand.width / 1.7
    } );
    heaterCoolerFrontLayer.addChild( rightLinkableHeaterCoolerFront );
    backLayer.addChild( rightHeaterCoolerBack );
    backLayer.addChild( rightBurnerStand );

    // link the dragging Properties of the heater slider thumbs. if the heaters are linked and one is being dragged,
    // tell the other heater to follow it, otherwise respect its own heating Property
    Property.multilink(
      [
        leftLinkableHeaterCoolerFront.heatCoolSlider.isThumbDraggingProperty,
        rightLinkableHeaterCoolerFront.heatCoolSlider.isThumbDraggingProperty
      ],
      function( isLeftThumbDragging, isRightThumbDragging ) {
        if ( model.linkedHeatersProperty.get() ) {
          isLeftThumbDragging ? rightLinkableHeaterCoolerFront.setFollowProperty( model.leftBurner.heatCoolLevelProperty ) :
          rightLinkableHeaterCoolerFront.clearFollowProperty( model.leftBurner.heatCoolLevelProperty );
          isRightThumbDragging ? leftLinkableHeaterCoolerFront.setFollowProperty( model.rightBurner.heatCoolLevelProperty ) :
          leftLinkableHeaterCoolerFront.clearFollowProperty( model.rightBurner.heatCoolLevelProperty );
        }
      }
    );

    // add the air
    airLayer.addChild( new AirNode( model.air, modelViewTransform ) );

    // define a closure that will limit the model element motion based on both view and model constraints
    function constrainMovableElementMotion( modelElement, proposedPosition ) {

      // constrain the model element to stay within the play area
      var viewConstrainedPosition = constrainToPlayArea(
        modelElement,
        proposedPosition,
        self.layoutBounds,
        modelViewTransform
      );

      // constrain the model element to move legally within the model, which generally means not moving through things
      var viewAndModelConstrainedPosition = model.constrainPosition( modelElement, viewConstrainedPosition );

      // return the position as constrained by both the model and the view
      return viewAndModelConstrainedPosition;
    }

    // add the blocks
    var brickNode = new BlockNode(
      model.brick,
      modelViewTransform,
      constrainMovableElementMotion,
      { setApproachingEnergyChunkParentNode: airLayer }
    );
    blockLayer.addChild( brickNode );
    var ironBlockNode = new BlockNode(
      model.ironBlock,
      modelViewTransform,
      constrainMovableElementMotion,
      { setApproachingEnergyChunkParentNode: airLayer }
    );
    blockLayer.addChild( ironBlockNode );
    this.waterBeakerView = new BeakerContainerView(
      model.waterBeaker,
      model,
      modelViewTransform,
      constrainMovableElementMotion,
      { composited: false }
    );
    this.oliveOilBeakerView = new BeakerContainerView(
      model.oliveOilBeaker,
      model,
      modelViewTransform,
      constrainMovableElementMotion,
      {
        label: oliveOilString,
        composited: false
      }
    );

    // add the beakers, which are composed of several pieces
    beakerFrontLayer.addChild( this.waterBeakerView.frontNode );
    beakerFrontLayer.addChild( this.oliveOilBeakerView.frontNode );
    beakerBackLayer.addChild( this.waterBeakerView.backNode );
    beakerBackLayer.addChild( this.oliveOilBeakerView.backNode );
    beakerGrabLayer.addChild( this.waterBeakerView.grabNode );
    this.waterBeakerView.grabNode.jbID = 'water beaker grab node';
    beakerGrabLayer.addChild( this.oliveOilBeakerView.grabNode );

    // the sensor layer needs to be above the movable objects
    var sensorLayer = new Node();
    this.addChild( sensorLayer );

    // create and add the temperature and color sensor nodes, which look like a thermometer with a triangle on the side
    var temperatureAndColorSensorNodes = [];
    var sumOfSensorNodeWidths = 0;
    var sensorNodeWidth = 0;
    var sensorNodeHeight = 0;
    model.temperatureAndColorSensors.forEach( function( sensor ) {
      var temperatureAndColorSensorNode = new TemperatureAndColorSensorNode( sensor, {
        modelViewTransform: modelViewTransform,
        dragBounds: modelViewTransform.viewToModelBounds( self.layoutBounds ),
        draggable: true
      } );

      // sensors need to be behind blocks and beakers while in storage, but in front when them while in use
      sensor.activeProperty.link( function( active ) {
        if ( active ) {
          if ( backLayer.hasChild( temperatureAndColorSensorNode ) ) {
            backLayer.removeChild( temperatureAndColorSensorNode );
          }
          sensorLayer.addChild( temperatureAndColorSensorNode );
        }
        else {
          if ( sensorLayer.hasChild( temperatureAndColorSensorNode ) ) {
            sensorLayer.removeChild( temperatureAndColorSensorNode );
          }
          backLayer.addChild( temperatureAndColorSensorNode );
        }
      } );

      temperatureAndColorSensorNodes.push( temperatureAndColorSensorNode );

      // update the variables that will be used to create the storage area
      sumOfSensorNodeWidths += temperatureAndColorSensorNode.width;
      sensorNodeHeight = sensorNodeHeight || temperatureAndColorSensorNode.height;
      sensorNodeWidth = sensorNodeWidth || temperatureAndColorSensorNode.width;
    } );

    // create the storage area for the sensors
    var sensorStorageArea = new Rectangle(
      0,
      0,
      sumOfSensorNodeWidths * 1.3,
      sensorNodeHeight * 1.15,
      EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
      EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
      {
        fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
        stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
        lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
        left: EDGE_INSET,
        top: EDGE_INSET
      }
    );
    backLayer.addChild( sensorStorageArea );
    sensorStorageArea.moveToBack(); // move behind the temperatureAndColorSensorNodes when they are being stored

    // set initial positions for sensors in the storage area, hook up listeners to handle interaction with storage area
    var interSensorSpacing = ( sensorStorageArea.width - sumOfSensorNodeWidths ) / 4;
    var offsetFromBottomOfStorageArea = 25; // empirically determined
    var sensorPositionsInStorageAreaMap = [];
    var nextSensorViewPositionX = sensorStorageArea.left + interSensorSpacing;
    model.temperatureAndColorSensors.forEach( function( sensor, index ) {

      // define the storage position and put it into an object with a reference to the sensor
      sensorPositionsInStorageAreaMap.push( {
        sensor: sensor,
        position: new Vector2(
          modelViewTransform.viewToModelX( nextSensorViewPositionX ),
          modelViewTransform.viewToModelY( sensorStorageArea.bottom - offsetFromBottomOfStorageArea )
        )
      } );

      // update the horizontal placement to be used for the next sensor
      nextSensorViewPositionX += interSensorSpacing + sensorNodeWidth;

      // add a listener for when the sensor is removed from or returned to the storage area
      sensor.userControlledProperty.link( function( userControlled ) {
        if ( userControlled ) {

          // the user has picked up this sensor
          if ( !sensor.activeProperty.get() ) {

            // The sensor was inactive, which means that it was in the storage area.  In this case, we make it jump
            // a little to cue the user that this is a movable object.
            sensor.positionProperty.set(
              sensor.positionProperty.get().plus( modelViewTransform.viewToModelDelta( SENSOR_JUMP_ON_EXTRACTION ) )
            );

            // activate the sensor
            sensor.activeProperty.set( true );
          }
        }
        else {

          // the user has released this sensor - test if it should go back in the storage area
          var sensorNode = temperatureAndColorSensorNodes[ index ];
          var colorIndicatorBounds = sensorNode.localToParentBounds( sensorNode.colorIndicatorNode.bounds );
          var thermometerBounds = sensorNode.localToParentBounds( sensorNode.thermometerNode.bounds );
          if ( colorIndicatorBounds.intersectsBounds( sensorStorageArea.bounds ) ||
               thermometerBounds.intersectsBounds( sensorStorageArea.bounds ) ) {
            returnSensorToStorageArea( sensor );
          }
        }
      } );
    } );

    // function to return a sensor to its initial position in the storage area
    function returnSensorToStorageArea( sensor ) {

      // find and set the initial position for this sensor
      var position = null;
      for ( var i = 0; i < model.temperatureAndColorSensors.length; i++ ) {
        if ( sensorPositionsInStorageAreaMap[ i ].sensor === sensor ) {
          position = sensorPositionsInStorageAreaMap[ i ].position;
          break;
        }
      }
      assert && assert( position, 'position not found for specified sensor' );
      sensor.positionProperty.set( position );

      // sensors are inactive when in the storage area
      sensor.activeProperty.set( false );
    }

    // function to return all sensors to the storage area
    function returnAllSensorsToStorageArea() {
      model.temperatureAndColorSensors.forEach( function( sensor ) {
        returnSensorToStorageArea( sensor );
      } );
    }

    // put all of the temperature and color sensors into the storage area as part of initialization process
    returnAllSensorsToStorageArea();

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

    // function that updates the Z-order of the beakers when the user-controlled state changes
    var beakerChangeListener = function() {
      if ( model.waterBeaker.getBounds().minY >= model.oliveOilBeaker.getBounds().maxY ) {
        self.waterBeakerView.frontNode.moveToFront();
        self.waterBeakerView.backNode.moveToFront();
        self.waterBeakerView.grabNode.moveToFront();
      }
      else if ( model.oliveOilBeaker.getBounds().minY >= model.waterBeaker.getBounds().maxY ) {
        self.oliveOilBeakerView.frontNode.moveToFront();
        self.oliveOilBeakerView.backNode.moveToFront();
        self.oliveOilBeakerView.grabNode.moveToFront();
      }
    };

    // update the Z-order of the beakers whenever the "userControlled" state of either changes
    model.waterBeaker.positionProperty.link( beakerChangeListener );
    model.oliveOilBeaker.positionProperty.link( beakerChangeListener );

    // Create the control for showing/hiding energy chunks.  The elements of this control are created separately to allow
    // each to be independently scaled. The EnergyChunk that is created here is not going to be used in the
    // simulation, it is only needed for the EnergyChunkNode that is displayed in the show/hide energy chunks toggle.
    var energyChunkNode = new EnergyChunkNode(
      new EnergyChunk( EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, new Property( true ) ),
      modelViewTransform
    );
    energyChunkNode.pickable = false;
    var energySymbolsText = new Text( energySymbolsString, {
      font: new PhetFont( 20 )
    } );
    var showEnergyCheckbox = new Checkbox( new HBox( {
      children: [ energySymbolsText, energyChunkNode ],
        spacing: 5
      } ), model.energyChunksVisibleProperty
    );

    // Create the control for linking/un-linking the heaters
    var flameNode = new Image( flameImage, {
      maxWidth: EFACConstants.ENERGY_CHUNK_WIDTH,
      maxHeight: EFACConstants.ENERGY_CHUNK_WIDTH
    } );
    var linkHeatersText = new Text( linkHeatersString, {
      font: new PhetFont( 20 )
    } );
    var linkHeatersCheckbox = new Checkbox( new HBox( {
        children: [ linkHeatersText, flameNode ],
        spacing: 5
      } ), model.linkedHeatersProperty
    );

    // Add the checkbox controls
    var controlPanelCheckboxes = new VBox( {
      children: [ showEnergyCheckbox, linkHeatersCheckbox ],
      spacing: 5,
      align: 'left'
    } );
    var controlPanel = new Panel( controlPanelCheckboxes, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS,
      rightTop: new Vector2( this.layoutBounds.width - EDGE_INSET, EDGE_INSET )
    } );
    this.addChild( controlPanel );

    // create and add the "Reset All" button in the bottom right
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        model.reset();
        returnAllSensorsToStorageArea();
      },
      radius: EFACConstants.RESET_ALL_BUTTON_RADIUS,
      right: this.layoutBounds.maxX - EDGE_INSET,
      centerY: ( labBenchSurfaceImage.bounds.maxY + this.layoutBounds.maxY ) / 2
    } );
    this.addChild( resetAllButton );
  }

  // helper function the constrains the provided model element's position to the play area
  function constrainToPlayArea( modelElement, proposedPosition, playAreaBounds, modelViewTransform ) {

    var viewConstrainedPosition = proposedPosition.copy();

    // TODO: Consider using a pre-allocated bounds for this if retained
    var elementViewBounds = modelViewTransform.modelToViewBounds(
      modelElement.getCompositeBoundsForPosition( proposedPosition )
    );

    // constrain the model element to stay within the play area
    var deltaX = 0;
    var deltaY = 0;
    if ( elementViewBounds.maxX >= playAreaBounds.maxX ) {
      deltaX = modelViewTransform.viewToModelDeltaX( playAreaBounds.maxX - elementViewBounds.maxX );
    }
    else if ( elementViewBounds.minX <= playAreaBounds.minX ) {
      deltaX = modelViewTransform.viewToModelDeltaX( playAreaBounds.minX - elementViewBounds.minX );
    }
    if ( elementViewBounds.minY <= playAreaBounds.minY ) {
      deltaY = modelViewTransform.viewToModelDeltaY( playAreaBounds.minY - elementViewBounds.minY );
    }
    else if ( proposedPosition.y < 0 ) {
      deltaY = -proposedPosition.y;
    }
    viewConstrainedPosition.setXY( viewConstrainedPosition.x + deltaX, viewConstrainedPosition.y + deltaY );

    // return the position as constrained by both the model and the view
    return viewConstrainedPosition;
  }

  energyFormsAndChanges.register( 'EFACIntroScreenView', EFACIntroScreenView );

  return inherit( ScreenView, EFACIntroScreenView, {

    /**
     * step this view element, called by the framework
     * @param dt - time step, in seconds
     * @public
     */
    step: function( dt ) {
      if ( this.model.isPlayingProperty.get() ) {
        this.waterBeakerView.step( dt );
        this.oliveOilBeakerView.step( dt );
      }
    }
  } );
} );
