// Copyright 2016-2022, University of Colorado Boulder

/**
 * model of a bicycle being pedaled by a rider in order to generate energy
 *
 * @author John Blanco
 * @author Andrew Adare
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
import bicycleIcon_png from '../../../images/bicycleIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergySource from './EnergySource.js';

// constants
const MAX_ANGULAR_VELOCITY_OF_CRANK = 3 * Math.PI; // In radians/sec.
const ANGULAR_ACCELERATION = Math.PI / 2; // In radians/(sec^2).
const MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR = EFACConstants.MAX_ENERGY_PRODUCTION_RATE; // In joules / sec
const MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR / 5; // In joules / sec
const CRANK_TO_REAR_WHEEL_RATIO = 1;
const INITIAL_NUMBER_OF_ENERGY_CHUNKS = 21;
const MECHANICAL_TO_THERMAL_CHUNK_RATIO = 5;
const REAR_WHEEL_RADIUS = 0.021; // In meters, must be worked out with the image.
const NUMBER_OF_LEG_IMAGES = 18; // must match number of leg images in view

// offsets used for creating energy chunk paths and rotating images - these need to be coordinated with the images
const BIKER_BUTTOCKS_OFFSET = new Vector2( 0.02, 0.04 );
const TOP_TUBE_ABOVE_CRANK_OFFSET = new Vector2( 0.007, 0.015 );
const BIKE_CRANK_OFFSET = new Vector2( 0.0052, -0.002 );
const CENTER_OF_GEAR_OFFSET = new Vector2( 0.0058, -0.006 );
const CENTER_OF_BACK_WHEEL_OFFSET = new Vector2( 0.035, -0.01 );
const UPPER_CENTER_OF_BACK_WHEEL_OFFSET = new Vector2( 0.035, -0.006 ); // where the top chain meets the back wheel cassette
const TOP_TANGENT_OF_BACK_WHEEL_OFFSET = new Vector2( 0.024, 0.007 );
const NEXT_ENERGY_SYSTEM_OFFSET = new Vector2( 0.107, 0.066 );
const CHEMICAL_ENERGY_CHUNK_OFFSETS = [ BIKER_BUTTOCKS_OFFSET, TOP_TUBE_ABOVE_CRANK_OFFSET ];


class Biker extends EnergySource {

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {Property.<boolean>} mechanicalPoweredSystemIsNextProperty - is a compatible energy system currently active
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, mechanicalPoweredSystemIsNextProperty,
               energyChunkGroup, energyChunkPathMoverGroup,
               options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( bicycleIcon_png ), options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.cyclist;

    // @public (read-only) {NumberProperty}
    this.crankAngleProperty = new NumberProperty( 0, {
      range: new Range( 0, 2 * Math.PI ),
      units: 'radians',
      tandem: options.tandem.createTandem( 'crankAngleProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'angle of the crank arm on the bike'
    } );

    // @public (read-only) {NumberProperty}
    this.rearWheelAngleProperty = new NumberProperty( 0, {
      range: new Range( 0, 2 * Math.PI ),
      units: 'radians',
      tandem: options.tandem.createTandem( 'rearWheelAngleProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'angle of the rear wheel on the bike'
    } );

    // @public {NumberProperty}
    this.energyChunksRemainingProperty = new NumberProperty( INITIAL_NUMBER_OF_ENERGY_CHUNKS, {
      range: new Range( 0, INITIAL_NUMBER_OF_ENERGY_CHUNKS ),
      tandem: options.tandem.createTandem( 'energyChunksRemainingProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'number of energy chunks remaining in the biker\'s body'
    } );

    // @public (read-only) {NumberProperty}
    this.targetCrankAngularVelocityProperty = new NumberProperty( 0, {
      range: new Range( 0, MAX_ANGULAR_VELOCITY_OF_CRANK ),
      units: 'radians/s',
      tandem: options.tandem.createTandem( 'targetCrankAngularVelocityProperty' ),
      phetioDocumentation: 'target angular velocity of crank'
    } );

    // @public (read-only) {NumberProperty}
    this.crankAngularVelocityProperty = new NumberProperty( 0, {
      range: new Range( 0, MAX_ANGULAR_VELOCITY_OF_CRANK ),
      units: 'radians/s',
      tandem: options.tandem.createTandem( 'crankAngularVelocityProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'angular velocity of crank'
    } );

    // @private - internal variables
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.mechanicalPoweredSystemIsNextProperty = mechanicalPoweredSystemIsNextProperty;
    this.energyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );

    this.energyProducedSinceLastChunkEmitted = EFACConstants.ENERGY_PER_CHUNK * 0.9;
    this.mechanicalChunksSinceLastThermal = 0;

    // @private
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // monitor target rotation rate for validity
    if ( assert ) {
      this.targetCrankAngularVelocityProperty.link( omega => {
        assert && assert( omega >= 0 && omega <= MAX_ANGULAR_VELOCITY_OF_CRANK,
          `Angular velocity out of range: ${omega}` );
      } );
    }

    // get the crank into a position where animation will start right away
    this.setCrankToPoisedPosition();

    // add a handler for the situation when energy chunks were in transit to the next energy system and that system is
    // swapped out
    this.mechanicalPoweredSystemIsNextProperty.link( () => {

      // While setting PhET-iO state, make sure that if this Property changed, it doesn't cascade to changing the
      // placement of energyChunks/Movers.
      if ( phet.joist.sim.isSettingPhetioStateProperty.value ) {
        return;
      }

      const movers = this.energyChunkMovers.slice();
      const hubPosition = this.positionProperty.value.plus( CENTER_OF_BACK_WHEEL_OFFSET );

      movers.forEach( mover => {

        const energyChunk = mover.energyChunk;

        if ( energyChunk.energyTypeProperty.get() === EnergyType.MECHANICAL ) {
          if ( energyChunk.positionProperty.get().x > hubPosition.x ) {

            // remove this energy chunk
            this.energyChunkMovers.remove( mover );
            this.energyChunkList.remove( energyChunk );
            this.energyChunkGroup.disposeElement( energyChunk );
            this.energyChunkPathMoverGroup.disposeElement( mover );
          }
          else {

            // make sure that this energy chunk turns into thermal energy
            this.energyChunkMovers.remove( mover );
            this.energyChunkPathMoverGroup.disposeElement( mover );

            this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
              energyChunk,
              createMechanicalToThermalEnergyChunkPath( this.positionProperty.value, energyChunk.positionProperty.get() ),
              EFACConstants.ENERGY_CHUNK_VELOCITY
            ) );
          }
        }
      } );
    } );
  }

  /**
   * step this energy producer forward in time
   * @param  {number} dt - time step in seconds
   * @returns {Energy}
   * @public
   */
  step( dt ) {

    if ( !this.activeProperty.value ) {
      return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
    }

    // if there is no energy, the target speed is 0, otherwise it is the current set point
    const target = this.energyChunksRemainingProperty.value > 0 ? this.targetCrankAngularVelocityProperty.value : 0;

    // speed up or slow down the angular velocity of the crank
    const previousAngularVelocity = this.crankAngularVelocityProperty.value;

    const dOmega = target - this.crankAngularVelocityProperty.value;

    if ( dOmega !== 0 ) {
      const change = ANGULAR_ACCELERATION * dt;
      if ( dOmega > 0 ) {

        // accelerate
        this.crankAngularVelocityProperty.value = Math.min(
          this.crankAngularVelocityProperty.value + change,
          this.targetCrankAngularVelocityProperty.value
        );
      }
      else {

        // decelerate
        this.crankAngularVelocityProperty.value = Math.max( this.crankAngularVelocityProperty.value - change, 0 );
      }
    }

    const newAngle = ( this.crankAngleProperty.value + this.crankAngularVelocityProperty.value * dt ) % ( 2 * Math.PI );
    this.crankAngleProperty.set( newAngle );

    this.rearWheelAngleProperty.set(
      ( this.rearWheelAngleProperty.value +
        this.crankAngularVelocityProperty.value * dt * CRANK_TO_REAR_WHEEL_RATIO ) % ( 2 * Math.PI )
    );

    if ( this.crankAngularVelocityProperty.value === 0 && previousAngularVelocity !== 0 ) {

      // set crank to a good position where animation will start right away when motion is restarted
      this.setCrankToPoisedPosition();
    }

    const fractionalVelocity = this.crankAngularVelocityProperty.value / MAX_ANGULAR_VELOCITY_OF_CRANK;

    // determine how much energy is produced in this time step
    if ( this.targetCrankAngularVelocityProperty.value > 0 ) {

      // less energy is produced if not hooked up to generator
      let maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_RUNNING_FREE;
      if ( this.mechanicalPoweredSystemIsNextProperty.value ) {
        maxEnergyProductionRate = MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR;
      }
      this.energyProducedSinceLastChunkEmitted += maxEnergyProductionRate * fractionalVelocity * dt;
    }

    // decide if new chem energy chunk should start on its way
    if ( this.energyProducedSinceLastChunkEmitted >= EFACConstants.ENERGY_PER_CHUNK &&
         this.targetCrankAngularVelocityProperty.value > 0 ) {

      // start a new chunk moving
      const energyChunk = this.findNonMovingEnergyChunk();
      if ( energyChunk ) {
        this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
          energyChunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, CHEMICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY )
        );
        this.energyProducedSinceLastChunkEmitted = 0;

        // update by reading how many chunks remain in the biker's body
        this.energyChunksRemainingProperty.set( this.energyChunkList.length - this.energyChunkMovers.length );
      }
    }

    this.moveEnergyChunks( dt );

    const energyAmount = Math.abs( fractionalVelocity * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * dt );

    assert && assert( energyAmount >= 0, `energyAmount is ${energyAmount}` );

    return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
  }

  /**
   * moves energy chunks throughout the biker system and converts them to other energy types as needed
   *
   * @param {number} dt
   * @private
   */
  moveEnergyChunks( dt ) {

    // iterate through this copy while the original is mutated
    const movers = this.energyChunkMovers.slice();

    movers.forEach( mover => {

      mover.moveAlongPath( dt );

      if ( !mover.pathFullyTraversed ) {
        return;
      }

      const chunk = mover.energyChunk;

      // CHEMICAL --> MECHANICAL
      if ( chunk.energyTypeProperty.get() === EnergyType.CHEMICAL ) {

        // turn this into mechanical energy
        chunk.energyTypeProperty.set( EnergyType.MECHANICAL );
        this.energyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );

        // add new mover for the mechanical energy chunk
        if ( this.mechanicalChunksSinceLastThermal >= MECHANICAL_TO_THERMAL_CHUNK_RATIO ||
             !this.mechanicalPoweredSystemIsNextProperty.get() ) {

          // make this chunk travel to the rear hub, where it will become a chunk of thermal energy
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
            createMechanicalToThermalEnergyChunkPath( this.positionProperty.value, chunk.positionProperty.get() ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
          this.mechanicalChunksSinceLastThermal = 0;
        }
        else {
          const mechanicalEnergyChunkOffsets = [
            BIKE_CRANK_OFFSET,
            UPPER_CENTER_OF_BACK_WHEEL_OFFSET,
            TOP_TANGENT_OF_BACK_WHEEL_OFFSET,
            NEXT_ENERGY_SYSTEM_OFFSET
          ];

          // send this chunk to the next energy system
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), mechanicalEnergyChunkOffsets ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
          this.mechanicalChunksSinceLastThermal++;
        }
      }

      // MECHANICAL --> THERMAL
      else if ( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL &&
                chunk.positionProperty.get().distance( this.positionProperty.value.plus( CENTER_OF_BACK_WHEEL_OFFSET ) ) < 1E-6 ) {

        // this is a mechanical energy chunk that has traveled to the hub and should now become thermal energy
        this.energyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );

        chunk.energyTypeProperty.set( EnergyType.THERMAL );
        this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
          EnergyChunkPathMover.createRadiatedPath( this.positionProperty.value.plus( CENTER_OF_BACK_WHEEL_OFFSET ), Math.PI * -0.1 ),
          EFACConstants.ENERGY_CHUNK_VELOCITY )
        );
      }

      // THERMAL
      else if ( chunk.energyTypeProperty.get() === EnergyType.THERMAL ) {

        // this is a radiating thermal energy chunk that has reached the end of its route - delete it
        this.energyChunkMovers.remove( mover );
        this.energyChunkList.remove( chunk );
        this.energyChunkGroup.disposeElement( chunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }

      // MECHANICAL
      else {

        // must be mechanical energy that is being passed to the next energy system element
        this.energyChunkList.remove( chunk );
        this.outgoingEnergyChunks.push( chunk );
        this.energyChunkMovers.remove( mover );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * @public
   * @override
   */
  preloadEnergyChunks() {

    // if we're not supposed to have any chunks, clear any existing ones out of the biker. this is needed for stateSet,
    // see https://github.com/phetsims/energy-forms-and-changes/issues/335
    if ( this.energyChunksRemainingProperty.value === 0 ) {
      this.clearEnergyChunks();
    }

    // Return if biker is not pedaling, or is out of energy, or is not hooked up to a compatible system
    if ( this.crankAngularVelocityProperty.value === 0 ||
         this.energyChunksRemainingProperty.value === 0 ||
         !this.mechanicalPoweredSystemIsNextProperty.value ) {
      return;
    }

    this.replenishBikerEnergyChunks();
    let preloadComplete = false;
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
    const fractionalVelocity = this.crankAngularVelocityProperty.value / MAX_ANGULAR_VELOCITY_OF_CRANK;

    // Simulate energy chunks moving through the system.
    while ( !preloadComplete ) {

      if ( this.outgoingEnergyChunks.length > 0 ) {

        // An energy chunk has traversed to the output of this system, completing the preload. If enough chunks are
        // already in the biker system, then we may not need to preload any, either, so check this condition before
        // adding the first pre-loaded chunk.
        preloadComplete = true;
        break;
      }

      energySinceLastChunk += MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR * fractionalVelocity * dt;

      // decide if new chem energy chunk should start on its way
      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {

        // we know the biker is not out of energy, so get one of the remaining chunks
        const energyChunk = this.findNonMovingEnergyChunk();
        this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
          energyChunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, CHEMICAL_ENERGY_CHUNK_OFFSETS ),
          EFACConstants.ENERGY_CHUNK_VELOCITY )
        );
        energySinceLastChunk = 0;

        // add back what we just took from the biker's energy, since we want to preserve the biker's energy state.
        this.addEnergyChunkToBiker();
      }

      // Update energy chunk positions.
      this.moveEnergyChunks( dt );
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    const amount = Math.abs(
      this.crankAngularVelocityProperty.value / MAX_ANGULAR_VELOCITY_OF_CRANK * MAX_ENERGY_OUTPUT_WHEN_CONNECTED_TO_GENERATOR
    );
    return new Energy( EnergyType.MECHANICAL, amount, -Math.PI / 2 );
  }

  /**
   * Set the crank to a position where a very small amount of motion will cause a new image to be chosen.  This is
   * generally done when the biker stops so that the animation starts right away the next time the motion starts.
   * @private
   */
  setCrankToPoisedPosition() {
    const currentIndex = this.mapAngleToImageIndex( this.crankAngleProperty.value );
    const radiansPerImage = 2 * Math.PI / NUMBER_OF_LEG_IMAGES;
    this.crankAngleProperty.set( ( currentIndex % NUMBER_OF_LEG_IMAGES * radiansPerImage + ( radiansPerImage - 1E-7 ) ) );
    assert && assert( this.crankAngleProperty.value >= 0 && this.crankAngleProperty.value <= 2 * Math.PI );
  }

  /**
   * The biker is replenished each time she is reactivated. This was a fairly arbitrary decision, and can be changed
   * if desired.
   * @public
   * @override
   */
  activate() {
    super.activate();
    this.replenishBikerEnergyChunks();
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.targetCrankAngularVelocityProperty.reset();
    this.energyChunksRemainingProperty.reset();
    this.rearWheelAngleProperty.reset();
    this.crankAngularVelocityProperty.value = this.targetCrankAngularVelocityProperty.value;
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.energyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.energyChunkMovers.clear();
  }

  /**
   * adds the current number of energy chunks remaining to the biker
   * @param {boolean} [clearEnergyChunks] - whether to clear the existing chunks out of the biker before adding them
   * back.
   * @public
   */
  replenishBikerEnergyChunks( clearEnergyChunks = true ) {
    clearEnergyChunks && this.clearEnergyChunks();
    for ( let i = 0; i < this.energyChunksRemainingProperty.value; i++ ) {
      this.addEnergyChunkToBiker();
    }
  }

  /**
   * add one energy chunk to biker
   * @public
   */
  addEnergyChunkToBiker() {
    const nominalInitialOffset = new Vector2( 0.019, 0.055 );
    const displacement = new Vector2( ( dotRandom.nextDouble() - 0.5 ) * 0.02, 0 ).rotated( Math.PI * 0.7 );
    const position = this.positionProperty.value.plus( nominalInitialOffset ).plus( displacement );

    const newEnergyChunk = this.energyChunkGroup.createNextElement(
      EnergyType.CHEMICAL,
      position,
      Vector2.ZERO,
      this.energyChunksVisibleProperty
    );

    this.energyChunkList.add( newEnergyChunk );
  }

  /**
   * find the image index corresponding to this angle in radians
   * @param  {number} angle
   * @returns {number} - image index
   * @public
   */
  mapAngleToImageIndex( angle ) {
    const i = Math.floor( ( angle % ( 2 * Math.PI ) ) / ( 2 * Math.PI / NUMBER_OF_LEG_IMAGES ) );
    assert && assert( i >= 0 && i < NUMBER_OF_LEG_IMAGES );
    return i;
  }

  /**
   * find a non-moving CHEMICAL energy chunk, returns null if none are found
   * @returns {EnergyChunk}
   * @private
   */
  findNonMovingEnergyChunk() {
    const movingEnergyChunks = [];
    let nonMovingEnergyChunk = null;

    this.energyChunkMovers.forEach( mover => {
      movingEnergyChunks.push( mover.energyChunk );
    } );

    this.energyChunkList.forEach( chunk => {

      // only interested in CHEMICAL energy chunks that are not moving
      if ( chunk.energyTypeProperty.value === EnergyType.CHEMICAL && movingEnergyChunks.indexOf( chunk ) === -1 ) {
        nonMovingEnergyChunk = chunk;
      }
    } );
    return nonMovingEnergyChunk;
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      energyProducedSinceLastChunkEmitted: this.energyProducedSinceLastChunkEmitted,
      mechanicalChunksSinceLastThermal: this.mechanicalChunksSinceLastThermal
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState( stateObject ) {
    this.energyProducedSinceLastChunkEmitted = stateObject.energyProducedSinceLastChunkEmitted;
    this.mechanicalChunksSinceLastThermal = stateObject.mechanicalChunksSinceLastThermal;
  }
}

