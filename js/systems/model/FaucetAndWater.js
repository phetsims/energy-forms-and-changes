// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type that represents a faucet that can be turned on to provide mechanical energy to other energy system elements
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import faucetIcon_png from '../../../images/faucetIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergySource from './EnergySource.js';
import WaterDrop from './WaterDrop.js';


// constants
const FALLING_ENERGY_CHUNK_VELOCITY = 0.09; // in meters/second
const MAX_WATER_WIDTH = 0.014; // in meters
const MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER = 0.5; // in meters
const WATER_DROPS_PER_SECOND = 30;
const WATER_DROP_CREATION_PERIOD = 1 / WATER_DROPS_PER_SECOND; // in seconds
const ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range( 0.07, 0.08 );
const FALLING_WATER_DELAY = 0.4; // time to pass before wheel starts turning after faucet starts, in seconds
const DT = 1 / EFACConstants.FRAMES_PER_SECOND; // artificial time step, in seconds

// where the water and energy chunks originate inside the faucet head, not where they emerge from the faucet
const OFFSET_FROM_CENTER_TO_WATER_ORIGIN = new Vector2( 0.069, 0.105 );

// center-x, bottom-y of the faucet head - where the water and energy chunks emerge from
const OFFSET_FROM_CENTER_TO_FAUCET_HEAD = OFFSET_FROM_CENTER_TO_WATER_ORIGIN.plusXY( 0, -0.022 );

// The following acceleration constant defines the rate at which the water flows from the faucet.  The value used is
// not the actual value in Earth's gravitational field - it has been tweaked for optimal visual effect.
const ACCELERATION_DUE_TO_GRAVITY = new Vector2( 0, -0.15 );

class FaucetAndWater extends EnergySource {

  /**
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {BooleanProperty} waterPowerableElementInPlaceProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor( energyChunksVisibleProperty, waterPowerableElementInPlaceProperty, energyChunkGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( faucetIcon_png ), options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.waterFaucet;

    // @private
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    // @private {BooleanProperty} - a flag that is used to decide whether to pass energy chunks to the next energy
    // system element
    this.waterPowerableElementInPlaceProperty = waterPowerableElementInPlaceProperty;

    // @public {NumberProperty}
    this.flowProportionProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: options.tandem.createTandem( 'flowProportionProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true,
      phetioDocumentation: 'proportion of water flowing from the faucet'
    } );

    // @public {read-only) {WaterDrop[]} - water drops that comprise the stream of water
    this.waterDrops = [];

    // @private {EnergyChunks[]} - list of chunks that are exempt from being transferred to the next energy system element
    this.exemptFromTransferEnergyChunks = createObservableArray( {
      tandem: options.tandem.createTandem( 'exemptFromTransferEnergyChunks' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    assert && this.outgoingEnergyChunks.addItemAddedListener( chunk => {
      assert && assert( !this.exemptFromTransferEnergyChunks.includes( chunk ), 'Exempt means it should not go onto outgoing list' );
    } );

    // @private {Energy[]} - list of Energy to be sent after a delay has passed
    this.flowEnergyDelay = [];

    // @private {number}
    this.energySinceLastChunk = 0;

    // @private {number}
    this.timeSinceLastDropCreation = 0;

    // @private {boolean} - flag for whether next chunk should be transferred or kept, used to alternate transfer with
    // non-transfer
    this.transferNextAvailableChunk = true;

    // @private {boolean} - flag for whether the water drops have been fully preloaded
    this.waterDropsPreloaded = true;

    // @private {EnergyChunkGroup}
    this.energyChunkGroup = energyChunkGroup;

    this.flowProportionProperty.lazyLink( ( newFlowRate, oldFlowRate ) => {

      // Prime the pump when the flow goes from zero to above zero so that water starts flowing right away.
      if ( oldFlowRate === 0 && newFlowRate > 0 ) {
        this.timeSinceLastDropCreation = WATER_DROP_CREATION_PERIOD;
      }
    } );

    // Preload falling water animation after state has been set
    Tandem.PHET_IO_ENABLED && phet.phetio.phetioEngine.phetioStateEngine.stateSetEmitter.addListener( () => {
      this.preloadWaterDrops();
    } );
  }

  /**
   * create a new energy chunk with the appropriate attributes for falling water
   * @returns {EnergyChunk}
   * @private
   */
  createNewChunk() {

    // random x value within water column for "watery" appearance
    const x = ( dotRandom.nextDouble() - 0.5 ) * this.flowProportionProperty.value * MAX_WATER_WIDTH / 2;

    const initialPosition = this.positionProperty.value
      .plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN )
      .plus( new Vector2( x, 0 ) );

    const velocity = new Vector2( 0, -FALLING_ENERGY_CHUNK_VELOCITY );

