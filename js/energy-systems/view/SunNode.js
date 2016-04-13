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
  var HSlider = require( 'SUN/HSlider' );
  var inherit = require( 'PHET_CORE/inherit' );
  var LinearGradient = require( 'SCENERY/util/LinearGradient' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Panel = require( 'SUN/Panel' );
  var Path = require( 'SCENERY/nodes/Path' );
  var PropertySet = require( 'AXON/PropertySet' );
  var RadialGradient = require( 'SCENERY/util/RadialGradient' );
  var Shape = require( 'KITE/Shape' );
  var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants
  // var CONTROL_PANEL_TITLE_FONT = new PhetFont( 16, true );
  // var SHOW_EMISSION_SECTORS = false; // For debug.
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

    for ( var i = 0; i < numRays; i++ ) {
      var angle = ( 2 * Math.PI / numRays ) * i;
      var start = center.plus( new Vector2( innerRadius, 0 ).rotated( angle ) );
      var end = center.plus( new Vector2( outerRadius, 0 ).rotated( angle ) );
      var transparent = 'rgba(255,255,255,0)';

      var line = new Shape.lineSegment( start.x, start.y, end.x, end.y );
      this.addChild( new Path( line, {
        stroke: new LinearGradient( start.x, start.y, end.x, end.y )
          .addColorStop( 0, 'yellow' )
          .addColorStop( 1, transparent ),
        lineWidth: 3
      } ) );
    }

  }

  inherit( Node, LightRays );

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

    // Add clouds
    sun.clouds.forEach( function( cloud ) {
      var cloudNode = new CloudNode( cloud, modelViewTransform );
      cloudNode.opacity = 1;
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

    this.addChild( new Panel( slider, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      centerX: 0,
      centerY: 0,
      cornerRadius: 8,
      resize: false
    } ) );


  }

  return inherit( EFACBaseNode, SunNode );
} );

