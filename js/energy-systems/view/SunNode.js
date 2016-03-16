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
  var Color = require( 'SCENERY/util/Color' );
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  // var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );

  // Constants
  // var CONTROL_PANEL_TITLE_FONT = new PhetFont( 16, true );
  // var SHOW_EMISSION_SECTORS = false; // For debug.
  // var EMISSION_SECTOR_LINE_LENGTH = 700;

  /**
   * [SunNode description]
   *
   * @param {SunEnergySource} sun Sun model element
   * @param {Property} energyChunksVisible
   * @param {ModelViewTransform} modelViewTransform
   * @constructor
   */
  function SunNode( sun, energyChunksVisible, modelViewTransform ) {
    EFACBaseNode.call( this, sun, modelViewTransform );

    var sunRadius = modelViewTransform.modelToViewDeltaX( sun.radius );

    // TODO
    // final LightRays lightRays = new LightRays( mvt.modelToViewDelta( Sun.OFFSET_TO_CENTER_OF_SUN ), sunRadius, 1000, 40, Color.YELLOW );
    // addChild( lightRays );
    // energyChunksVisible.addObserver( new VoidFunction1 < Boolean > () {
    //   public void apply( Boolean energyChunksVisible ) {
    //     // Only show the rays then the energy chunks are not shown.
    //     lightRays.setVisible( !energyChunksVisible );
    //   }
    // } );
    // // Add the energy chunks, which reside on their own layer.
    // addChild( new EnergyChunkLayer( sun.energyChunkList, sun.getObservablePosition(), mvt ) );
    // // Add the emission sectors, if enabled.
    // if ( SHOW_EMISSION_SECTORS ) {
    //   for ( int i = 0; i < Sun.NUM_EMISSION_SECTORS; i++ ) {
    //     DoubleGeneralPath path = new DoubleGeneralPath( mvt.modelToViewDelta( Sun.OFFSET_TO_CENTER_OF_SUN ) );
    //     double angle = i * Sun.EMISSION_SECTOR_SPAN + Sun.EMISSION_SECTOR_OFFSET;
    //     path.lineToRelative( EMISSION_SECTOR_LINE_LENGTH * Math.cos( angle ), -EMISSION_SECTOR_LINE_LENGTH * Math.sin( angle ) );
    //     addChild( new PhetPPath( path.getGeneralPath() ) );
    //   }
    // }


    // Add the sun.
    var sunCenter = modelViewTransform.modelToViewDelta( sun.sunPosition );
    var sunShape = new Shape.ellipse( sunCenter.x, sunCenter.y, 2 * sunRadius, 2 * sunRadius );
    var sunPath = new Path( sunShape, {
      fill: Color.White,
      lineWidth: 1,
      stroke: Color.YELLOW
    } );

    sunPath.setTranslation( modelViewTransform.modelToViewDelta( sun.sunPosition ) );

    // PNode sunNode = new PhetPPath( new Ellipse2D.Double( -sunRadius, -sunRadius, sunRadius * 2, sunRadius * 2 ) ) {
    //   {
    //     setOffset( mvt.modelToViewDelta( Sun.OFFSET_TO_CENTER_OF_SUN ).toPoint2D() );
    //     setPaint( new RoundGradientPaint( 0, 0, Color.WHITE, new Point2D.Double( sunRadius * 0.7, sunRadius * 0.7 ), new Color( 255, 215, 0 ) ) );
    //     setStroke( new BasicStroke( 1 ) );
    //     setStrokePaint( Color.YELLOW );
    //   }
    // };
    this.addChild( sunPath );

  }

  return inherit( EFACBaseNode, SunNode );
} );
