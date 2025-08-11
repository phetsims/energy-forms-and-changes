// Copyright 2016-2025, University of Colorado Boulder

/* eslint-disable */
// @ts-nocheck

/**
 * a Scenery Node that represents the sun, clouds, and a slider to control the level of cloudiness in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import Multilink from '../../../../axon/js/Multilink.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import Property from '../../../../axon/js/Property.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Node from '../../../../scenery/js/nodes/Node.js';
import Path from '../../../../scenery/js/nodes/Path.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Color from '../../../../scenery/js/util/Color.js';
import RadialGradient from '../../../../scenery/js/util/RadialGradient.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import VSlider from '../../../../sun/js/VSlider.js';
import cloud_png from '../../../images/cloud_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EFACQueryParameters from '../../common/EFACQueryParameters.js';
import EnergyChunkLayer from '../../common/view/EnergyChunkLayer.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Cloud from '../model/Cloud.js';
import SunEnergySource from '../model/SunEnergySource.js';
import LightRays from './LightRays.js';
import MoveFadeModelElementNode from './MoveFadeModelElementNode.js';

const cloudsString = EnergyFormsAndChangesStrings.clouds;
const lotsString = EnergyFormsAndChangesStrings.lots;
const noneString = EnergyFormsAndChangesStrings.none;

// constants
const CONTROL_PANEL_TITLE_FONT = new PhetFont( 16 );
const CONTROL_PANEL_TEXT_MAX_WIDTH = 50;
const SLIDER_LABEL_FONT = new PhetFont( 12 );

class SunNode extends MoveFadeModelElementNode {

  /**
   * @param sun - Sun model element
   * @param energyChunksVisibleProperty
   * @param modelViewTransform
   * @param tandem
   */
  public constructor( sun: SunEnergySource, energyChunksVisibleProperty: Property<boolean>, modelViewTransform: ModelViewTransform2, tandem: Tandem ) {
    super( sun, modelViewTransform, tandem );

    const sunCenter = modelViewTransform.modelToViewDelta( SunEnergySource.OFFSET_TO_CENTER_OF_SUN );
    const sunRadius = modelViewTransform.modelToViewDeltaX( sun.radius );
    const lightRays = new LightRays( sunCenter, sunRadius, 1000, 40, Color.YELLOW );

    this.addChild( lightRays );

    // turn off light rays when energy chunks are visible
    energyChunksVisibleProperty.link( chunksVisible => {
      lightRays.setVisible( !chunksVisible );
    } );

    // add the sun
    const sunShape = Shape.ellipse( 0, 0, sunRadius, sunRadius );
    const sunPath = new Path( sunShape, {
      fill: new RadialGradient( 0, 0, 0, 0, 0, sunRadius )
        .addColorStop( 0, 'white' )
        .addColorStop( 0.25, 'white' )
        .addColorStop( 1, '#FFD700' ),
      lineWidth: 1,
      stroke: 'yellow'
    } );

    sunPath.setTranslation( sunCenter );

    // create a scale-only MVT since translation of the absorption shapes is done separately
    const scaleOnlyMVT = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      Vector2.ZERO,
      modelViewTransform.getMatrix().getScaleVector().x
    );

    // add clouds, initially transparent
    sun.clouds.forEach( cloud => {

      // make a light-absorbing shape from the cloud's absorption ellipse
      const cloudAbsorptionShape = cloud.getCloudAbsorptionReflectionShape();
      const translatedCloudAbsorptionShape = cloudAbsorptionShape.transformed( Matrix3.translation(
        -sun.positionProperty.value.x,
        -sun.positionProperty.value.y
      ) );
      const scaledAndTranslatedCloudAbsorptionShape = scaleOnlyMVT.modelToViewShape( translatedCloudAbsorptionShape );
      const lightAbsorbingShape = new LightAbsorbingShape( scaledAndTranslatedCloudAbsorptionShape, 0 );

      cloud.existenceStrengthProperty.link( existenceStrength => {
        lightAbsorbingShape.absorptionCoefficientProperty.set( existenceStrength / 10 );
      } );

      lightRays.addLightAbsorbingShape( lightAbsorbingShape );

      const cloudNode = new CloudNode( cloud, modelViewTransform );
      cloudNode.opacity = 0;
      this.addChild( cloudNode );

      if ( EFACQueryParameters.showHelperShapes ) {
        this.addChild( new Path( scaledAndTranslatedCloudAbsorptionShape, {
          stroke: 'red'
        } ) );
      }
    } );

    // add the energy chunks, which reside on their own layer
    this.addChild( new EnergyChunkLayer( sun.energyChunkList, modelViewTransform, {
      parentPositionProperty: sun.positionProperty
    } ) );
    this.addChild( sunPath );
    const cloudsPanelTandem = tandem.createTandem( 'cloudsPanel' );

    // add slider panel to control cloudiness
    const slider = new VSlider(
      sun.cloudinessProportionProperty,
      new Range( 0, 1 ), {
        top: 0, left: 0,
        tandem: cloudsPanelTandem.createTandem( 'slider' )
      }
    );

    const tickLabel = label => {
      return new Text( label, {
        font: SLIDER_LABEL_FONT,
        maxWidth: CONTROL_PANEL_TEXT_MAX_WIDTH
      } );
    };

    slider.addMajorTick( 0, tickLabel( noneString ) );
    slider.addMajorTick( 1, tickLabel( lotsString ) );

    const titleText = new Text( cloudsString, {
      font: CONTROL_PANEL_TITLE_FONT,
      maxWidth: CONTROL_PANEL_TEXT_MAX_WIDTH
    } );

    const iconNode = new Image( cloud_png, { scale: 0.25 } );

    const titleBox = new HBox( {
      children: [ titleText, iconNode ],
      spacing: 10
    } );

    const panelContent = new VBox( {
      children: [ titleBox, slider ],
      spacing: 10,
      resize: false
    } );

    this.addChild( new Panel( panelContent, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.CONTROL_PANEL_CORNER_RADIUS,
      centerX: 0,
      centerY: 0,
      resize: false,
      tandem: cloudsPanelTandem
    } ) );

    // add/remove the light-absorbing shape for the solar panel
    let currentLightAbsorbingShape = null;

    // visible absorption shape used for debugging
    let helperAbsorptionNode = null;

    Multilink.multilink(
      [ sun.activeProperty, sun.solarPanel.activeProperty ],
      ( sunActive, solarPanelActive ) => {

        if ( sunActive && solarPanelActive ) {
          const absorptionShape = sun.solarPanel.getAbsorptionShape();
          const translatedAbsorptionShape = absorptionShape.transformed( Matrix3.translation(
            -sun.positionProperty.value.x,
            -sun.positionProperty.value.y
          ) );
          const scaledAndTranslatedAbsorptionShape = scaleOnlyMVT.modelToViewShape( translatedAbsorptionShape );
          currentLightAbsorbingShape = new LightAbsorbingShape( scaledAndTranslatedAbsorptionShape, 1 );

          lightRays.addLightAbsorbingShape( currentLightAbsorbingShape );

          // for debug, show absorption shape outline with dotted line visible on top of SolarPanel's helper shape
          if ( EFACQueryParameters.showHelperShapes ) {
            helperAbsorptionNode = new Path( scaledAndTranslatedAbsorptionShape, {
              stroke: 'lime',
              lineDash: [ 4, 8 ]
            } );
            this.addChild( helperAbsorptionNode );
          }
        }
        else if ( currentLightAbsorbingShape !== null ) {
          lightRays.removeLightAbsorbingShape( currentLightAbsorbingShape );
          currentLightAbsorbingShape = null;

          // for debug
          if ( EFACQueryParameters.showHelperShapes && helperAbsorptionNode ) {
            this.removeChild( helperAbsorptionNode );
            helperAbsorptionNode = null;
          }
        }
      }
    );
  }
}

