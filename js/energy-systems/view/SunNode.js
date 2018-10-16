// Copyright 2018, University of Colorado Boulder

/**
 * a Scenery Node that represents the sun, clouds, and a slider to control the level of cloudiness in the view
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var Cloud = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Cloud' );
  var Color = require( 'SCENERY/util/Color' );
  var MoveFadeModelElementNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/MoveFadeModelElementNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRays = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRays' );
  var Matrix3 = require( 'DOT/Matrix3' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Property = require( 'AXON/Property' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );
  var VSlider = require( 'SUN/VSlider' );

  // images
  var cloudImage = require( 'image!ENERGY_FORMS_AND_CHANGES/cloud_1.png' );

  // strings
  var cloudsString = require( 'string!ENERGY_FORMS_AND_CHANGES/clouds' );
  var lotsString = require( 'string!ENERGY_FORMS_AND_CHANGES/lots' );
  var noneString = require( 'string!ENERGY_FORMS_AND_CHANGES/none' );

  // constants
  var CONTROL_PANEL_TITLE_FONT = new PhetFont( 16 );
  var SLIDER_LABEL_FONT = new PhetFont( 12 );

  /**
   * @param {SunEnergySource} sun Sun model element
   * @param {Property} energyChunksVisibleProperty
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function SunNode( sun, energyChunksVisibleProperty, modelViewTransform ) {
    MoveFadeModelElementNode.call( this, sun, modelViewTransform );
    var self = this;

    var sunCenter = modelViewTransform.modelToViewDelta( SunEnergySource.OFFSET_TO_CENTER_OF_SUN );
    var sunRadius = modelViewTransform.modelToViewDeltaX( sun.radius );
    var lightRays = new LightRays( sunCenter, sunRadius, 1000, 40, Color.YELLOW );

    this.addChild( lightRays );

    // turn off light rays when energy chunks are visible
    energyChunksVisibleProperty.link( function( chunksVisible ) {
      lightRays.setVisible( !chunksVisible );
    } );

    // add the sun
    var sunShape = Shape.ellipse( 0, 0, sunRadius, sunRadius );
    var sunPath = new Path( sunShape, {
      fill: new RadialGradient( 0, 0, 0, 0, 0, sunRadius )
        .addColorStop( 0, 'white' )
        .addColorStop( 0.25, 'white' )
        .addColorStop( 1, '#FFD700' ),
      lineWidth: 1,
      stroke: 'yellow'
    } );

    sunPath.setTranslation( sunCenter );

    // add clouds, initially transparent
    sun.clouds.forEach( function( cloud ) {
      var cloudNode = new CloudNode( cloud, modelViewTransform );

      // make a crude light-absorbing shape from the rectangular cloud boundary
      var b = cloudNode.bounds;
      var cloudShape = Shape.rect( b.minX, b.minY, b.getWidth(), b.getHeight() );
      var lightAbsorbingShape = new LightAbsorbingShape( cloudShape, 0 );

      cloud.existenceStrengthProperty.link( function( existenceStrength ) {
        lightAbsorbingShape.absorptionCoefficientProperty.set( existenceStrength / 10 );
      } );

      lightRays.addLightAbsorbingShape( lightAbsorbingShape );

      cloudNode.opacity = 0;
      self.addChild( cloudNode );
    } );

    // add slider panel to control cloudiness
    var slider = new VSlider(
      sun.cloudinessProperty,
      { min: 0, max: 1 },
      { top: 0, left: 0 }
    );

    function tickLabel( label ) {
      return new Text( label, {
        font: SLIDER_LABEL_FONT
      } );
    }

    slider.addMajorTick( 0, tickLabel( noneString ) );
    slider.addMajorTick( 1, tickLabel( lotsString ) );

    var titleText = new Text( cloudsString, {
      font: CONTROL_PANEL_TITLE_FONT
    } );

    var iconNode = new Image( cloudImage, { scale: 0.25 } );
    iconNode.setScaleMagnitude( 0.25 );

    var titleBox = new HBox( {
      children: [ titleText, iconNode ],
      spacing: 10
    } );

    var panelContent = new VBox( {
      children: [ titleBox, slider ],
      spacing: 10,
      resize: false
    } );

    this.addChild( new Panel( panelContent, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      centerX: 0,
      centerY: 0,
      cornerRadius: 8,
      resize: false
    } ) );

    // add the energy chunks, which reside on their own layer
    this.addChild( new EnergyChunkLayer( sun.energyChunkList, sun.positionProperty, modelViewTransform ) );
    this.addChild( sunPath );

    // add/remove the light-absorbing shape for the solar panel
    var currentLightAbsorbingShape = null;
    Property.multilink(
      [ sun.activeProperty, sun.solarPanel.activeProperty ],
      function( sunActive, solarPanelActive ) {

        if ( sunActive && solarPanelActive ) {
          var absorptionShape = sun.solarPanel.getAbsorptionShape();
          absorptionShape = modelViewTransform.modelToViewShape( absorptionShape );

          // This line seems consistent with the Java, but doesn't seem to work.
          // absorptionShape = absorptionShape.transformed( Matrix3.translationFromVector( modelViewTransform.modelToViewXY( 2*sun.position.x, -sun.position.y ) ) );
          //
          // Hard-coding an approx. shift until a better solution can be found.
          absorptionShape = absorptionShape.transformed( Matrix3.translation( -240, -420 ) );
          currentLightAbsorbingShape = new LightAbsorbingShape( absorptionShape, 1 );

          lightRays.addLightAbsorbingShape( currentLightAbsorbingShape );

          // TODO: Is the commented out code below still needed?
          // DEBUG: Show absorption shape outline with wide line visible behind image.
          // var path = new Path( absorptionShape, {
          //   stroke: 'lime',
          //   lineWidth: 50
          // } );
          // self.addChild( path );
        }
        else if ( currentLightAbsorbingShape !== null ) {
          lightRays.removeLightAbsorbingShape( currentLightAbsorbingShape );
          currentLightAbsorbingShape = null;

          // TODO: I (jbphet) came across the commented-out code below during initial code cleanup in mid-May 2018.  Is it needed?
          // self.removeChild(path);
        }
      }
    );
  }

  /**
   * inner type - a shape with observable light absorption coefficient
   * @param {Shape} shape
   * @param {number} initialAbsorptionCoefficient
   * @constructor
   */
  function LightAbsorbingShape( shape, initialAbsorptionCoefficient ) {
    this.absorptionCoefficientProperty = new Property( initialAbsorptionCoefficient );
    this.shape = shape;
  }

  energyFormsAndChanges.register( 'LightAbsorbingShape', LightAbsorbingShape );

  inherit( Object, LightAbsorbingShape, {
    reset: function() {
      this.absorptionCoefficientProperty.reset();
    }
  } );

  /**
   * inner type - a cloud
   * @param cloud
   * @param modelViewTransform
   * @constructor
   */
  function CloudNode( cloud, modelViewTransform ) {
    Node.call( this );
    var self = this;
    var cloudNode = new Image( cloudImage, {
      width: Cloud.CLOUD_WIDTH,
      scale: 0.5
    } );
    this.addChild( cloudNode );

    var x = modelViewTransform.modelToViewDeltaX( cloud.offsetFromParent.x );
    var y = modelViewTransform.modelToViewDeltaY( cloud.offsetFromParent.y );
    this.center = new Vector2( x, y );

    cloud.existenceStrengthProperty.link( function( opacity ) {
      self.opacity = opacity;
    } );
  }

  inherit( Node, CloudNode );

  energyFormsAndChanges.register( 'SunNode', SunNode );

  return inherit( MoveFadeModelElementNode, SunNode );
} );

