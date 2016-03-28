// Copyright 2016, University of Colorado Boulder

/**
 * Node representing the biker in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // Modules
  var EFACBaseNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACBaseNode' );
  var EFACModelImageNode = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/view/EFACModelImageNode' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  // var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Biker = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Biker' );

  /**
   * @param {Biker} biker EnergySource
   * @param {Property<boolean>} energyChunksVisible
   * @param {ModelViewTransform2} modelViewTransform
   * @constructor
   */
  function BikerNode( biker, energyChunksVisible, modelViewTransform ) {

    // Add args to constructor as needed
    EFACBaseNode.call( this, biker, modelViewTransform );

    var spokesImage = new EFACModelImageNode( Biker.REAR_WHEEL_SPOKES_IMAGE, modelViewTransform );
    this.addChild( spokesImage );

  }

  energyFormsAndChanges.register( 'BikerNode', BikerNode );

  return inherit( EFACBaseNode, BikerNode );
} );
