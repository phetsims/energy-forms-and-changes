// Copyright 2014-2022, University of Colorado Boulder

/**
 * Scenery node that represents a chunk of energy in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Chris Klusendorf (Phet Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import { Circle, Image, Node, Text } from '../../../../scenery/js/imports.js';
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
import EnergyType from '../model/EnergyType.js';

const energyChunkLabelString = EnergyFormsAndChangesStrings.energyChunkLabel;

// constants
const Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters

// convenience map that links energy types to their representing images
const mapEnergyTypeToImage = {};
mapEnergyTypeToImage[ EnergyType.THERMAL ] = energyThermal_png;
mapEnergyTypeToImage[ EnergyType.ELECTRICAL ] = energyElectrical_png;
mapEnergyTypeToImage[ EnergyType.MECHANICAL ] = energyMechanical_png;
mapEnergyTypeToImage[ EnergyType.LIGHT ] = energyLight_png;
mapEnergyTypeToImage[ EnergyType.CHEMICAL ] = energyChemical_png;
mapEnergyTypeToImage[ EnergyType.HIDDEN ] = energyHidden_png;

// array that holds the created energy chunk image nodes
const energyChunkImageNodes = {};

class EnergyChunkNode extends Node {

  /**
   * @param {EnergyChunk} energyChunk - model of an energy chunk
   * @param {ModelViewTransform2} modelViewTransform
   */
  constructor( energyChunk, modelViewTransform ) {
    super();

    // control the overall visibility of this node
    const handleVisibilityChanged = visible => {
      !this.isDisposed && this.setVisible( visible );
    };
    energyChunk.visibleProperty.link( handleVisibilityChanged );

    // set up updating of transparency based on Z position
    const handleZPositionChanged = zPosition => {
      this.updateTransparency( zPosition );
    };
    energyChunk.zPositionProperty.link( handleZPositionChanged );

    // monitor the energy type and update the image if a change occurs
    const handleEnergyTypeChanged = energyType => {
      this.removeAllChildren();
      this.addChild( getEnergyChunkNode( energyType ) );

      if ( EFACQueryParameters.showHelperShapes ) {
        this.addChild( new Circle( 6, { fill: 'pink' } ) );
      }
    };
    energyChunk.energyTypeProperty.link( handleEnergyTypeChanged );

    // set this node's position when the corresponding model element moves
    const handlePositionChanged = position => {
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
   * update the transparency, which is a function of several factors
   * @private
   * @param {number} zPosition
   */
  updateTransparency( zPosition ) {
    let zFadeValue = 1;
    if ( zPosition < 0 ) {
      zFadeValue = Math.max( ( Z_DISTANCE_WHERE_FULLY_FADED + zPosition ) / Z_DISTANCE_WHERE_FULLY_FADED, 0 );
    }
    this.setOpacity( zFadeValue );
  }

  // @public
  dispose() {
    this.disposeEnergyChunkNode();
    super.dispose();
  }
}

/**
 * Helper function that creates the image for an EnergyChunkNode.
 * @param {EnergyType} energyType
 * @returns {Image}
 */
const createEnergyChunkImageNode = energyType => {
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
 * @param {EnergyType} energyType
 * @returns {Image}
 */
const getEnergyChunkNode = energyType => {

  // these need to be lazily created because the images are not decoded fast enough in the built version to be
  // available right away
  if ( !energyChunkImageNodes[ energyType ] ) {
    energyChunkImageNodes[ energyType ] = createEnergyChunkImageNode( energyType );
  }
  return energyChunkImageNodes[ energyType ];
};

// statics
EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED = Z_DISTANCE_WHERE_FULLY_FADED;

energyFormsAndChanges.register( 'EnergyChunkNode', EnergyChunkNode );
export default EnergyChunkNode;