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
  var backLegImages = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_10.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_11.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_12.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_13.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_14.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_15.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_16.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_17.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_18.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_19.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_20.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_21.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_22.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_23.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/back_leg_24.png' )
  ];
  var frontLegImages = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_10.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_11.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_12.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_13.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_14.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_15.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_16.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_17.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_18.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_19.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_20.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_21.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_22.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_23.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/front_leg_24.png' )
  ];
  var NUM_LEG_IMAGES = frontLegImages.length;
  var bicycleFrameImage = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_frame_3.png' );
  var bicycleRiderImage = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_rider.png' );
  var bicycleRiderTiredImage = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_rider_tired.png' );
  var bicycleSpokesImage = require( 'image!ENERGY_FORMS_AND_CHANGES/bicycle_spokes.png' );

  // constants
  var BICYCLE_FRAME_RIGHT_OFFSET = 120;
  var BICYCLE_FRAME_TOP_OFFSET = -112;
  var LEG_RIGHT_OFFSET = BICYCLE_FRAME_RIGHT_OFFSET - 33;
  var LEG_TOP_OFFSET = BICYCLE_FRAME_TOP_OFFSET - 10;

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
    var frameNode = new Image( bicycleFrameImage, {
      right: BICYCLE_FRAME_RIGHT_OFFSET,
      top: BICYCLE_FRAME_TOP_OFFSET
    } );
    var spokesNode = new Image( bicycleSpokesImage, { right: frameNode.right - 14, bottom: frameNode.bottom - 14 } );
    var upperBodyNormalNode = new Image( bicycleRiderImage, {
      centerX: frameNode.centerX - 5,
      bottom: frameNode.top + 25
    } );
    var upperBodyTiredNode = new Image( bicycleRiderTiredImage, {
      centerX: frameNode.centerX - 5,
      bottom: frameNode.top + 25
    } );
    var backLegRootNode = new Node();
    var frontLegRootNode = new Node();
    var backLegImageNodes = [];
    var frontLegImageNodes = [];

    for ( var i = 0; i < NUM_LEG_IMAGES; i++ ) {

      // back leg image nodes
      backLegImageNodes.push( new Image( backLegImages[ i ], { right: LEG_RIGHT_OFFSET, top: LEG_TOP_OFFSET } ) );
      backLegImageNodes[ i ].setVisible( false );
      backLegRootNode.addChild( backLegImageNodes[ i ] );

      // front leg image nodes
      frontLegImageNodes.push( new Image( frontLegImages[ i ], { right: LEG_RIGHT_OFFSET, top: LEG_TOP_OFFSET } ) );
      frontLegImageNodes[ i ].setVisible( false );
      frontLegRootNode.addChild( frontLegImageNodes[ i ] );
    }

    // animate legs by setting image visibility based on crank arm angle
    var visibleBackLeg = backLegImageNodes[ 0 ];
    var visibleFrontLeg = frontLegImageNodes[ 0 ];
    biker.crankAngleProperty.link( function( angle ) {
      assert && assert( angle >= 0 && angle <= 2 * Math.PI, 'Angle out of range: ' + angle );
      var i = biker.mapAngleToImageIndex( angle );
      visibleFrontLeg.setVisible( false );
      visibleBackLeg.setVisible( false );
      visibleFrontLeg = frontLegImageNodes[ i ];
      visibleBackLeg = backLegImageNodes[ i ];
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
      centerX: upperBodyNormalNode.centerTop.x,
      centerY: upperBodyNormalNode.centerTop.y - 40
    } );
    this.addChild( feedMeButton );

    // control the visibility of the "feed me" button the the position of the upper body based on the energy level
    biker.bikerHasEnergyProperty.link( function( hasEnergy ) {
      feedMeButton.setVisible( !hasEnergy );
      upperBodyNormalNode.setVisible( hasEnergy );
      upperBodyTiredNode.setVisible( !hasEnergy );
    } );

    // add a listener that will turn the back wheel
    var wheelRotationPoint = spokesNode.bounds.center;
    biker.rearWheelAngleProperty.link( function( angle ) {
      assert && assert( angle < 2 * Math.PI, 'Angle is out of bounds' );

      // Scenery doesn't use the convention in physics where a positive rotation is counter-clockwise, so we have to
      // invert the angle in the following calculation.
      var compensatedAngle = ( 2 * Math.PI - spokesNode.getRotation() ) % ( 2 * Math.PI );
      var delta = angle - compensatedAngle;
      spokesNode.rotateAround( wheelRotationPoint, -delta );
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
      centerX: 0,
      centerY: 110,
      cornerRadius: 8,
      resize: false
    } ) );

    // add the other images used
    this.addChild( spokesNode );
    this.addChild( backLegRootNode );
    this.addChild( frameNode );
    this.addChild( frontLegRootNode );
    this.addChild( upperBodyNormalNode );
    this.addChild( upperBodyTiredNode );

    // add the energy chunk layer
    this.addChild( new EnergyChunkLayer( biker.energyChunkList, biker.positionProperty, modelViewTransform ) );
  }

  energyFormsAndChanges.register( 'BikerNode', BikerNode );

  return inherit( MoveFadeModelElementNode, BikerNode );
} );