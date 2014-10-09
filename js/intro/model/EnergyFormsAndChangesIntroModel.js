//  Copyright 2002-2014, University of Colorado Boulder

/**
 *  Model for the 'Intro' screen of the Energy Forms And Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );

  /**
   * Main constructor for EnergyFormsAndChangesIntroModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function EnergyFormsAndChangesIntroModel() {

    PropertySet.call( this, {
      positionY: 100
    } );

  }

  return inherit( PropertySet, EnergyFormsAndChangesIntroModel, {

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    step: function( dt ) {
      // Handle model animation here.
      this.positionY = this.positionY - 10 * dt;

    }
  } );
} );