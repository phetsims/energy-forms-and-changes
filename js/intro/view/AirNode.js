// Copyright 2014-2018, University of Colorado Boulder

/**
 * view representation of the air, which is basically just a parent node through which energy chunks can move
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Node = require( 'SCENERY/nodes/Node' );
  var Rectangle = require( 'SCENERY/nodes/Rectangle' );

  // constants
  var SHOW_BOUNDS = false; // useful for debugging

  /**
   * @param {Air} air - model of the air
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function AirNode( air, modelViewTransform ) {

    var self = this;
    Node.call( this );

    if ( SHOW_BOUNDS ) {
      this.addChild( new Rectangle( modelViewTransform.modelToViewBounds( air.getThermalContactArea() ), {
        fill: 'red',
        lineWidth: 1
      } ) );
    }

    // watch for energy chunks coming and going and add/remove nodes accordingly
    air.energyChunkList.addItemAddedListener( function( addedEnergyChunk ) {
      var energyChunkNode = new EnergyChunkNode( addedEnergyChunk, modelViewTransform );
      self.addChild( energyChunkNode );
      air.energyChunkList.addItemRemovedListener( function removalListener( removedEnergyChunk ) {
        if ( removedEnergyChunk === addedEnergyChunk ) {
          self.removeChild( energyChunkNode );
          air.energyChunkList.removeItemRemovedListener( removalListener );
        }
      } );
    } );
  }

  energyFormsAndChanges.register( 'AirNode', AirNode );

  return inherit( Node, AirNode );
} );

