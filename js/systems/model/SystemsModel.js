// Copyright 2016-2019, University of Colorado Boulder

/**
 * model for the 'Systems' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const BeakerHeater = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/BeakerHeater' );
  const Belt = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Belt' );
  const Biker = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Biker' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const Emitter = require( 'AXON/Emitter' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergySystemElementCarousel = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySystemElementCarousel' );
  const Fan = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Fan' );
  const FaucetAndWater = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/FaucetAndWater' );
  const FluorescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/FluorescentBulb' );
  const Generator = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Generator' );
  const IncandescentBulb = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/IncandescentBulb' );
  const SolarPanel = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/SolarPanel' );
  const SunEnergySource = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/SunEnergySource' );
  const TeaKettle = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/TeaKettle' );
  const Vector2 = require( 'DOT/Vector2' );

  // constants
  const OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 ); // in meters
  const ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2( -0.15, 0 ); // in meters
  const ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2( -0.025, 0 ); // in meters

  class SystemsModel {
    constructor() {

      // @public {BooleanProperty} - see in EFACIntroModel for doc
      this.energyChunksVisibleProperty = new BooleanProperty( false );

      // @public (read-only) {BooleanProperty} - is the sim running or paused?
      this.isPlayingProperty = new BooleanProperty( true );

      // @public (read-only) energy converters
      this.generator = new Generator( this.energyChunksVisibleProperty );
      this.solarPanel = new SolarPanel( this.energyChunksVisibleProperty );

      // @public (read-only) energy sources
      this.faucet = new FaucetAndWater( this.energyChunksVisibleProperty, this.generator.activeProperty );
      this.sun = new SunEnergySource( this.solarPanel, this.energyChunksVisibleProperty );
      this.teaKettle = new TeaKettle( this.energyChunksVisibleProperty, this.generator.activeProperty );
      this.biker = new Biker( this.energyChunksVisibleProperty, this.generator.activeProperty );

      const wheel1Center = ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION.plus( Biker.CENTER_OF_BACK_WHEEL_OFFSET );
      const wheel2Center = ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION.plus( Generator.WHEEL_CENTER_OFFSET );

      // @public (read-only) belt that connects biker to generator, which is not on a carousel
      this.belt = new Belt( Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center );

      // @public (read-only) energy users
      this.fan = new Fan( this.energyChunksVisibleProperty );
      this.incandescentBulb = new IncandescentBulb( this.energyChunksVisibleProperty );
      this.fluorescentBulb = new FluorescentBulb( this.energyChunksVisibleProperty );
      this.beakerHeater = new BeakerHeater( this.energyChunksVisibleProperty );

      // @public (read-only) carousels that control the positions of the energy sources, converters, and users
      this.energySourcesCarousel = new EnergySystemElementCarousel(
        [ this.faucet, this.sun, this.teaKettle, this.biker ],
        ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION,
        OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL
      );
      this.energyConvertersCarousel = new EnergySystemElementCarousel(
        [ this.generator, this.solarPanel ],
        ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION,
        OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL
      );
      this.energyUsersCarousel = new EnergySystemElementCarousel(
        [ this.beakerHeater, this.incandescentBulb, this.fluorescentBulb, this.fan ],
        new Vector2( 0.09, 0 ),
        OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL
      );

      // @private {EnergySystemElementCarousel[]}
      this.carousels = [
        this.energySourcesCarousel,
        this.energyConvertersCarousel,
        this.energyUsersCarousel
      ];

      // @public - used to notify the view that a manual step was called
      this.manualStepEmitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );

      // set isActive = true for the first element in each carousel
      this.carousels.forEach( carousel => {
        carousel.managedElements[ 0 ].activate();
      } );

      // adds the functionality to show/hide the belt that interconnects the biker and the generator
      const beltVisibilityUpdated = isAnimating => {
        const bikerAndGeneratorSelected = ( !isAnimating && this.biker.activeProperty.value &&
                                            this.generator.activeProperty.value );
        this.belt.isVisibleProperty.set( bikerAndGeneratorSelected );
        this.generator.directCouplingModeProperty.set( bikerAndGeneratorSelected );
      };

      this.energySourcesCarousel.animationInProgressProperty.link( beltVisibilityUpdated );
      this.energyConvertersCarousel.animationInProgressProperty.link( beltVisibilityUpdated );

      // monitor the visibility of the energy chunks and make sure they are in the right places when this changes
      this.energyChunksVisibleProperty.link( energyChunksVisible => {
        if ( energyChunksVisible ) {
          this.preloadEnergyChunks();
        }
      } );
    }

    /**
     * restore the initial state
     * @public
     */
    reset() {
      this.energyChunksVisibleProperty.reset();
      this.isPlayingProperty.reset();

      this.carousels.forEach( carousel => {
        carousel.getSelectedElement().deactivate();
        carousel.targetIndexProperty.set( 0 );
        carousel.getSelectedElement().activate();
      } );
    }

    /**
     * step the sim forward by one fixed nominal frame time
     * @public
     */
    manualStep() {
      this.stepModel( EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      this.manualStepEmitter.emit( EFACConstants.SIM_TIME_PER_TICK_NORMAL ); // notify the view
    }

    /**
     * step function or this model, automatically called by joist
     * @param {number} dt - delta time, in seconds
     * @public
     */
    step( dt ) {

      // elements managed by carousels need to be scrollable/selectable regardless of play/pause state
      this.carousels.forEach( carousel => {
        carousel.step( dt );
      } );

      if ( this.isPlayingProperty.get() ) {
        this.stepModel( dt );
      }
    }

    /**
     * step the model in time
     * @param  {number} dt - time step in seconds
     * @public
     */
    stepModel( dt ) {
      const source = this.energySourcesCarousel.getSelectedElement();
      const converter = this.energyConvertersCarousel.getSelectedElement();
      const user = this.energyUsersCarousel.getSelectedElement();

      // step the currently selected energy system elements and transfer energy chunks in between each step
      const energyFromSource = source.step( dt );
      converter.injectEnergyChunks( source.extractOutgoingEnergyChunks() );
      const energyFromConverter = converter.step( dt, energyFromSource );
      user.injectEnergyChunks( converter.extractOutgoingEnergyChunks() );
      user.step( dt, energyFromConverter );
    }

    /**
     * Pre-load the currently active energy system elements with energy chunks so that the energy chunks are fully
     * propagated into the elements.
     * @private
     */
    preloadEnergyChunks() {
      const source = this.energySourcesCarousel.getSelectedElement();
      const converter = this.energyConvertersCarousel.getSelectedElement();
      const user = this.energyUsersCarousel.getSelectedElement();

      source.preloadEnergyChunks();
      converter.preloadEnergyChunks( source.getEnergyOutputRate() );
      user.preloadEnergyChunks( converter.getEnergyOutputRate() );
    }
  }

  return energyFormsAndChanges.register( 'SystemsModel', SystemsModel );
} );

