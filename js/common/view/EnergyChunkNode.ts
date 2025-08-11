// Copyright 2014-2025, University of Colorado Boulder

/**
 * Scenery node that represents a chunk of energy in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Chris Klusendorf (Phet Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import Circle from '../../../../scenery/js/nodes/Circle.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import energyChemical_png from '../../../images/energyChemical_png.js';
import energyElectrical_png from '../../../images/energyElectrical_png.js';
import energyHidden_png from '../../../images/energyHidden_png.js';
import energyLight_png from '../../../images/energyLight_png.js';
import energyMechanical_png from '../../../images/energyMechanical_png.js';
import energyThermal_png from '../../../images/energyThermal_png.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EFACConstants from '../EFACConstants.js';
import EFACQueryParameters from '../EFACQueryParameters.js';
import EnergyChunk from '../model/EnergyChunk.js';
import EnergyType from '../model/EnergyType.js';

const energyChunkLabelString = EnergyFormsAndChangesStrings.energyChunkLabel;

// constants

// convenience map that links energy types to their representing images
const mapEnergyTypeToImage = {
  THERMAL: energyThermal_png,
  ELECTRICAL: energyElectrical_png,
  MECHANICAL: energyMechanical_png,
  LIGHT: energyLight_png,
  CHEMICAL: energyChemical_png,
  HIDDEN: energyHidden_png
} as const;

// array that holds the created energy chunk image nodes
const energyChunkImageNodes = {};

class EnergyChunkNode extends Node {

  // Function to dispose this node
  private readonly disposeEnergyChunkNode: () => void;

  /**
   * @param energyChunk - model of an energy chunk
   * @param modelViewTransform
   */
  public constructor( energyChunk: EnergyChunk, modelViewTransform: ModelViewTransform2 ) {
    super();

    // control the overall visibility of this node
    const handleVisibilityChanged = ( visible: boolean ) => {
      !this.isDisposed && this.setVisible( visible );
    };
    energyChunk.visibleProperty.link( handleVisibilityChanged );

    // set up updating of transparency based on Z position
    const handleZPositionChanged = ( zPosition: number ) => {
      this.updateTransparency( zPosition );
    };
    energyChunk.zPositionProperty.link( handleZPositionChanged );

    // monitor the energy type and update the image if a change occurs
    const handleEnergyTypeChanged = ( energyType: EnergyType ) => {
      this.removeAllChildren();
      this.addChild( getEnergyChunkNode( energyType ) );

      if ( EFACQueryParameters.showHelperShapes ) {
        this.addChild( new Circle( 6, { fill: 'pink' } ) );
      }
    };
    energyChunk.energyTypeProperty.link( handleEnergyTypeChanged );

    // set this node's position when the corresponding model element moves
    const handlePositionChanged = ( position: Vector2 ) => {
      assert && assert( !_.isNaN( position.x ), `position.x = ${position.x}` );
      assert && assert( !_.isNaN( position.y ), `position.y = ${position.y}` );
      this.translation = modelViewTransform.modelToViewPosition( position );
    };
    energyChunk.positionProperty.link( handlePositionChanged );

    this.disposeEnergyChunkNode = () => {
      energyChunk.visibleProperty.unlink( handleVisibilityChanged );
      energyChunk.zPositionProperty.unlink( handleZPositionChanged );
      energyChunk.energyTypeProperty.unlink( handleEnergyTypeChanged );
      energyChunk.positionProperty.unlink( handlePositionChanged );
    };
  }

  /**
   * Update the transparency, which is mostly a function of how far the energy chunk is from the front.
   * @param zPosition
   */
  private updateTransparency( zPosition: number ): void {
    let zFadeValue = 1;
    if ( zPosition < 0 ) {
      zFadeValue = Math.max( 1 + zPosition / EFACConstants.Z_DISTANCE_WHERE_FULLY_FADED, 0 );
    }
    this.setOpacity( zFadeValue );
  }

  public override dispose(): void {
    this.disposeEnergyChunkNode();
    super.dispose();
  }
}

/**
 * Helper function that creates the image for an EnergyChunkNode.
 * @param energyType
 */
const createEnergyChunkImageNode = ( energyType: EnergyType ): Image => {
  const background = new Image( mapEnergyTypeToImage[ energyType ] );
  const energyText = new Text( energyChunkLabelString, { font: new PhetFont( 16 ) } );
  energyText.scale( Math.min( background.width / energyText.width, background.height / energyText.height ) * 0.65 );
  energyText.center = background.center;
  background.addChild( energyText );
  background.scale( EFACConstants.ENERGY_CHUNK_WIDTH / background.width );
  background.center = Vector2.ZERO;
  return background;
};

/**
 * Helper function that returns the correct image for an EnergyChunkNode.
 * @param energyType
 */
const getEnergyChunkNode = ( energyType: EnergyType ): Image => {

  // these need to be lazily created because the images are not decoded fast enough in the built version to be
  // available right away
  // @ts-expect-error
  if ( !energyChunkImageNodes[ energyType ] ) {
    // @ts-expect-error
    energyChunkImageNodes[ energyType ] = createEnergyChunkImageNode( energyType );
  }
  // @ts-expect-error
  return energyChunkImageNodes[ energyType ];
};

energyFormsAndChanges.register( 'EnergyChunkNode', EnergyChunkNode );
export default EnergyChunkNode;