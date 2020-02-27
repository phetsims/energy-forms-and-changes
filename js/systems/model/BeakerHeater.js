// Copyright 2016-2020, University of Colorado Boulder

/**
 * model of a heating element with a beaker on it
 *
 * @author John Blanco
 */

import NumberProperty from '../../../../axon/js/NumberProperty.js';
import ObservableArray from '../../../../axon/js/ObservableArray.js';
import Range from '../../../../dot/js/Range.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import WATER_ICON from '../../../images/water_icon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import Beaker from '../../common/model/Beaker.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyContainerCategory from '../../common/model/EnergyContainerCategory.js';
import EnergyType from '../../common/model/EnergyType.js';
import HeatTransferConstants from '../../common/model/HeatTransferConstants.js';
import TemperatureAndColorSensor from '../../common/model/TemperatureAndColorSensor.js';
import EFACA11yStrings from '../../EFACA11yStrings.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
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
   * @param {Tandem} tandem
   */
  constructor( energyChunksVisibleProperty, tandem ) {
    super( new Image( WATER_ICON ), tandem );

    // @public {string} - a11y name
    this.a11yName = EFACA11yStrings.beakerOfWater.value;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @public (read-only) {NumberProperty}
    this.heatProportionProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: tandem.createTandem( 'heatProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of how much heat the coils have'
    } );

    // @private {EnergyChunkPathMover[]} - arrays that move the energy chunks as they move into, within, and out of the
    // beaker
    this.electricalEnergyChunkMovers = [];
    this.heatingElementEnergyChunkMovers = [];
    this.radiatedEnergyChunkMovers = [];

    // @public (read-only) {ObservableArray} - energy chunks that are radiated by this beaker
    this.radiatedEnergyChunkList = new ObservableArray();

    // @private {Tandem} - used for instrumenting the water beaker and the thermometer's sensedElementNameProperty
    this.waterBeakerTandem = tandem.createTandem( 'waterBeaker' );

    // @public {Beaker} (read-only) - note that the position is absolute, not relative to the "parent" model element
    this.beaker = new Beaker(
      this.positionProperty.value.plus( BEAKER_OFFSET ),
      BEAKER_WIDTH,
      BEAKER_HEIGHT,
      energyChunksVisibleProperty, {
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
        tandem: tandem.createTandem( 'thermometer' ),
        userControllable: false
      }
    );

    // @private, for convenience
    this.random = phet.joist.random;

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
        this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( chunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), ELECTRICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY ) );
      } );

      // clear incoming chunks array
      this.incomingEnergyChunks.length = 0;
    }
    this.moveElectricalEnergyChunks( dt );
    this.moveThermalEnergyChunks( dt );

    const energyFraction = incomingEnergy.amount / ( EFACConstants.MAX_ENERGY_PRODUCTION_RATE * dt );

    // set the proportion of max heat being generated by the heater element
    if ( ( this.energyChunksVisibleProperty.get() && this.heatingElementEnergyChunkMovers.length > 0 ) ||
         ( !this.energyChunksVisibleProperty.get() && incomingEnergy.type === EnergyType.ELECTRICAL ) ) {
      this.heatProportionProperty.set(
        Math.min( energyFraction, this.heatProportionProperty.value + HEAT_ENERGY_CHANGE_RATE * dt )
      );
    }
    else {
      this.heatProportionProperty.set(
        Math.max( 0, this.heatProportionProperty.value - HEAT_ENERGY_CHANGE_RATE * dt )
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
      const extractionPoint = new Vector2( bounds.minX + phet.joist.random.nextDouble() * bounds.width, bounds.maxY );
      const ec = this.beaker.extractEnergyChunkClosestToPoint( extractionPoint );

      if ( ec ) {
        ec.zPositionProperty.set( 0 ); // move to front of z order
        this.radiatedEnergyChunkList.push( ec );
        this.radiatedEnergyChunkMovers.push(
          new EnergyChunkPathMover(
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
   * update the temperature and color at the specified location within the beaker
   *
   * @param {Vector2} position - location to be sensed
   * @param {Property.<number>} sensedTemperatureProperty
   * @param {Property.<Color>} sensedElementColorProperty
   * @public
   */
  updateTemperatureAndColorAndNameAtLocation(
    position,
    sensedTemperatureProperty,
    sensedElementColorProperty,
    sensedElementNameProperty
  ) {

    // validate that the specified location is inside the beaker, since that's the only supported location
    assert && assert(
    position.x >= BEAKER_OFFSET.x - BEAKER_WIDTH / 2 && position.x <= BEAKER_OFFSET.x + BEAKER_WIDTH / 2,
      'location is not inside of beaker'
    );
    assert && assert(
    position.y >= BEAKER_OFFSET.y - BEAKER_HEIGHT / 2 && position.y <= BEAKER_OFFSET.y + BEAKER_HEIGHT / 2,
      'location is not inside of beaker'
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
        _.pull( this.radiatedEnergyChunkMovers, mover );
      }
    } );
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveThermalEnergyChunks( dt ) {
    const movers = _.clone( this.heatingElementEnergyChunkMovers );

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        // This chunk is ready to move to the beaker.  We remove it from here, and the beaker takes over management of
        // the chunk.
        this.beaker.addEnergyChunk( mover.energyChunk );
        this.energyChunkList.remove( mover.energyChunk );
        _.pull( this.heatingElementEnergyChunkMovers, mover );
      }
    } );
  }

  /**
   * @param  {number} dt - time step, in seconds
   * @private
   */
  moveElectricalEnergyChunks( dt ) {
    const movers = _.clone( this.electricalEnergyChunkMovers );

    movers.forEach( mover => {
      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        // the electrical energy chunk has reached the burner, so it needs to change into thermal energy
        _.pull( this.electricalEnergyChunkMovers, mover );
        mover.energyChunk.energyTypeProperty.set( EnergyType.THERMAL );

        // have the thermal energy move a little on the element before moving into the beaker
        this.heatingElementEnergyChunkMovers.push( new EnergyChunkPathMover( mover.energyChunk,
          this.createHeaterElementEnergyChunkPath( mover.energyChunk.positionProperty.get() ),
          HEATING_ELEMENT_ENERGY_CHUNK_VELOCITY ) );
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
        const newEnergyChunk = new EnergyChunk(
          EnergyType.ELECTRICAL,
          this.positionProperty.get().plus( LEFT_SIDE_OF_WIRE_OFFSET ),
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );
        this.energyChunkList.push( newEnergyChunk );

        // add a "mover" that will move this energy chunk through the wire to the heating element
        this.electricalEnergyChunkMovers.push( new EnergyChunkPathMover( newEnergyChunk,
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
  }

  /**
   * remove all energy chunks
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunkMovers.length = 0;
    this.heatingElementEnergyChunkMovers.length = 0;
    this.radiatedEnergyChunkMovers.length = 0;
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