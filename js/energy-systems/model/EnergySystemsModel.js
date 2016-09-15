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
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
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

    var self = this;

    // Carousels that control the positions of the energy sources, converters,
    // and users.
    this.energySourcesCarousel = new EnergySystemElementCarousel( new Vector2( -0.15, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );
    this.energyConvertersCarousel = new EnergySystemElementCarousel( new Vector2( -0.025, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );
    this.energyUsersCarousel = new EnergySystemElementCarousel( new Vector2( 0.09, 0 ), OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL );

    // Energy converters
    this.generator = new Generator( this.energyChunksVisibleProperty );
    this.solarPanel = new SolarPanel( this.energyChunksVisibleProperty );
    this.energyConvertersCarousel.add( this.generator );
    this.energyConvertersCarousel.add( this.solarPanel );

    // Energy sources
    var wheel1Center = this.energySourcesCarousel.selectedElementPosition.plus( Biker.CENTER_OF_BACK_WHEEL_OFFSET ).plusXY( 0.005, 0 );
    var wheel2Center = this.energyConvertersCarousel.selectedElementPosition.plus( Generator.WHEEL_CENTER_OFFSET );

    this.faucet = new FaucetAndWater( this.energyChunksVisibleProperty, this.generator.activeProperty );
    this.sun = new SunEnergySource( this.solarPanel, this.energyChunksVisibleProperty );
    this.teaPot = new TeaPot( this.energyChunksVisibleProperty, this.generator.activeProperty );

    this.belt = new Belt( Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center );
    this.biker = new Biker( this.energyChunksVisibleProperty, this.generator.activeProperty );
    this.energySourcesCarousel.add( this.faucet );
    this.energySourcesCarousel.add( this.sun );
    this.energySourcesCarousel.add( this.teaPot );
    this.energySourcesCarousel.add( this.biker );

    // Energy users
    this.incandescentBulb = new IncandescentBulb( this.energyChunksVisibleProperty );
    this.fluorescentBulb = new FluorescentBulb( this.energyChunksVisibleProperty );
    this.beakerHeater = new BeakerHeater( this.energyChunksVisibleProperty );
    this.energyUsersCarousel.add( this.beakerHeater );
    this.energyUsersCarousel.add( this.incandescentBulb );
    this.energyUsersCarousel.add( this.fluorescentBulb );

    this.carousels = [
      this.energySourcesCarousel,
      this.energyConvertersCarousel,
      this.energyUsersCarousel
    ];

    // Set isActive = true for the first element in each carousel.
    this.carousels.forEach( function( carousel ) {
      carousel.managedElements[ 0 ].activate();
    } );

    // Add the functionality to show/hide the belt that interconnects the
    // biker and the generator.
    function beltVisibilityUpdated( isAnimating ) {
      var bikerAndGeneratorSelected = ( !isAnimating && self.biker.active && self.generator.active );
      self.belt.isVisibleProperty.set( bikerAndGeneratorSelected );
      self.generator.directCouplingModeProperty.set( bikerAndGeneratorSelected );
    }

    this.energySourcesCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
    this.energyConvertersCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
  }

  energyFormsAndChanges.register( 'EnergySystemsModel', EnergySystemsModel );

  return inherit( PropertySet, EnergySystemsModel, {

    reset: function() {
      this.energyChunksVisibleProperty.reset();

      this.carousels.forEach( function( carousel ) {
        carousel.getSelectedElement().deactivate();
        carousel.targetIndexProperty.set( 0 );
        carousel.getSelectedElement().activate();
      } );
    },

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
        var source = this.energySourcesCarousel.getSelectedElement();
        var converter = this.energyConvertersCarousel.getSelectedElement();
        var user = this.energyUsersCarousel.getSelectedElement();

        // Step selected energy system elements
        var energyFromSource = source.step( dt );
        var energyFromConverter = converter.step( dt, energyFromSource );
        user.step( dt, energyFromConverter );

        // Transfer energy chunks between the elements.
        converter.injectEnergyChunks( source.extractOutgoingEnergyChunks() );
        user.injectEnergyChunks( converter.extractOutgoingEnergyChunks() );
      }
    },

    /**
     * Pre-load the currently active energy system elements with energy
     * chunks so that the energy chunks are fully propagated into the
     * elements.
     */
    preLoadEnergyChunks: function() {
      var source = this.energySourcesCarousel.getSelectedElement();
      var converter = this.energyConvertersCarousel.getSelectedElement();
      var user = this.energyUsersCarousel.getSelectedElement();

      source.preLoadEnergyChunks();
      converter.preLoadEnergyChunks( source.getEnergyOutputRate() );
      user.preLoadEnergyChunks( converter.getEnergyOutputRate() );
    }
  } );
} );

