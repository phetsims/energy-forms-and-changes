// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type that models an electrical generator in an energy system
 *
 * @author John Blanco
 * @author Andrew Adare
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import generatorIcon_png from '../../../images/generatorIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyConverter from './EnergyConverter.js';

// constants

// attributes of the wheel and generator
const WHEEL_MOMENT_OF_INERTIA = 5; // In kg.
const RESISTANCE_CONSTANT = 3; // Controls max speed and rate of slow down, empirically determined.
const MAX_ROTATIONAL_VELOCITY = Math.PI / 2; // In radians/sec, empirically determined.
const WHEEL_RADIUS = 0.039; // half the width of the wheel image, need this precision for proper visual
const WHEEL_CENTER_OFFSET = new Vector2( 0, 0.03 );
const LEFT_SIDE_OF_WHEEL_OFFSET = new Vector2( -0.03, 0.03 );

// offsets used to create the paths followed by the energy chunks
const START_OF_WIRE_CURVE_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.011, -0.050 );
const WIRE_CURVE_POINT_1_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.012, -0.055 );
const WIRE_CURVE_POINT_2_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.015, -0.061 );
const WIRE_CURVE_POINT_3_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.021, -0.066 );
const WIRE_CURVE_POINT_4_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.024, -0.068 );
const WIRE_CURVE_POINT_5_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.030, -0.0705 );
const CENTER_OF_CONNECTOR_OFFSET = WHEEL_CENTER_OFFSET.plusXY( 0.057, -0.071 );

class Generator extends EnergyConverter {

  /**
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {EnergyChunkPathMoverGroup} energyChunkPathMoverGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, energyChunkGroup, energyChunkPathMoverGroup, options ) {
    options = merge( {
      tandem: Tandem.REQUIRED,
      phetioState: false // no internal fields to convey in state
    }, options );

    super( new Image( generatorIcon_png ), options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.electricalGenerator;

    // @private {BooleanProperty}
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    // @public (read-only) {NumberProperty}
    this.wheelRotationalAngleProperty = new NumberProperty( 0, {
      range: new Range( 0, 2 * Math.PI ),
      units: 'radians',
      tandem: options.tandem.createTandem( 'wheelRotationalAngleProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angle of the wheel'
    } );

    // @public {BooleanProperty}
    this.directCouplingModeProperty = new BooleanProperty( false, {
      tandem: options.tandem.createTandem( 'directCouplingModeProperty' ),
      phetioReadOnly: true,
      phetioDocumentation: 'whether the wheel is in "direct coupling mode", meaning the generator wheel turns at a ' +
                           'rate that is directly proportional to the incoming energy, with no rotational inertia. ' +
                           'true when the generator is paired with the biker.'
    } );

    // @private
    this.wheelRotationalVelocityProperty = new NumberProperty( 0, {
      units: 'radians/s',
      tandem: options.tandem.createTandem( 'wheelRotationalVelocityProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'the angular velocity of the wheel'
    } );
    this.energyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkMovers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );

    // @public (read-only) {ObservableArrayDef.<EnergyChunk} - The electrical energy chunks are kept on a separate list to
    // support placing them on a different layer in the view.
    this.electricalEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'electricalEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    // // @public (read-only) {ObservableArrayDef.<EnergyChunk} - the "hidden" energy chunks are kept on a separate list
    // mainly for code clarity
    this.hiddenEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'hiddenEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );
  }

  /**
   * Factored from this.step
   * @param {number} dt time step in seconds
   * @param {Energy} incomingEnergy
   * @private
   */
  spinGeneratorWheel( dt, incomingEnergy ) {
    if ( !this.activeProperty.value ) {
      return;
    }

    // positive is counter clockwise
    const sign = Math.sin( incomingEnergy.direction ) > 0 ? -1 : 1;

    // handle different wheel rotation modes
    if ( this.directCouplingModeProperty.value ) {

      // treat the wheel as though it is directly coupled to the energy source, e.g. through a belt or drive shaft
      if ( incomingEnergy.type === EnergyType.MECHANICAL ) {
        const energyFraction = ( incomingEnergy.amount / dt ) / EFACConstants.MAX_ENERGY_PRODUCTION_RATE;
        this.wheelRotationalVelocityProperty.value = energyFraction * MAX_ROTATIONAL_VELOCITY * sign;
        this.wheelRotationalAngleProperty.set(
          calculateWheelAngle( this.wheelRotationalAngleProperty.value, this.wheelRotationalVelocityProperty.value, dt )
        );
      }

    }
    else {

      // treat the wheel like it is being moved from an external energy, such as water, and has inertia
      let torqueFromIncomingEnergy = 0;

      // empirically determined to reach max energy after a second or two
      const energyToTorqueConstant = 0.5;

      if ( incomingEnergy.type === EnergyType.MECHANICAL ) {
        torqueFromIncomingEnergy = incomingEnergy.amount * WHEEL_RADIUS * energyToTorqueConstant * sign;
      }

      const torqueFromResistance = -this.wheelRotationalVelocityProperty.value * RESISTANCE_CONSTANT;
      const angularAcceleration = ( torqueFromIncomingEnergy + torqueFromResistance ) / WHEEL_MOMENT_OF_INERTIA;
      const newAngularVelocity = this.wheelRotationalVelocityProperty.value + ( angularAcceleration * dt );
      this.wheelRotationalVelocityProperty.value = Utils.clamp(
        newAngularVelocity,
        -MAX_ROTATIONAL_VELOCITY,
        MAX_ROTATIONAL_VELOCITY
      );

      if ( Math.abs( this.wheelRotationalVelocityProperty.value ) < 1E-3 ) {

        // prevent the wheel from moving forever
        this.wheelRotationalVelocityProperty.value = 0;
      }
      this.wheelRotationalAngleProperty.set(
        calculateWheelAngle( this.wheelRotationalAngleProperty.value, this.wheelRotationalVelocityProperty.value, dt )
      );
    }
  }

