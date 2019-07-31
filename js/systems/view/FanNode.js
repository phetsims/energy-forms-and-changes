// Copyright 2018-2019, University of Colorado Boulder

/**
 * a scenery node that represents a fan in the view
 *
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Image = require( 'SCENERY/nodes/Image' );
  const MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  const Node = require( 'SCENERY/nodes/Node' );

  // images
  const fanImages = [
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
  const connectorImage = require( 'image!ENERGY_FORMS_AND_CHANGES/connector.png' );
  const wireBottomRightShortImage = require( 'image!ENERGY_FORMS_AND_CHANGES/wire_bottom_right_short.png' );

  // constants
  const NUM_FAN_IMAGES = fanImages.length;

  class FanNode extends MoveFadeModelElementNode {

    /**
     * @param {Fan} fan
     * @param {BooleanProperty} energyChunksVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( fan, energyChunksVisibleProperty, modelViewTransform ) {
      super( fan, modelViewTransform );

      // add the images and the layer that will contain the energy chunks
      const wireBottomRightNode = new Image( wireBottomRightShortImage, {
        left: -109.5,
        bottom: 105,
        scale: EFACConstants.WIRE_IMAGE_SCALE
      } );
      const connectorNode = new Image( connectorImage, {
        right: wireBottomRightNode.right + 10,
        bottom: wireBottomRightNode.top + 3
      } );

      this.addChild( wireBottomRightNode );

      const fanBladeRootNode = new Node();
      const fanBladeImageNodes = [];

      // fan blade image nodes
      for ( let i = 0; i < NUM_FAN_IMAGES; i++ ) {
        fanBladeImageNodes.push( new Image( fanImages[ i ], {
          left: connectorNode.right - 2,
          centerY: connectorNode.centerY,
          scale: 0.74
        } ) );
        fanBladeImageNodes[ i ].setVisible( false );
        fanBladeRootNode.addChild( fanBladeImageNodes[ i ] );
      }

      // animate blades by setting image visibility based on fan rotation angle
      let visibleFanNode = fanBladeImageNodes[ 0 ];
      fan.bladePositionProperty.link( angle => {
        assert && assert( angle >= 0 && angle <= 2 * Math.PI, `Angle out of range: ${angle}` );
        const i = this.mapAngleToImageIndex( angle );
        visibleFanNode.setVisible( false );
        visibleFanNode = fanBladeImageNodes[ i ];
        visibleFanNode.setVisible( true );
      } );
      this.addChild( fanBladeRootNode );

      this.addChild( new EnergyChunkLayer( fan.energyChunkList, modelViewTransform, {
        parentPositionProperty: fan.positionProperty
      } ) );
      this.addChild( connectorNode );
    }

    //REVIEW #247 function can be private, no dependencies on FanNode
    /**
     * find the image index corresponding to this angle in radians
     * @param  {number} angle
     * @returns {number} - image index
     * @private
     */
    mapAngleToImageIndex( angle ) {
      const i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUM_FAN_IMAGES ) );
      assert && assert( i >= 0 && i < NUM_FAN_IMAGES );
      return i;
    }
  }

  return energyFormsAndChanges.register( 'FanNode', FanNode );
} );