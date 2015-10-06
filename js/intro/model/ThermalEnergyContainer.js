// Copyright 2002-2015, University of Colorado Boulder

/**
 * Interface for model elements that contain energy.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * Basic constructor for ThermalEnergyContainer.
   * TODO: This constructor does nothing.  Is the interface necessary for javascript?
   *
   * @constructor
   */
  function ThermalEnergyContainer() {

  }

  return inherit( Object, ThermalEnergyContainer, {

    /**
     * Change the amount of energy contained.  This is used to both add and
     * remove energy.
     *
     * @param deltaEnergy Amount of energy change.
     */
    changeEnergy: function( deltaEnergy ) {},
    /**
     * Get the current amount of energy contained.
     *
     * @return Total amount of energy contained by this energy container, in
     * joules.  Must be 0 or more.
     */
    getEnergy: function() {},
    /**
     * Reset to the initial amount of energy.
     */
    reset: function() {},
    /**
     * Exchange energy with another energy container.  The implementation must
     * determine the amount of contact or overlap as well as the energy
     * gradient and do the exchange based on these conditions.
     *
     * @param energyContainer Energy container with with to exchange energy.
     * @param {number} dt - Amount of time for energy exchange.
     */
    exchangeEnergyWith: function( energyContainer, dt ) {},
    /**
     * Get a point that represents the 2D center in model space of the energy
     * container.
     *
     * @return Center point.
     */
    getCenterPoint: function() {},
    /**
     * Get the area that can be used to test whether one energy container is in
     * thermal contact with another, and thus able to exchange energy.
     *
     * @return Thermal contact area.
     */
    getThermalContactArea: function() {},
    /**
     * Get the temperature of the element.
     *
     * @return Temperature in degrees Kelvin.
     */
    getTemperature: function() {},
    /**
     * Get the category or type of container.  See the definition of the return
     * type for a greater understanding of what this means.
     *
     * @return Category.
     */
    getEnergyContainerCategory: function() {},
    /**
     * Get the amount of energy currently contained that is in excess of the
     * amount needed to reach the max temperature.
     *
     * @return Excess energy in joules, 0 if item is below max temperature.
     */
    getEnergyBeyondMaxTemperature: function() {}
  } );
} );
