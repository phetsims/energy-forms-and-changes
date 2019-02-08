// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node that depicts a tea kettle on a burner
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const Bounds2 = require( 'DOT/Bounds2' );
  const BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  const Color = require( 'SCENERY/util/Color' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  const HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LinearGradient = require( 'SCENERY/util/LinearGradient' );
  const MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Shape = require( 'KITE/Shape' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const teapotImage = require( 'image!ENERGY_FORMS_AND_CHANGES/tea_kettle_large.png' );

  // constants
  const BURNER_MODEL_BOUNDS = new Bounds2( -0.037, -0.0075, 0.037, 0.0525 ); // in meters
  const BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // multiplier empirically determined for best look
  const MAX_HEIGHT_AND_WIDTH = 200; // for tea kettle steam node
  const HEATER_COOLER_NODE_SCALE = 0.85; // empirically determined for best look

  class TeaKettleNode extends MoveFadeModelElementNode {

    /**
     * @param {TeaKettle} teaKettle
     * @param {Property.<boolean>} energyChunksVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     */
    constructor( teaKettle, energyChunksVisibleProperty, modelViewTransform ) {
      super( teaKettle, modelViewTransform );

      const teaKettleImageNode = new Image( teapotImage, { right: 114, bottom: 53 } );

      // create a mapping between the slider position and the steam proportion, which prevents very small values
      this.heaterSettingProperty = new NumberProperty( 0 );
      this.heaterSettingProperty.link( setting => {
        const mappedSetting = setting === 0 ? 0 : 0.25 + ( setting * 0.75 );
        assert && assert( mappedSetting >= 0 && mappedSetting <= 1 );
        teaKettle.heatCoolAmountProperty.set( mappedSetting );
      } );

      // node for heater-cooler bucket - front and back are added separately to support layering of energy chunks
      const heaterCoolerBack = new HeaterCoolerBack( this.heaterSettingProperty, { scale: HEATER_COOLER_NODE_SCALE } );
      const heaterCoolerFront = new HeaterCoolerFront( this.heaterSettingProperty, {
        snapToZero: false,
        coolEnabled: false,
        scale: HEATER_COOLER_NODE_SCALE
      } );

      // burner stand node
      const burnerSize = modelViewTransform.modelToViewShape( BURNER_MODEL_BOUNDS );
      const burnerProjection = burnerSize.width * BURNER_EDGE_TO_HEIGHT_RATIO;
      const burnerStandNode = new BurnerStandNode( burnerSize, burnerProjection );

      burnerStandNode.centerTop = teaKettleImageNode.centerBottom.plus( new Vector2( 0, -teaKettleImageNode.height / 4 ) );
      heaterCoolerBack.centerX = burnerStandNode.centerX;
      heaterCoolerBack.bottom = burnerStandNode.bottom - burnerProjection / 2;
      heaterCoolerFront.leftTop = heaterCoolerBack.getHeaterFrontPosition();

      // make the tea kettle & stand transparent when the energy chunks are visible
      energyChunksVisibleProperty.link( chunksVisible => {
        const opacity = chunksVisible ? 0.7 : 1;
        teaKettleImageNode.setOpacity( opacity );
        burnerStandNode.setOpacity( opacity );
      } );

      const energyChunkLayer = new EnergyChunkLayer(
        teaKettle.energyChunkList,
        modelViewTransform,
        { parentPositionProperty: teaKettle.positionProperty }
      );

      const spoutXY = new Vector2( teaKettleImageNode.bounds.maxX - 5, teaKettleImageNode.bounds.minY + 16 );
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

      // reset the heater slider when the tea kettle is deactivated
      teaKettle.activeProperty.link( active => {
        if ( !active ) {
          this.heaterSettingProperty.reset();
        }
      } );
    }
  }

  class SteamNode extends Node {

    /**
     * inner type for depicting steam that emits from the tea kettle when it's hot
     * @param {Vector2} origin
     * @param {NumberProperty} energyOutputProperty
     * @param {number} maxEnergyOutput
     * @param {BooleanProperty} activeProperty
     * @constructor
     */
    constructor( origin, energyOutputProperty, maxEnergyOutput, activeProperty ) {
      super();

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

    /**
     * step the steam node forward in time
     * @param  {number} dt - time step, in seconds
     * @public
     */
    //TODO: This animation should use dt so that it looks consistent across all platforms
    step( dt ) {
      if ( this.activeProperty.get() ) {

        const proportion = this.energyOutputProperty.get() / this.maxEnergyOutput;
        const heightAndWidth = proportion * MAX_HEIGHT_AND_WIDTH;

        const stemBaseWidth = 8; // Empirically chosen

        // add points to steam cloud outline array
        const cloudStem = new Shape();
        const cloudBody = new Shape();

        // cloud stem
        const startPoint = new Vector2( -stemBaseWidth / 2, 0 ).rotated( Math.PI / 4 );

        // opening angle of steam stream (/2)
        const stemHalfAngle = 0.5 * Math.PI / 4 * ( 1 + 0.3 * ( phet.joist.random.nextDouble() - 0.5 ) );

        const stemEdge = new Vector2( heightAndWidth / 4, -heightAndWidth / 4 );

        cloudStem.moveToPoint( startPoint );

        // point at bottom of tea kettle spout
        cloudStem.lineToPoint( new Vector2( stemBaseWidth / 2, stemBaseWidth / 2 ).rotated( -Math.PI / 4 ) );

        // points farthest from spout
        cloudStem.lineToPoint( stemEdge.rotated( stemHalfAngle ) );
        cloudStem.lineToPoint( stemEdge.rotated( -stemHalfAngle ) );
        cloudStem.lineToPoint( startPoint );

        // cloud body
        const cloudSize = heightAndWidth * 0.9; // Empirically chosen
        const cloudCenter = new Vector2( heightAndWidth - cloudSize / 2, -cloudSize / 2 );
        const nPoints = 16;
        for ( let i = 0; i < nPoints; i++ ) {
          const radiusVector = new Vector2( cloudSize / 2 * ( 1 + 0.1 * ( phet.joist.random.nextDouble() - 0.5 ) ), 0 );
          const point = cloudCenter.plus( radiusVector.rotated( i * Math.PI * 2 / nPoints ) );
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
  }

  return energyFormsAndChanges.register( 'TeaKettleNode', TeaKettleNode );
} );

