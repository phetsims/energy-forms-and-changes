// Copyright 2014-2015, University of Colorado Boulder

/**
 * Model for the 'Energy Systems' screen of the Energy Forms And Changes simulation.
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  // var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' ); // Comment until used
  // var Vector2 = require( 'DOT/Vector2' ); // Comment until used

  // Constants
  // var OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 ); // Comment until used

  /**
   * Main constructor for EnergySystemsModel, which contains all of the model
   * logic for the entire sim screen.
   * @constructor
   */
  function EnergySystemsModel() {

    PropertySet.call( this, {

      // Boolean property that controls whether the energy chunks are visible to the user.
      energyChunksVisible: false
    } );

  }

  return inherit( PropertySet, EnergySystemsModel );
} );
