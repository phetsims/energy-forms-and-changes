// Copyright 2016-2020, University of Colorado Boulder

/**
 * a scenery node that represents a faucet from which water flows
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import FaucetNode from '../../../../scenery-phet/js/FaucetNode.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import FaucetAndWater from '../model/FaucetAndWater.js';
import FallingWaterCanvasNode from './FallingWaterCanvasNode.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

// constants
const FAUCET_NODE_HORIZONTAL_LENGTH = 1400; // empirically determined to be long enough that end is generally not seen

class FaucetAndWaterNode extends MoveFadeModelElementNode {

  /**
   * @param {FaucetAndWater} faucet EnergySource
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Tandem} tandem
   */
  constructor( faucet, energyChunksVisibleProperty, modelViewTransform, tandem ) {
    super( faucet, modelViewTransform, tandem );

    const fallingWaterOrigin = modelViewTransform.modelToViewDelta( FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN );

    // create the falling water drops and set position to its model offset
    this.fallingWaterCanvasNode = new FallingWaterCanvasNode(
      faucet.waterDrops,
      modelViewTransform,
      {
        canvasBounds: new Bounds2(
          -modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH ),
          0,
          modelViewTransform.modelToViewDeltaX( FaucetAndWater.MAX_WATER_WIDTH ),
          EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY
        ),
        x: fallingWaterOrigin.x,
        y: fallingWaterOrigin.y
      }
    );

    const faucetHeadOrigin = modelViewTransform.modelToViewDelta( FaucetAndWater.OFFSET_FROM_CENTER_TO_FAUCET_HEAD );
    const maxFlowProportion = 1.0;

    // create a mapping between the slider position and the flow proportion that prevents very small values
    this.faucetSettingProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'faucetSettingProperty' )
    } );
    this.faucetSettingProperty.link( setting => {
      const mappedSetting = setting === 0 ? 0 : 0.25 + ( setting * 0.75 );
      faucet.flowProportionProperty.set( mappedSetting );
    } );

    // create the faucet and set position to its model offset
    const faucetNode = new FaucetNode( maxFlowProportion, this.faucetSettingProperty, faucet.activeProperty, {
      horizontalPipeLength: FAUCET_NODE_HORIZONTAL_LENGTH,
      verticalPipeLength: 40,
      scale: 0.45,
      x: faucetHeadOrigin.x,
      y: faucetHeadOrigin.y,
      closeOnRelease: false,
      shooterOptions: {
        touchAreaXDilation: 77,
        touchAreaYDilation: 100
      },
      tandem: tandem.createTandem( 'faucetNode' )
    } );

    // create the energy chunk layer
    const energyChunkLayer = new EnergyChunkLayer( faucet.energyChunkList, modelViewTransform, {
      parentPositionProperty: faucet.positionProperty
    } );

    this.addChild( this.fallingWaterCanvasNode );
    this.addChild( energyChunkLayer );
    this.addChild( faucetNode );

    // reset the valve when the faucet is deactivated
    faucet.activeProperty.link( active => {
      if ( !active ) {
        this.faucetSettingProperty.reset();
      }
    } );
  }

  /**
   * @public
   * @param {number} dt - the change in time
   */
  step( dt ) {
    this.fallingWaterCanvasNode.step( dt );
  }
}

energyFormsAndChanges.register( 'FaucetAndWaterNode', FaucetAndWaterNode );
export default FaucetAndWaterNode;