  /**
   * step this model element in time
   * @param {number} dt time step
   * @param {Energy} incomingEnergy
   * @returns {Energy}
   * @public
   */
  step( dt, incomingEnergy ) {
    if ( this.activeProperty.value ) {

      this.spinGeneratorWheel( dt, incomingEnergy );

      // handle any incoming energy chunks
      if ( this.incomingEnergyChunks.length > 0 ) {
        this.incomingEnergyChunks.forEach( chunk => {

          // validate energy type
          assert && assert( chunk.energyTypeProperty.get() === EnergyType.MECHANICAL,
            `EnergyType of incoming chunk expected to be of type MECHANICAL, but has type ${chunk.energyTypeProperty.get()}`
          );

          // transfer chunk from incoming list to current list
          this.energyChunkList.push( chunk );

          // add a "mover" that will move this energy chunk to the center of the wheel
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( chunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, [ WHEEL_CENTER_OFFSET ] ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
        } );

        this.incomingEnergyChunks.clear();
      }

      // move the energy chunks and update their state
      this.updateEnergyChunkPositions( dt );

    } // this.active

    // produce the appropriate amount of energy
    const speedFraction = this.wheelRotationalVelocityProperty.value / MAX_ROTATIONAL_VELOCITY;
    const energy = Math.abs( speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE ) * dt;
    return new Energy( EnergyType.ELECTRICAL, energy, 0 );
  }

  /**
   * @param {number} dt - time step, in seconds
   * @returns {Energy}
   * @private
   */
  updateEnergyChunkPositions( dt ) {
    const chunkMovers = this.energyChunkMovers.slice();

    chunkMovers.forEach( mover => {

      mover.moveAlongPath( dt );

      if ( !mover.pathFullyTraversed ) {
        return;
      }

      const chunk = mover.energyChunk;
      switch( chunk.energyTypeProperty.get() ) {
        case EnergyType.MECHANICAL: {

          const electricalEnergyChunkOffsets = [
            START_OF_WIRE_CURVE_OFFSET,
            WIRE_CURVE_POINT_1_OFFSET,
            WIRE_CURVE_POINT_2_OFFSET,
            WIRE_CURVE_POINT_3_OFFSET,
            WIRE_CURVE_POINT_4_OFFSET,
            WIRE_CURVE_POINT_5_OFFSET,
            CENTER_OF_CONNECTOR_OFFSET
          ];

          // This mechanical energy chunk has traveled to the end of its path, so change it to electrical and send it
          // on its way.  Also add a "hidden" chunk so that the movement through the generator can be seen by the
          // user.
          this.energyChunkList.remove( chunk );
          this.energyChunkMovers.remove( mover );

          chunk.energyTypeProperty.set( EnergyType.ELECTRICAL );
          this.electricalEnergyChunks.push( chunk );
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( mover.energyChunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, electricalEnergyChunkOffsets ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );
          const hiddenChunk = this.energyChunkGroup.createNextElement(
            EnergyType.HIDDEN,
            chunk.positionProperty.get(),
            Vector2.ZERO,
            this.energyChunksVisibleProperty
          );
          hiddenChunk.zPositionProperty.set( -EnergyChunkNode.Z_DISTANCE_WHERE_FULLY_FADED / 2 );
          this.hiddenEnergyChunks.push( hiddenChunk );
          const hiddenEnergyChunkOffsets = [ START_OF_WIRE_CURVE_OFFSET, WIRE_CURVE_POINT_1_OFFSET ];
          this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( hiddenChunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, hiddenEnergyChunkOffsets ),
            EFACConstants.ENERGY_CHUNK_VELOCITY )
          );

          this.energyChunkPathMoverGroup.disposeElement( mover );

          break;
        }
        case EnergyType.ELECTRICAL:

          // This electrical energy chunk has traveled to the end of its path, so transfer it to the next energy
          // system.
          this.energyChunkMovers.remove( mover );
          this.electricalEnergyChunks.remove( chunk );
          this.outgoingEnergyChunks.push( chunk );
          this.energyChunkPathMoverGroup.disposeElement( mover );

          break;
        case EnergyType.HIDDEN:

          // This hidden energy chunk has traveled to the end of its path, so just remove it, because the electrical
          // energy chunk to which is corresponds should now be visible to the user.
          this.hiddenEnergyChunks.remove( chunk );
          this.energyChunkMovers.remove( mover );
          this.energyChunkGroup.disposeElement( chunk );
          this.energyChunkPathMoverGroup.disposeElement( mover );

          break;
        default:
          assert && assert( false, 'Unrecognized EnergyType: ', chunk.energyTypeProperty.get() );
      }
    } );
  }

  /**
   * @param {Energy} incomingEnergy
   * @public
   * @override
   */
  preloadEnergyChunks( incomingEnergy ) {

    // in most system elements, we clear energy chunks before checking if incomingEnergy.amount === 0, but since the
    // generator wheel has rotational inertia, we leave the remaining chunks on their way, which looks more accurate.
    if ( incomingEnergy.amount === 0 || incomingEnergy.type !== EnergyType.MECHANICAL ) {

      // no energy chunk pre-loading needed
      return;
    }
    this.clearEnergyChunks();

    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
    let preloadComplete = false;

    // skip every other visual chunk to match the usual rate of chunks flowing through the generator. this is needed
    // because there is visual energy chunk loss (e.g. every other chunks from the faucet comes into the generator,
    // but the actual incoming energy is constant so that the generator wheel spins at a constant speed). so, since
    // more energy is being converted than visually shown, we need to stay consistent with that practice here and only
    // preload chunks for half as much energy that is incoming
    let skipThisChunk = true;

    // simulate energy chunks moving through the system
    while ( !preloadComplete ) {
      energySinceLastChunk += incomingEnergy.amount * dt;

      // determine if time to add a new chunk
      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK && !skipThisChunk ) {
        const newChunk = this.energyChunkGroup.createNextElement(
          EnergyType.MECHANICAL,
          this.positionProperty.value.plus( LEFT_SIDE_OF_WHEEL_OFFSET ),
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );

        this.energyChunkList.push( newChunk );

        // add a 'mover' for this energy chunk
        this.energyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( newChunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, [ WHEEL_CENTER_OFFSET ] ),
          EFACConstants.ENERGY_CHUNK_VELOCITY )
        );

        // update energy since last chunk
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        skipThisChunk = true;
      }
      else if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
        energySinceLastChunk = energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        skipThisChunk = false;
      }

      this.updateEnergyChunkPositions( dt );

      if ( this.outgoingEnergyChunks.length > 0 ) {

        // an energy chunk has made it all the way through the system
        preloadComplete = true;
      }
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    const speedFraction = this.wheelRotationalVelocityProperty.value / MAX_ROTATIONAL_VELOCITY;
    const energy = Math.abs( speedFraction * EFACConstants.MAX_ENERGY_PRODUCTION_RATE );
    return new Energy( EnergyType.ELECTRICAL, energy, 0 );
  }

  /**
   * deactivate the generator
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.wheelRotationalVelocityProperty.reset();
    this.wheelRotationalAngleProperty.reset();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.electricalEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.electricalEnergyChunks.clear();
    this.hiddenEnergyChunks.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.hiddenEnergyChunks.clear();
    this.energyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.energyChunkMovers.clear();
  }

  /**
   * @public
   * @override
   */
  extractOutgoingEnergyChunks() {
    const chunks = this.outgoingEnergyChunks.slice();

    const chunksToRemove = chunks.filter( energyChunk => this.electricalEnergyChunks.includes( energyChunk ) );

    // Remove outgoing chunks from electrical energy chunks list
    this.electricalEnergyChunks.removeAll( chunksToRemove );
    this.outgoingEnergyChunks.clear();

    return chunks;
  }
}

/**
 * calculates the angle of the wheel for the current time step. this supports both positive and negative velocity, so
 * that regardless of which direction the wheel is spinning, its angle values are constrained between 0 and 2pi.
 *
 * @param wheelRotationalAngle
 * @param wheelRotationalVelocity
 * @param dt
 * @returns {number}
 */
const calculateWheelAngle = ( wheelRotationalAngle, wheelRotationalVelocity, dt ) => {
  const twoPi = 2 * Math.PI;
  const newAngle = ( wheelRotationalAngle + wheelRotationalVelocity * dt ) % twoPi;
  return newAngle < 0 ? twoPi + newAngle : newAngle;
};

// statics
Generator.WHEEL_CENTER_OFFSET = WHEEL_CENTER_OFFSET;
Generator.WHEEL_RADIUS = WHEEL_RADIUS;

energyFormsAndChanges.register( 'Generator', Generator );
export default Generator;