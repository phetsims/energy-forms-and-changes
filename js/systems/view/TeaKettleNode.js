// Copyright 2016-2022, University of Colorado Boulder

/**
 * a Scenery Node that depicts a tea kettle on a burner
 *
 * @author John Blanco
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import HeaterCoolerBack from '../../../../scenery-phet/js/HeaterCoolerBack.js';
import HeaterCoolerFront from '../../../../scenery-phet/js/HeaterCoolerFront.js';
import { Image, Node } from '../../../../scenery/js/imports.js';
import gasPipeSystemsLong_png from '../../../images/gasPipeSystemsLong_png.js';
import gasPipeSystemsShort_png from '../../../images/gasPipeSystemsShort_png.js';
import teaKettle_png from '../../../images/teaKettle_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import BurnerStandNode from '../../common/view/BurnerStandNode.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';
import TeaKettleSteamCanvasNode from './TeaKettleSteamCanvasNode.js';

// constants
const BURNER_MODEL_BOUNDS = new Bounds2( -0.037, -0.0075, 0.037, 0.0525 ); // in meters
const BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // multiplier empirically determined for best look
const HEATER_COOLER_NODE_SCALE = 0.85; // empirically determined for best look

class TeaKettleNode extends MoveFadeModelElementNode {

  /**
   * @param {TeaKettle} teaKettle
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( teaKettle, energyChunksVisibleProperty, modelViewTransform, tandem ) {
    super( teaKettle, modelViewTransform, tandem );

    const teaKettleNode = new Image( teaKettle_png, { right: 114, bottom: 53 } );

    // create a mapping between the slider position and the steam proportion, which prevents very small values
    this.heaterSettingProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'heaterSettingProperty' )
    } );
    this.heaterSettingProperty.link( setting => {
      const mappedSetting = setting === 0 ? 0 : 0.25 + ( setting * 0.75 );
      teaKettle.heatProportionProperty.set( mappedSetting );
    } );

    // node for heater-cooler bucket - front and back are added separately to support layering of energy chunks
    const heaterCoolerBack = new HeaterCoolerBack( this.heaterSettingProperty, { scale: HEATER_COOLER_NODE_SCALE } );
    const heaterCoolerFront = new HeaterCoolerFront( this.heaterSettingProperty, {
      snapToZero: false,
      coolEnabled: false,
      scale: HEATER_COOLER_NODE_SCALE,
      linkHeaterCoolerBack: heaterCoolerBack,
      tandem: tandem.createTandem( 'heaterCoolerNode' ),
      heaterCoolerBack: heaterCoolerBack
    } );

    // burner stand node
    const burnerSize = modelViewTransform.modelToViewShape( BURNER_MODEL_BOUNDS );
    const burnerProjection = burnerSize.width * BURNER_EDGE_TO_HEIGHT_RATIO;
    const burnerStandNode = new BurnerStandNode( burnerSize, burnerProjection );

    burnerStandNode.centerTop = teaKettleNode.centerBottom.plus( new Vector2( 0, -teaKettleNode.height / 4 ) );
    heaterCoolerBack.centerX = burnerStandNode.centerX;
    heaterCoolerBack.bottom = burnerStandNode.bottom - burnerProjection / 2;
    heaterCoolerFront.leftTop = heaterCoolerBack.getHeaterFrontPosition();

    const gasPipeScale = 0.9;

    // create the left part of the gas pipe that connects to the heater cooler node. while it appears to be one pipe,
    // it's created as two separate nodes so that once part is behind the burner stand and one part is in front of the
    // the burner stand (to avoid splitting the burner stand into even more pieces). this is the part that's behind the
    // front of the burner stand. See https://github.com/phetsims/energy-forms-and-changes/issues/311
    const leftGasPipe = new Image( gasPipeSystemsLong_png, {
      right: heaterCoolerFront.left - 30, // empirically determined
      bottom: heaterCoolerFront.bottom - 20, // empirically determined
      scale: gasPipeScale
    } );

    // create the right part of the gas pipe that connects to the heater cooler node. this is a shorter segment that
    // goes in front of the burner stand but behind the heater cooler node.
    const rightGasPipe = new Image( gasPipeSystemsShort_png, {
      left: leftGasPipe.right - 1,
      centerY: leftGasPipe.centerY,
      scale: gasPipeScale
    } );

    // since the gas pipes are part of the heater/coolers, link their NodeIO Properties to listen to the heater/cooler's
    // NodeIO Properties
    heaterCoolerFront.opacityProperty.lazyLink( () => {
      leftGasPipe.opacity = heaterCoolerFront.opacity;
      rightGasPipe.opacity = heaterCoolerFront.opacity;
    } );
    heaterCoolerFront.pickableProperty.lazyLink( () => {
      leftGasPipe.pickable = heaterCoolerFront.pickable;
      rightGasPipe.pickable = heaterCoolerFront.pickable;
    } );
    heaterCoolerFront.visibleProperty.lazyLink( () => {
      leftGasPipe.visible = heaterCoolerFront.visible;
      rightGasPipe.visible = heaterCoolerFront.visible;
    } );

    const energyChunkLayer = new EnergyChunkLayer(
      teaKettle.energyChunkList,
      modelViewTransform,
      { parentPositionProperty: teaKettle.positionProperty }
    );

    // create steam node
    const spoutExitPosition = new Vector2( teaKettleNode.bounds.maxX - 4.5, teaKettleNode.bounds.minY + 16 );
    this.steamCanvasNode = new TeaKettleSteamCanvasNode(
      spoutExitPosition,
      teaKettle.energyProductionRateProperty,
      EFACConstants.MAX_ENERGY_PRODUCTION_RATE, {
        canvasBounds: new Bounds2(
          -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2,
          -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY,
          EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2,
          EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY
        )
      } );

    this.addChild( heaterCoolerBack );
    this.addChild( energyChunkLayer );
    this.addChild( leftGasPipe );

    // create a separate layer for the tea kettle, stand, and steam, which all become transparent when energy chunks
    // are turned on. the steam canvas node does not like its opacity to be set when it's not rendering anything, but
    // setting the opacity of its parent node is allowed.
    const kettleAndStand = new Node();
    kettleAndStand.addChild( burnerStandNode );
    kettleAndStand.addChild( this.steamCanvasNode );
    kettleAndStand.addChild( teaKettleNode );
    this.addChild( kettleAndStand );
    this.addChild( rightGasPipe );
    this.addChild( heaterCoolerFront );

    // make the tea kettle, stand, and steam transparent when energy chunks are visible
    energyChunksVisibleProperty.link( chunksVisible => {
      kettleAndStand.setOpacity( chunksVisible ? 0.7 : 1 );
    } );

    // reset the heater slider and clear the steam node when the tea kettle is deactivated
    teaKettle.activeProperty.link( active => {
      if ( !active ) {
        this.heaterSettingProperty.reset();
        this.steamCanvasNode.reset();
      }
    } );
  }

  /**
   * step function for the steam
   * @param {number} dt
   * @public
   */
  step( dt ) {
    this.steamCanvasNode.step( dt );
  }

  /**
   * @public
   */
  reset() {
    this.steamCanvasNode.reset();
  }
}

energyFormsAndChanges.register( 'TeaKettleNode', TeaKettleNode );
export default TeaKettleNode;