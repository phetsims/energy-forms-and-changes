// Copyright 2014-2019, University of Colorado Boulder

/**
 * Scenery node that represents a chunk of energy in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Chris Klusendorf (Phet Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Circle = require( 'SCENERY/nodes/Circle' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Node = require( 'SCENERY/nodes/Node' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const Text = require( 'SCENERY/nodes/Text' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const chemicalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_chem_blank_light.png' );
  const electricalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_electric_blank.png' );
  const hiddenEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_dashed_blank.png' );
  const lightEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_light_blank.png' );
  const mechanicalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_mech_blank.png' );
  const thermalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_therm_blank_orange.png' );

  // strings
  const energyChunkLabelString = require( 'string!ENERGY_FORMS_AND_CHANGES/energyChunkLabel' );

  // constants
  const Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters

  // convenience map that links energy types to their representing images
  const mapEnergyTypeToImage = {};
  mapEnergyTypeToImage[ EnergyType.THERMAL ] = thermalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.ELECTRICAL ] = electricalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.MECHANICAL ] = mechanicalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.LIGHT ] = lightEnergyImage;
  mapEnergyTypeToImage[ EnergyType.CHEMICAL ] = chemicalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.HIDDEN ] = hiddenEnergyImage;

  // array that holds the created energy chunk image nodes
  const energyChunkImageNodes = {};

  /**
   * Helper function that creates the image for an EnergyChunkNode.
   * @param {EnergyType} energyType
   * @returns {Image}
   */
  const createEnergyChunkImageNode = energyType => {
    const background = new Image( mapEnergyTypeToImage[ energyType ] );
    const energyText = new Text( energyChunkLabelString, { font: new PhetFont( 16 ) } );
    energyText.scale( Math.min( background.width / energyText.width, background.height / energyText.height ) * 0.95 );
    energyText.center = background.center;
    background.addChild( energyText );
    background.scale( EFACConstants.ENERGY_CHUNK_WIDTH / background.width );
    background.center = Vector2.ZERO;
    const backgroundBounds = background.bounds;
    assert && background.on( 'bounds', bounds => {
      assert( backgroundBounds === bounds, 'Energy chunk node bounds should not change: ' + bounds );
    } );
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

  class EnergyChunkNode extends Node {

    /**
     * @param {EnergyChunk} energyChunk - model of an energy chunk
     * @param {ModelViewTransform2} modelViewTransform
     * @constructor
     */
    constructor( energyChunk, modelViewTransform ) {
      super();

      // control the overall visibility of this node
      const handleVisibilityChanged = visible => {
        this.setVisible( visible );
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

  // statics
  EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED = Z_DISTANCE_WHERE_FULLY_FADED;

  return energyFormsAndChanges.register( 'EnergyChunkNode', EnergyChunkNode );
} );