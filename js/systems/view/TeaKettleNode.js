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
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HeaterCoolerBack = require( 'SCENERY_PHET/HeaterCoolerBack' );
  const HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );
  const Image = require( 'SCENERY/nodes/Image' );
  const MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const TeaKettleSteamCanvasNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/TeaKettleSteamCanvasNode' );
  const Vector2 = require( 'DOT/Vector2' );

  // images
  const teapotImage = require( 'image!ENERGY_FORMS_AND_CHANGES/tea_kettle_large.png' );

  // constants
  const BURNER_MODEL_BOUNDS = new Bounds2( -0.037, -0.0075, 0.037, 0.0525 ); // in meters
  const BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // multiplier empirically determined for best look
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

      const energyChunkLayer = new EnergyChunkLayer(
        teaKettle.energyChunkList,
        modelViewTransform,
        { parentPositionProperty: teaKettle.positionProperty }
      );

      // create steam node
      const spoutExitPosition = new Vector2( teaKettleImageNode.bounds.maxX - 4.5, teaKettleImageNode.bounds.minY + 16 );
      this.steamCanvasNode = new TeaKettleSteamCanvasNode(
        spoutExitPosition,
        teaKettle.energyProductionRateProperty,
        EFACConstants.MAX_ENERGY_PRODUCTION_RATE, {
          canvasBounds: new Bounds2(
            -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2,
            -EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY,
            EFACConstants.SCREEN_LAYOUT_BOUNDS.maxX / 2,
            EFACConstants.SCREEN_LAYOUT_BOUNDS.maxY
          )
        } );

      this.addChild( heaterCoolerBack );
      this.addChild( energyChunkLayer );
      this.addChild( heaterCoolerFront );
      this.addChild( burnerStandNode );
      this.addChild( this.steamCanvasNode );
      this.addChild( teaKettleImageNode );

      // make the tea kettle & stand transparent when the energy chunks are visible
      energyChunksVisibleProperty.link( chunksVisible => {
        if ( this.teaKettle.activeProperty.get() ) {
          const opacity = chunksVisible ? 0.7 : 1;
          teaKettleImageNode.setOpacity( opacity );
          burnerStandNode.setOpacity( opacity );
          this.steamCanvasNode.setOpacity( opacity );
        }
      } );

      // reset the heater slider when the tea kettle is deactivated
      teaKettle.activeProperty.link( active => {
        if ( !active ) {
          this.heaterSettingProperty.reset();
        }
      } );
    }

    /**
     * step function for the steam
     * @param {number} dt
     * @public
     */
    step( dt ) {
      this.steamCanvasNode.step( dt );
    }
  }

  return energyFormsAndChanges.register( 'TeaKettleNode', TeaKettleNode );
} );

