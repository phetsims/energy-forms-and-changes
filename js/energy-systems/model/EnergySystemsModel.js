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

  // Modules
  var BeakerHeater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/BeakerHeater' );
  var Biker = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Biker' );
  var Belt = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Belt' );
  var EnergySystemElementCarousel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElementCarousel' );
  var FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FaucetAndWater' );
  var FluorescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FluorescentBulb' );
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Generator' );
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  var SolarPanel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SolarPanel' );
  var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );
  var IncandescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/IncandescentBulb' );
  var TeaPot = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/TeaPot' );
  var Vector2 = require( 'DOT/Vector2' );

  // Constants

  // For the images (sun, teapot, biker, ...) scrolling like a one-armed bandit,
  // this is the offset between them (purely vertical).
  var OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 );

  /**
   * Main constructor for EnergySystemsModel, which contains all of the model
   * logic for the entire sim screen.
   * @constructor
   */
  function EnergySystemsModel() {

    PropertySet.call( this, {

      // Boolean property that controls whether the energy chunks are visible to the user.
      energyChunksVisible: false,

      steamPowerableElementInPlace: false,

      waterPowerableElementInPlace: false,

      // Play/pause state
      isPlaying: true
    } );

    var thisModel = this;

    // Carousels that control the positions of the energy sources, converters,
    // and users.
    this.energySourcesCarousel = new EnergySystemElementCarousel( new Vector2( -0.15, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );
    this.energyConvertersCarousel = new EnergySystemElementCarousel( new Vector2( -0.025, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );
    this.energyUsersCarousel = new EnergySystemElementCarousel( new Vector2( 0.09, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );

    // Energy converters
    this.generator = new Generator( this.energyChunksVisible );
    this.solarPanel = new SolarPanel( this.energyChunksVisible );
    this.energyConvertersCarousel.add( this.generator );
    this.energyConvertersCarousel.add( this.solarPanel );

    // Energy sources
    var wheel1Center = this.energySourcesCarousel.selectedElementPosition.plus( Biker.CENTER_OF_BACK_WHEEL_OFFSET ).plusXY( 0.005, 0 );
    var wheel2Center = this.energyConvertersCarousel.selectedElementPosition.plus( Generator.WHEEL_CENTER_OFFSET );

    this.faucet = new FaucetAndWater( this.energyChunksVisible, this.waterPowerableElementInPlace );
    this.sun = new SunEnergySource( this.solarPanel, this.energyChunksVisible );
    this.teaPot = new TeaPot( this.energyChunksVisible, this.generator.activeProperty );

    this.belt = new Belt( Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center );
    this.biker = new Biker( this.energyChunksVisible, this.generator.activeProperty );
    this.energySourcesCarousel.add( this.faucet );
    this.energySourcesCarousel.add( this.sun );
    this.energySourcesCarousel.add( this.teaPot );
    this.energySourcesCarousel.add( this.biker );

    // Energy users
    this.incandescentBulb = new IncandescentBulb( this.energyChunksVisible );
    this.fluorescentBulb = new FluorescentBulb( this.energyChunksVisible );
    this.beakerHeater = new BeakerHeater( this.energyChunksVisible );
    this.energyUsersCarousel.add( this.beakerHeater );
    this.energyUsersCarousel.add( this.incandescentBulb );
    this.energyUsersCarousel.add( this.fluorescentBulb );

    this.carousels = [
      this.energySourcesCarousel,
      this.energyConvertersCarousel,
      this.energyUsersCarousel
    ];

    // Add the functionality to show/hide the belt that interconnects the
    // biker and the generator.
    function beltVisibilityUpdated( isAnimating ) {
      var bikerAndGeneratorSelected = ( !isAnimating && thisModel.biker.active && thisModel.generator.active );
      thisModel.belt.isVisibleProperty.set( bikerAndGeneratorSelected );
    }

    this.energySourcesCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
    this.energyConvertersCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
  }

  return inherit( PropertySet, EnergySystemsModel, {

    /**
     * @param  {Number} dt timestep
     * @public
     */
    step: function( dt ) {

      // Elements managed by carousels need to be scrollable/selectable regardless
      // of play/pause state.
      this.carousels.forEach( function( carousel ) {
        carousel.step( dt );
      } );

      if ( this.isPlaying ) {
        var energyFromSource = this.energySourcesCarousel.getSelectedElement().step( dt );
        var energyFromConverter = this.energyConvertersCarousel.getSelectedElement().step( dt, energyFromSource ); // eslint-disable-line no-unused-vars
        this.energyUsersCarousel.getSelectedElement().step( dt, energyFromConverter );
      }

    }
  } );
} );
