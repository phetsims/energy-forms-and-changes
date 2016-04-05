// Copyright 2016, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // Modules
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  // var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  var HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  var inherit = require( 'PHET_CORE/inherit' );
  var TeaPot = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/TeaPot' );
  var Vector2 = require( 'DOT/Vector2' );
  var Bounds2 = require( 'DOT/Bounds2' );

  var BURNER_MODEL_BOUNDS = new Bounds2( -0.0375, 0, 0.0375, 0.075 ); // From Burner.getBoundingRect()
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.

  /**
   * @param {TeaPot} teaPot              EnergySource
   * @param {Property<boolean>} energyChunksVisible [description]
   * @param {ModelViewTransform2} modelViewTransform  [description]
   * @constructor
   */
  function TeaPotNode( teaPot, energyChunksVisible, modelViewTransform ) {

    EFACBaseNode.call( this, teaPot, modelViewTransform );

    var teaPotImageNode = new EFACModelImageNode( TeaPot.TEAPOT_IMAGE, modelViewTransform );

    // Node for heater-cooler bucket.
    // Front and back are added separately so support layering of energy chunks.
    var heaterCoolerBack = new HeaterCoolerBack( {
      heatCoolLevelProperty: teaPot.heatCoolAmountProperty
    } );
    var heaterCoolerFront = new HeaterCoolerFront( {
      heatCoolLevelProperty: teaPot.heatCoolAmountProperty
    } );

    // Burner stand node
    var burnerSize = modelViewTransform.modelToViewShape( BURNER_MODEL_BOUNDS );
    var burnerProjection = burnerSize.width * BURNER_EDGE_TO_HEIGHT_RATIO;
    var burnerStandNode = new BurnerStandNode( burnerSize, burnerProjection );

    burnerStandNode.centerTop = teaPotImageNode.centerBottom.plus( new Vector2( 0, -teaPotImageNode.height / 4 ) );
    heaterCoolerBack.centerTop = teaPotImageNode.centerBottom.plus( new Vector2( 0, teaPotImageNode.height / 4 ) );
    heaterCoolerFront.leftTop = heaterCoolerBack.getHeaterFrontPosition();

    this.addChild( heaterCoolerBack );
    this.addChild( heaterCoolerFront );
    this.addChild( burnerStandNode );

    this.addChild( teaPotImageNode );
  }

  return inherit( EFACBaseNode, TeaPotNode );
} );
