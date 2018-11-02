// Copyright 2016-2018, University of Colorado Boulder

/**
 * a Scenery Node representing a belt that connects two circular items, like a fan belt in an automobile
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Path = require( 'SCENERY/nodes/Path' );

  /**
   * @param {Belt} belt
   * @param {ModelViewTransform2} modelViewTransform
   * @param {Object} [options]
   */
  function BeltNode( belt, modelViewTransform, options ) {

    options = _.extend( {
      stroke: 'black',
      lineWidth: 4
    }, options );

    Path.call( this, modelViewTransform.modelToViewShape( belt.beltShape ), options );

    // control visibility of the belt
    var self = this;
    belt.isVisibleProperty.link( function( isVisible ) {
      self.setVisible( isVisible );
    } );
  }

  energyFormsAndChanges.register( 'BeltNode', BeltNode );

  return inherit( Path, BeltNode );
} );
