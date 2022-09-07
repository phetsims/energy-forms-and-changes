// Copyright 2016-2022, University of Colorado Boulder

/**
 * a type representing a model of the sun as an energy source - includes the clouds that can block the sun's rays
 *
 * @author  John Blanco (original Java)
 * @author  Andrew Adare (js port)
 */

import createObservableArray from '../../../../axon/js/createObservableArray.js';
import DerivedProperty from '../../../../axon/js/DerivedProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import merge from '../../../../phet-core/js/merge.js';
import { Image } from '../../../../scenery/js/imports.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import sunIcon_png from '../../../images/sunIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Cloud from './Cloud.js';
import Energy from './Energy.js';
import EnergySource from './EnergySource.js';

// constants
const RADIUS = 0.02; // In meters, apparent size, not (obviously) actual size.
const OFFSET_TO_CENTER_OF_SUN = new Vector2( -0.05, 0.12 );
const ENERGY_CHUNK_EMISSION_PERIOD = 0.11; // In seconds.
const MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN = 0.7; // In meters.

// Constants that control the nature of the emission sectors.  These are used to make emission look random yet still
// have a fairly steady rate within each sector.  One sector is intended to point at the solar panel.
const NUM_EMISSION_SECTORS = 10;
const EMISSION_SECTOR_SPAN = 2 * Math.PI / NUM_EMISSION_SECTORS;

// used to tweak sector positions to make sure solar panel gets consistent flow of E's
const EMISSION_SECTOR_OFFSET = EMISSION_SECTOR_SPAN * 0.71;


class SunEnergySource extends EnergySource {

  /**
   * @param {SolarPanel} solarPanel
   * @param {BooleanProperty} isPlayingProperty
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @param {EnergyChunkGroup} energyChunkGroup
   * @param {Object} [options]
   */
  constructor( solarPanel, isPlayingProperty, energyChunksVisibleProperty, energyChunkGroup, options ) {

    options = merge( {
      tandem: Tandem.REQUIRED
    }, options );

    super( new Image( sunIcon_png ), options );

    // @public {string} - a11y name
    this.a11yName = EnergyFormsAndChangesStrings.a11y.sun;

    // @public (read-only) {SolarPanel}
    this.solarPanel = solarPanel;

    // @public (read-only) {number}
    this.radius = RADIUS;

    // @public {Cloud[]} - clouds that can potentially block the sun's rays.  The positions are set so that they appear
    // between the sun and the solar panel, and must not overlap with one another.
    this.clouds = [
      new Cloud( new Vector2( -0.01, 0.08 ), this.positionProperty ),
      new Cloud( new Vector2( 0.017, 0.0875 ), this.positionProperty ),
      new Cloud( new Vector2( 0.02, 0.105 ), this.positionProperty )
    ];

    // @public {NumberProperty} - a factor between zero and one that indicates how cloudy it is
    this.cloudinessProportionProperty = new NumberProperty( 0, {
      range: new Range( 0, 1 ),
      tandem: options.tandem.createTandem( 'cloudinessProportionProperty' ),
      phetioDocumentation: 'proportion of clouds blocking the sun'
    } );

    // @public - exists only for phet-io
    this.sunProportionProperty = new DerivedProperty( [ this.cloudinessProportionProperty ], cloudinessProportion => {
      return 1 - cloudinessProportion;
    }, {
      range: new Range( 0, 1 ),
      tandem: options.tandem.createTandem( 'sunProportionProperty' ),
      phetioDocumentation: 'proportion of sun reaching the solar panel',
      phetioValueType: NumberIO
    } );

    // @private - internal variables used in methods
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.isPlayingProperty = isPlayingProperty;
    this.energyChunkEmissionCountdownTimer = ENERGY_CHUNK_EMISSION_PERIOD;
    this.sectorList = dotRandom.shuffle( _.range( NUM_EMISSION_SECTORS ) );
    this.currentSectorIndex = 0;
    this.sunPosition = OFFSET_TO_CENTER_OF_SUN;

    // @private - list of energy chunks that should be allowed to pass through the clouds without bouncing (i.e. being
    // reflected)
    this.energyChunksPassingThroughClouds = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunksPassingThroughClouds' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    // @private
    this.energyChunkGroup = energyChunkGroup;

    // set up a listener to add/remove clouds based on the value of the cloudiness Property
    this.cloudinessProportionProperty.link( cloudiness => {
      const nClouds = this.clouds.length;
      for ( let i = 0; i < nClouds; i++ ) {

        // stagger the existence strength of the clouds
        const value = Utils.clamp( cloudiness * nClouds - i, 0, 1 );
        this.clouds[ i ].existenceStrengthProperty.set( value );
      }
    } );

    // update the position of the sun as the position of this system changes
    this.positionProperty.link( position => {
      this.sunPosition = position.plus( OFFSET_TO_CENTER_OF_SUN );
    } );
  }

