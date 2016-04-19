// Copyright 2014-2015, University of Colorado Boulder

/**
 * Node that represents the sun, clouds, and a slider to control the level
 * of cloudiness in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var Cloud = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Cloud' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var HSlider = require( 'SUN/HSlider' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LightRayNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/LightRayNode' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var PropertySet = require( 'AXON/PropertySet' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );
  var Text = require( 'SCENERY/nodes/Text' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var Vector2 = require( 'DOT/Vector2' );


  // Strings
  var cloudsString = require( 'string!ENERGY_FORMS_AND_CHANGES/clouds' );
  var lotsString = require( 'string!ENERGY_FORMS_AND_CHANGES/lots' );
  var noneString = require( 'string!ENERGY_FORMS_AND_CHANGES/none' );

  // Constants
  var CONTROL_PANEL_TITLE_FONT = new PhetFont( 16, true );
  var SLIDER_LABEL_FONT = new PhetFont( 12 );

  // var EMISSION_SECTOR_LINE_LENGTH = 700;

  /**
   * Shape with observable light absorption coefficient.
   * @param {Shape} shape
   * @param {Number} initialAbsorptionCoefficient
   * @constructor
   */
  function LightAbsorbingShape( shape, initialAbsorptionCoefficient ) {
    PropertySet.call( this, {
      absorptionCoefficient: initialAbsorptionCoefficient
    } );
    this.shape = shape;
  }

  energyFormsAndChanges.register( 'LightAbsorbingShape', LightAbsorbingShape );

  inherit( PropertySet, LightAbsorbingShape );

  /**
   * Rays from the sun
   * @param {Vector2} center      Center position of radial rays
   * @param {Number} innerRadius Start point
   * @param {Number} outerRadius End point
   * @param {Number} numRays     How many rays around the sun
   * @param {Color} color       Ray color
   * @constructor
   */
  function LightRays( center, innerRadius, outerRadius, numRays, color ) {
    Node.call( this );

    var lightRayNodes = [];
    var angle;
    var startPoint;
    var endPoint;
    for ( var i = 0; i < numRays; i++ ) {
      angle = ( 2 * Math.PI / numRays ) * i;
      startPoint = center.plus( new Vector2( innerRadius, 0 ).rotated( angle ) );
      endPoint = center.plus( new Vector2( outerRadius, 0 ).rotated( angle ) );
      // var transparent = 'rgba(255,255,255,0)';

      // var rayGradient = new LinearGradient( start.x, start.y, end.x, end.y )
      //   .addColorStop( 0, color )
      //   .addColorStop( 1, transparent );

      // var line = new Line( start.x, start.y, end.x, end.y, {
      //   stroke: rayGradient,
      //   linewidth: 3
      // } );

      // this.addChild( line );

      var lightRayNode = new LightRayNode( startPoint, endPoint, color );
      lightRayNodes.push( lightRayNode );
      this.addChild( lightRayNode );
    }
  }

  energyFormsAndChanges.register( 'LightRays', LightRays );

  inherit( Node, LightRays, {

    /**
     * @param {LightAbsorbingShape} lightAbsorbingShape [description]
     * @public
     */
    addLightAbsorbingShape: function( lightAbsorbingShape ) {
      this.lightRayNodes.forEach( function( lightRayNode ) {
        lightRayNode.addLightAbsorbingShape( lightAbsorbingShape );
      } );
    },

    /**
     * @param {LightAbsorbingShape} lightAbsorbingShape [description]
     * @public
     */
    removeLightAbsorbingShape: function( lightAbsorbingShape ) {
      this.lightRayNodes.forEach( function( lightRayNode ) {
        lightRayNode.removeLightAbsorbingShape( lightAbsorbingShape );
      } );
    }

  } );

  function CloudNode( cloud, modelViewTransform ) {
    Node.call( this );
    var self = this;

    this.addChild( new EFACModelImageNode( Cloud.CLOUD_IMAGE, modelViewTransform ) );

    var x = modelViewTransform.modelToViewDeltaX( cloud.offsetFromParent.x );
    var y = modelViewTransform.modelToViewDeltaY( cloud.offsetFromParent.y );
    this.center = new Vector2( x, y );

    cloud.existenceStrengthProperty.link( function( opacity ) {
      self.opacity = opacity;
    } );
  }
  inherit( Node, CloudNode );


  /**
   * @param {SunEnergySource} sun Sun model element
   * @param {Property} energyChunksVisible
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function SunNode( sun, energyChunksVisible, modelViewTransform ) {
    EFACBaseNode.call( this, sun, modelViewTransform );
    var self = this;

    var sunCenter = modelViewTransform.modelToViewDelta( SunEnergySource.OFFSET_TO_CENTER_OF_SUN );
    var sunRadius = modelViewTransform.modelToViewDeltaX( sun.radius );
    var lightRays = new LightRays( sunCenter, sunRadius, 1000, 40, Color.YELLOW );

    this.addChild( lightRays );

    // Turn off light rays when energy chunks are visible
    energyChunksVisible.link( function( chunksVisible ) {
      lightRays.setVisible( !chunksVisible );
    } );

    // Add the sun
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

    this.addChild( sunPath );

    // Add clouds, initially transparent
    sun.clouds.forEach( function( cloud ) {
      var cloudNode = new CloudNode( cloud, modelViewTransform );
      cloudNode.opacity = 0;
      self.addChild( cloudNode );
    } );

    // Add slider panel to control cloudiness
    var slider = new HSlider( sun.cloudinessProperty, {
      min: 0,
      max: 1
    }, {
      top: 0,
      left: 0
    } );

    slider.rotate( -Math.PI / 2 );

    function tickLabel( label ) {
      var labelText = new Text( label, {
        font: SLIDER_LABEL_FONT
      } );
      labelText.rotate( Math.PI / 2 );
      return labelText;
    }

    slider.addMajorTick( 0, tickLabel( noneString ) );
    slider.addMajorTick( 1, tickLabel( lotsString ) );

    var titleText = new Text( cloudsString, {
      font: CONTROL_PANEL_TITLE_FONT
    } );

    var iconNode = new Image( Cloud.CLOUD_1 );
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
      centerX: 0,
      centerY: 0,
      cornerRadius: 8,
      resize: false
    } ) );

    var absorptionShape = modelViewTransform.modelToViewShape( sun.solarPanel.getAbsorptionShape() );

    // DEBUG: Show absorption shape path
    var spPath = new Path( absorptionShape, {
      stroke: 'lime',
      lineWidth: 5
    } );

    // TODO: what is the equivalent of the Java AffineTransform class?
    // Translating by (-)sun.position does not put this in the right location.
    // Should I move the shape itself? Like this??
    // absorptionShape.bounds = absorptionShape.bounds.shifted(x,y) ?
    // Hard-coding approximate shift for now.
    spPath.translate( -240, -420 );
    this.addChild( spPath );
    var currentLightAbsorbingShape = new LightAbsorbingShape( absorptionShape, 1 );
  }

  energyFormsAndChanges.register( 'SunNode', SunNode );

  return inherit( EFACBaseNode, SunNode );
} );

