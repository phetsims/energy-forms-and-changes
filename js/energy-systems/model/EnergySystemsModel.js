// Copyright 2016-2018, University of Colorado Boulder

/**
 * model for the 'Energy Systems' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( function( require ) {
  'use strict';

  // modules
  var BeakerHeater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/BeakerHeater' );
  var Belt = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Belt' );
  var Biker = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Biker' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var EnergySystemElementCarousel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySystemElementCarousel' );
  var FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FaucetAndWater' );
  var FluorescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/FluorescentBulb' );
  var Generator = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/Generator' );
  var IncandescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/IncandescentBulb' );
  var inherit = require( 'PHET_CORE/inherit' );
  var Property = require( 'AXON/Property' );
  var SolarPanel = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SolarPanel' );
  var SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/SunEnergySource' );
  var TeaPot = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/TeaPot' );
  var Vector2 = require( 'DOT/Vector2' );

  // constants
  var OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 );

  /**
   * @constructor
   */
  function EnergySystemsModel() {

    this.energyChunksVisibleProperty = new Property( false );
    this.steamPowerableElementInPlaceProperty = new Property( false );
    this.waterPowerableElementInPlaceProperty = new Property( false );
    this.isPlayingProperty = new Property( true );

    var self = this;

    // carousels that control the positions of the energy sources, converters, and users
    this.energySourcesCarousel = new EnergySystemElementCarousel(
      new Vector2( -0.15, 0 ),
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL
    );
    this.energyConvertersCarousel = new EnergySystemElementCarousel(
      new Vector2( -0.025, 0 ),
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL
    );
    this.energyUsersCarousel = new EnergySystemElementCarousel(
      new Vector2( 0.09, 0 ),
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL
    );

    // energy converters
    this.generator = new Generator( this.energyChunksVisibleProperty );
    this.solarPanel = new SolarPanel( this.energyChunksVisibleProperty );
    this.energyConvertersCarousel.add( this.generator );
    this.energyConvertersCarousel.add( this.solarPanel );

    this.faucet = new FaucetAndWater( this.energyChunksVisibleProperty, this.generator.activeProperty );

    // energy sources
    var wheel1Center = this.energySourcesCarousel.selectedElementPosition.plus( Biker.CENTER_OF_BACK_WHEEL_OFFSET ).plusXY( 0.005, 0 );
    var wheel2Center = this.energyConvertersCarousel.selectedElementPosition.plus( Generator.WHEEL_CENTER_OFFSET );
    this.sun = new SunEnergySource( this.solarPanel, this.energyChunksVisibleProperty );
    this.teaPot = new TeaPot( this.energyChunksVisibleProperty, this.generator.activeProperty );
    this.belt = new Belt( Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center );
    this.biker = new Biker( this.energyChunksVisibleProperty, this.generator.activeProperty );
    this.energySourcesCarousel.add( this.faucet );
    this.energySourcesCarousel.add( this.sun );
    this.energySourcesCarousel.add( this.teaPot );
    this.energySourcesCarousel.add( this.biker );

    // energy users
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

    // set isActive = true for the first element in each carousel
    this.carousels.forEach( function( carousel ) {
      carousel.managedElements[ 0 ].activate();
    } );

    // add the functionality to show/hide the belt that interconnects the biker and the generator.
    function beltVisibilityUpdated( isAnimating ) {
      var bikerAndGeneratorSelected = ( !isAnimating && self.biker.activeProperty.value &&
                                        self.generator.activeProperty.value );
      self.belt.isVisibleProperty.set( bikerAndGeneratorSelected );
      self.generator.directCouplingModeProperty.set( bikerAndGeneratorSelected );
    }
    this.energySourcesCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
    this.energyConvertersCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
  }

  energyFormsAndChanges.register( 'EnergySystemsModel', EnergySystemsModel );

  return inherit( Object, EnergySystemsModel, {

    /**
     * restore the initial state
     * @public
     */
    reset: function() {
      this.energyChunksVisibleProperty.reset();
      this.steamPowerableElementInPlaceProperty.reset();
      this.waterPowerableElementInPlaceProperty.reset();
      this.isPlayingProperty.reset();

      this.carousels.forEach( function( carousel ) {
        carousel.getSelectedElement().deactivate();
        carousel.targetIndexProperty.set( 0 );
        carousel.getSelectedElement().activate();
      } );
    },

    /**
     * step the model in time
     * @param  {number} dt - time step in seconds
     * @public
     */
    step: function( dt ) {

      // elements managed by carousels need to be scrollable/selectable regardless of play/pause state
      this.carousels.forEach( function( carousel ) {
        carousel.step( dt );
      } );

      if ( this.isPlayingProperty.value ) {
        var source = this.energySourcesCarousel.getSelectedElement();
        var converter = this.energyConvertersCarousel.getSelectedElement();
        var user = this.energyUsersCarousel.getSelectedElement();

        // step the currently selected energy system elements
        var energyFromSource = source.step( dt );
        var energyFromConverter = converter.step( dt, energyFromSource );
        user.step( dt, energyFromConverter );

        // transfer energy chunks between the elements
        converter.injectEnergyChunks( source.extractOutgoingEnergyChunks() );
        user.injectEnergyChunks( converter.extractOutgoingEnergyChunks() );
      }
    },

    /**
     * Pre-load the currently active energy system elements with energy chunks so that the energy chunks are fully
     * propagated into the elements.
     * @private
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