  /**
   * step in time
   * @param dt - time step, in seconds
   * @returns {Energy}
   * @public
   */
  step( dt ) {
    let energyProduced = 0;
    if ( this.activeProperty.value === true ) {

      // see if it is time to emit a new energy chunk
      this.energyChunkEmissionCountdownTimer -= dt;
      if ( this.energyChunkEmissionCountdownTimer <= 0 ) {

        // create a new chunk and start it on its way
        this.emitEnergyChunk();
        this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
      }

      // move the energy chunks
      this.updateEnergyChunkPositions( dt );

      let energyProducedProportion = 1 - this.cloudinessProportionProperty.value;

      // map energy produced proportion to eliminate very low values
      energyProducedProportion = energyProducedProportion === 0 ? 0 : 0.1 + ( energyProducedProportion * 0.9 );
      assert && assert( energyProducedProportion >= 0 && energyProducedProportion <= 1 );

      // calculate the amount of energy produced
      energyProduced = EFACConstants.MAX_ENERGY_PRODUCTION_RATE * energyProducedProportion * dt;
    }

    // produce the energy
    return new Energy( EnergyType.LIGHT, energyProduced, 0 );
  }

  /**
   * @param {number} dt - time step, in seconds
   * @private
   */
  updateEnergyChunkPositions( dt ) {

    // check for bouncing and absorption of the energy chunks
    this.energyChunkList.forEach( chunk => {

      const distanceFromSun = chunk.positionProperty.value.distance( this.sunPosition.plus( OFFSET_TO_CENTER_OF_SUN ) );

      // this energy chunk was absorbed by the solar panel, so put it on the list of outgoing chunks
      if ( this.solarPanel.activeProperty.value && this.solarPanel.getAbsorptionShape().containsPoint( chunk.positionProperty.value ) ) {
        this.energyChunkList.remove( chunk );

        if ( this.energyChunksPassingThroughClouds.includes( chunk ) ) {
          this.energyChunksPassingThroughClouds.remove( chunk );
        }
        this.outgoingEnergyChunks.push( chunk );
      }

      // this energy chunk is out of visible range, so remove it
      else if ( distanceFromSun > MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN ||
                chunk.positionProperty.value.x < -0.35 || // empirically determined
                chunk.positionProperty.value.y > EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT
      ) {
        this.energyChunkList.remove( chunk );
        if ( this.energyChunksPassingThroughClouds.includes( chunk ) ) {
          this.energyChunksPassingThroughClouds.remove( chunk );
        }
        this.energyChunkGroup.disposeElement( chunk );
      }

      // chunks encountering clouds
      else {
        this.clouds.forEach( cloud => {

          const inClouds = cloud.getCloudAbsorptionReflectionShape().containsPoint( chunk.positionProperty.value );
          const inList = this.energyChunksPassingThroughClouds.includes( chunk );
          const deltaPhi = chunk.velocity.angle - chunk.positionProperty.value.minus( this.sunPosition ).angle;

          if ( inClouds && !inList && Math.abs( deltaPhi ) < Math.PI / 10 ) {

            // decide whether this energy chunk should pass through the clouds or be reflected
            if ( dotRandom.nextDouble() < cloud.existenceStrengthProperty.get() ) {

              // Reflect the energy chunk.  It looks a little weird if they go back to the sun, so the code below
              // tries to avoid that.
              const angleTowardsSun = chunk.velocity.angle + Math.PI;
              const reflectionAngle = chunk.positionProperty.value.minus( cloud.getCenterPosition() ).angle;

              if ( reflectionAngle < angleTowardsSun ) {
                chunk.setVelocity( chunk.velocity.rotated(
                  0.7 * Math.PI + dotRandom.nextDouble() * Math.PI / 8 )
                );
              }
              else {
                chunk.setVelocity(
                  chunk.velocity.rotated( -0.7 * Math.PI - dotRandom.nextDouble() * Math.PI / 8 )
                );
              }

            }
            else {

              // let the energy chunk pass through the cloud
              this.energyChunksPassingThroughClouds.push( chunk );
            }
          }
        } );
      }
    } );

    // move the energy chunks
    this.energyChunkList.forEach( chunk => {
      chunk.translateBasedOnVelocity( dt );
    } );
  }

