// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node that represents the sun, clouds, and a slider to control the level of cloudiness in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const Cloud = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Cloud' );
  const Color = require( 'SCENERY/util/Color' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  const EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Image = require( 'SCENERY/nodes/Image' );
  const LightRays = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/LightRays' );
  const Matrix3 = require( 'DOT/Matrix3' );
  const ModelViewTransform2 = require( 'PHETCOMMON/view/ModelViewTransform2' );
  const MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/MoveFadeModelElementNode' );
  const Node = require( 'SCENERY/nodes/Node' );
  const Panel = require( 'SUN/Panel' );
  const Path = require( 'SCENERY/nodes/Path' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const NumberProperty = require( 'AXON/NumberProperty' );
  const Property = require( 'AXON/Property' );
  const RadialGradient = require( 'SCENERY/util/RadialGradient' );
  const Range = require( 'DOT/Range' );
  const Shape = require( 'KITE/Shape' );
  const SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/SunEnergySource' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );
  const VSlider = require( 'SUN/VSlider' );

  // images
  const cloudImage = require( 'image!ENERGY_FORMS_AND_CHANGES/cloud.png' );

  // strings
  const cloudsString = require( 'string!ENERGY_FORMS_AND_CHANGES/clouds' );
  const lotsString = require( 'string!ENERGY_FORMS_AND_CHANGES/lots' );
  const noneString = require( 'string!ENERGY_FORMS_AND_CHANGES/none' );

  // constants
  const CONTROL_PANEL_TITLE_FONT = new PhetFont( 16 );
  const CONTROL_PANEL_TEXT_MAX_WIDTH = 50;
  const SLIDER_LABEL_FONT = new PhetFont( 12 );

  class SunNode extends MoveFadeModelElementNode {

    /**
     * @param {SunEnergySource} sun Sun model element
     * @param {Property} energyChunksVisibleProperty
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Tandem} tandem
     */
    constructor( sun, energyChunksVisibleProperty, modelViewTransform, tandem ) {
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

      // add slider panel to control cloudiness
      const slider = new VSlider(
        sun.cloudinessProportionProperty,
        new Range( 0, 1 ), {
          top: 0, left: 0,
          tandem: tandem.createTandem( 'slider' )
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

      const iconNode = new Image( cloudImage, { scale: 0.25 } );

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
        tandem: tandem.createTandem( 'cloudsPanel' )
      } ) );

      // add/remove the light-absorbing shape for the solar panel
      let currentLightAbsorbingShape = null;

      // visible absorption shape used for debugging
      let helperAbsorptionNode = null;

      Property.multilink(
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

    /**
     * inner type - a shape with observable light absorption coefficient
     * @param {Shape} shape
     * @param {number} initialAbsorptionCoefficient
     */
    constructor( shape, initialAbsorptionCoefficient ) {

      // @public {NumberProperty}
      this.absorptionCoefficientProperty = new NumberProperty( initialAbsorptionCoefficient, {
        range: new Range( 0, 1 )
      } );

      // @public (read-only) {Shape}
      this.shape = shape;
    }

    reset() {
      this.absorptionCoefficientProperty.reset();
    }
  }

  class CloudNode extends Node {

    /**
     * inner type - a cloud
     * @param cloud
     * @param modelViewTransform
     */
    constructor( cloud, modelViewTransform ) {
      super();

      const cloudNode = new Image( cloudImage );
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

  return energyFormsAndChanges.register( 'SunNode', SunNode );
} );

