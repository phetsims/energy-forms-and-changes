// Copyright 2014-2016, University of Colorado Boulder

/**
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );


  // constants
  var SHOW_BOUNDS = false;

  /**
   *
   * @param {Air} air
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function AirNode( air, modelViewTransform ) {

    Node.call( this );

    if ( SHOW_BOUNDS ) {
      this.addChild( new Rectangle( modelViewTransform.modelToViewBounds( air.getThermalContactArea() ), {
        fill: 'red',
        lineWidth: 1
      } ) );
    }

    // var EnergyChunkLayer = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkLayer' );
    // this.addChild( new EnergyChunkLayer( air.energyChunkList, air.positionProperty, modelViewTransform ) );

    // Create a layer where energy chunks will be placed.
    var energyChunkLayer = new Node();
    this.addChild( energyChunkLayer );

    // Watch for energy chunks coming and going and add/remove nodes accordingly.
    air.energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      energyChunkLayer.addChild( energyChunkNode );
      air.energyChunkList.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          energyChunkLayer.removeChild( energyChunkNode );
          air.energyChunkList.removeItemRemovedListener( removalListener );
        }
      } );
    } );
  }

  energyFormsAndChanges.register( 'AirNode', AirNode );

  return inherit( Node, AirNode );
} );

