// Copyright 2016-2018, University of Colorado Boulder

/**
 * Node representing the water-powered generator in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  // var Circle = require( 'SCENERY/nodes/Circle' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Generator' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Generator} generator EnergyConverter
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GeneratorNode( generator, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, generator, modelViewTransform );

    var spokesNode = new EFACModelImageNode( Generator.SHORT_SPOKES_IMAGE, modelViewTransform );
    var paddlesNode = new EFACModelImageNode( Generator.WHEEL_PADDLES_IMAGE, modelViewTransform );

    this.addChild( new EFACModelImageNode( Generator.WIRE_CURVED_IMAGE, modelViewTransform ) );
    this.addChild( new EnergyChunkLayer( generator.electricalEnergyChunks, generator.positionProperty, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( Generator.HOUSING_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( Generator.CONNECTOR_IMAGE, modelViewTransform ) );
    this.addChild( spokesNode );
    this.addChild( paddlesNode );
    this.addChild( new EFACModelImageNode( Generator.WHEEL_HUB_IMAGE, modelViewTransform ) );
    this.addChild( new EnergyChunkLayer( generator.hiddenEnergyChunks, generator.positionProperty, modelViewTransform ) );
    this.addChild( new EnergyChunkLayer( generator.energyChunkList, generator.positionProperty, modelViewTransform ) );

    // DEBUG - Remove later
    // var self = this;
    // var mechPath = generator.createMechanicalEnergyChunkPath( Vector2.ZERO );
    // var elecPath = generator.createElectricalEnergyChunkPath( Vector2.ZERO );
    // var hiddenPath = generator.createHiddenEnergyChunkPath( Vector2.ZERO );
    // console.log(elecPath);
    // console.log(hiddenPath);
    // mechPath.forEach( function( pt ) {
    //   var c = new Circle( 10, {
    //     fill: 'red',
    //     centerX: modelViewTransform.modelToViewDeltaX( pt.x ),
    //     centerY: modelViewTransform.modelToViewDeltaY( pt.y )
    //   });
    //   self.addChild(c);
    // } );
    // elecPath.forEach( function( pt ) {
    //   var c = new Circle( 10, {
    //     fill: 'blue',
    //     centerX: modelViewTransform.modelToViewDeltaX( pt.x ),
    //     centerY: modelViewTransform.modelToViewDeltaY( pt.y )
    //   });
    //   self.addChild(c);
    // } );
    // hiddenPath.forEach( function( pt ) {
    //   var c = new Circle( 10, {
    //     fill: 'green',
    //     centerX: modelViewTransform.modelToViewDeltaX( pt.x ),
    //     centerY: modelViewTransform.modelToViewDeltaY( pt.y )
    //   });
    //   self.addChild(c);
    // } );

    // Update the rotation of the wheel image based on model value.
    var wheelRotationPoint = new Vector2( paddlesNode.center.x, paddlesNode.center.y );
    generator.wheelRotationalAngleProperty.link( function( angle ) {
      var delta = -angle - paddlesNode.getRotation();
      paddlesNode.rotateAround( wheelRotationPoint, delta );
      spokesNode.rotateAround( wheelRotationPoint, delta );
    } );

    // Hide the paddles and show the spokes when in direct coupling mode.
    generator.directCouplingModeProperty.link( function( directCouplingMode ) {
      paddlesNode.setVisible( !directCouplingMode );
      spokesNode.setVisible( directCouplingMode );
    } );
  }

  energyFormsAndChanges.register( 'GeneratorNode', GeneratorNode );

  return inherit( MoveFadeModelElementNode, GeneratorNode );
} );

