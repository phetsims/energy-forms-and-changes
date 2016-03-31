// Copyright 2016, University of Colorado Boulder

/**
 * Node representing the water-powered generator in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Generator' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Generator} generator EnergyConverter
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function GeneratorNode( generator, modelViewTransform ) {

    EFACBaseNode.call( this, generator, modelViewTransform );

    var spokesNode = new EFACModelImageNode( Generator.SHORT_SPOKES_IMAGE, modelViewTransform );
    var paddlesNode = new EFACModelImageNode( Generator.WHEEL_PADDLES_IMAGE, modelViewTransform );

    this.addChild( new EFACModelImageNode( Generator.WIRE_CURVED_IMAGE, modelViewTransform ) );
    // this.addChild( new EnergyChunkLayer( generator.electricalEnergyChunks, generator.getObservablePosition(), modelViewTransform ) );
    this.addChild( new EFACModelImageNode( Generator.HOUSING_IMAGE, modelViewTransform ) );
    this.addChild( new EFACModelImageNode( Generator.CONNECTOR_IMAGE, modelViewTransform ) );
    this.addChild( spokesNode );
    this.addChild( paddlesNode );
    this.addChild( new EFACModelImageNode( Generator.WHEEL_HUB_IMAGE, modelViewTransform ) );
    // this.addChild( new EnergyChunkLayer( generator.hiddenEnergyChunks, generator.getObservablePosition(), modelViewTransform ) );
    // this.addChild( new EnergyChunkLayer( generator.energyChunkList, generator.getObservablePosition(), modelViewTransform ) );

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

  return inherit( EFACBaseNode, GeneratorNode );
} );
