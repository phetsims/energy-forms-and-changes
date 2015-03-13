// Copyright 2002-2015, University of Colorado

/**
 * Class that represents a chunk of energy in the view.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );

  // constants
  var Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters.
  var WIDTH = 24; // In screen coords, which is close to pixels.

//  private static final Map<EnergyType, Image> mapEnergyTypeToImage = new HashMap<EnergyType, Image>() {{
//    put( EnergyType.THERMAL, EnergyFormsAndChangesResources.Images.E_THERM_BLANK_ORANGE );
//    put( EnergyType.ELECTRICAL, EnergyFormsAndChangesResources.Images.E_ELECTRIC_BLANK );
//    put( EnergyType.MECHANICAL, EnergyFormsAndChangesResources.Images.E_MECH_BLANK );
//    put( EnergyType.LIGHT, EnergyFormsAndChangesResources.Images.E_LIGHT_BLANK );
//    put( EnergyType.CHEMICAL, EnergyFormsAndChangesResources.Images.E_CHEM_BLANK_LIGHT );
//    put( EnergyType.HIDDEN, EnergyFormsAndChangesResources.Images.E_DASHED_BLANK );
//  }};

  function EnergyChunkNode( energyChunk, modelViewTransform ) {

    Node.call( this );
    var energyChunkNode = this;

    // Control the overall visibility of this node.
    energyChunk.visibleProperty.link( function( visible ) {
        energyChunkNode.setVisible( visible );
      }
    );

    // Set up updating of transparency based on Z position.
    energyChunk.zPositionProperty.link( function( zPosition ) {
        energyChunkNode.updateTransparency( zPosition );
      }
    );

    // Monitor the energy type and make the image match it.
    energyChunk.energyTypeProperty.link( function( energyType ) {
        energyChunkNode.removeAllChildren();
        energyChunkNode.addChild( this.createEnergyChunkNode( energyType ) );
      }
    );

    // Set this node's position when the corresponding model element moves.
    energyChunk.positionProperty.link( function( position ) {
        energyChunkNode.setOffset( modelViewTransform.modelToView( position ) );
      }
    );
  }

  return inherit( Node, EnergyChunkNode, {

    /**
     * Update the transparency, which is a function of several factors.*
     * @private
     * @param {number} zPosition
     */
    updateTransparency: function( zPosition ) {
      var zFadeValue = 1;
      if ( zPosition < 0 ) {
        zFadeValue = Math.max( (Z_DISTANCE_WHERE_FULLY_FADED + zPosition) / Z_DISTANCE_WHERE_FULLY_FADED, 0 );
      }
      setTransparency( zFadeValue );
    },

    /**
     * *
     * @param energyType
     * @returns {Image}
     */
    createEnergyChunkNode: function( energyType ) {
      var background = new Image( mapEnergyTypeToImage.get( energyType ) );
      background.addChild( new Text( EnergyFormsAndChangesResources.Strings.ENERGY_CHUNK_LABEL, new PhetFont( 16, true ) ).withAnonymousClassBody( {
        initializer: function() {
          setScale( Math.min( background.bounds.width / this.bounds.width, background.bounds.height / this.bounds.height ) * 0.95 );
          setOffset( background.bounds.width / 2 - this.bounds.width / 2, background.bounds.height / 2 - this.bounds.height / 2 );
        }
      } ) );
      background.setScale( WIDTH / background.bounds.width );
      background.setOffset( -background.bounds.width / 2, -background.bounds.height / 2 );
      return background;
    }
  } );
} );
