// Copyright 2018, University of Colorado Boulder

/**
 * A class for the fan, which is an energy user
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( function( require ) {
  'use strict';

  // modules
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyChunkPathMover = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyChunkPathMover' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  var EnergyUser = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergyUser' );
  var Image = require( 'SCENERY/nodes/Image' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var VELOCITY_DIVISOR = 3; // empirically determined, lower number = faster fan speed

  // energy chunk path offsets
  var OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND = new Vector2( -0.02, -0.04 );
  var OFFSET_TO_FIRST_WIRE_CURVE_POINT = new Vector2( -0.01, -0.0375 );
  var OFFSET_TO_SECOND_WIRE_CURVE_POINT = new Vector2( -0.001, -0.025 );
  var OFFSET_TO_THIRD_WIRE_CURVE_POINT = new Vector2( 0, -0.0175 );
  var OFFSET_TO_BOTTOM_OF_SECOND_WIRE_BEND = new Vector2( 0, 0.011 );
  var OFFSET_TO_FOURTH_WIRE_CURVE_POINT = new Vector2( 0.0025, 0.02 );
  var OFFSET_TO_FIFTH_WIRE_CURVE_POINT = new Vector2( 0.0125, 0.031 );
  var OFFSET_TO_SIXTH_WIRE_CURVE_POINT = new Vector2( 0.02, 0.033 );
  var OFFSET_TO_FAN_MOTOR_INTERIOR = new Vector2( 0.03, 0.033 );

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
    this.electricalEnergyChunkMovers = [];
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
      var self = this;
      if ( !this.activeProperty.value ) {
        return;
      }

      // handle any incoming energy chunks
      if ( this.incomingEnergyChunks.length > 0 ) {
        this.incomingEnergyChunks.forEach( function( chunk ) {

          assert && assert(
            chunk.energyTypeProperty.value === EnergyType.ELECTRICAL,
            'Energy chunk type should be ELECTRICAL but is ' + chunk.energyTypeProperty.value
          );

          // add the energy chunk to the list of those under management
          self.energyChunkList.push( chunk );

          // add a "mover" that will move this energy chunk through the wire to the heating element
          self.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( chunk,
            self.createElectricalEnergyChunkPath( self.positionProperty.get() ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        } );

        // clear incoming chunks array
        this.incomingEnergyChunks.length = 0;
      }
      this.moveElectricalEnergyChunks( dt );

      // set how fast the fan is turning
      if ( this.energyChunksVisibleProperty.get() ) {
        // handle case where fan only turns when energy chunks get to it
      }
      else {
        var angularVelocity = incomingEnergy.amount / VELOCITY_DIVISOR;
        var newAngle = ( this.bladePositionProperty.value + angularVelocity * dt ) % ( 2 * Math.PI );
        this.bladePositionProperty.set( newAngle );
      }
    },

    /**
     * @param  {number} dt - time step, in seconds
     * @private
     */
    moveElectricalEnergyChunks: function( dt ) {
      var self = this;
      var movers = _.clone( this.electricalEnergyChunkMovers );

      movers.forEach( function( mover ) {
        mover.moveAlongPath( dt );

        if ( mover.pathFullyTraversed ) {

          // the electrical energy chunk has reached the burner, so it needs to change into thermal energy
          _.pull( self.electricalEnergyChunkMovers, mover );
          mover.energyChunk.energyTypeProperty.set( EnergyType.MECHANICAL );
        }
      } );
    },

    /**
     * @param  {Vector2} center
     * @returns {Vector2[]}
     * @private
     */
    createElectricalEnergyChunkPath: function( center ) {
      var path = [];

      path.push( center.plus( OFFSET_TO_LEFT_SIDE_OF_WIRE_BEND ) );
      path.push( center.plus( OFFSET_TO_FIRST_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SECOND_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_THIRD_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_BOTTOM_OF_SECOND_WIRE_BEND ) );
      path.push( center.plus( OFFSET_TO_FOURTH_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_FIFTH_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_SIXTH_WIRE_CURVE_POINT ) );
      path.push( center.plus( OFFSET_TO_FAN_MOTOR_INTERIOR ) );
      return path;
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

