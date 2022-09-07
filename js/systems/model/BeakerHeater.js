// Copyright 2016-2022, University of Colorado Boulder

/**
 * model of a heating element with a beaker on it
 *
 * @author John Blanco
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import waterIcon_png from '../../../images/waterIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import Beaker from '../../common/model/Beaker.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyContainerCategory from '../../common/model/EnergyContainerCategory.js';
import EnergyType from '../../common/model/EnergyType.js';
import HeatTransferConstants from '../../common/model/HeatTransferConstants.js';
import TemperatureAndColorSensor from '../../common/model/TemperatureAndColorSensor.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyUser from './EnergyUser.js';

// position and size constants, empirically determined
const BEAKER_WIDTH = 0.075; // In meters.
const BEAKER_HEIGHT = BEAKER_WIDTH * 1.1;
const BEAKER_OFFSET = new Vector2( 0, 0.016 );
const HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY = 0.0075; // in meters/sec, quite slow
const HEATER_ELEMENT_2D_HEIGHT = 0.027; // height of image
const MAX_HEAT_GENERATION_RATE = 5000; // Joules/sec, not connected to incoming energy
const HEAT_ENERGY_CHANGE_RATE = 0.5; // in proportion per second

// energy chunk path offsets, empirically determined such that they move through the view in a way that looks good
const LEFT_SIDE_OF_WIRE_OFFSET = new Vector2( -0.04, -0.041 );
const WIRE_CURVE_POINT_1_OFFSET = new Vector2( -0.02, -0.041 );
const WIRE_CURVE_POINT_2_OFFSET = new Vector2( -0.015, -0.04 );
const WIRE_CURVE_POINT_3_OFFSET = new Vector2( -0.005, -0.034 );
const WIRE_CURVE_POINT_4_OFFSET = new Vector2( -0.001, -0.027 );
const WIRE_CURVE_POINT_5_OFFSET = new Vector2( -0.0003, -0.02 );
const BOTTOM_OF_CONNECTOR_OFFSET = new Vector2( -0.0003, -0.01 );
const CONVERSION_POINT_OFFSET = new Vector2( 0, 0.003 );
const ELECTRICAL_ENERGY_CHUNK_OFFSETS = [
  WIRE_CURVE_POINT_1_OFFSET,
  WIRE_CURVE_POINT_2_OFFSET,
  WIRE_CURVE_POINT_3_OFFSET,
  WIRE_CURVE_POINT_4_OFFSET,
  WIRE_CURVE_POINT_5_OFFSET,
  BOTTOM_OF_CONNECTOR_OFFSET,
  CONVERSION_POINT_OFFSET
];

class BeakerHeater extends EnergyUser {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty,
               energyChunkGroup,
               energyChunkPathMoverGroup,
               options ) {

    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioState: false // no internal fields to convey in state
    }, options );

    super( new Image( waterIcon_png ), options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.beakerOfWater;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @public (read-only) {NumberProperty}
    this.heatProportionProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: options.tandem.createTandem( 'heatProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of how much heat the coils have'
    } );

    // @private {ObservableArrayDef.<EnergyChunkPathMover>} - arrays that move the energy chunks as they move into, within, and out of the
    // beaker
    this.electricalEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'electricalEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.heatingElementEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'heatingElementEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.radiatedEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'radiatedEnergyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );

    // @public (read-only) {ObservableArrayDef} - energy chunks that are radiated by this beaker
    this.radiatedEnergyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'radiatedEnergyChunkList' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    // @private {Tandem} - used for instrumenting the water beaker and the thermometer's sensedElementNameProperty
    this.waterBeakerTandem = options.tandem.createTandem( 'waterBeaker' );

    // @public {Beaker} (read-only) - note that the position is absolute, not relative to the "parent" model element
    this.beaker = new Beaker(
      this.positionProperty.value.plus( BEAKER_OFFSET ),
      BEAKER_WIDTH,
      BEAKER_HEIGHT,
      energyChunksVisibleProperty,
      energyChunkGroup, {
        tandem: this.waterBeakerTandem,
        phetioDocumentation: 'beaker that contains water',
        userControllable: false
      }
    );

    // @public {TemperatureAndColorSensor} (read-only)
    this.thermometer = new TemperatureAndColorSensor(
      this,
      new Vector2( BEAKER_WIDTH * 0.45, BEAKER_HEIGHT * 0.6 ), // position is relative, not absolute
      true, {
        tandem: options.tandem.createTandem( 'thermometer' ),
        userControllable: false
      }
    );

    // @private, for convenience
    this.random = dotRandom;

    // move the beaker as the overall position changes
    this.positionProperty.link( position => {
      this.beaker.positionProperty.value = position.plus( BEAKER_OFFSET );
    } );
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @param  {Energy} incomingEnergy
   * @public
   * @override
   */
  step( dt, incomingEnergy ) {
    if ( !this.activeProperty.value ) {
      return;
    }

    // this isn't designed to take in anything other than electrical energy, so make sure that's what we've got
    assert && assert( incomingEnergy.type === EnergyType.ELECTRICAL, `unexpected energy type: ${incomingEnergy.type}` );

    // handle any incoming energy chunks
    if ( this.incomingEnergyChunks.length > 0 ) {
      this.incomingEnergyChunks.forEach( chunk => {

        assert && assert(
          chunk.energyTypeProperty.value === EnergyType.ELECTRICAL,
          `Energy chunk type should be ELECTRICAL but is ${chunk.energyTypeProperty.value}`
        );

        // add the energy chunk to the list of those under management
        this.energyChunkList.push( chunk );

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY ) );
      } );

      // clear incoming chunks array
      this.incomingEnergyChunks.clear();
    }
    this.moveElectricalEnergyChunks( dt );
    this.moveThermalEnergyChunks( dt );


    // set the proportion of max heat being generated by the heater element
    if ( this.energyChunksVisibleProperty.value ) {

      // Energy chunks are visible, so set the heat level based on the number of them that are on the burner.  This
      // calculation uses a shifted sigmoid function so that it will asymptotically approach one as more energy chunks
      // are present.  It was empirically determined by looking at the incoming energy rate versus the number of energy
      // chunks present when the system has been producing energy steadily for long enough that the energy chunks have
      // propagated all the way through.
      const currentHeatProportion = this.heatProportionProperty.value;
      const targetHeatProportion = 2 / ( 1 + Math.pow( Math.E, -this.heatingElementEnergyChunkMovers.length ) ) - 1;
      if ( targetHeatProportion > currentHeatProportion ) {
        this.heatProportionProperty.set(
          Math.min( targetHeatProportion, currentHeatProportion + HEAT_ENERGY_CHANGE_RATE * dt )
        );
      }
      else if ( targetHeatProportion < currentHeatProportion ) {
        this.heatProportionProperty.set(
          Math.max( targetHeatProportion, currentHeatProportion - HEAT_ENERGY_CHANGE_RATE * dt )
        );
      }
    }
    else {

      // set the heat proportion based on the incoming energy amount, but moderate the rate at which it changes
      const energyFraction = incomingEnergy.amount / ( EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt );
      this.heatProportionProperty.set(
        Math.min( energyFraction, this.heatProportionProperty.value + HEAT_ENERGY_CHANGE_RATE * dt )
      );
    }

    // add energy to the beaker based on heat coming from heat element
    this.beaker.changeEnergy( this.heatProportionProperty.value * MAX_HEAT_GENERATION_RATE * dt );

    // remove energy from the beaker based on loss of heat to the surrounding air
    const temperatureGradient = this.beaker.getTemperature() - EFACConstants.ROOM_TEMPERATURE;
    if ( Math.abs( temperatureGradient ) > EFACConstants.TEMPERATURES_EQUAL_THRESHOLD ) {
      const beakerRect = this.beaker.getUntransformedBounds();
      const thermalContactArea = ( beakerRect.width * 2 ) + ( beakerRect.height * 2 ) * this.beaker.fluidProportionProperty.value;
      const transferFactor = HeatTransferConstants.getHeatTransferFactor(
        EnergyContainerCategory.WATER, EnergyContainerCategory.AIR );
      const thermalEnergyLost = temperatureGradient * transferFactor * thermalContactArea * dt;

      this.beaker.changeEnergy( -thermalEnergyLost );

      if ( this.beaker.getEnergyBeyondMaxTemperature() > 0 ) {
        // Prevent the water from going beyond the boiling point.
        this.beaker.changeEnergy( -this.beaker.getEnergyBeyondMaxTemperature() );
      }
    }

    this.beaker.step( dt );

    if ( this.beaker.getEnergyChunkBalance() > 0 ) {

      // remove an energy chunk from the beaker and start it floating away, a.k.a. make it "radiate"
      const bounds = this.beaker.getBounds();
      const extractionPoint = new Vector2( bounds.minX + dotRandom.nextDouble() * bounds.width, bounds.maxY );
      const ec = this.beaker.extractEnergyChunkClosestToPoint( extractionPoint );

      if ( ec ) {
        ec.zPositionProperty.set( 0 ); // move to front of z order
        this.radiatedEnergyChunkList.push( ec );
        this.radiatedEnergyChunkMovers.push(
          this.energyChunkPathMoverGroup.createNextElement(
            ec,
            EnergyChunkPathMover.createRadiatedPath( ec.positionProperty.value, 0 ),
            EFACConstants.ENERGY_CHUNK_VELOCITY
          )
        );
      }
    }

    this.moveRadiatedEnergyChunks( dt );

    // step sub-elements
    this.thermometer.step();
  }

  /**
   * update the temperature and color at the specified position within the beaker
   *
   * @param {Vector2} position - position to be sensed
   * @param {Property.<number>} sensedTemperatureProperty
   * @param {Property.<Color>} sensedElementColorProperty
   * @public
   */
  updateTemperatureAndColorAndNameAtPosition(
    position,
    sensedTemperatureProperty,
    sensedElementColorProperty,
    sensedElementNameProperty
  ) {

    // validate that the specified position is inside the beaker, since that's the only supported position
    assert && assert(
    position.x >= BEAKER_OFFSET.x - BEAKER_WIDTH / 2 && position.x <= BEAKER_OFFSET.x + BEAKER_WIDTH / 2,
      'position is not inside of beaker'
    );
    assert && assert(
    position.y >= BEAKER_OFFSET.y - BEAKER_HEIGHT / 2 && position.y <= BEAKER_OFFSET.y + BEAKER_HEIGHT / 2,
      'position is not inside of beaker'
    );

    sensedTemperatureProperty.set( this.beaker.getTemperature() );
    sensedElementColorProperty.set( EFACConstants.WATER_COLOR_OPAQUE );
    sensedElementNameProperty.set( this.waterBeakerTandem.phetioID );
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveRadiatedEnergyChunks( dt ) {
    const movers = this.radiatedEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        // remove this energy chunk entirely
        this.radiatedEnergyChunkList.remove( mover.energyChunk );
        this.radiatedEnergyChunkMovers.remove( mover );
        this.energyChunkGroup.disposeElement( mover.energyChunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveThermalEnergyChunks( dt ) {
    const movers = this.heatingElementEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        // This chunk is ready to move to the beaker.  We remove it from here, and the beaker takes over management of
        // the chunk.
        this.beaker.addEnergyChunk( mover.energyChunk );
        this.energyChunkList.remove( mover.energyChunk );
        this.heatingElementEnergyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks( dt ) {
    const movers = this.electricalEnergyChunkMovers.slice();

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        // the electrical energy chunk has reached the burner, so it needs to change into thermal energy
        this.electricalEnergyChunkMovers.remove( mover );
        mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

        // have the thermal energy move a little on the element before moving into the beaker
        this.heatingElementEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( mover.energyChunk,
          this.createHeaterElementEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
          HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY ) );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * @param  {Energy} incomingEnergyRate
   * @public
   * @override
   */
  preloadEnergyChunks( incomingEnergyRate ) {
    this.clearEnergyChunks();

    if ( incomingEnergyRate.amount === 0 || incomingEnergyRate.type !== EnergyType.ELECTRICAL ) {
      // no energy chunk pre-loading needed
      return;
    }

    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;

    // simulate energy chunks moving through the system
    let preloadComplete = false;
    while ( !preloadComplete ) {
      energySinceLastChunk += incomingEnergyRate.amount * dt;

      // determine if time to add a new chunk
      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

        // create and add a new chunk
        const newEnergyChunk = this.energyChunkGroup.createNextElement(
          EnergyType.ELECTRICAL,
          this.positionProperty.get().plus( LEFT_SIDE_OF_WIRE_OFFSET ),
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );
        this.energyChunkList.push( newEnergyChunk );

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( newEnergyChunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY )
        );

        // update energy since last chunk
        energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
      }

      this.moveElectricalEnergyChunks( dt );

      if ( this.heatingElementEnergyChunkMovers.length > 0 ) {

        // an energy chunk has made it to the heating element, which completes the preload
        preloadComplete = true;
      }
    }
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.beaker.reset();
    this.beaker.positionProperty.value = this.positionProperty.value.plus( BEAKER_OFFSET );
    this.heatProportionProperty.set( 0 );

    // step the thermometer so that any temperature changes resulting from the reset are immediately reflected
    this.thermometer.step();
  }

  /**
   * remove all energy chunks
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();

    this.electricalEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.electricalEnergyChunkMovers.clear();
    this.heatingElementEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.heatingElementEnergyChunkMovers.clear();
    this.radiatedEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.radiatedEnergyChunkMovers.clear();
    this.radiatedEnergyChunkList.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.radiatedEnergyChunkList.clear();
  }

  /**
   * @param  {Vector2} startingPoint
   * @returns {Vector2[]}
   * @private
   */
  createHeaterElementEnergyChunkPath( startingPoint ) {
    const path = [];

    // The path for the thermal energy chunks is meant to look like it is moving on the burner element.  This must be
    // updated if the burner element image changes.
    const angleSpan = Math.PI * 0.75;
    const angle = Math.PI / 2 + ( this.random.nextDouble() - 0.5 ) * angleSpan;

    // Calculate a travel distance that will move farther to the left and right, less in the middle, to match the
    // elliptical shape of the burner in the view, see https://github.com/phetsims/energy-forms-and-changes/issues/174.
    const travelDistance = ( 0.6 + Math.abs( Math.cos( angle ) ) * 0.3 ) * HEATER_ELEMENT_2D_HEIGHT;
    path.push( startingPoint.plus( new Vector2( travelDistance, 0 ).rotated( angle ) ) );
    return path;
  }
}

BeakerHeater.HEATER_ELEMENT_2D_HEIGHT = HEATER_ELEMENT_2D_HEIGHT;

energyFormsAndChanges.register( 'BeakerHeater', BeakerHeater );
export default BeakerHeater;