/**
 * creates a path for an energy chunk that will travel to the hub and then become thermal
 *
 * @param  {Vector2} centerPosition
 * @param  {Vector2} currentPosition
 * @returns {Vector2[]}
 * @private
 */
const createMechanicalToThermalEnergyChunkPath = ( centerPosition, currentPosition ) => {
  const path = [];
  const crankPosition = centerPosition.plus( BIKE_CRANK_OFFSET );
  if ( currentPosition.y > crankPosition.y ) {

    // only add the crank position if the current position indicates that the chunk hasn't reached the crank yet
    path.push( centerPosition.plus( BIKE_CRANK_OFFSET ) );
  }
  path.push( centerPosition.plus( CENTER_OF_BACK_WHEEL_OFFSET ) );
  return path;
};

// statics
Biker.CENTER_OF_GEAR_OFFSET = CENTER_OF_GEAR_OFFSET;
Biker.CENTER_OF_BACK_WHEEL_OFFSET = CENTER_OF_BACK_WHEEL_OFFSET;
Biker.INITIAL_NUMBER_OF_ENERGY_CHUNKS = INITIAL_NUMBER_OF_ENERGY_CHUNKS;
Biker.MAX_ANGULAR_VELOCITY_OF_CRANK = MAX_ANGULAR_VELOCITY_OF_CRANK;
Biker.NUMBER_OF_LEG_IMAGES = NUMBER_OF_LEG_IMAGES;
Biker.REAR_WHEEL_RADIUS = REAR_WHEEL_RADIUS;

energyFormsAndChanges.register( 'Biker', Biker );
export default Biker;