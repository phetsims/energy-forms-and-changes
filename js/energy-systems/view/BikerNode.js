// Copyright 2016, University of Colorado Boulder

/**
 * Node representing the biker in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Biker = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Biker' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  // var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );

  /**
   * @param {Biker} biker EnergySource
   * @param {Property<boolean>} energyChunksVisible
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BikerNode( biker, energyChunksVisible, modelViewTransform ) {

    // Add args to constructor as needed
    EFACBaseNode.call( this, biker, modelViewTransform );

    var spokesImage = new EFACModelImageNode( Biker.REAR_WHEEL_SPOKES_IMAGE, modelViewTransform );
    var backLegRootNode = new Node();
    var frontLegRootNode = new Node();
    var backLegImageNodes = [];
    var frontLegImageNodes = [];

    for ( var i = 0; i < Biker.NUM_LEG_IMAGES; i++ ) {
      // Back leg image nodes
      backLegImageNodes.push( new EFACModelImageNode( Biker.BACK_LEG_IMAGES[ i ], modelViewTransform ) );
      backLegImageNodes[ i ].setVisible( false );
      backLegRootNode.addChild( backLegImageNodes[ i ] );

      // Front leg image nodes
      frontLegImageNodes.push( new EFACModelImageNode( Biker.FRONT_LEG_IMAGES[ i ], modelViewTransform ) );
      frontLegImageNodes[ i ].setVisible( false );
      frontLegRootNode.addChild( frontLegImageNodes[ i ] );
    }

    var upperBodyNormal = new EFACModelImageNode( Biker.RIDER_NORMAL_UPPER_BODY_IMAGE, modelViewTransform );
    var upperBodyTired = new EFACModelImageNode( Biker.RIDER_TIRED_UPPER_BODY_IMAGE, modelViewTransform );

    // Animate legs by setting image visibility based on crank arm angle
    var visibleBackLeg = backLegImageNodes[ 0 ];
    var visibleFrontLeg = frontLegImageNodes[ 0 ];
    biker.crankAngleProperty.link( function( angle ) {
      var i = biker.mapAngleToImageIndex( angle );
      visibleFrontLeg.setVisible( false );
      visibleBackLeg.setVisible( false );
      visibleFrontLeg = frontLegImageNodes[ i ];
      visibleBackLeg = backLegImageNodes[ i ];
      visibleFrontLeg.setVisible( true );
      visibleBackLeg.setVisible( true );
    } );

    // TODO "feed me" button

    biker.bikerHasEnergyProperty.link( function( hasEnergy ) {
      // feedMeButton.setVisible(!hasEnergy);
      upperBodyNormal.setVisible( hasEnergy );
      upperBodyTired.setVisible( !hasEnergy );
    } );

    this.addChild( spokesImage );
    this.addChild( backLegRootNode );
    this.addChild( new EFACModelImageNode( Biker.FRAME_IMAGE, modelViewTransform ) );
    this.addChild( frontLegRootNode );
    this.addChild( upperBodyNormal );
    this.addChild( upperBodyTired );

  }

  energyFormsAndChanges.register( 'BikerNode', BikerNode );

  return inherit( EFACBaseNode, BikerNode );
} );
