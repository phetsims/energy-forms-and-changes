// Copyright 2016-2020, University of Colorado Boulder

/**
 * a Scenery Node that represents a biker in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Dimension2 from '../../../../dot/js/Dimension2.js';
import Range from '../../../../dot/js/Range.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Image } from '../../../../scenery/js/imports.js';
import { Node } from '../../../../scenery/js/imports.js';
import { Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import bicycleFrameImage from '../../../images/bicycle_frame_png.js';
import bicycleGearImage from '../../../images/bicycle_gear_png.js';
import bicycleSpokesImage from '../../../images/bicycle_spokes_png.js';
import cyclistLegBack1 from '../../../images/cyclist_leg_back_01_png.js';
import cyclistLegBack2 from '../../../images/cyclist_leg_back_02_png.js';
import cyclistLegBack3 from '../../../images/cyclist_leg_back_03_png.js';
import cyclistLegBack4 from '../../../images/cyclist_leg_back_04_png.js';
import cyclistLegBack5 from '../../../images/cyclist_leg_back_05_png.js';
import cyclistLegBack6 from '../../../images/cyclist_leg_back_06_png.js';
import cyclistLegBack7 from '../../../images/cyclist_leg_back_07_png.js';
import cyclistLegBack8 from '../../../images/cyclist_leg_back_08_png.js';
import cyclistLegBack9 from '../../../images/cyclist_leg_back_09_png.js';
import cyclistLegBack10 from '../../../images/cyclist_leg_back_10_png.js';
import cyclistLegBack11 from '../../../images/cyclist_leg_back_11_png.js';
import cyclistLegBack12 from '../../../images/cyclist_leg_back_12_png.js';
import cyclistLegBack13 from '../../../images/cyclist_leg_back_13_png.js';
import cyclistLegBack14 from '../../../images/cyclist_leg_back_14_png.js';
import cyclistLegBack15 from '../../../images/cyclist_leg_back_15_png.js';
import cyclistLegBack16 from '../../../images/cyclist_leg_back_16_png.js';
import cyclistLegBack17 from '../../../images/cyclist_leg_back_17_png.js';
import cyclistLegBack18 from '../../../images/cyclist_leg_back_18_png.js';
import cyclistLegFront1 from '../../../images/cyclist_leg_front_01_png.js';
import cyclistLegFront2 from '../../../images/cyclist_leg_front_02_png.js';
import cyclistLegFront3 from '../../../images/cyclist_leg_front_03_png.js';
import cyclistLegFront4 from '../../../images/cyclist_leg_front_04_png.js';
import cyclistLegFront5 from '../../../images/cyclist_leg_front_05_png.js';
import cyclistLegFront6 from '../../../images/cyclist_leg_front_06_png.js';
import cyclistLegFront7 from '../../../images/cyclist_leg_front_07_png.js';
import cyclistLegFront8 from '../../../images/cyclist_leg_front_08_png.js';
import cyclistLegFront9 from '../../../images/cyclist_leg_front_09_png.js';
import cyclistLegFront10 from '../../../images/cyclist_leg_front_10_png.js';
import cyclistLegFront11 from '../../../images/cyclist_leg_front_11_png.js';
import cyclistLegFront12 from '../../../images/cyclist_leg_front_12_png.js';
import cyclistLegFront13 from '../../../images/cyclist_leg_front_13_png.js';
import cyclistLegFront14 from '../../../images/cyclist_leg_front_14_png.js';
import cyclistLegFront15 from '../../../images/cyclist_leg_front_15_png.js';
import cyclistLegFront16 from '../../../images/cyclist_leg_front_16_png.js';
import cyclistLegFront17 from '../../../images/cyclist_leg_front_17_png.js';
import cyclistLegFront18 from '../../../images/cyclist_leg_front_18_png.js';
import cyclistTorso from '../../../images/cyclist_torso_png.js';
import cyclistTorsoTired1 from '../../../images/cyclist_torso_tired_1_png.js';
import cyclistTorsoTired2 from '../../../images/cyclist_torso_tired_2_png.js';
import cyclistTorsoTired3 from '../../../images/cyclist_torso_tired_3_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChangesStrings from '../../energyFormsAndChangesStrings.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Biker from '../model/Biker.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

const cyclistBackLegImages = [
  cyclistLegBack1,
  cyclistLegBack2,
  cyclistLegBack3,
  cyclistLegBack4,
  cyclistLegBack5,
  cyclistLegBack6,
  cyclistLegBack7,
  cyclistLegBack8,
  cyclistLegBack9,
  cyclistLegBack10,
  cyclistLegBack11,
  cyclistLegBack12,
  cyclistLegBack13,
  cyclistLegBack14,
  cyclistLegBack15,
  cyclistLegBack16,
  cyclistLegBack17,
  cyclistLegBack18
];

const cyclistFrontLegImages = [
  cyclistLegFront1,
  cyclistLegFront2,
  cyclistLegFront3,
  cyclistLegFront4,
  cyclistLegFront5,
  cyclistLegFront6,
  cyclistLegFront7,
  cyclistLegFront8,
  cyclistLegFront9,
  cyclistLegFront10,
  cyclistLegFront11,
  cyclistLegFront12,
  cyclistLegFront13,
  cyclistLegFront14,
  cyclistLegFront15,
  cyclistLegFront16,
  cyclistLegFront17,
  cyclistLegFront18
];

const cyclistTorsoImages = [
  cyclistTorso,
  cyclistTorsoTired1,
  cyclistTorsoTired2,
  cyclistTorsoTired3
];
assert && assert( Biker.NUMBER_OF_LEG_IMAGES === cyclistFrontLegImages.length,
  'NUMBER_OF_LEG_IMAGES in Biker.js must match the number of images used for the legs in BikerNode.js'
);
const NUMBER_OF_LEG_IMAGES = cyclistFrontLegImages.length;
const NUMBER_OF_TORSO_IMAGES = cyclistTorsoImages.length;

// constants
const BICYCLE_SYSTEM_RIGHT_OFFSET = 123;
const BICYCLE_SYSTEM_TOP_OFFSET = -249;
const IMAGE_SCALE = 0.490; // scale factor used to size the images, empirically determined

const feedMeString = energyFormsAndChangesStrings.feedMe;

class BikerNode extends MoveFadeModelElementNode {

  /**
   * @param {Biker} biker EnergySource
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( biker, energyChunksVisibleProperty, modelViewTransform, tandem ) {
    super( biker, modelViewTransform, tandem );

    // bike part image nodes
    const bicycleFrameNode = new Image( bicycleFrameImage, {
      right: BICYCLE_SYSTEM_RIGHT_OFFSET,
      top: BICYCLE_SYSTEM_TOP_OFFSET,
      scale: IMAGE_SCALE
    } );
    const bicycleGearNode = new Image( bicycleGearImage, {
      center: modelViewTransform.modelToViewDelta( Biker.CENTER_OF_GEAR_OFFSET ),
      scale: IMAGE_SCALE
    } );
    const bicycleSpokesNode = new Image( bicycleSpokesImage, {
      center: modelViewTransform.modelToViewDelta( Biker.CENTER_OF_BACK_WHEEL_OFFSET ),
      scale: IMAGE_SCALE
    } );
    const cyclistTorsoRootNode = new Node();
    const cyclistTorsoNodes = [];

    // create the torso image nodes
    for ( let i = 0; i < NUMBER_OF_TORSO_IMAGES; i++ ) {
      cyclistTorsoNodes.push( new Image( cyclistTorsoImages[ i ], {
        centerX: bicycleFrameNode.centerX,
        bottom: bicycleFrameNode.bottom,
        scale: IMAGE_SCALE
      } ) );
      cyclistTorsoNodes[ i ].setVisible( false );
      cyclistTorsoRootNode.addChild( cyclistTorsoNodes[ i ] );
    }
    const cyclistBackLegRootNode = new Node();
    const cyclistFrontLegRootNode = new Node();
    const cyclistBackLegNodes = [];
    const cyclistFrontLegNodes = [];

    // create the leg image nodes
    for ( let i = 0; i < NUMBER_OF_LEG_IMAGES; i++ ) {

      // back leg image nodes
      cyclistBackLegNodes.push( new Image( cyclistBackLegImages[ i ], {
        right: BICYCLE_SYSTEM_RIGHT_OFFSET,
        top: BICYCLE_SYSTEM_TOP_OFFSET,
        scale: IMAGE_SCALE
      } ) );
      cyclistBackLegNodes[ i ].setVisible( false );
      cyclistBackLegRootNode.addChild( cyclistBackLegNodes[ i ] );

      // front leg image nodes
      cyclistFrontLegNodes.push( new Image( cyclistFrontLegImages[ i ], {
        right: BICYCLE_SYSTEM_RIGHT_OFFSET,
        top: BICYCLE_SYSTEM_TOP_OFFSET,
        scale: IMAGE_SCALE
      } ) );
      cyclistFrontLegNodes[ i ].setVisible( false );
      cyclistFrontLegRootNode.addChild( cyclistFrontLegNodes[ i ] );
    }

    // animate legs by setting image visibility based on crank arm angle. also animate the gear by mapping its angle of
    // rotation to the crank arm angle
    let visibleBackLeg = cyclistBackLegNodes[ 0 ];
    let visibleFrontLeg = cyclistFrontLegNodes[ 0 ];
    const gearRotationPoint = bicycleGearNode.bounds.center;
    biker.crankAngleProperty.link( angle => {
      assert && assert( angle >= 0 && angle <= 2 * Math.PI, `Angle out of range: ${angle}` );
      const i = biker.mapAngleToImageIndex( angle );
      visibleFrontLeg.setVisible( false );
      visibleBackLeg.setVisible( false );
      visibleFrontLeg = cyclistFrontLegNodes[ i ];
      visibleBackLeg = cyclistBackLegNodes[ i ];
      visibleFrontLeg.setVisible( true );
      visibleBackLeg.setVisible( true );

      // Scenery doesn't use the convention in physics where a positive rotation is counter-clockwise, so we have to
      // invert the angle in the following calculation.
      const compensatedAngle = ( 2 * Math.PI - bicycleGearNode.getRotation() ) % ( 2 * Math.PI );
      const delta = angle - compensatedAngle;

      // once the velocity of the biker has decelerated to 0, the crank angle Property is set to a value that aligns to
      // the next closest biker animation frame so that there is no delay for the legs to start moving the next time the
      // biker starts moving. this small change of angle causes the gear to jump a bit when the biker stops, but we can
      // eliminate that jump by checking to see if the biker has any actual velocity, since the angle adjustment only
      // happens when velocity is 0.
      if ( biker.crankAngularVelocityProperty.value > 0 ) {
        bicycleGearNode.rotateAround( gearRotationPoint, -delta );
      }
    } );

    // add feedMeButton
    const feedMeButton = new RectangularPushButton( {
      content: new Text( feedMeString, {
        font: new PhetFont( 18 ),
        maxWidth: 100
      } ),
      listener: () => {
        biker.energyChunksRemainingProperty.reset();
        biker.replenishBikerEnergyChunks( false ); // don't clear out existing chunks when adding more
      },
      baseColor: 'rgba(0,220,0,1)',
      centerX: cyclistTorsoNodes[ 0 ].centerTop.x,
      centerY: cyclistTorsoNodes[ 0 ].centerTop.y - 15,
      minHeight: 30,
      tandem: tandem.createTandem( 'feedMeButton' ),
      phetioReadOnly: true,
      phetioDocumentation: 'button that replenish\'s the biker\'s energy. only visible when the biker is out of energy'
    } );
    this.addChild( feedMeButton );

    // control the visibility of the "feed me" button and the tiredness of the upper body based on the energy level
    let visibleTorso = cyclistTorsoNodes[ 0 ];
    biker.energyChunksRemainingProperty.link( numberOfChunksRemaining => {

      // only set the state by numberOfChunksRemaining if the biker is active, otherwise set initial state. this is
      // needed for the biker to initially look correct when selected from the carousel
      const percentageOfChunksRemaining = numberOfChunksRemaining / Biker.INITIAL_NUMBER_OF_ENERGY_CHUNKS;
      visibleTorso.setVisible( false );

      // select how tired the cyclist appears by how much energy the have remaining
      visibleTorso = percentageOfChunksRemaining > 0.67 ? cyclistTorsoNodes[ 0 ] :
                     percentageOfChunksRemaining > 0.33 ? cyclistTorsoNodes[ 1 ] :
                     percentageOfChunksRemaining > 0 ? cyclistTorsoNodes[ 2 ] : cyclistTorsoNodes[ 3 ];
      visibleTorso.setVisible( true );
      feedMeButton.setVisible( numberOfChunksRemaining === 0 );
    } );

    // add a listener that will turn the back wheel
    const wheelRotationPoint = bicycleSpokesNode.bounds.center;
    biker.rearWheelAngleProperty.link( angle => {
      assert && assert( angle < 2 * Math.PI, 'Angle is out of bounds' );

      // Scenery doesn't use the convention in physics where a positive rotation is counter-clockwise, so we have to
      // invert the angle in the following calculation.
      const compensatedAngle = ( 2 * Math.PI - bicycleSpokesNode.getRotation() ) % ( 2 * Math.PI );
      const delta = angle - compensatedAngle;
      bicycleSpokesNode.rotateAround( wheelRotationPoint, -delta );
    } );

    const controlPanelTandem = tandem.createTandem( 'controlPanel' );

    // slider to control crank speed
    const crankSlider = new HSlider(
      biker.targetCrankAngularVelocityProperty,
      new Range( 0, Biker.MAX_ANGULAR_VELOCITY_OF_CRANK ), {
        trackSize: new Dimension2( 200, 5 ),
        thumbSize: new Dimension2( 20, 40 ),
        thumbTouchAreaXDilation: 11,
        thumbTouchAreaYDilation: 11,
        tandem: controlPanelTandem.createTandem( 'slider' )
      }
    );

    this.addChild( new Panel( crankSlider, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
      centerX: 0,
      centerY: 110,
      resize: false,
      tandem: controlPanelTandem
    } ) );

    // add the other images used
    this.addChild( cyclistBackLegRootNode );
    this.addChild( bicycleSpokesNode );
    this.addChild( bicycleFrameNode );
    this.addChild( bicycleGearNode );
    this.addChild( cyclistTorsoRootNode );
    this.addChild( cyclistFrontLegRootNode );

    // add the energy chunk layer
    this.addChild( new EnergyChunkLayer( biker.energyChunkList, modelViewTransform, {
      parentPositionProperty: biker.positionProperty
    } ) );
  }
}

energyFormsAndChanges.register( 'BikerNode', BikerNode );
export default BikerNode;