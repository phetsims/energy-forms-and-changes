// Copyright 2016-2018, University of Colorado Boulder

define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var Color = require( 'SCENERY/util/Color' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  var HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var TeaKettle = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/TeaKettle' );
  var Vector2 = require( 'DOT/Vector2' );

  var BURNER_MODEL_BOUNDS = new Bounds2( -0.0375, 0, 0.0375, 0.075 ); // From Burner.getBoundingRect()
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.

  var MAX_HEIGHT_AND_WIDTH = 200; // For tea kettle steam node

  /**
   * @param {TeaKettle} teaKettle
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function TeaKettleNode( teaKettle, energyChunksVisibleProperty, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, teaKettle, modelViewTransform );

    var teaKettleImageNode = new EFACModelImageNode( TeaKettle.TEAPOT_IMAGE, modelViewTransform );

    // Node for heater-cooler bucket.
    // Front and back are added separately so support layering of energy chunks.
    var heaterCoolerBack = new HeaterCoolerBack( {
      heatCoolAmountProperty: teaKettle.heatCoolAmountProperty
    } );
    var heaterCoolerFront = new HeaterCoolerFront( {
      heatCoolAmountProperty: teaKettle.heatCoolAmountProperty
    } );

    // Burner stand node
    var burnerSize = modelViewTransform.modelToViewShape( BURNER_MODEL_BOUNDS );
    var burnerProjection = burnerSize.width * BURNER_EDGE_TO_HEIGHT_RATIO;
    var burnerStandNode = new BurnerStandNode( burnerSize, burnerProjection );

    burnerStandNode.centerTop = teaKettleImageNode.centerBottom.plus( new Vector2( 0, -teaKettleImageNode.height / 4 ) );
    heaterCoolerBack.centerTop = teaKettleImageNode.centerBottom.plus( new Vector2( 0, teaKettleImageNode.height / 4 ) );
    heaterCoolerFront.leftTop = heaterCoolerBack.getHeaterFrontPosition();

    // Make the tea kettle & stand transparent when the energy chunks are visible.
    energyChunksVisibleProperty.link( function( chunksVisible ) {
      var opacity = chunksVisible ? 0.7 : 1;
      teaKettleImageNode.setOpacity( opacity );
      burnerStandNode.setOpacity( opacity );
    } );

    var energyChunkLayer = new EnergyChunkLayer( teaKettle.energyChunkList, teaKettle.positionProperty, modelViewTransform );

    var spoutXY = new Vector2( teaKettleImageNode.bounds.maxX - 5, teaKettleImageNode.bounds.minY + 16 );
    this.steamNode = new SteamNode( spoutXY,
      teaKettle.energyProductionRateProperty,
      EFACConstants.MAX_ENERGY_PRODUCTION_RATE,
      teaKettle.activeProperty );

    this.addChild( heaterCoolerBack );
    this.addChild( heaterCoolerFront );
    this.addChild( burnerStandNode );
    this.addChild( energyChunkLayer );
    this.addChild( teaKettleImageNode );
    this.addChild( this.steamNode );
  }

  function SteamNode( origin, energyOutputProperty, maxEnergyOutput, activeProperty ) {

    Node.call( this );

    this.origin = origin;
    this.energyOutputProperty = energyOutputProperty;
    this.maxEnergyOutput = maxEnergyOutput;
    this.activeProperty = activeProperty;

    // Create paths from shapes
    this.stemPath = new Path( null, {
      fill: Color.WHITE,
      lineWidth: 1,
      stroke: Color.WHITE,
      opacity: 0.5
    } );


    // Create paths from shapes
    this.bodyPath = new Path( null, {
      fill: Color.WHITE,
      lineWidth: 1,
      stroke: Color.WHITE,
      opacity: 0.5
    } );

    this.stemPath.setTranslation( this.origin );
    this.bodyPath.setTranslation( this.origin );

    this.addChild( this.stemPath );
    this.addChild( this.bodyPath );
  }

  inherit( Node, SteamNode, {

    /**
     * Step function for steam.
     * step() for view components is not typical for this simulation, but this
     * is most consistent with the original Java implementation.
     *
     * @param  {number} dt - timestep
     * @public
     */
    step: function( dt ) {
      if ( this.activeProperty.get() ) {

        var proportion = this.energyOutputProperty.get() / this.maxEnergyOutput;
        var heightAndWidth = proportion * MAX_HEIGHT_AND_WIDTH;

        var stemBaseWidth = 8; // Empirically chosen

        // Add points to steam cloud outline array
        var cloudStem = new Shape();
        var cloudBody = new Shape();

        // Cloud stem
        var startPoint = new Vector2( -stemBaseWidth / 2, 0 ).rotated( Math.PI / 4 );

        // Opening angle of steam stream (/2)
        var stemHalfAngle = 0.5 * Math.PI / 4 * (1 + 0.3 * (phet.joist.random.nextDouble() - 0.5));

        var stemEdge = new Vector2( heightAndWidth / 2, -heightAndWidth / 2 );

        cloudStem.moveToPoint( startPoint );

        // Point at bottom of tea kettle spout
        cloudStem.lineToPoint( new Vector2( stemBaseWidth / 2, stemBaseWidth / 2 ).rotated( -Math.PI / 4 ) );

        // Points furthest from spout
        cloudStem.lineToPoint( stemEdge.rotated( stemHalfAngle ) );
        cloudStem.lineToPoint( stemEdge.rotated( -stemHalfAngle ) );

        cloudStem.lineToPoint( startPoint );

        // Cloud body
        var cloudSize = heightAndWidth * 0.9; // Empirically chosen
        var cloudCenter = new Vector2( heightAndWidth - cloudSize / 2, -cloudSize / 2 );
        var nPoints = 16;
        for ( var i = 0; i < nPoints; i++ ) {
          var radiusVector = new Vector2( cloudSize / 2 * (1 + 0.1 * (phet.joist.random.nextDouble() - 0.5)), 0 );
          var point = cloudCenter.plus( radiusVector.rotated( i * Math.PI * 2 / nPoints ) );
          i ? cloudBody.lineToPoint( point ) : cloudBody.moveToPoint( point );
        }

        this.stemPath.setShape( cloudStem );
        this.bodyPath.setShape( cloudBody );

        this.stemPath.setVisible( true );
        this.bodyPath.setVisible( true );

      } else {
        this.stemPath.setVisible( false );
        this.bodyPath.setVisible( false );
      }
    }
  } );

  energyFormsAndChanges.register( 'TeaKettleNode', TeaKettleNode );

  return inherit( MoveFadeModelElementNode, TeaKettleNode );
} );
