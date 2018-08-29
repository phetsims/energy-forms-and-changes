// Copyright 2014-2018, University of Colorado Boulder

/**
 * Scenery node that represents a chunk of energy in the view.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Chris Klusendorf (Phet Interactive Simulations)
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
  var chemicalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_chem_blank_light.png' );
  var electricalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_electric_blank.png' );
  var hiddenEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_dashed_blank.png' );
  var lightEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_light_blank.png' );
  var mechanicalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_mech_blank.png' );
  var thermalEnergyImage = require( 'image!ENERGY_FORMS_AND_CHANGES/E_therm_blank_orange.png' );

  // strings
  var energyChunkLabelString = require( 'string!ENERGY_FORMS_AND_CHANGES/energyChunkLabel' );

  // constants
  var Z_DISTANCE_WHERE_FULLY_FADED = 0.1; // In meters
  var WIDTH = 24; // in screen coords, which are close to pixels

  // convenience array that collects all energy types
  var energyTypes = [
    EnergyType.THERMAL,
    EnergyType.ELECTRICAL,
    EnergyType.MECHANICAL,
    EnergyType.LIGHT,
    EnergyType.CHEMICAL,
    EnergyType.HIDDEN
  ];

  // convenience map that links energy types to their representing images
  var mapEnergyTypeToImage = {};
  mapEnergyTypeToImage[ EnergyType.THERMAL ] = thermalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.ELECTRICAL ] = electricalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.MECHANICAL ] = mechanicalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.LIGHT ] = lightEnergyImage;
  mapEnergyTypeToImage[ EnergyType.CHEMICAL ] = chemicalEnergyImage;
  mapEnergyTypeToImage[ EnergyType.HIDDEN ] = hiddenEnergyImage;

  // array that holds the created energy chunk image nodes
  var energyChunkImageNodes = {};

  // loop over each type of energy and create the image node chunk for that type
  energyTypes.forEach( function( energyType ) {
    var background = new Image( mapEnergyTypeToImage[ energyType ] );
    var energyText = new Text( energyChunkLabelString, { font: new PhetFont( 16 ) } );
    energyText.scale( Math.min( background.width / energyText.width, background.height / energyText.height ) * 0.95 );
    energyText.center = background.center;
    background.addChild( energyText );
    background.scale( WIDTH / background.width );
    background.center = ( new Vector2( -background.width / 2, -background.height / 2 ) );
    var backgroundBounds = background.bounds;
    assert && background.on( 'bounds', function( bounds ) {
      assert( backgroundBounds === bounds, 'Energy chunk node bounds should not change: ' + bounds );
    } );
    energyChunkImageNodes[ energyType ] = background;
  } );

  /**
   * Helper function that returns the correct image for an EnergyChunkNode.
   * @param {EnergyType} energyType
   * @returns {Image}
   */
  function getEnergyChunkNode( energyType ) {
    return energyChunkImageNodes[ energyType ];
  }

  /**
   * @param {EnergyChunk} energyChunk - model of an energy chunk
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function EnergyChunkNode( energyChunk, modelViewTransform ) {

    Node.call( this );
    var self = this;

    // control the overall visibility of this node
    function handleVisibilityChanged( visible ) {
      self.setVisible( visible );
    }

    energyChunk.visibleProperty.link( handleVisibilityChanged );

    // set up updating of transparency based on Z position
    function handleZPositionChanged( zPosition ) {
      self.updateTransparency( zPosition );
    }

    energyChunk.zPositionProperty.link( handleZPositionChanged );

    // monitor the energy type and update the image if a change occurs
    function handleEnergyTypeChanged( energyType ) {
      self.removeAllChildren();
      self.addChild( getEnergyChunkNode( energyType ) );
    }

    energyChunk.energyTypeProperty.link( handleEnergyTypeChanged );

    // set this node's position when the corresponding model element moves
    function handlePositionChanged( position ) {
      assert && assert( !_.isNaN( position.x ), 'position.x = ' + position.x );
      assert && assert( !_.isNaN( position.y ), 'position.y = ' + position.y );
      self.translation = modelViewTransform.modelToViewPosition( position );
    }

    energyChunk.positionProperty.link( handlePositionChanged );

    this.disposeEnergyChunkNode = function() {
      energyChunk.visibleProperty.unlink( handleVisibilityChanged );
      energyChunk.zPositionProperty.unlink( handleZPositionChanged );
      energyChunk.energyTypeProperty.unlink( handleEnergyTypeChanged );
      energyChunk.positionProperty.unlink( handlePositionChanged );
    };
  }

  energyFormsAndChanges.register( 'EnergyChunkNode', EnergyChunkNode );

  return inherit( Node, EnergyChunkNode, {

    /**
     * update the transparency, which is a function of several factors
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

    // @public
    dispose: function() {
      this.disposeEnergyChunkNode();
      Node.prototype.dispose.call( this );
    }
  }, {

    // statics
    WIDTH: WIDTH
  } );
} );