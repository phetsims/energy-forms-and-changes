// Copyright 2014-2019, University of Colorado Boulder

/**
 * main view for the 'Intro' screen of the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const AirNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/AirNode' );
  const Animation = require( 'TWIXT/Animation' );
  const BeakerContainerView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/BeakerContainerView' );
  const BeakerType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/BeakerType' );
  const BlockNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/BlockNode' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Bounds2 = require( 'DOT/Bounds2' );
  const BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  const Checkbox = require( 'SUN/Checkbox' );
  const Dimension2 = require( 'DOT/Dimension2' );
  const DownUpListener = require( 'SCENERY/input/DownUpListener' );
  const Easing = require( 'TWIXT/Easing' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const efacPositionConstrainer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/efacPositionConstrainer' );
  const EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  const EFACTemperatureAndColorSensorNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EFACTemperatureAndColorSensorNode' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  const HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  const KeyboardUtil = require( 'SCENERY/accessibility/KeyboardUtil' );
  const Image = require( 'SCENERY/nodes/Image' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Rectangle = require( 'SCENERY/nodes/Rectangle' );
  const ResetAllButton = require( 'SCENERY_PHET/buttons/ResetAllButton' );
  const ScreenView = require( 'JOIST/ScreenView' );
  const SimSpeedButtonGroup = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/SimSpeedButtonGroup' );
  const SkyNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/SkyNode' );
  const Text = require( 'SCENERY/nodes/Text' );
  const TimeControlNode = require( 'SCENERY_PHET/TimeControlNode' );
  const Util = require( 'DOT/Util' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const energySymbolsString = require( 'string!ENERGY_FORMS_AND_CHANGES/energySymbols' );
  const linkHeatersString = require( 'string!ENERGY_FORMS_AND_CHANGES/linkHeaters' );
  const oliveOilString = require( 'string!ENERGY_FORMS_AND_CHANGES/oliveOil' );
  const waterString = require( 'string!ENERGY_FORMS_AND_CHANGES/water' );

  // images
  const shelfImage = require( 'image!ENERGY_FORMS_AND_CHANGES/shelf.png' );
  const flameImage = require( 'image!SCENERY_PHET/flame.png' );

  // constants
  const EDGE_INSET = 10; // screen edge padding, in screen coordinates
  const THERMOMETER_JUMP_ON_EXTRACTION = new Vector2( 5, 5 ); // in screen coordinates
  const THERMOMETER_ANIMATION_SPEED = 0.2; // in meters per second
  const MAX_THERMOMETER_ANIMATION_TIME = 1; // max time for thermometer return animation to complete, in seconds

  class EFACIntroScreenView extends ScreenView {

    /**
     * @param {EFACIntroModel} model
     * @param {Tandem} tandem
     */
    constructor( model, tandem ) {
      super();

      // @private {EFACIntroModel}
      this.model = model;

      // Create the model-view transform. The primary units used in the model are meters, so significant zoom is used.
      // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model appears in the
      // view.
      const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
        Vector2.ZERO,
        new Vector2(
          Util.roundSymmetric( this.layoutBounds.width * 0.5 ),
          Util.roundSymmetric( this.layoutBounds.height * 0.85 )
        ),
        EFACConstants.INTRO_MVT_SCALE_FACTOR
      );

      // create nodes that will act as layers in order to create the needed Z-order behavior
      const backLayer = new Node();
      this.addChild( backLayer );
      const beakerBackLayer = new Node();
      this.addChild( beakerBackLayer );
      const beakerGrabLayer = new Node();
      this.addChild( beakerGrabLayer );
      const blockLayer = new Node();
      this.addChild( blockLayer );
      const airLayer = new Node();
      this.addChild( airLayer );
      const leftBurnerEnergyChunkLayer = new EnergyChunkLayer( model.leftBurner.energyChunkList, modelViewTransform );
      this.addChild( leftBurnerEnergyChunkLayer );
      if ( model.rightBurner ) {
        const rightBurnerEnergyChunkLayer = new EnergyChunkLayer( model.rightBurner.energyChunkList, modelViewTransform );
        this.addChild( rightBurnerEnergyChunkLayer );
      }
      const heaterCoolerFrontLayer = new Node();
      this.addChild( heaterCoolerFrontLayer );
      const beakerFrontLayer = new Node();
      this.addChild( beakerFrontLayer );

      // create the lab bench surface image
      const labBenchSurfaceImage = new Image( shelfImage, {
        centerX: modelViewTransform.modelToViewX( 0 ),
        centerY: modelViewTransform.modelToViewY( 0 ) + 10 // slight tweak required due to nature of the image
      } );

      // create a rectangle that will act as the background below the lab bench surface, basically like the side of the
      // bench
      const benchWidth = labBenchSurfaceImage.width * 0.95;
      const benchHeight = 1000; // arbitrary large number, user should never see the bottom of this
      const labBenchSide = new Rectangle(
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
      const centerYBelowSurface = ( this.layoutBounds.height + labBenchSurfaceImage.bottom ) / 2;

      // add the play/pause and step buttons
      const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
        stepOptions: {
          listener: () => model.manualStep()
        },
        tandem: tandem.createTandem( 'timeControlNode' )
      } );

      // for testing - option to add fast forward controls
      if ( EFACQueryParameters.showSpeedControls ) {
        const simSpeedButtonGroup = new SimSpeedButtonGroup( model.simSpeedProperty );
        const playPauseStepAndSpeedButtonGroup = new HBox( {
          children: [ timeControlNode, simSpeedButtonGroup ],
          spacing: 25
        } );
        playPauseStepAndSpeedButtonGroup.center = new Vector2( this.layoutBounds.centerX, centerYBelowSurface );
        backLayer.addChild( playPauseStepAndSpeedButtonGroup );
      }
      else {

        // only play/pause and step are being added, so center them below the lab bench
        timeControlNode.center = new Vector2( this.layoutBounds.centerX, centerYBelowSurface );
        backLayer.addChild( timeControlNode );
      }

      // add the burners
      const burnerProjectionAmount = modelViewTransform.modelToViewDeltaX(
        model.leftBurner.getBounds().height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO
      );

      // create left burner node
      const leftBurnerStand = new BurnerStandNode(
        modelViewTransform.modelToViewShape( model.leftBurner.getBounds() ),
        burnerProjectionAmount
      );

      // for testing - option to keep the heater coolers sticky
      const snapToZero = !EFACQueryParameters.stickyBurners;

      // set up left heater-cooler node, front and back are added separately to support layering of energy chunks
      const leftHeaterCoolerBack = new HeaterCoolerBack( model.leftBurner.heatCoolLevelProperty, {
        centerX: modelViewTransform.modelToViewX( model.leftBurner.getBounds().centerX ),
        bottom: modelViewTransform.modelToViewY( model.leftBurner.getBounds().minY ),
        minWidth: leftBurnerStand.width / 1.5,
        maxWidth: leftBurnerStand.width / 1.5
      } );
      const leftHeaterCoolerFront = new HeaterCoolerFront( model.leftBurner.heatCoolLevelProperty, {
        leftTop: leftHeaterCoolerBack.getHeaterFrontPosition(),
        minWidth: leftBurnerStand.width / 1.5,
        maxWidth: leftBurnerStand.width / 1.5,
        thumbSize: new Dimension2( 18, 36 ),
        snapToZero: snapToZero
      } );
      heaterCoolerFrontLayer.addChild( leftHeaterCoolerFront );
      backLayer.addChild( leftHeaterCoolerBack );
      backLayer.addChild( leftBurnerStand );

      let rightBurnerBounds = null;

      // only add the right burner and handle linking heaters if the right one exists in the model
      if ( model.rightBurner ) {

        // create right burner node
        const rightBurnerStand = new BurnerStandNode(
          modelViewTransform.modelToViewShape( model.rightBurner.getBounds() ),
          burnerProjectionAmount
        );

        // set up right heater-cooler node
        const rightHeaterCoolerBack = new HeaterCoolerBack( model.rightBurner.heatCoolLevelProperty, {
          centerX: modelViewTransform.modelToViewX( model.rightBurner.getBounds().centerX ),
          bottom: modelViewTransform.modelToViewY( model.rightBurner.getBounds().minY ),
          minWidth: rightBurnerStand.width / 1.5,
          maxWidth: rightBurnerStand.width / 1.5
        } );
        const rightHeaterCoolerFront = new HeaterCoolerFront( model.rightBurner.heatCoolLevelProperty, {
          leftTop: rightHeaterCoolerBack.getHeaterFrontPosition(),
          minWidth: rightBurnerStand.width / 1.5,
          maxWidth: rightBurnerStand.width / 1.5,
          thumbSize: new Dimension2( 18, 36 ),
          snapToZero: snapToZero
        } );
        heaterCoolerFrontLayer.addChild( rightHeaterCoolerFront );
        backLayer.addChild( rightHeaterCoolerBack );
        backLayer.addChild( rightBurnerStand );

        // make the heat cool levels equal if they become linked
        model.linkedHeatersProperty.link( linked => {
          if ( linked ) {
            model.leftBurner.heatCoolLevelProperty.value = model.rightBurner.heatCoolLevelProperty.value;
          }
        } );

        // if the heaters are linked, changing the left heater will change the right to match
        model.leftBurner.heatCoolLevelProperty.link( leftHeatCoolAmount => {
          if ( model.linkedHeatersProperty.value ) {
            model.rightBurner.heatCoolLevelProperty.value = leftHeatCoolAmount;
          }
        } );

        // if the heaters are linked, changing the right heater will change the left to match
        model.rightBurner.heatCoolLevelProperty.link( rightHeatCoolAmount => {
          if ( model.linkedHeatersProperty.value ) {
            model.leftBurner.heatCoolLevelProperty.value = rightHeatCoolAmount;
          }
        } );

        const leftHeaterCoolerDownInputAction = () => {

          // make the right heater-cooler un-pickable if the heaters are linked
          if ( model.linkedHeatersProperty.value ) {
            rightHeaterCoolerFront.interruptSubtreeInput();
            rightHeaterCoolerFront.pickable = false;
          }
        };
        const leftHeaterCoolerUpInputAction = () => {
          rightHeaterCoolerFront.pickable = true;
        };

        // listen to pointer events on the left heater-cooler
        leftHeaterCoolerFront.addInputListener( new DownUpListener( {
          down: leftHeaterCoolerDownInputAction,
          up: leftHeaterCoolerUpInputAction
        } ) );

        // listen to keyboard events on the left heater-cooler
        leftHeaterCoolerFront.addInputListener( {
          keydown: event => {
            if ( KeyboardUtil.isRangeKey( event.domEvent.keyCode ) ) {
              leftHeaterCoolerDownInputAction();
            }
          },
          keyup: event => {
            if ( KeyboardUtil.isRangeKey( event.domEvent.keyCode ) ) {
              leftHeaterCoolerUpInputAction();
            }
          }
        } );

        const rightHeaterCoolerDownInputAction = () => {

          // make the left heater-cooler un-pickable if the heaters are linked
          if ( model.linkedHeatersProperty.value ) {
            leftHeaterCoolerFront.interruptSubtreeInput();
            leftHeaterCoolerFront.pickable = false;
          }
        };
        const rightHeaterCoolerUpInputAction = () => {
          leftHeaterCoolerFront.pickable = true;
        };

        // listen to pointer events on the right heater-cooler
        rightHeaterCoolerFront.addInputListener( new DownUpListener( {
          down: rightHeaterCoolerDownInputAction,
          up: rightHeaterCoolerUpInputAction
        } ) );

        // listen to keyboard events on the right heater-cooler
        rightHeaterCoolerFront.addInputListener( {
          keydown: event => {
            if ( KeyboardUtil.isRangeKey( event.domEvent.keyCode ) ) {
              rightHeaterCoolerDownInputAction();
            }
          },
          keyup: event => {
            if ( KeyboardUtil.isRangeKey( event.domEvent.keyCode ) ) {
              rightHeaterCoolerUpInputAction();
            }
          }
        } );

        rightBurnerBounds = model.rightBurner.getBounds();
      }

      // Pre-calculate the space occupied by the burners, since they don't move.  This is used when validating
      // positions of movable model elements.  The space is extended a bit to the left to avoid awkward z-ordering
      // issues when preventing overlap.
      const leftBurnerBounds = model.leftBurner.getBounds();
      const burnerPerspectiveExtension = leftBurnerBounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                         Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;
      // @private {Bounds2}
      this.burnerBlockingRect = new Bounds2(
        leftBurnerBounds.minX - burnerPerspectiveExtension,
        leftBurnerBounds.minY,
        rightBurnerBounds ? rightBurnerBounds.maxX : leftBurnerBounds.maxX,
        rightBurnerBounds ? rightBurnerBounds.maxY : leftBurnerBounds.maxY
      );

      // add the air
      airLayer.addChild( new AirNode( model.air, modelViewTransform ) );

      // create a reusable bounds in order to reduce memory allocations
      const reusableConstraintBounds = Bounds2.NOTHING.copy();

      /**
       * limits the model element motion based on both view and model constraints
       * @param {ModelElement} modelElement
       * @param {Vector2} proposedPosition
       * @returns {Vector2}
       */
      const constrainMovableElementMotion = ( modelElement, proposedPosition ) => {

        // constrain the model element to stay within the play area
        const viewConstrainedPosition = constrainToPlayArea(
          modelElement,
          proposedPosition,
          this.layoutBounds,
          modelViewTransform,
          reusableConstraintBounds
        );

        // constrain the model element to move legally within the model, which generally means not moving through things
        const viewAndModelConstrainedPosition = efacPositionConstrainer.constrainPosition(
          modelElement,
          viewConstrainedPosition,
          model.beakers,
          model.blocks,
          this.burnerBlockingRect
        );

        // return the position as constrained by both the model and the view
        return viewAndModelConstrainedPosition;
      };

      const blockNodes = [];
      const nodeString = 'Node';

      // add the blocks
      model.blocks.forEach( block => {
        const blockNode = new BlockNode(
          block,
          modelViewTransform,
          constrainMovableElementMotion,
          model.isPlayingProperty, {
            setApproachingEnergyChunkParentNode: airLayer,
            tandem: tandem.createTandem( block.tandem.name + nodeString )
          }
        );
        blockLayer.addChild( blockNode );
        blockNodes.push( blockNode );
      } );

      this.beakerViews = [];
      const viewString = 'View';

      // add the beakers
      model.beakers.forEach( beaker => {
        const label = beaker.beakerType === BeakerType.WATER ? waterString : oliveOilString;
        const beakerView = new BeakerContainerView(
          beaker,
          model,
          modelViewTransform,
          constrainMovableElementMotion, {
            label: label,
            tandem: tandem.createTandem( beaker.tandem.name + viewString )
          }
        );
        this.beakerViews.push( beakerView );
      } );

      // add the beakers, which are composed of several pieces
      this.beakerViews.forEach( beakerView => {
        beakerFrontLayer.addChild( beakerView.frontNode );
      } );
      this.beakerViews.forEach( beakerView => {
        beakerBackLayer.addChild( beakerView.backNode );
      } );
      this.beakerViews.forEach( beakerView => {
        beakerGrabLayer.addChild( beakerView.grabNode );
      } );

      // the thermometer layer needs to be above the movable objects
      const thermometerLayer = new Node();
      this.addChild( thermometerLayer );

      // create and add the temperature and color thermometer nodes, which look like a thermometer with a triangle on the side
      const thermometerNodes = [];
      let thermometerNodeWidth = 0;
      let thermometerNodeHeight = 0;
      model.thermometers.forEach( thermometer => {
        const thermometerNode = new EFACTemperatureAndColorSensorNode( thermometer, {
          modelViewTransform: modelViewTransform,
          dragBounds: modelViewTransform.viewToModelBounds( this.layoutBounds ),
          draggable: true,
          tandem: tandem.createTandem( thermometer.tandem.name + nodeString )
        } );

        // thermometers need to be behind blocks and beakers while in storage, but in front when them while in use
        thermometer.activeProperty.link( active => {
          if ( active ) {
            if ( backLayer.hasChild( thermometerNode ) ) {
              backLayer.removeChild( thermometerNode );
            }
            thermometerLayer.addChild( thermometerNode );
          }
          else {
            if ( thermometerLayer.hasChild( thermometerNode ) ) {
              thermometerLayer.removeChild( thermometerNode );
            }
            backLayer.addChild( thermometerNode );
          }
        } );

        thermometerNodes.push( thermometerNode );

        // update the variables that will be used to create the storage area
        thermometerNodeHeight = thermometerNodeHeight || thermometerNode.height;
        thermometerNodeWidth = thermometerNodeWidth || thermometerNode.width;
      } );

      // create the storage area for the thermometers
      const thermometerStorageArea = new Rectangle(
        0,
        0,
        thermometerNodeWidth * 2,
        thermometerNodeHeight * 1.15,
        EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
        EFACConstants.CONTROL_PANEL_CORNER_RADIUS, {
          fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
          stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
          lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
          left: EDGE_INSET,
          top: EDGE_INSET,
          tandem: tandem.createTandem( 'thermometerStorageAreaNode' )
        }
      );
      backLayer.addChild( thermometerStorageArea );
      thermometerStorageArea.moveToBack(); // move behind the thermometerNodes when they are being stored

      // set initial position for thermometers in the storage area, hook up listeners to handle interaction with storage area
      const interThermometerSpacing = ( thermometerStorageArea.width - thermometerNodeWidth ) / 2;
      const offsetFromBottomOfStorageArea = 25; // empirically determined
      const thermometerNodePositionX = thermometerStorageArea.left + interThermometerSpacing;
      const thermometerPositionInStorageArea = new Vector2(
        modelViewTransform.viewToModelX( thermometerNodePositionX ),
        modelViewTransform.viewToModelY( thermometerStorageArea.bottom - offsetFromBottomOfStorageArea ) );

      model.thermometers.forEach( ( thermometer, index ) => {

        // add a listener for when the thermometer is removed from or returned to the storage area
        thermometer.userControlledProperty.link( userControlled => {
          if ( userControlled ) {

            // the user has picked up this thermometer
            if ( !thermometer.activeProperty.get() ) {

              // The thermometer was inactive, which means that it was in the storage area.  In this case, we make it jump
              // a little to cue the user that this is a movable object.
              thermometer.positionProperty.set(
                thermometer.positionProperty.get().plus( modelViewTransform.viewToModelDelta( THERMOMETER_JUMP_ON_EXTRACTION ) )
              );

              // activate the thermometer
              thermometer.activeProperty.set( true );
            }
          }
          else {

            // the user has released this thermometer - test if it should go back in the storage area
            const thermometerNode = thermometerNodes[ index ];
            const colorIndicatorBounds = thermometerNode.localToParentBounds(
              thermometerNode.temperatureAndColorSensorNode.colorIndicatorBounds
            );
            const thermometerBounds = thermometerNode.localToParentBounds(
              thermometerNode.temperatureAndColorSensorNode.thermometerBounds
            );
            if ( colorIndicatorBounds.intersectsBounds( thermometerStorageArea.bounds ) ||
                 thermometerBounds.intersectsBounds( thermometerStorageArea.bounds ) ) {
              returnThermometerToStorageArea( thermometer, true, thermometerNode );
            }
          }
        } );
      } );

      /**
       * return a thermometer to its initial position in the storage area
       * @param {StickyTemperatureAndColorSensor} thermometer
       * @param {Boolean} doAnimation - whether the thermometer animates back to the storage area
       * @param {EFACTemperatureAndColorSensorNode} [thermometerNode]
       */
      const returnThermometerToStorageArea = ( thermometer, doAnimation, thermometerNode ) => {
        const currentPosition = thermometer.positionProperty.get();
        if ( !currentPosition.equals( thermometerPositionInStorageArea ) && doAnimation ) {

          // calculate the time needed to get to the destination
          const animationDuration = Math.min(
            thermometer.positionProperty.get().distance( thermometerPositionInStorageArea ) / THERMOMETER_ANIMATION_SPEED,
            MAX_THERMOMETER_ANIMATION_TIME
          );
          const animationOptions = {
            property: thermometer.positionProperty,
            to: thermometerPositionInStorageArea,
            duration: animationDuration,
            easing: Easing.CUBIC_IN_OUT
          };
          const translateAnimation = new Animation( animationOptions );

          // make the thermometer unpickable while it's animating back to the storage area
          translateAnimation.animatingProperty.link( isAnimating => {
            thermometerNode && ( thermometerNode.pickable = !isAnimating );
          } );
          translateAnimation.start();
        }
        else if ( !currentPosition.equals( thermometerPositionInStorageArea ) && !doAnimation ) {

          // set the initial position for this thermometer
          thermometer.positionProperty.set( thermometerPositionInStorageArea );
        }

        // thermometers are inactive when in the storage area
        thermometer.activeProperty.set( false );
      };

      // returns all thermometers to the storage area
      const returnAllThermometersToStorageArea = () => {
        model.thermometers.forEach( thermometer => {
          returnThermometerToStorageArea( thermometer, false );
        } );
      };

      // put all of the temperature and color thermometers into the storage area as part of initialization process
      returnAllThermometersToStorageArea();

      // updates the Z-order of the blocks when their position changes
      const blockChangeListener = position => {
        let currentBlock = null;
        let currentBlockNode = null;

        model.blocks.forEach( block => {
          if ( block.positionProperty.value === position ) {
            currentBlock = block;
          }
        } );
        blockNodes.forEach( blockNode => {
          if ( blockNode.block === currentBlock ) {
            currentBlockNode = blockNode;
          }
        } );

        model.blocks.forEach( otherBlock => {
          if ( otherBlock === currentBlock ) {
            return;
          }

          let otherBlockNode = null;
          blockNodes.forEach( blockNode => {
            if ( blockNode.block === otherBlock ) {
              otherBlockNode = blockNode;
            }
          } );

          if ( currentBlock.getBounds().minX >= otherBlock.getBounds().maxX ||
               currentBlock.getBounds().minY >= otherBlock.getBounds().maxY ) {
            currentBlockNode.moveToFront();
          }
          else if ( otherBlock.getBounds().minX >= currentBlock.getBounds().maxX ||
                    otherBlock.getBounds().minY >= currentBlock.getBounds().maxY ) {
            otherBlockNode.moveToFront();
          }
        } );
      };

      // no need to link z-order-changing listener if there is only one block
      if ( model.blocks.length > 1 ) {
        model.blocks.forEach( block => {
          block.positionProperty.link( blockChangeListener );
        } );
      }

      // updates the Z-order of the beakers whenever their position changes
      const beakerChangeListener = () => {
        if ( model.beakers[ 0 ].getBounds().minY >= model.beakers[ 1 ].getBounds().maxY ) {
          this.beakerViews[ 0 ].frontNode.moveToFront();
          this.beakerViews[ 0 ].backNode.moveToFront();
          this.beakerViews[ 0 ].grabNode.moveToFront();
        }
        else if ( model.beakers[ 1 ].getBounds().minY >= model.beakers[ 0 ].getBounds().maxY ) {
          this.beakerViews[ 1 ].frontNode.moveToFront();
          this.beakerViews[ 1 ].backNode.moveToFront();
          this.beakerViews[ 1 ].grabNode.moveToFront();
        }
      };

      // no need to link z-order-changing listener if there is only one beaker
      if ( model.beakers.length > 1 ) {

        // this particular listener could be generalized to support more than 2 beakers (see the block listener above),
        // but since other code in this sim limits the number of beakers to 2, i (@chrisklus) think it's better to
        // leave this listener as simple as it is, since a general version could only worsen performance.
        assert && assert( model.beakers.length <= 2, 'Only 2 beakers are allowed: ' + model.beakers.length );

        model.beakers.forEach( beaker => {
          beaker.positionProperty.link( beakerChangeListener );
        } );
      }

      // Create the control for showing/hiding energy chunks.  The elements of this control are created separately to
      // allow each to be independently scaled. The EnergyChunk that is created here is not going to be used in the
      // simulation, it is only needed for the EnergyChunkNode that is displayed in the show/hide energy chunks toggle.
      const energyChunkNode = new EnergyChunkNode(
        new EnergyChunk( EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, new BooleanProperty( true ) ),
        modelViewTransform
      );
      energyChunkNode.pickable = false;
      const energySymbolsText = new Text( energySymbolsString, {
        font: new PhetFont( 20 ),
        maxWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH
      } );
      const showEnergyCheckbox = new Checkbox( new HBox( {
          children: [ energySymbolsText, energyChunkNode ],
          spacing: 5
        } ),
        model.energyChunksVisibleProperty, {
          tandem: tandem.createTandem( 'showEnergySymbolsCheckbox' )
        }
      );
      showEnergyCheckbox.touchArea =
        showEnergyCheckbox.localBounds.dilatedY( EFACConstants.ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION );

      let controlPanelCheckboxes = null;

      // Create the control for linking/un-linking the heaters, if two burners exist
      if ( model.rightBurner ) {
        const flameNode = new Image( flameImage, {
          maxWidth: EFACConstants.ENERGY_CHUNK_WIDTH,
          maxHeight: EFACConstants.ENERGY_CHUNK_WIDTH
        } );
        const linkHeatersText = new Text( linkHeatersString, {
          font: new PhetFont( 20 ),
          maxWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH
        } );
        const linkHeatersCheckbox = new Checkbox( new HBox( {
            children: [ linkHeatersText, flameNode ],
            spacing: 5
          } ),
          model.linkedHeatersProperty, {
            tandem: tandem.createTandem( 'linkHeatersCheckbox' )
          }
        );
        linkHeatersCheckbox.touchArea =
          linkHeatersCheckbox.localBounds.dilatedY( EFACConstants.ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION );

        controlPanelCheckboxes = new VBox( {
          children: [ showEnergyCheckbox, linkHeatersCheckbox ],
          spacing: 10,
          align: 'left'
        } );
      }

      // Add the checkbox controls
      const controlPanel = new Panel( controlPanelCheckboxes || showEnergyCheckbox, {
        fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
        stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
        lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
        cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS,
        rightTop: new Vector2( this.layoutBounds.width - EDGE_INSET, EDGE_INSET ),
        minWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_MIN_WIDTH
      } );
      backLayer.addChild( controlPanel );

      // create and add the "Reset All" button in the bottom right
      const resetAllButton = new ResetAllButton( {
        listener: () => {
          model.reset();
          returnAllThermometersToStorageArea();
        },
        radius: EFACConstants.RESET_ALL_BUTTON_RADIUS,
        right: this.layoutBounds.maxX - EDGE_INSET,
        centerY: ( labBenchSurfaceImage.bounds.maxY + this.layoutBounds.maxY ) / 2,
        tandem: tandem.createTandem( 'resetAllButton' )
      } );
      this.addChild( resetAllButton );

      // add a floating sky high above the sim
      const skyNode = new SkyNode(
        this.layoutBounds,
        modelViewTransform.modelToViewY( EFACConstants.INTRO_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT ) + EFACConstants.ENERGY_CHUNK_WIDTH
      );
      this.addChild( skyNode );

      // listen to the manualStepEmitter in the model
      model.manualStepEmitter.addListener( dt => {
        this.manualStep( dt );
      } );

      /**
       * constrains the provided model element's position to the play area
       * @param {ModelElement} modelElement
       * @param {Vector2} proposedPosition
       * @param {Bounds2} playAreaBounds
       * @param {ModelViewTransform2} modelViewTransform
       * @param {Bounds2} reusuableBounds
       * @returns {Vector2}
       */
      const constrainToPlayArea = ( modelElement, proposedPosition, playAreaBounds, modelViewTransform, reusuableBounds ) => {
        const viewConstrainedPosition = proposedPosition.copy();

        const elementViewBounds = modelViewTransform.modelToViewBounds(
          modelElement.getCompositeBoundsForPosition( proposedPosition, reusuableBounds )
        );

        // constrain the model element to stay within the play area
        let deltaX = 0;
        let deltaY = 0;
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
      };
    }

    /**
     * step this view element, called by the framework
     * @param dt - time step, in seconds
     * @public
     */
    step( dt ) {
      if ( this.model.isPlayingProperty.get() ) {
        this.stepView( dt );
      }
    }

    /**
     * step forward by one fixed nominal frame time
     * @param dt - time step, in seconds
     * @public
     */
    manualStep( dt ) {
      this.stepView( dt );
    }

    /**
     * update the state of the non-model associated view elements for a given time amount
     * @param dt - time step, in seconds
     * @public
     */
    stepView( dt ) {
      this.beakerViews.forEach( beakerView => {
        beakerView.step();
      } );
    }

    /**
     * Custom layout function for this view so that it floats to the bottom of the window.
     *
     * @param {number} width
     * @param {number} height
     * @override
     * @public
     */
    layout( width, height ) {
      this.resetTransform();

      const scale = this.getLayoutScale( width, height );
      this.setScaleMagnitude( scale );

      let dx = 0;
      let offsetY = 0;

      // Move to bottom vertically (custom for this sim)
      if ( scale === width / this.layoutBounds.width ) {
        offsetY = ( height / scale - this.layoutBounds.height );
      }

      // center horizontally (default behavior for ScreenView)
      else if ( scale === height / this.layoutBounds.height ) {
        dx = ( width - this.layoutBounds.width * scale ) / 2 / scale;
      }
      this.translate( dx, offsetY );

      // update the visible bounds of the screen view
      this.visibleBoundsProperty.set( new Bounds2( -dx, -offsetY, width / scale - dx, height / scale - offsetY ) );
    }
  }

  return energyFormsAndChanges.register( 'EFACIntroScreenView', EFACIntroScreenView );
} );
