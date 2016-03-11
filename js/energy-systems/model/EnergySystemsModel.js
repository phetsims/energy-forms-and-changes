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
  var Vector2 = require( 'DOT/Vector2' );
  var EnergySystemElementCarousel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElementCarousel' );

  // Constants
  var OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 );

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

    // Carousels that control the positions of the energy sources, converters,
    // and users.
    var energySourcesCarousel = new EnergySystemElementCarousel( new Vector2( -0.15, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );
    var energyConvertersCarousel = new EnergySystemElementCarousel( new Vector2( -0.025, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );
    var energyUsersCarousel = new EnergySystemElementCarousel( new Vector2( 0.09, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );


    var carousels = [
      energySourcesCarousel, energyConvertersCarousel, energyUsersCarousel
    ];

    // Just to pass lint
    console.log( carousels );

  }

  return inherit( PropertySet, EnergySystemsModel );
} );
