// Copyright 2018, University of Colorado Boulder

/**
 * a scenery node that represents a fan in the view
 *
 * @author Chris Klusendorf
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var Node = require( 'SCENERY/nodes/Node' );

  // images
  var fanImages = [
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_01.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_02.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_03.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_04.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_05.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_06.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_07.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_08.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_09.png' ),
    require( 'image!ENERGY_FORMS_AND_CHANGES/fan_10.png' )
  ];
  var connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  var wireBottomRightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_right.png' );

  // constants
  var NUM_FAN_IMAGES = fanImages.length;

  /**
   * @param {Fan} fan
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function FanNode( fan, energyChunksVisibleProperty, modelViewTransform ) {
    var self = this;
    MoveFadeModelElementNode.call( this, fan, modelViewTransform );

    // add the images and the layer that will contain the energy chunks
    var wireBottomRightNode = new Image( wireBottomRightImage, { left: -110, bottom: 105 } );
    var connectorNode = new Image( connectorImage, {
      right: wireBottomRightNode.right + 9,
      bottom: wireBottomRightNode.top + 3
    } );

    this.addChild( wireBottomRightNode );

    var fanBladeRootNode = new Node();
    var fanBladeImageNodes = [];

    // fan blade image nodes
    for ( var i = 0; i < NUM_FAN_IMAGES; i++ ) {
      fanBladeImageNodes.push( new Image( fanImages[ i ], {
        left: connectorNode.right - 2,
        centerY: connectorNode.centerY,
        scale: 0.74
      } ) );
      fanBladeImageNodes[ i ].setVisible( false );
      fanBladeRootNode.addChild( fanBladeImageNodes[ i ] );
    }

    // animate blades by setting image visibility based on fan rotation angle
    var visibleFanNode = fanBladeImageNodes[ 0 ];
    fan.bladePositionProperty.link( function( angle ) {
      assert && assert( angle >= 0 && angle <= 2 * Math.PI, 'Angle out of range: ' + angle );
      var i = self.mapAngleToImageIndex( angle );
      visibleFanNode.setVisible( false );
      visibleFanNode = fanBladeImageNodes[ i ];
      visibleFanNode.setVisible( true );
    } );
    this.addChild( fanBladeRootNode );

    this.addChild( new EnergyChunkLayer( fan.energyChunkList, fan.positionProperty, modelViewTransform ) );
    this.addChild( connectorNode );
  }

  energyFormsAndChanges.register( 'FanNode', FanNode );

  return inherit( MoveFadeModelElementNode, FanNode, {

    /**
     * find the image index corresponding to this angle in radians
     * @param  {number} angle
     * @returns {number} - image index
     * @private
     */
    mapAngleToImageIndex: function( angle ) {
      var i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUM_FAN_IMAGES ) );
      assert && assert( i >= 0 && i < NUM_FAN_IMAGES );
      return i;
    }
  } );
} );