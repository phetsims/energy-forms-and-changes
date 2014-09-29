//  Copyright 2002-2014, University of Colorado Boulder

/**
 *
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * Main constructor for EnergyFormsAndChangesModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function EnergyFormsAndChangesModel() {

    PropertySet.call( this, {} );
  }

  return inherit( PropertySet, EnergyFormsAndChangesModel, {

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    step: function( dt ) {
      // Handle model animation here.
    }
  } );
} );