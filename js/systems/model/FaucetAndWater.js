// Copyright 2016-2019, University of Colorado Boulder

/**
 * a type that represents a faucet that can be turned on to provide mechanical energy to other energy system elements
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const Dimension2 = require( 'DOT/Dimension2' );
  const EFACA11yStrings = require( 'ENERGY_FORMS_AND_CHANGES/EFACA11yStrings' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const Energy = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/Energy' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/EnergySource' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Property = require( 'AXON/Property' );
  const Range = require( 'DOT/Range' );
  const Vector2 = require( 'DOT/Vector2' );
  const WaterDrop = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/WaterDrop' );

  // images
  const FAUCET_ICON = require( 'image!ENERGY_FORMS_AND_CHANGES/faucet_icon.png' );

  // constants
  const FALLING_ENERGY_CHUNK_VELOCITY = 0.09; // In meters/second.
  const MAX_WATER_WIDTH = 0.014; // In meters.
  const MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER = 0.5; // In meters.
  const ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE = new Range( 0.07, 0.08 );
  const FALLING_WATER_DELAY = 0.4; // time to pass before wheel starts turning after faucet starts, in seconds

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
     * @param {BooleanProperty} waterPowerableElementInPlace
     */
    constructor( energyChunksVisibleProperty, waterPowerableElementInPlaceProperty ) {
      super( new Image( FAUCET_ICON ) );

      // @public {string} - a11y name
      this.a11yName = EFACA11yStrings.waterFaucet.value;

      // @private
      this.energyChunksVisibleProperty = energyChunksVisibleProperty;

      // @private {BooleanProperty} - a flag that is used to decide whether to pass energy chunks to the next energy
      // system element
      this.waterPowerableElementInPlaceProperty = waterPowerableElementInPlaceProperty;

      // @public {BooleanProperty} proportion of full available flow that is occurring
      this.flowProportionProperty = new Property( 0 );

      // @public {read-only) {WaterDrop[]} - water drops that comprise the stream of water
      this.waterDrops = [];

      // @private {EnergyChunks[]} - list of chunks that are exempt from being transferred to the next energy system element
      this.exemptFromTransferEnergyChunks = [];

      // @private {Energy[]} - list of Energy to be sent after a delay has passed
      this.flowEnergyDelay = [];

      // @private {number}
      this.energySinceLastChunk = 0;

      // @private {boolean} - flag for whether next chunk should be transferred or kept, used to alternate transfer with
      // non-transfer
      this.transferNextAvailableChunk = true;
    }

    /**
     * create a new energy chunk with the appropriate attributes for falling water
     * @returns {EnergyChunk}
     * @private
     */
    createNewChunk() {

      // random x value within water column for "watery" appearance
      const x = ( phet.joist.random.nextDouble() - 0.5 ) * this.flowProportionProperty.value * MAX_WATER_WIDTH / 2;

      const initialPosition = this.positionProperty.value
        .plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN )
        .plus( new Vector2( x, 0 ) );

      const velocity = new Vector2( 0, -FALLING_ENERGY_CHUNK_VELOCITY );

      return new EnergyChunk( EnergyType.MECHANICAL, initialPosition, velocity, this.energyChunksVisibleProperty );
    }

    /**
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
     * @override
     */
    step( dt ) {

      if ( !this.activeProperty.value ) {
        return new Energy( EnergyType.MECHANICAL, 0, -Math.PI / 2 );
      }

      // add water droplets as needed based on flow rate
      if ( this.flowProportionProperty.value > 0 ) {
        const initialPosition = new Vector2( 0, 0 );
        const initialWidth = this.flowProportionProperty.value * MAX_WATER_WIDTH *
                           ( 1 + ( phet.joist.random.nextDouble() - 0.5 ) * 0.2 );
        const initialSize = new Dimension2( initialWidth, initialWidth );
        this.waterDrops.push( new WaterDrop( initialPosition, new Vector2( 0, 0 ), initialSize ) );
      }

      // make the water droplets fall
      this.waterDrops.forEach( drop => {
        const v = drop.velocityProperty.value;
        drop.velocityProperty.set( v.plus( ACCELERATION_DUE_TO_GRAVITY.times( dt ) ) );
        drop.position.set( drop.position.plus( v.times( dt ) ) );
      } );

      // remove drops that have run their course by iterating over a copy and checking for matches
      const waterDropsCopy = this.waterDrops;
      waterDropsCopy.forEach( drop => {
        if ( drop.position.distance( this.positionProperty.value ) > MAX_DISTANCE_FROM_FAUCET_TO_BOTTOM_OF_WATER ) {
          const index = this.waterDrops.indexOf( drop );
          if ( index !== -1 ) {
            this.waterDrops.splice( index, 1 );
          }
        }
      } );

      // check if time to emit an energy chunk and, if so, do it
      this.energySinceLastChunk += EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value * dt;
      this.addChunkIfEnoughEnergy();

      // update energy chunk positions
      this.energyChunkList.forEach( chunk => {

        // make the chunk fall
        chunk.translateBasedOnVelocity( dt );

        // see if chunk is in the location where it can be transferred to the next energy system
        const yPosition = this.positionProperty.get().plus( OFFSET_FROM_CENTER_TO_WATER_ORIGIN ).y -
                          chunk.positionProperty.value.y;
        const chunkInRange = ENERGY_CHUNK_TRANSFER_DISTANCE_RANGE.contains( yPosition );
        const chunkExempt = this.exemptFromTransferEnergyChunks.indexOf( chunk ) >= 0;

        if ( this.waterPowerableElementInPlaceProperty.value && chunkInRange && !chunkExempt ) {
          if ( this.transferNextAvailableChunk ) {

            // send this chunk to the next energy system
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
          _.pull( this.exemptFromTransferEnergyChunks, chunk );
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
      const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
      const tempEnergyChunkList = [];

      // simulate energy chunks moving through the system
      while ( preloadTime > 0 ) {
        this.energySinceLastChunk += this.getEnergyOutputRate().amount * dt;
        if ( this.energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
          tempEnergyChunkList.push( this.createNewChunk() );
          this.energySinceLastChunk = this.energySinceLastChunk - EFACConstants.ENERGY_PER_CHUNK;
        }

        // make the chunks fall
        translateChunks( tempEnergyChunkList, dt );

        preloadTime -= dt;
      }

      // now that they are positioned, add these to the 'real' list of energy chunks
      tempEnergyChunkList.forEach( ec => {
        this.energyChunkList.push( ec );
      } );
    }

    /**
     * @returns {Energy}
     * @public
     * @override
     */
    getEnergyOutputRate() {
      const energyAmount = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * this.flowProportionProperty.value;
      assert && assert( energyAmount >= 0, 'EnergyAmount is ' + energyAmount );
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
      this.exemptFromTransferEnergyChunks.length = 0;
    }


  }

  // statics
  FaucetAndWater.OFFSET_FROM_CENTER_TO_WATER_ORIGIN = OFFSET_FROM_CENTER_TO_WATER_ORIGIN;
  FaucetAndWater.OFFSET_FROM_CENTER_TO_FAUCET_HEAD = OFFSET_FROM_CENTER_TO_FAUCET_HEAD;
  FaucetAndWater.MAX_WATER_WIDTH = MAX_WATER_WIDTH;

  return energyFormsAndChanges.register( 'FaucetAndWater', FaucetAndWater );
} );
