//  Copyright 2002-2014, University of Colorado Boulder

/**
 * View for the 'Energy Systems' screen of the Energy Forms And Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var ScreenView = require( 'JOIST/ScreenView' );
  var ResetAllButton = require( 'SCENERY_PHET/ResetAllButton' );

  /**
   * @param {EnergyFormsAndChangesEnergySystemsModel} energyFormsAndChangesEnergySystemsModel
   * @constructor
   */
  function EnergyFormsAndChangesEnergySystemsScreenView( energyFormsAndChangesEnergySystemsModel ) {

    ScreenView.call( this );

    // Create and add the Reset All Button in the bottom right, which resets the model
    var resetAllButton = new ResetAllButton( {
      listener: function() {
        energyFormsAndChangesEnergySystemsModel.reset();
      },
      right: this.layoutBounds.maxX - 10,
      bottom: this.layoutBounds.maxY - 10
    } );
    this.addChild( resetAllButton );
  }

  return inherit( ScreenView, EnergyFormsAndChangesEnergySystemsScreenView, {

    // Called by the animation loop. Optional, so if your view has no animation, you can omit this.
    step: function( dt ) {
      // Handle view animation here.
    }
  } );
} );