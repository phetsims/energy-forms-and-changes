// Copyright 2016-2020, University of Colorado Boulder

/**
 * model for the 'Systems' screen of the Energy Forms And Changes simulation
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Emitter from '../../../../axon/js/Emitter.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Enumeration from '../../../../phet-core/js/Enumeration.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerHeater from './BeakerHeater.js';
import Belt from './Belt.js';
import Biker from './Biker.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import EnergySystemElementCarousel from './EnergySystemElementCarousel.js';
import FaucetAndWater from './FaucetAndWater.js';
import Generator from './Generator.js';

// constants
const OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 ); // in meters
const ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2( -0.15, 0 ); // in meters
const ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2( -0.025, 0 ); // in meters

class SystemsModel {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    // tandems to nest energy systems in Studio
    const energySourcesTandem = tandem.createTandem( 'energySources' );
    const energyConvertersTandem = tandem.createTandem( 'energyConverters' );
    const energyUsersTandem = tandem.createTandem( 'energyUsers' );

    // @public {BooleanProperty} - see in EFACIntroModel for doc
    this.energyChunksVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'energyChunksVisibleProperty' ),
      phetioDocumentation: 'whether the energy chunks are visible'
    } );

    // @public (read-only) {BooleanProperty} - is the sim running or paused?
    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' ),
      phetioDocumentation: 'whether the screen is playing or paused'
    } );

    // @private
    this.energyChunkGroup = new EnergyChunkGroup( {
      tandem: tandem.createTandem( 'energyChunkGroup' )
    } );

    // @private
    this.energyChunkPathMoverGroup = new EnergyChunkPathMoverGroup( this.energyChunkGroup, {
      tandem: tandem.createTandem( 'energyChunkPathMoverGroup' )
    } );

    // @public (read-only) energy converters
    this.generator = new Generator(
      this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup,
      energyConvertersTandem.createTandem( 'generator' ) );
    // this.solarPanel = new SolarPanel( this.energyChunksVisibleProperty, energyConvertersTandem.createTandem( 'solarPanel' ) );

    // @public (read-only) energy sources
    this.biker = new Biker(
      this.energyChunksVisibleProperty,
      this.generator.activeProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup,
      energySourcesTandem.createTandem( 'biker' )
    );

    this.faucetAndWater = new FaucetAndWater(
      this.energyChunksVisibleProperty,
      this.generator.activeProperty,
      this.energyChunkGroup,
      energySourcesTandem.createTandem( 'faucetAndWater' )
    );
    // this.sun = new SunEnergySource(
    //   this.solarPanel,
    //   this.energyChunksVisibleProperty,
    //   energySourcesTandem.createTandem( 'sun' )
    // );
    // this.teaKettle = new TeaKettle(
    //   this.energyChunksVisibleProperty,
    //   this.generator.activeProperty,
    //   energySourcesTandem.createTandem( 'teaKettle' )
    // );

    const wheel1Center = ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION.plus( Biker.CENTER_OF_BACK_WHEEL_OFFSET );
    const wheel2Center = ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION.plus( Generator.WHEEL_CENTER_OFFSET );

    // @public (read-only) belt that connects biker to generator, which is not on a carousel
    this.belt = new Belt( Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center );

    // TODO: bring these back, https://github.com/phetsims/energy-forms-and-changes/issues/350
    // // @public (read-only) energy users
    // this.fan = new Fan( this.energyChunksVisibleProperty, energyUsersTandem.createTandem( 'fan' ) );
    // this.incandescentBulb = new IncandescentBulb(
    //   this.energyChunksVisibleProperty,
    //   energyUsersTandem.createTandem( 'incandescentBulb' )
    // );
    // this.fluorescentBulb = new FluorescentBulb(
    //   this.energyChunksVisibleProperty,
    //   energyUsersTandem.createTandem( 'fluorescentBulb' )
    // );
    this.beakerHeater = new BeakerHeater( this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup,
      energyUsersTandem.createTandem( 'beakerHeater' ) );

    // @public (read-only) carousels that control the positions of the energy sources, converters, and users
    this.energySourcesCarousel = new EnergySystemElementCarousel(
      // TODO: bring these back, https://github.com/phetsims/energy-forms-and-changes/issues/350
      [ this.biker, this.faucetAndWater ],
      Enumeration.byKeys( [ 'BIKER', 'FAUCET' ] ),
      // [ this.biker, this.faucetAndWater, this.sun, this.teaKettle ],
      // Enumeration.byKeys( [ 'BIKER', 'FAUCET', 'SUN', 'TEA_KETTLE' ] ),

      ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION,
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL,
      tandem.createTandem( 'energySourcesCarousel' )
    );
    this.energyConvertersCarousel = new EnergySystemElementCarousel(
      // TODO: bring these back, https://github.com/phetsims/energy-forms-and-changes/issues/350
      [ this.generator ],
      Enumeration.byKeys( [ 'GENERATOR' ] ),
      // [ this.generator, this.solarPanel ],
      // Enumeration.byKeys( [ 'GENERATOR', 'SOLAR_PANEL' ] ),

      ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION,
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL,
      tandem.createTandem( 'energyConvertersCarousel' )
    );
    this.energyUsersCarousel = new EnergySystemElementCarousel(
      // TODO: bring these back, https://github.com/phetsims/energy-forms-and-changes/issues/350
      [ this.beakerHeater ],
      Enumeration.byKeys( [ 'BEAKER_HEATER' ] ),
      // [ this.beakerHeater, this.incandescentBulb, this.fluorescentBulb, this.fan ],
      // Enumeration.byKeys( [ 'BEAKER_HEATER', 'INCANDESCENT_BULB', 'FLUORESCENT_BULB', 'FAN' ] ),

      new Vector2( 0.09, 0 ),
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL,
      tandem.createTandem( 'energyUsersCarousel' )
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

      // When setting PhET-iO state, energy chunks are positioned based on the state.
      if ( energyChunksVisible && !phet.joist.sim.isSettingPhetioStateProperty.value ) {
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
      carousel.targetElementNameProperty.reset();
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

    // {Energy} - step the currently selected energy system elements and transfer energy chunks in between each step
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

energyFormsAndChanges.register( 'SystemsModel', SystemsModel );
export default SystemsModel;