// Copyright 2016-2023, University of Colorado Boulder

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
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import isSettingPhetioStateProperty from '../../../../tandem/js/isSettingPhetioStateProperty.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import BeakerHeater from './BeakerHeater.js';
import Belt from './Belt.js';
import Biker from './Biker.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import EnergySystemElementCarousel from './EnergySystemElementCarousel.js';
import Fan from './Fan.js';
import FaucetAndWater from './FaucetAndWater.js';
import FluorescentBulb from './FluorescentBulb.js';
import Generator from './Generator.js';
import IncandescentBulb from './IncandescentBulb.js';
import SolarPanel from './SolarPanel.js';
import SunEnergySource from './SunEnergySource.js';
import TeaKettle from './TeaKettle.js';

// constants
const OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL = new Vector2( 0, -0.4 ); // in meters
const ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2( -0.15, 0 ); // in meters
const ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION = new Vector2( -0.025, 0 ); // in meters

class SystemsModel {

  // See in EFACIntroModel for doc
  public readonly energyChunksVisibleProperty: BooleanProperty;

  // Is the sim running or paused?
  public readonly isPlayingProperty: BooleanProperty;

  // For PhET-iO support. This type is responsible for creating and destroying all EnergyChunks in this model.
  private readonly energyChunkGroup: EnergyChunkGroup;

  // For PhET-iO support. This type is responsible for creating and destroying all EnergyChunkPathMover instances in this model.
  private readonly energyChunkPathMoverGroup: EnergyChunkPathMoverGroup;

  // Energy converters
  public readonly generator: Generator;
  public readonly solarPanel: SolarPanel;

  // Energy sources
  public readonly biker: Biker;
  public readonly faucetAndWater: FaucetAndWater;
  public readonly sun: SunEnergySource;
  public readonly teaKettle: TeaKettle;

  // Belt that connects biker to generator, which is not on a carousel
  public readonly belt: Belt;

  // Energy users
  public readonly fan: Fan;
  public readonly incandescentBulb: IncandescentBulb;
  public readonly fluorescentBulb: FluorescentBulb;
  public readonly beakerHeater: BeakerHeater;

  // Carousels that control the positions of the energy sources, converters, and users
  public readonly energySourcesCarousel: EnergySystemElementCarousel<'BIKER' | 'FAUCET' | 'SUN' | 'TEA_KETTLE'>;
  public readonly energyConvertersCarousel: EnergySystemElementCarousel<'GENERATOR' | 'SOLAR_PANEL'>;
  public readonly energyUsersCarousel: EnergySystemElementCarousel<'BEAKER_HEATER' | 'INCANDESCENT_BULB' | 'FLUORESCENT_BULB' | 'FAN'>;

  private readonly carousels: EnergySystemElementCarousel<IntentionalAny>[];

  // Used to notify the view that a manual step was called
  public readonly manualStepEmitter: Emitter<[ number ]>;

