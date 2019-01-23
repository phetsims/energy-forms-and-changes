// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node that depicts a tea kettle on a burner
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Bounds2 = require( 'DOT/Bounds2' );
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  var HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // images
  var teapotImage = require( 'image!ENERGY_FORMS_AND_CHANGES/tea_kettle_large.png' );

  // constants
  var BURNER_MODEL_BOUNDS = new Bounds2( -0.037, -0.0075, 0.037, 0.0525 ); // in meters
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // multiplier empirically determined for best look
  var MAX_HEIGHT_AND_WIDTH = 200; // for tea kettle steam node
  var HEATER_COOLER_NODE_SCALE = 0.85; // empirically determined for best look

  /**
   * @param {TeaKettle} teaKettle
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function TeaKettleNode( teaKettle, energyChunksVisibleProperty, modelViewTransform ) {

    MoveFadeModelElementNode.call( this, teaKettle, modelViewTransform );

    var teaKettleImageNode = new Image( teapotImage, { right: 114, bottom: 53 } );

    // node for heater-cooler bucket - front and back are added separately to support layering of energy chunks
    var heaterCoolerBack = new HeaterCoolerBack( teaKettle.heatCoolAmountProperty, { scale: HEATER_COOLER_NODE_SCALE } );
    var heaterCoolerFront = new HeaterCoolerFront( teaKettle.heatCoolAmountProperty, {
      snapToZero: false,
      coolEnabled: false,
      scale: HEATER_COOLER_NODE_SCALE
    } );

    // burner stand node
    var burnerSize = modelViewTransform.modelToViewShape( BURNER_MODEL_BOUNDS );
    var burnerProjection = burnerSize.width * BURNER_EDGE_TO_HEIGHT_RATIO;
    var burnerStandNode = new BurnerStandNode( burnerSize, burnerProjection );

    burnerStandNode.centerTop = teaKettleImageNode.centerBottom.plus( new Vector2( 0, -teaKettleImageNode.height / 4 ) );
    heaterCoolerBack.centerX = burnerStandNode.centerX;
    heaterCoolerBack.bottom = burnerStandNode.bottom - burnerProjection / 2;
    heaterCoolerFront.leftTop = heaterCoolerBack.getHeaterFrontPosition();

    // make the tea kettle & stand transparent when the energy chunks are visible
    energyChunksVisibleProperty.link( function( chunksVisible ) {
      var opacity = chunksVisible ? 0.7 : 1;
      teaKettleImageNode.setOpacity( opacity );
      burnerStandNode.setOpacity( opacity );
    } );

    var energyChunkLayer = new EnergyChunkLayer(
      teaKettle.energyChunkList,
      modelViewTransform,
      { parentPositionProperty: teaKettle.positionProperty }
    );

    var spoutXY = new Vector2( teaKettleImageNode.bounds.maxX - 5, teaKettleImageNode.bounds.minY + 16 );
    this.steamNode = new SteamNode(
      spoutXY,
      teaKettle.energyProductionRateProperty,
      EFACConstants.MAX_ENERGY_PRODUCTION_RATE,
      teaKettle.activeProperty
    );

    this.addChild( heaterCoolerBack );
    this.addChild( energyChunkLayer );
    this.addChild( heaterCoolerFront );
    this.addChild( burnerStandNode );
    this.addChild( teaKettleImageNode );
    this.addChild( this.steamNode );
  }

  /**
   * inner type for depicting steam that emits from the tea kettle when it's hot
   * @param {Vector2} origin
   * @param {NumberProperty} energyOutputProperty
   * @param {number} maxEnergyOutput
   * @param {BooleanProperty} activeProperty
   * @constructor
   */
  function SteamNode( origin, energyOutputProperty, maxEnergyOutput, activeProperty ) {

    Node.call( this );

    this.origin = origin;
    this.energyOutputProperty = energyOutputProperty;
    this.maxEnergyOutput = maxEnergyOutput;
    this.activeProperty = activeProperty;

    // create paths from shapes
    this.stemPath = new Path( null );

    // create paths from shapes
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
     * step the steam node forward in time
     * @param  {number} dt - time step, in seconds
     * @public
     */
    //TODO: This animation should use dt so that it looks consistent across all platforms
    step: function( dt ) {
      if ( this.activeProperty.get() ) {

        var proportion = this.energyOutputProperty.get() / this.maxEnergyOutput;
        var heightAndWidth = proportion * MAX_HEIGHT_AND_WIDTH;

        var stemBaseWidth = 8; // Empirically chosen

        // add points to steam cloud outline array
        var cloudStem = new Shape();
        var cloudBody = new Shape();

        // cloud stem
        var startPoint = new Vector2( -stemBaseWidth / 2, 0 ).rotated( Math.PI / 4 );

        // opening angle of steam stream (/2)
        var stemHalfAngle = 0.5 * Math.PI / 4 * ( 1 + 0.3 * ( phet.joist.random.nextDouble() - 0.5 ) );

        var stemEdge = new Vector2( heightAndWidth / 4, -heightAndWidth / 4 );

        cloudStem.moveToPoint( startPoint );

        // point at bottom of tea kettle spout
        cloudStem.lineToPoint( new Vector2( stemBaseWidth / 2, stemBaseWidth / 2 ).rotated( -Math.PI / 4 ) );

        // points farthest from spout
        cloudStem.lineToPoint( stemEdge.rotated( stemHalfAngle ) );
        cloudStem.lineToPoint( stemEdge.rotated( -stemHalfAngle ) );
        cloudStem.lineToPoint( startPoint );

        // cloud body
        var cloudSize = heightAndWidth * 0.9; // Empirically chosen
        var cloudCenter = new Vector2( heightAndWidth - cloudSize / 2, -cloudSize / 2 );
        var nPoints = 16;
        for ( var i = 0; i < nPoints; i++ ) {
          var radiusVector = new Vector2( cloudSize / 2 * ( 1 + 0.1 * ( phet.joist.random.nextDouble() - 0.5 ) ), 0 );
          var point = cloudCenter.plus( radiusVector.rotated( i * Math.PI * 2 / nPoints ) );
          i ? cloudBody.lineToPoint( point ) : cloudBody.moveToPoint( point );
        }

        this.stemPath.setShape( cloudStem );
        this.stemPath.fill = new LinearGradient( startPoint.x, startPoint.y, stemEdge.x, stemEdge.y )
          .addColorStop( 0, new Color( 255, 255, 255, 0.7 ) )
          .addColorStop( 0.7, new Color( 255, 255, 255, 0.5 ) )
          .addColorStop( 1, new Color( 255, 255, 255, 0 ) );
        this.bodyPath.setShape( cloudBody );

        this.stemPath.setVisible( true );
        this.bodyPath.setVisible( true );

      }
      else {
        this.stemPath.setVisible( false );
        this.bodyPath.setVisible( false );
      }
    }
  } );

  energyFormsAndChanges.register( 'TeaKettleNode', TeaKettleNode );

  return inherit( MoveFadeModelElementNode, TeaKettleNode );
} );