  /**
   * @private
   */
  emitEnergyChunk() {
    const emissionAngle = this.chooseNextEmissionAngle();
    const velocity = new Vector2( EFACConstants.ENERGY_CHUNK_VELOCITY, 0 ).rotated( emissionAngle );
    const startPoint = this.sunPosition.plus( new Vector2( RADIUS / 2, 0 ).rotated( emissionAngle ) );
    const chunk = this.energyChunkGroup.createNextElement( EnergyType.LIGHT, startPoint, velocity, this.energyChunksVisibleProperty );

    this.energyChunkList.add( chunk );
  }

  /**
   * @public
   * @override
   */
  preloadEnergyChunks() {
    this.clearEnergyChunks();
    let preloadTime = 6; // in simulated seconds, empirically determined
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    this.energyChunkEmissionCountdownTimer = 0;

    // simulate energy chunks moving through the system
    while ( preloadTime > 0 ) {
      this.energyChunkEmissionCountdownTimer -= dt;
      if ( this.energyChunkEmissionCountdownTimer <= 0 ) {
        this.emitEnergyChunk();
        this.energyChunkEmissionCountdownTimer += ENERGY_CHUNK_EMISSION_PERIOD;
      }
      this.updateEnergyChunkPositions( dt );
      preloadTime -= dt;
    }

    // remove any chunks that actually made it to the solar panel
    this.outgoingEnergyChunks.clear();
  }

  /**
   * return a structure containing type, rate, and direction of emitted energy
   * @returns {Energy}
   * @public
   */
  getEnergyOutputRate() {
    return new Energy(
      EnergyType.LIGHT,
      EFACConstants.MAX_ENERGY_PRODUCTION_RATE * ( 1 - this.cloudinessProportionProperty.value )
    );
  }

  /**
   * @returns {number} emission angle
   * @private
   */
  chooseNextEmissionAngle() {
    const sector = this.sectorList[ this.currentSectorIndex ];
    this.currentSectorIndex++;

    if ( this.currentSectorIndex >= NUM_EMISSION_SECTORS ) {
      this.currentSectorIndex = 0;
    }

    // angle is a function of the selected sector and a random offset within the sector
    return sector * EMISSION_SECTOR_SPAN +
           ( dotRandom.nextDouble() * EMISSION_SECTOR_SPAN ) +
           EMISSION_SECTOR_OFFSET;
  }

  /**
   * Pre-populate the space around the sun with energy chunks. The number of iterations is chosen carefully such that
   * there are chunks that are close, but not quite reaching, the solar panel.
   * @public
   * @override
   */
  activate() {
    super.activate();

    // Don't move the EnergyChunks from their position if setting state.
    // Don't step if not playing, this makes sure that PhET-iO state maintains exact EnergyChunk positions.
    if ( !phet.joist.sim.isSettingPhetioStateProperty.value && this.isPlayingProperty.value ) {

      // step a few times to get some energy chunks out
      for ( let i = 0; i < 100; i++ ) {
        this.step( EFACConstants.SIM_TIME_PER_TICK_NORMAL );
      }
    }
  }

  /**
   * deactivate the sun
   * @public
   * @override
   */
  deactivate() {
    super.deactivate();
    this.cloudinessProportionProperty.reset();
  }

  /**
   * @public
   * @override
   */
  clearEnergyChunks() {
    super.clearEnergyChunks();
    this.energyChunksPassingThroughClouds.clear();
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @returns {Object}
   */
  toStateObject() {
    return {
      sectorList: this.sectorList,
      currentSectorIndex: this.currentSectorIndex,
      radius: this.radius,
      sunPosition: this.sunPosition,
      energyChunkEmissionCountdownTimer: this.energyChunkEmissionCountdownTimer
    };
  }

  /**
   * @override
   * @public (EnergySystemElementIO)
   * @param {Object} stateObject - see this.toStateObject()
   */
  applyState( stateObject ) {
    this.sectorList = stateObject.sectorList;
    this.currentSectorIndex = stateObject.currentSectorIndex;
    this.radius = stateObject.radius;
    this.sunPosition = stateObject.sunPosition;
    this.energyChunkEmissionCountdownTimer = stateObject.energyChunkEmissionCountdownTimer;
  }
}

// statics
SunEnergySource.OFFSET_TO_CENTER_OF_SUN = OFFSET_TO_CENTER_OF_SUN;

energyFormsAndChanges.register( 'SunEnergySource', SunEnergySource );
export default SunEnergySource;