class LightAbsorbingShape {

  public readonly absorptionCoefficientProperty: NumberProperty;
  public readonly shape: Shape;

  /**
   * inner type - a shape with observable light absorption coefficient
   * @param shape
   * @param initialAbsorptionCoefficient
   */
  public constructor( shape: Shape, initialAbsorptionCoefficient: number ) {

    this.absorptionCoefficientProperty = new NumberProperty( initialAbsorptionCoefficient, {
      range: new Range( 0, 1 )
    } );

    this.shape = shape;
  }
}

class CloudNode extends Node {

  /**
   * inner type - a cloud
   */
  public constructor( cloud: Cloud, modelViewTransform: ModelViewTransform2 ) {
    super();

    const cloudNode = new Image( cloud_png );
    cloudNode.scale(
      modelViewTransform.modelToViewDeltaX( Cloud.WIDTH ) / cloudNode.width,
      -modelViewTransform.modelToViewDeltaY( Cloud.HEIGHT ) / cloudNode.height
    );
    this.addChild( cloudNode );

    this.center = modelViewTransform.modelToViewDelta( cloud.offsetFromParent );

    cloud.existenceStrengthProperty.link( opacity => {
      this.opacity = opacity;
    } );
  }
}

energyFormsAndChanges.register( 'SunNode', SunNode );
export default SunNode;