  public constructor( tandem: Tandem ) {

    // tandems to nest energy systems in Studio
    const energySourcesTandem = tandem.createTandem( 'energySources' );
    const energyConvertersTandem = tandem.createTandem( 'energyConverters' );
    const energyUsersTandem = tandem.createTandem( 'energyUsers' );

    this.energyChunksVisibleProperty = new BooleanProperty( false, {
      tandem: tandem.createTandem( 'energyChunksVisibleProperty' ),
      phetioDocumentation: 'whether the energy chunks are visible'
    } );

    this.isPlayingProperty = new BooleanProperty( true, {
      tandem: tandem.createTandem( 'isPlayingProperty' ),
      phetioDocumentation: 'whether the screen is playing or paused'
    } );

    this.energyChunkGroup = new EnergyChunkGroup( this.energyChunksVisibleProperty, {
      tandem: tandem.createTandem( 'energyChunkGroup' )
    } );

    // @ts-expect-error
    this.energyChunkPathMoverGroup = new EnergyChunkPathMoverGroup( this.energyChunkGroup, {
      tandem: tandem.createTandem( 'energyChunkPathMoverGroup' )
    } );

    this.generator = new Generator(
      this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energyConvertersTandem.createTandem( 'generator' )
      } );
    this.solarPanel = new SolarPanel(
      this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energyConvertersTandem.createTandem( 'solarPanel' )
      } );

    this.biker = new Biker(
      this.energyChunksVisibleProperty,
      this.generator.activeProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energySourcesTandem.createTandem( 'biker' )
      } );

    this.faucetAndWater = new FaucetAndWater(
      this.energyChunksVisibleProperty,
      this.generator.activeProperty,
      this.energyChunkGroup, {
        tandem: energySourcesTandem.createTandem( 'faucetAndWater' )
      } );
    this.sun = new SunEnergySource(
      this.solarPanel,
      this.isPlayingProperty,
      this.energyChunksVisibleProperty,
      this.energyChunkGroup, {
        tandem: energySourcesTandem.createTandem( 'sun' )
      } );
    this.teaKettle = new TeaKettle(
      this.energyChunksVisibleProperty,
      this.generator.activeProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energySourcesTandem.createTandem( 'teaKettle' )
      } );

    const wheel1Center = ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION.plus( Biker.CENTER_OF_BACK_WHEEL_OFFSET );
    const wheel2Center = ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION.plus( Generator.WHEEL_CENTER_OFFSET );

    this.belt = new Belt( Biker.REAR_WHEEL_RADIUS, wheel1Center, Generator.WHEEL_RADIUS, wheel2Center );

    this.fan = new Fan(
      this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energyUsersTandem.createTandem( 'fan' )
      } );
    this.incandescentBulb = new IncandescentBulb(
      this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energyUsersTandem.createTandem( 'incandescentBulb' )
      } );
    this.fluorescentBulb = new FluorescentBulb(
      this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energyUsersTandem.createTandem( 'fluorescentBulb' )
      } );
    this.beakerHeater = new BeakerHeater( this.energyChunksVisibleProperty,
      this.energyChunkGroup,
      this.energyChunkPathMoverGroup, {
        tandem: energyUsersTandem.createTandem( 'beakerHeater' )
      } );

    this.energySourcesCarousel = new EnergySystemElementCarousel(
      // @ts-expect-error
      [ this.biker, this.faucetAndWater, this.sun, this.teaKettle ],
      [ 'BIKER', 'FAUCET', 'SUN', 'TEA_KETTLE' ],
      ENERGY_SOURCES_CAROUSEL_SELECTED_ELEMENT_POSITION,
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL,
      tandem.createTandem( 'energySourcesCarousel' )
    );
    this.energyConvertersCarousel = new EnergySystemElementCarousel(
      // @ts-expect-error
      [ this.generator, this.solarPanel ],
      [ 'GENERATOR', 'SOLAR_PANEL' ],
      ENERGY_CONVERTERS_CAROUSEL_SELECTED_ELEMENT_POSITION,
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL,
      tandem.createTandem( 'energyConvertersCarousel' )
    );
    this.energyUsersCarousel = new EnergySystemElementCarousel(
      // @ts-expect-error
      [ this.beakerHeater, this.incandescentBulb, this.fluorescentBulb, this.fan ],
      [ 'BEAKER_HEATER', 'INCANDESCENT_BULB', 'FLUORESCENT_BULB', 'FAN' ],

      new Vector2( 0.09, 0 ),
      OFFSET_BETWEEN_ELEMENTS_ON_CAROUSEL,
      tandem.createTandem( 'energyUsersCarousel' )
    );

    this.carousels = [
      this.energySourcesCarousel,
      this.energyConvertersCarousel,
      this.energyUsersCarousel
    ];

    this.manualStepEmitter = new Emitter( { parameters: [ { valueType: 'number' } ] } );

    // set isActive = true for the first element in each carousel
    this.carousels.forEach( carousel => {
      carousel.managedElements[ 0 ].activate();
    } );

    // adds the functionality to show/hide the belt that interconnects the biker and the generator
    const beltVisibilityUpdated = ( isAnimating: boolean ) => {
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
      if ( energyChunksVisible && !isSettingPhetioStateProperty.value ) {
        this.preloadEnergyChunks();
      }
    } );
  }

  /**
   * restore the initial state
   */
  public reset(): void {
    this.energyChunksVisibleProperty.reset();
    this.isPlayingProperty.reset();

    this.carousels.forEach( carousel => {
      carousel.getSelectedElement()!.deactivate();
      carousel.targetElementNameProperty.reset();
      carousel.getSelectedElement()!.activate();
    } );
  }

  /**
   * step the sim forward by one fixed nominal frame time
   */
  public manualStep(): void {
    this.stepModel( EFACConstants.SIM_TIME_PER_TICK_NORMAL );
    this.manualStepEmitter.emit( EFACConstants.SIM_TIME_PER_TICK_NORMAL ); // notify the view
  }

  /**
   * step function or this model, automatically called by joist
   * @param dt - delta time, in seconds
   */
  public step( dt: number ): void {

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
   * @param dt - time step in seconds
   */
  public stepModel( dt: number ): void {
    const source = this.energySourcesCarousel.getSelectedElement()!;
    const converter = this.energyConvertersCarousel.getSelectedElement()!;
    const user = this.energyUsersCarousel.getSelectedElement()!;

    // {Energy} - step the currently selected energy system elements and transfer energy chunks in between each step
    // @ts-expect-error
    const energyFromSource = source.step( dt );
    // @ts-expect-error
    converter.injectEnergyChunks( source.extractOutgoingEnergyChunks() );
    // @ts-expect-error
    const energyFromConverter = converter.step( dt, energyFromSource );
    // @ts-expect-error
    user.injectEnergyChunks( converter.extractOutgoingEnergyChunks() );
    // @ts-expect-error
    user.step( dt, energyFromConverter );
  }

  /**
   * Pre-load the currently active energy system elements with energy chunks so that the energy chunks are fully
   * propagated into the elements.
   */
  private preloadEnergyChunks(): void {
    const source = this.energySourcesCarousel.getSelectedElement();
    const converter = this.energyConvertersCarousel.getSelectedElement();
    const user = this.energyUsersCarousel.getSelectedElement();

    // @ts-expect-error
    source.preloadEnergyChunks();
    // @ts-expect-error
    converter.preloadEnergyChunks( source.getEnergyOutputRate() );
    // @ts-expect-error
    user.preloadEnergyChunks( converter.getEnergyOutputRate() );
  }
}

energyFormsAndChanges.register( 'SystemsModel', SystemsModel );
export default SystemsModel;