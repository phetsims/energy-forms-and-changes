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
  var Dimension2 = require( 'DOT/Dimension2' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var RectangularPushButton = require( 'SUN/buttons/RectangularPushButton' );
  var Text = require( 'SCENERY/nodes/Text' );

  // Strings
  var feedMeString = require( 'string!ENERGY_FORMS_AND_CHANGES/feedMe' );

  /**
   * @param {Biker} biker EnergySource
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BikerNode( biker, energyChunksVisibleProperty, modelViewTransform ) {

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
      assert && assert( angle >= 0 && angle <= 2 * Math.PI, 'Angle out of range: ' + angle );
      var i = biker.mapAngleToImageIndex( angle );
      visibleFrontLeg.setVisible( false );
      visibleBackLeg.setVisible( false );
      visibleFrontLeg = frontLegImageNodes[ i ];
      visibleBackLeg = backLegImageNodes[ i ];
      visibleFrontLeg.setVisible( true );
      visibleBackLeg.setVisible( true );
    } );

    // Add button to replenish the biker's energy
    var feedMeButton = new RectangularPushButton( {
      content: new Text( feedMeString, { font: new PhetFont( 18 ), maxWidth: 100 } ),
      listener: function() {
        biker.replenishEnergyChunks();
      },
      baseColor: 'rgba(0,220,0,1)',
      centerX: upperBodyNormal.centerTop.x,
      centerY: upperBodyNormal.centerTop.y - 40
    } );
    this.addChild( feedMeButton );

    biker.bikerHasEnergyProperty.link( function( hasEnergy ) {
      feedMeButton.setVisible( !hasEnergy );
      upperBodyNormal.setVisible( hasEnergy );
      upperBodyTired.setVisible( !hasEnergy );
    } );

    // Add and observer that will turn the back wheel.
    var wheelRotationPoint = spokesImage.bounds.center;
    biker.rearWheelAngleProperty.link( function( angle ) {
      assert && assert( angle < 2 * Math.PI, 'Angle is out of bounds' );
      // Scenery doesn't use the convention in physics where a
      // positive rotation is counter-clockwise, so we have to
      // invert the angle in the following calculation.
      var compensatedAngle = ( 2 * Math.PI - spokesImage.getRotation() ) % ( 2 * Math.PI );
      var delta = angle - compensatedAngle;
      spokesImage.rotateAround( wheelRotationPoint, -delta );
    } );

    // Slider to control crank speed
    var crankSlider = new HSlider( biker.targetCrankAngularVelocityProperty, {
      min: 0,
      max: Biker.MAX_ANGULAR_VELOCITY_OF_CRANK
    }, {
      trackSize: new Dimension2( 200, 5 ),
      thumbSize: new Dimension2( 20, 40 ), // Default: ( 22, 45 )
      thumbTouchAreaXDilation: 11,
      thumbTouchAreaYDilation: 11
    } );

    this.addChild( new Panel( crankSlider, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      centerX: 0,
      centerY: 110,
      cornerRadius: 8,
      resize: false
    } ) );

    this.addChild( spokesImage );
    this.addChild( backLegRootNode );
    this.addChild( new EFACModelImageNode( Biker.FRAME_IMAGE, modelViewTransform ) );
    this.addChild( frontLegRootNode );
    this.addChild( upperBodyNormal );
    this.addChild( upperBodyTired );

    // DEBUG
    // Remove when #21 is solved
    // var Path = require( 'SCENERY/nodes/Path' );
    // var Shape = require( 'KITE/Shape' );
    // var Vector2 = require( 'DOT/Vector2' );
    // var mechPath = biker.createMechanicalEnergyChunkPath( new Vector2( -0.23, 0.15 ) );
    // var shape = new Shape();
    // for ( i = 0; i < 3; i++ ) {
    //   var p = modelViewTransform.modelToViewPosition( mechPath[ i ] );
    //   i === 0 ? shape.moveTo( p.x, p.y ) : shape.lineTo( p.x, p.y );
    // }
    // this.addChild( new Path( shape, {
    //   stroke: 'lime',
    //   lineWidth: 25
    // } ) );

    // Add the energy chunk layer.
    this.addChild( new EnergyChunkLayer( biker.energyChunkList, biker.positionProperty, modelViewTransform ) );
  }

  energyFormsAndChanges.register( 'BikerNode', BikerNode );

  return inherit( EFACBaseNode, BikerNode );
} );