    return this.energyChunkGroup.createNextElement( EnergyType.MECHANICAL, initialPosition, velocity, this.energyChunksVisibleProperty );
  }

  /**
   * if enough energy has been produced since the last energy chunk was emitted, release another one into the system
   *
   * @private
   */
  addChunkIfEnoughEnergy() {
    if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
      const chunk = this.createNewChunk();
      this.energyChunkList.push( chunk );
      this.energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
    }
  }

  /**
   * step in time
   * @param  {number} dt time step, in seconds
   * @returns {Energy}
   * @public
   */
  step( dt ) {

    if ( !this.activeProperty.value ) {
      return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
    }

    this.stepWaterDrops( dt );

    // check if time to emit an energy chunk and, if so, do it
    this.energySinceLastChunk += EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;
    this.addChunkIfEnoughEnergy();

    // update energy chunk positions
    this.energyChunkList.forEach( chunk => {

      // make the chunk fall
      chunk.translateBasedOnVelocity( dt );

      // see if chunk is in the position where it can be transferred to the next energy system
      const yPosition = this.positionProperty.get().plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).y -
                        chunk.positionProperty.value.y;
      const chunkInRange = ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( yPosition );
      const chunkExempt = this.exemptFromTransferEnergyChunks.indexOf( chunk ) >= 0;

      if ( this.waterPowerableElementInPlaceProperty.value && chunkInRange && !chunkExempt ) {
        if ( this.transferNextAvailableChunk ) {

          // send this chunk to the next energy system
          this.energyChunkList.remove( chunk );
          this.outgoingEnergyChunks.push( chunk );

          // alternate sending or keeping chunks
          this.transferNextAvailableChunk = false;
        }
        else {

          // don't transfer this chunk
          this.exemptFromTransferEnergyChunks.push( chunk );

          // set up to transfer the next one
          this.transferNextAvailableChunk = true;
        }
      }

      // remove the energy chunk if it is out of visible range
      const chunkDistance = this.positionProperty.get()
        .plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).distance( chunk.positionProperty.value );
      if ( chunkDistance > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
        this.energyChunkList.remove( chunk );
        this.exemptFromTransferEnergyChunks.remove( chunk );
        this.energyChunkGroup.disposeElement( chunk );
      }
    } );

    // generate the appropriate amount of energy
    const energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;

    // add incoming energy to delay queue
    this.flowEnergyDelay.push( new Energy(
      EnergyType.MECHANICAL,
      energyAmount,
      -Math.PI / 2,
      { creationTime: new Date().getTime() } )
    );

    // send along saved energy values if enough time has passed
    if ( this.flowEnergyDelay[ 0 ].creationTime + FALLING_WATER_DELAY * 1000 <= new Date().getTime() ) {
      return this.flowEnergyDelay.shift();
    }
    else {
      return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
    }
  }

  /**
   * steps only the water drops
   * @param {number} dt
   * @private
   */
  stepWaterDrops( dt ) {

    // make the existing water droplets fall
    this.waterDrops.forEach( drop => {
      const v = drop.velocityProperty.value;
      drop.velocityProperty.set( v.plus( ACCELERATION_DUE_TO_GRAVITY.times( dt ) ) );
      drop.position.set( drop.position.plus( v.times( dt ) ) );
    } );

    // add new water droplets as needed based on flow rate
    if ( this.flowProportionProperty.value > 0 ) {

      this.timeSinceLastDropCreation += dt;

      while ( this.timeSinceLastDropCreation >= WATER_DROP_CREATION_PERIOD ) {

        const dropTime = this.timeSinceLastDropCreation - WATER_DROP_CREATION_PERIOD;

        // Create a new water drop of somewhat random size and position it based on the time since the last one.
        const initialPosition = new Vector2(
          0,
          0.5 * ACCELERATION_DUE_TO_GRAVITY.y * dropTime * dropTime
        );
        const initialWidth = this.flowProportionProperty.value * MAX_WATER_WIDTH *
                             ( 1 + ( dotRandom.nextDouble() - 0.5 ) * 0.2 );
        const initialSize = new Dimension2( initialWidth, initialWidth );
        this.waterDrops.push( new WaterDrop(
          initialPosition,
          new Vector2( 0, ACCELERATION_DUE_TO_GRAVITY.y * dropTime ),
          initialSize
        ) );

        this.timeSinceLastDropCreation -= WATER_DROP_CREATION_PERIOD;
      }
    }
    else {
      this.waterDropsPreloaded = true;
    }

    // remove drops that have run their course
    const waterDropsCopy = this.waterDrops;
    waterDropsCopy.forEach( drop => {
      if ( drop.position.distance( this.positionProperty.value ) > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
        const index = this.waterDrops.indexOf( drop );
        if ( index !== -1 ) {
          this.waterDrops.splice( index, 1 );
          this.waterDropsPreloaded = true;
        }
      }
    } );
  }

  /**
   * @public
   * @override
   */
  preloadEnergyChunks() {
    this.clearEnergyChunks();

    // define translation function here to avoid creating anonymous function inside loop
    const translateChunks = ( chunks, dt ) => {
      chunks.forEach( chunk => {
        chunk.translateBasedOnVelocity( dt );
      } );
    };

    let preloadTime = 3; // In seconds, empirically determined.

    let tempEnergyChunkList = [];

    if ( this.getEnergyOutputRate().amount > 0 ) {

      // preload energy chunks into the system
      while ( preloadTime > 0 ) {
        this.energySinceLastChunk += this.getEnergyOutputRate().amount * DT;
        if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          tempEnergyChunkList.push( this.createNewChunk() );
          this.energySinceLastChunk = this.energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        // make the chunks fall
        translateChunks( tempEnergyChunkList, DT );

        preloadTime -= DT;
      }

      // Now that the new chunks are in place, make sure that there is actually water falling where the chunks ended up
      // and, if not, remove them.  This is a rare but possible case that can occur when preloading right after turning
      // on the faucet.  For more on this, please see https://github.com/phetsims/energy-forms-and-changes/issues/347.
      tempEnergyChunkList = tempEnergyChunkList.filter( ec => {
        const yOffsetForWaterDrops = this.positionProperty.value.y + OFFSET_FROM_CENTER_TO_WATER_ORIGIN.y;
        let verticalDistanceToNearestWaterDrop = Number.POSITIVE_INFINITY;
        this.waterDrops.forEach( waterDrop => {
          const verticalDistanceToWaterDrop =
            Math.abs( ( waterDrop.position.y + yOffsetForWaterDrops ) - ec.positionProperty.value.y );
          if ( verticalDistanceToWaterDrop < verticalDistanceToNearestWaterDrop ) {
            verticalDistanceToNearestWaterDrop = verticalDistanceToWaterDrop;
          }
        } );
        return verticalDistanceToNearestWaterDrop < 0.01; // distance threshold empirically determined
      } );
    }
    else if ( this.waterDrops.length > 0 ) {

      // The faucet is off, but water is present, so we must be preloading energy chunks just after the faucet was
      // turned off, which means we need to add energy chunks to the following water.  This is a rare but possible
      // condition.  For more info as to why this is needed, see
      // https://github.com/phetsims/energy-forms-and-changes/issues/347.

      // the top of the water column will be where the last drop is
      const topWaterDrop = this.waterDrops[ this.waterDrops.length - 1 ];

      // the bottom drop is the first one
      const bottomWaterDrop = this.waterDrops[ 0 ];

      // Figure out how many energy chunks to add based on the size of the stream of water droplets.  This calculation
      // was empirically determined so that the number of energy chunks roughly matches what there are when the faucet
      // is running at full output.
      const waterColumnDistanceSpan = topWaterDrop.position.y - bottomWaterDrop.position.y;
      const numberOfChunksToAdd = Utils.roundSymmetric( waterColumnDistanceSpan / 0.05 );
      const distanceBetweenChunks = waterColumnDistanceSpan / numberOfChunksToAdd;

      // add the energy chunks and position them along the stream of water droplets
      _.times( numberOfChunksToAdd, index => {

        // create a new energy chunk
        const ec = this.createNewChunk();
        tempEnergyChunkList.push( ec );

        // position the new energy chunk on the water stream
        ec.positionProperty.set(
          ec.positionProperty.value.plusXY( 0, topWaterDrop.position.y - distanceBetweenChunks * index )
        );
      } );
    }

    // now that they are positioned, add these to the 'real' list of energy chunks
    tempEnergyChunkList.forEach( ec => {
      this.energyChunkList.push( ec );
    } );
  }

  /**
   * Preloads the falling water animation to be in
   * @public
   */
  preloadWaterDrops() {
    this.waterDropsPreloaded = false;
    while ( !this.waterDropsPreloaded ) {
      this.stepWaterDrops( DT );
    }
  }

  /**
   * @returns {Energy}
   * @public
   * @override
   */
  getEnergyOutputRate() {
    const energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value;
    assert && assert( energyAmount >= 0, `EnergyAmount is ${energyAmount}` );
    return new Energy( EnergyType.MECHANICAL, energyAmount, -Math.PI / 2 );
  }

  /**
   * @public
   * @override
   */
  deactivate() {
    this.flowProportionProperty.reset();
    this.waterDrops.length = 0;
    this.flowEnergyDelay.length = 0;
    super.deactivate();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.exemptFromTransferEnergyChunks.clear(); // Disposal is done when energyChunkList is cleared
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      waterDropsPreloaded: this.waterDropsPreloaded,
      transferNextAvailableChunk: this.transferNextAvailableChunk,
      energySinceLastChunk: this.energySinceLastChunk
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState( stateObject ) {
    this.waterDropsPreloaded = stateObject.waterDropsPreloaded;
    this.transferNextAvailableChunk = stateObject.transferNextAvailableChunk;
    this.energySinceLastChunk = stateObject.energySinceLastChunk;
  }
}

// statics
FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN = OFFSET_FROM_CENTER_TO_WATER_ORIGIN;
FaucetAndWater.OFFSET_FROM_CENTER_TO_FAUCET_HEAD = OFFSET_FROM_CENTER_TO_FAUCET_HEAD;
FaucetAndWater.MAX_WATER_WIDTH = MAX_WATER_WIDTH;

energyFormsAndChanges.register( 'FaucetAndWater', FaucetAndWater );
export default FaucetAndWater;
