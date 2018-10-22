// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node that represents a biker in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var Biker = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Biker' );
  var Dimension2 = require( 'DOT/Dimension2' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  // images
  var cyclistBackLegImages = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_10.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_11.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_12.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_13.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_14.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_15.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_16.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_17.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_back_18.png' )
  ];
  var cyclistFrontLegImages = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_10.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_11.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_12.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_13.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_14.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_15.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_16.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_17.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_leg_front_18.png' )
  ];
  var cyclistTorsoImages = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_torso.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_torso_tired_1.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_torso_tired_2.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/cyclist_torso_tired_3.png' )
  ];
  assert && assert( Biker.NUMBER_OF_LEG_IMAGES === cyclistFrontLegImages.length,
    'NUMBER_OF_LEG_IMAGES in Biker.js must match the number of images used for the legs in BikerNode.js'
  );
  var NUMBER_OF_LEG_IMAGES = cyclistFrontLegImages.length;
  var NUMBER_OF_TORSO_IMAGES = cyclistTorsoImages.length;
  var bicycleFrameImage = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_frame.png' );
  var bicycleSpokesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_spokes.png' );

  // constants
  var BICYCLE_SYSTEM_RIGHT_OFFSET = 123;
  var BICYCLE_SYSTEM_TOP_OFFSET = -249;
  var BICYCLE_SYSTEM_SCALE = 0.490;
  var SPOKES_OFFSET = -14;

  // strings
  var feedMeString = require( 'string!ENERGY_FORMS_AND_CHANGES/feedMe' );

  /**
   * @param {Biker} biker EnergySource
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BikerNode( biker, energyChunksVisibleProperty, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, biker, modelViewTransform );

    // bike part image nodes
    var bicycleFrameNode = new Image( bicycleFrameImage, {
      right: BICYCLE_SYSTEM_RIGHT_OFFSET,
      top: BICYCLE_SYSTEM_TOP_OFFSET,
      scale: BICYCLE_SYSTEM_SCALE
    } );
    var bicycleSpokesNode = new Image( bicycleSpokesImage, {
      right: bicycleFrameNode.right + SPOKES_OFFSET,
      bottom: bicycleFrameNode.bottom + SPOKES_OFFSET,
      scale: BICYCLE_SYSTEM_SCALE
    } );
    var cyclistTorsoRootNode = new Node();
    var cyclistTorsoNodes = [];
    var i;

    // create the torso image nodes
    for ( i = 0; i < NUMBER_OF_TORSO_IMAGES; i++ ) {
      cyclistTorsoNodes.push( new Image( cyclistTorsoImages[ i ], {
        centerX: bicycleFrameNode.centerX,
        bottom: bicycleFrameNode.bottom,
        scale: BICYCLE_SYSTEM_SCALE
      } ) );
      cyclistTorsoNodes[ i ].setVisible( false );
      cyclistTorsoRootNode.addChild( cyclistTorsoNodes[ i ] );
    }
    var cyclistBackLegRootNode = new Node();
    var cyclistFrontLegRootNode = new Node();
    var cyclistBackLegNodes = [];
    var cyclistFrontLegNodes = [];

    // create the leg image nodes
    for ( i = 0; i < NUMBER_OF_LEG_IMAGES; i++ ) {

      // back leg image nodes
      cyclistBackLegNodes.push( new Image( cyclistBackLegImages[ i ], {
        right: BICYCLE_SYSTEM_RIGHT_OFFSET,
        top: BICYCLE_SYSTEM_TOP_OFFSET,
        scale: BICYCLE_SYSTEM_SCALE
      } ) );
      cyclistBackLegNodes[ i ].setVisible( false );
      cyclistBackLegRootNode.addChild( cyclistBackLegNodes[ i ] );

      // front leg image nodes
      cyclistFrontLegNodes.push( new Image( cyclistFrontLegImages[ i ], {
        right: BICYCLE_SYSTEM_RIGHT_OFFSET,
        top: BICYCLE_SYSTEM_TOP_OFFSET,
        scale: BICYCLE_SYSTEM_SCALE
      } ) );
      cyclistFrontLegNodes[ i ].setVisible( false );
      cyclistFrontLegRootNode.addChild( cyclistFrontLegNodes[ i ] );
    }

    // animate legs by setting image visibility based on crank arm angle
    var visibleBackLeg = cyclistBackLegNodes[ 0 ];
    var visibleFrontLeg = cyclistFrontLegNodes[ 0 ];
    biker.crankAngleProperty.link( function( angle ) {
      assert && assert( angle >= 0 && angle <= 2 * Math.PI, 'Angle out of range: ' + angle );
      var i = biker.mapAngleToImageIndex( angle );
      visibleFrontLeg.setVisible( false );
      visibleBackLeg.setVisible( false );
      visibleFrontLeg = cyclistFrontLegNodes[ i ];
      visibleBackLeg = cyclistBackLegNodes[ i ];
      visibleFrontLeg.setVisible( true );
      visibleBackLeg.setVisible( true );
    } );

    // add button to replenish the biker's energy (when she runs out)
    var feedMeButton = new RectangularPushButton( {
      content: new Text( feedMeString, { font: new PhetFont( 18 ), maxWidth: 100 } ),
      listener: function() {
        biker.replenishEnergyChunks();
      },
      baseColor: 'rgba(0,220,0,1)',
      centerX: cyclistTorsoNodes[ 0 ].centerTop.x,
      centerY: cyclistTorsoNodes[ 0 ].centerTop.y - 15
    } );
    this.addChild( feedMeButton );

    // control the visibility of the "feed me" button and the tiredness of the upper body based on the energy level
    var visibleTorso = cyclistTorsoNodes[ 0 ];
    biker.energyChunksRemainingProperty.link( function( numberOfChunksRemaining ) {

      // only set the state by numberOfChunksRemaining if the biker is active, otherwise set initial state. this is
      // needed for the biker to initially look correct when selected from the carousel
      if ( biker.activeProperty.get() ) {
        var percentageOfChunksRemaining = numberOfChunksRemaining / Biker.INITIAL_NUMBER_OF_ENERGY_CHUNKS;
        visibleTorso.setVisible( false );

        // select how tired the cyclist appears by how much energy the have remaining
        visibleTorso = percentageOfChunksRemaining > 0.67 ? cyclistTorsoNodes[ 0 ] :
                       percentageOfChunksRemaining > 0.33 ? cyclistTorsoNodes[ 1 ] :
                       percentageOfChunksRemaining > 0 ? cyclistTorsoNodes[ 2 ] : cyclistTorsoNodes[ 3 ];
        visibleTorso.setVisible( true );
        feedMeButton.setVisible( numberOfChunksRemaining === 0 );
      }
      else {
        visibleTorso.setVisible( true );
        feedMeButton.setVisible( false );
      }
    } );

    // add a listener that will turn the back wheel
    var wheelRotationPoint = bicycleSpokesNode.bounds.center;
    biker.rearWheelAngleProperty.link( function( angle ) {
      assert && assert( angle < 2 * Math.PI, 'Angle is out of bounds' );

      // Scenery doesn't use the convention in physics where a positive rotation is counter-clockwise, so we have to
      // invert the angle in the following calculation.
      var compensatedAngle = ( 2 * Math.PI - bicycleSpokesNode.getRotation() ) % ( 2 * Math.PI );
      var delta = angle - compensatedAngle;
      bicycleSpokesNode.rotateAround( wheelRotationPoint, -delta );
    } );

    // slider to control crank speed
    var crankSlider = new HSlider(
      biker.targetCrankAngularVelocityProperty,
      {
        min: 0,
        max: Biker.MAX_ANGULAR_VELOCITY_OF_CRANK
      },
      {
        trackSize: new Dimension2( 200, 5 ),
        thumbSize: new Dimension2( 20, 40 ),
        thumbTouchAreaXDilation: 11,
        thumbTouchAreaYDilation: 11
      }
    );

    this.addChild( new Panel( crankSlider, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
      centerX: 0,
      centerY: 110,
      resize: false
    } ) );

    // add the other images used
    this.addChild( cyclistBackLegRootNode );
    this.addChild( bicycleSpokesNode );
    this.addChild( bicycleFrameNode );
    this.addChild( cyclistTorsoRootNode );
    this.addChild( cyclistFrontLegRootNode );

    // add the energy chunk layer
    this.addChild( new EnergyChunkLayer( biker.energyChunkList, biker.positionProperty, modelViewTransform ) );
  }

  energyFormsAndChanges.register( 'BikerNode', BikerNode );

  return inherit( MoveFadeModelElementNode, BikerNode );
} );