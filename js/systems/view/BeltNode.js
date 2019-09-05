// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node representing a belt that connects two circular items, like a fan belt in an automobile
 *
 * @author John Blanco
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Path = require( 'SCENERY/nodes/Path' );
  const Tandem = require( 'TANDEM/Tandem' );

  class BeltNode extends Path {

    /**
     * @param {Belt} belt
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( belt, modelViewTransform, options ) {

      options = _.extend( {
        stroke: 'black',
        lineWidth: 4,

        // phet-io
        tandem: Tandem.required
      }, options );

      super( modelViewTransform.modelToViewShape( belt.beltShape ), options );

      // control visibility of the belt
      belt.isVisibleProperty.link( isVisible => {
        this.setVisible( isVisible );
      } );
    }
  }

  return energyFormsAndChanges.register( 'BeltNode', BeltNode );
} );
