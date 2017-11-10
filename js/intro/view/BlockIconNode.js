// Copyright 2014-2017, University of Colorado Boulder

/**
 * Created for the Heat Capacity Lab (HCL) prototype, clean up and document if kept.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  //modules
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Path = require( 'SCENERY/nodes/Path' );
  var Shape = require( 'KITE/Shape' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var EDGE_LENGTH = 15; // In screen coordinates, which are roughly pixels.
  var FORESHORTENING_PROPORTION = 0.35;

  /**
   *
   * @param {Property.<Color>} colorProperty
   * @constructor
   */
  function BlockIconNode( colorProperty ) {

    Node.call( this );

    var over = new Vector2( EDGE_LENGTH, 0 );
    var down = new Vector2( 0, EDGE_LENGTH );
    var back = new Vector2( EDGE_LENGTH * FORESHORTENING_PROPORTION, -EDGE_LENGTH * FORESHORTENING_PROPORTION );
    var upperLeftCorner = new Vector2( 0, 0 );

    var shape = new Shape();
    shape.moveToPoint( upperLeftCorner )
      .lineToPoint( upperLeftCorner.plus( over ) )
      .lineToPoint( upperLeftCorner.plus( over ).plus( down ) )
      .lineToPoint( upperLeftCorner.plus( down ) )
      .lineToPoint( upperLeftCorner )
      .lineToPoint( upperLeftCorner.plus( back ) )
      .lineToPoint( upperLeftCorner.plus( back ).plus( over ) )
      .lineToPoint( upperLeftCorner.plus( over ) )
      .moveToPoint( upperLeftCorner.plus( over ).plus( back ) )
      .lineToPoint( upperLeftCorner.plus( over ).plus( down ).plus( back ) )
      .lineToPoint( upperLeftCorner.plus( over ).plus( down ) )
      .lineToPoint( upperLeftCorner.plus( over ) );

    var block = new Path( shape, {
      stroke: 'black',
      lineWidth: 1,
      lineJoin: 'round'
    } );

    this.addChild( block );

    colorProperty.link( function( color ) {
      block.fill( color );
    } );
  }

  return inherit( Node, BlockIconNode );
} );
