// Copyright 2016-2022, University of Colorado Boulder

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
import { Image, Node, Text } from '../../../../scenery/js/imports.js';
import RectangularPushButton from '../../../../sun/js/buttons/RectangularPushButton.js';
import HSlider from '../../../../sun/js/HSlider.js';
import Panel from '../../../../sun/js/Panel.js';
import bicycleFrame_png from '../../../images/bicycleFrame_png.js';
import bicycleGear_png from '../../../images/bicycleGear_png.js';
import bicycleSpokes_png from '../../../images/bicycleSpokes_png.js';
import cyclistLegBack01_png from '../../../images/cyclistLegBack01_png.js';
import cyclistLegBack02_png from '../../../images/cyclistLegBack02_png.js';
import cyclistLegBack03_png from '../../../images/cyclistLegBack03_png.js';
import cyclistLegBack04_png from '../../../images/cyclistLegBack04_png.js';
import cyclistLegBack05_png from '../../../images/cyclistLegBack05_png.js';
import cyclistLegBack06_png from '../../../images/cyclistLegBack06_png.js';
import cyclistLegBack07_png from '../../../images/cyclistLegBack07_png.js';
import cyclistLegBack08_png from '../../../images/cyclistLegBack08_png.js';
import cyclistLegBack09_png from '../../../images/cyclistLegBack09_png.js';
import cyclistLegBack10_png from '../../../images/cyclistLegBack10_png.js';
import cyclistLegBack11_png from '../../../images/cyclistLegBack11_png.js';
import cyclistLegBack12_png from '../../../images/cyclistLegBack12_png.js';
import cyclistLegBack13_png from '../../../images/cyclistLegBack13_png.js';
import cyclistLegBack14_png from '../../../images/cyclistLegBack14_png.js';
import cyclistLegBack15_png from '../../../images/cyclistLegBack15_png.js';
import cyclistLegBack16_png from '../../../images/cyclistLegBack16_png.js';
import cyclistLegBack17_png from '../../../images/cyclistLegBack17_png.js';
import cyclistLegBack18_png from '../../../images/cyclistLegBack18_png.js';
import cyclistLegFront01_png from '../../../images/cyclistLegFront01_png.js';
import cyclistLegFront02_png from '../../../images/cyclistLegFront02_png.js';
import cyclistLegFront03_png from '../../../images/cyclistLegFront03_png.js';
import cyclistLegFront04_png from '../../../images/cyclistLegFront04_png.js';
import cyclistLegFront05_png from '../../../images/cyclistLegFront05_png.js';
import cyclistLegFront06_png from '../../../images/cyclistLegFront06_png.js';
import cyclistLegFront07_png from '../../../images/cyclistLegFront07_png.js';
import cyclistLegFront08_png from '../../../images/cyclistLegFront08_png.js';
import cyclistLegFront09_png from '../../../images/cyclistLegFront09_png.js';
import cyclistLegFront10_png from '../../../images/cyclistLegFront10_png.js';
import cyclistLegFront11_png from '../../../images/cyclistLegFront11_png.js';
import cyclistLegFront12_png from '../../../images/cyclistLegFront12_png.js';
import cyclistLegFront13_png from '../../../images/cyclistLegFront13_png.js';
import cyclistLegFront14_png from '../../../images/cyclistLegFront14_png.js';
import cyclistLegFront15_png from '../../../images/cyclistLegFront15_png.js';
import cyclistLegFront16_png from '../../../images/cyclistLegFront16_png.js';
import cyclistLegFront17_png from '../../../images/cyclistLegFront17_png.js';
import cyclistLegFront18_png from '../../../images/cyclistLegFront18_png.js';
import cyclistTorso_png from '../../../images/cyclistTorso_png.js';
import cyclistTorsoTired1_png from '../../../images/cyclistTorsoTired1_png.js';
import cyclistTorsoTired2_png from '../../../images/cyclistTorsoTired2_png.js';
import cyclistTorsoTired3_png from '../../../images/cyclistTorsoTired3_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Biker from '../model/Biker.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

const cyclistBackLegImages = [
  cyclistLegBack01_png,
  cyclistLegBack02_png,
  cyclistLegBack03_png,
  cyclistLegBack04_png,
  cyclistLegBack05_png,
  cyclistLegBack06_png,
  cyclistLegBack07_png,
  cyclistLegBack08_png,
  cyclistLegBack09_png,
  cyclistLegBack10_png,
  cyclistLegBack11_png,
  cyclistLegBack12_png,
  cyclistLegBack13_png,
  cyclistLegBack14_png,
  cyclistLegBack15_png,
  cyclistLegBack16_png,
  cyclistLegBack17_png,
  cyclistLegBack18_png
];

const cyclistFrontLegImages = [
  cyclistLegFront01_png,
  cyclistLegFront02_png,
  cyclistLegFront03_png,
  cyclistLegFront04_png,
  cyclistLegFront05_png,
  cyclistLegFront06_png,
  cyclistLegFront07_png,
  cyclistLegFront08_png,
  cyclistLegFront09_png,
  cyclistLegFront10_png,
  cyclistLegFront11_png,
  cyclistLegFront12_png,
  cyclistLegFront13_png,
  cyclistLegFront14_png,
  cyclistLegFront15_png,
  cyclistLegFront16_png,
  cyclistLegFront17_png,
  cyclistLegFront18_png
];

const cyclistTorsoImages = [
 cyclistTorso_png,
 cyclistTorsoTired1_png,
 cyclistTorsoTired2_png,
 cyclistTorsoTired3_png
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

const feedMeString = EnergyFormsAndChangesStrings.feedMe;

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
    const bicycleFrameNode = new Image( bicycleFrame_png, {
      right: BICYCLE_SYSTEM_RIGHT_OFFSET,
      top: BICYCLE_SYSTEM_TOP_OFFSET,
      scale: IMAGE_SCALE
    } );
    const bicycleGearNode = new Image( bicycleGear_png, {
      center: modelViewTransform.modelToViewDelta( Biker.CENTER_OF_GEAR_OFFSET ),
      scale: IMAGE_SCALE
    } );
    const bicycleSpokesNode = new Image( bicycleSpokes_png, {
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