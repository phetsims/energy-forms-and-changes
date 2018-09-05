// Copyright 2018, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );

  // constants
  var VELOCITY_DIVISOR = 5.7; // empirically determined, maxes out fan speed at 10PI rads/sec

  // images
  var FAN_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/fan_icon.png' );

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function Fan( energyChunksVisibleProperty ) {

    EnergyUser.call( this, new Image( FAN_ICON ) );

    // @public (read-only) {NumberProperty}
    this.bladePositionProperty = new Property( 0 );

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private - movers and flags that control how the energy chunks move through the fan
    // this.electricalEnergyChunkMovers = [];
    // this.bladeEnergyChunkMovers = [];
    // this.radiatedEnergyChunkMovers = [];
    // this.goUpNextTime = true;
  }

  energyFormsAndChanges.register( 'Fan', Fan );

  return inherit( EnergyUser, Fan, {

    /**
     * @param {number} dt - time step, in seconds
     * @param {Energy} incomingEnergy
     * @public
     * @override
     */
    step: function( dt, incomingEnergy ) {
      // var self = this;
      if ( this.activeProperty.value ) {

        // set how fast the fan is turning
        if ( this.energyChunksVisibleProperty.get() ) {
          // handle case where fan only turns when energy chunks get to it
        }
        else {
          var angularVelocity = incomingEnergy.amount / VELOCITY_DIVISOR;
          var newAngle = ( this.bladePositionProperty.value + angularVelocity * dt ) % ( 2 * Math.PI );
          this.bladePositionProperty.set( newAngle );
        }
      }
    },

    /**
     * restore the initial state
     * @public
     */
    reset: function() {
      this.bladePositionProperty.set( 0 );
    }
  } );
} );

