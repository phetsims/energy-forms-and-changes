// Copyright 2014-2015, University of Colorado Boulder

/**
 * Class that represents a chunk of energy in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Text = require( 'SCENERY/nodes/Text' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var thermalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_therm_blank_orange.png' );
  var electricalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_electric_blank.png' );
  var mechanicalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_mech_blank.png' );
  var lightEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_light_blank.png' );
  var chemicalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_chem_blank_light.png' );
  var hiddenEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_dashed_blank.png' );

  // strings
  var energyChunkLabelString = require( 'string!ENERGY_FORMS_AND_CHANGES/energyChunkLabel' );

  // constants
  var Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters.
  var WIDTH = 24; // In screen coords, which is close to pixels.

  // Convenience map that links energy types to their representing images.
  var mapEnergyTypeToImage = {};
  mapEnergyTypeToImage[ EnergyType.THERMAL ] = thermalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.ELECTRICAL ] = electricalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.MECHANICAL ] = mechanicalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.LIGHT ] = lightEnergyImage;
  mapEnergyTypeToImage[ EnergyType.CHEMICAL ] = chemicalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.HIDDEN ] = hiddenEnergyImage;

  /**
   * Function that returns the correct image for an EnergyChunkNode.  This is
   * function is needed in both static and private scopes and is declared here
   * so that it can be used in both scopes as necessary.
   *
   * @param {string} energyType
   * @returns {Image}
   */
  function createEnergyChunkNode( energyType ) {
    var background = new Image( mapEnergyTypeToImage[ energyType ] );
    var energyText = new Text( energyChunkLabelString, new PhetFont( 16 ) );
    energyText.scale( Math.min( background.width / energyText.width, background.height / energyText.height ) * 0.95 );
    energyText.center = background.center;
    background.addChild( energyText );
    background.scale( WIDTH / background.width );
    background.center = ( new Vector2( -background.width / 2, -background.height / 2 ) );
    return background;
  }

  /**
   * Constructor for an EnergyChunkNode.
   *
   * @param {EnergyChunk} energyChunk
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkNode( energyChunk, modelViewTransform ) {

    Node.call( this );
    var energyChunkNode = this;

    // Control the overall visibility of this node.
    energyChunk.visibleProperty.link( function( visible ) {
      energyChunkNode.setVisible( visible );
    } );

    // Set up updating of transparency based on Z position.
    energyChunk.zPositionProperty.link( function( zPosition ) {
      energyChunkNode.updateTransparency( zPosition );
    } );

    // Monitor the energy type and make the image match it.
    energyChunk.energyTypeProperty.link( function( energyType ) {
      energyChunkNode.removeAllChildren();
      energyChunkNode.addChild( energyChunkNode.createEnergyChunkNode( energyType ) );
    } );

    // Set this node's position when the corresponding model element moves.
    energyChunk.positionProperty.link( function( position ) {
      energyChunkNode.translation = modelViewTransform.modelToViewPosition( position );
    } );
  }

  energyFormsAndChanges.register( 'EnergyChunkNode', EnergyChunkNode );

  return inherit( Node, EnergyChunkNode, {

    /**
     * Update the transparency, which is a function of several factors.
     *
     * @private
     * @param {number} zPosition
     */
    updateTransparency: function( zPosition ) {
      var zFadeValue = 1;
      if ( zPosition < 0 ) {
        zFadeValue = Math.max( ( Z_DISTANCE_WHERE_FULLY_FADED + zPosition ) / Z_DISTANCE_WHERE_FULLY_FADED, 0 );
      }
      this.setOpacity( zFadeValue );
    },

    /**
     * Function that returns the correct image for this EnergyChunkNode.
     *
     * @static
     * @param {string} energyType
     * @returns {Image}
     */
    createEnergyChunkNode: function( energyType ) {
      return createEnergyChunkNode( energyType );
    }
  }, {

    /**
     * Function that returns the correct image for this EnergyChunkNode.
     * This is a static function so that an image can be generated without an
     * EnergyChunkNode instance.  This is mostly useful for button icons that
     * should not have visibility properties linked to the model.
     *
     * @static
     * @param {string} energyType
     * @returns {Image}
     */
    createEnergyChunkNode: function( energyType ) {
      return createEnergyChunkNode( energyType );
    }

  } );
} );

