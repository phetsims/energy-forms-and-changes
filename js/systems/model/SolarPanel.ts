// Copyright 2016-2025, University of Colorado Boulder

/**
 * A type that represents a model of a solar panel that converts light energy to electrical energy.  The panel actually
 * consists of an actual panel but also is meant to have a lower assembly through which energy chunks move.  The
 * appearance needs to be tightly coordinated with the images used in the view.
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import createObservableArray from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Dimension2 from '../../../../dot/js/Dimension2.js';
import dotRandom from '../../../../dot/js/dotRandom.js';
import Matrix3 from '../../../../dot/js/Matrix3.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Shape from '../../../../kite/js/Shape.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import Image from '../../../../scenery/js/nodes/Image.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import solarPanelIcon_png from '../../../images/solarPanelIcon_png.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyChunkGroup from '../../common/model/EnergyChunkGroup.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import Energy from './Energy.js';
import EnergyChunkPathMover from './EnergyChunkPathMover.js';
import EnergyChunkPathMoverGroup from './EnergyChunkPathMoverGroup.js';
import EnergyConverter, { EnergyConverterOptions } from './EnergyConverter.js';

// constants
const PANEL_SIZE = new Dimension2( 0.15, 0.07 ); // size of the panel-only portion (no connectors), in meters

// Constants used for creating the path followed by the energy chunks and for positioning the wire and connector
// images in the view.  Many of these numbers were empirically determined based on the images, and will need to be
// updated if the images change.  All values are in meters.
const PANEL_CONNECTOR_OFFSET = new Vector2( 0.015, 0 ); // where the bottom of the panel connects to the wires & such
const CONVERGENCE_POINT_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0, 0.0065 );
const WIRE_CURVE_POINT_1_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0, -0.025 );
const WIRE_CURVE_POINT_2_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0.005, -0.0325 );
const WIRE_CURVE_POINT_3_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0.008, -0.0355 );
const WIRE_CURVE_POINT_4_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0.012, -0.038 );
const WIRE_CURVE_POINT_5_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0.0165, -0.040 );
const OUTGOING_CONNECTOR_OFFSET = PANEL_CONNECTOR_OFFSET.plusXY( 0.042, -0.041 );

// Inter chunk spacing time for when the chunks reach the 'convergence point' at the bottom of the solar panel.
// Empirically determined to create an appropriate flow of electrical chunks in an energy user wire. In seconds.
const MIN_INTER_CHUNK_TIME = 0.6;

type SelfOptions = EmptySelfOptions;

type SolarPanelOptions = SelfOptions & EnergyConverterOptions;

class SolarPanel extends EnergyConverter {

  private readonly electricalEnergyChunkMovers: ReturnType<typeof createObservableArray>;
  private readonly lightEnergyChunkMovers: ReturnType<typeof createObservableArray>;
  private latestChunkArrivalTime: number;
  private numberOfConvertedChunks: number;
  private readonly energyChunksVisibleProperty: BooleanProperty;
  public readonly energyOutputRateProperty: NumberProperty;

  // counter to mimic function of IClock in original Java code
  private simulationTime: number;
  private readonly energyChunkGroup: EnergyChunkGroup;
  private readonly energyChunkPathMoverGroup: EnergyChunkPathMoverGroup;

  // A shape used to describe where the collection area is relative to the model position.  The collection area is at
  // the top, and the energy chunks flow through wires and connectors below.
  public readonly untranslatedPanelBounds: Bounds2;
  public readonly untranslatedAbsorptionShape: Shape;

  // shape used when determining if a given chunk of light energy should be absorbed. It is created at (0,0) relative
  // to the solar panel, so its position needs to be adjusted when the solar panel changes its position. It cannot
  // just use a relative position to the solar panel because energy chunks that are positioned globally need to check
  // to see if they are located within this shape, so it needs a global position as well. The untranslated version of
  // this shape is needed to draw the helper shape node in SolarPanelNode.
  private absorptionShape!: Shape;

  public constructor( energyChunksVisibleProperty: BooleanProperty, energyChunkGroup: EnergyChunkGroup, energyChunkPathMoverGroup: EnergyChunkPathMoverGroup, providedOptions?: SolarPanelOptions ) {

    const options = optionize<SolarPanelOptions, SelfOptions, EnergyConverterOptions>()( {
      tandem: Tandem.REQUIRED,
      phetioType: SolarPanel.SolarPanelIO,
      phetioState: true
    }, providedOptions );

    super( new Image( solarPanelIcon_png ), options );

    this.a11yName = EnergyFormsAndChangesStrings.a11y.solarPanel;

    this.electricalEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'electricalEnergyChunkMovers' ),

      // @ts-expect-error
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.lightEnergyChunkMovers = createObservableArray( {
      tandem: options.tandem.createTandem( 'lightEnergyChunkMovers' ),

      // @ts-expect-error
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkPathMover.EnergyChunkPathMoverIO ) )
    } );
    this.latestChunkArrivalTime = 0;
    this.numberOfConvertedChunks = 0;
    this.energyChunksVisibleProperty = energyChunksVisibleProperty;
    this.energyOutputRateProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'energyOutputRateProperty' ),
      phetioReadOnly: true,
      phetioHighFrequency: true
    } );

    this.simulationTime = 0;
    this.energyChunkGroup = energyChunkGroup;
    this.energyChunkPathMoverGroup = energyChunkPathMoverGroup;

    this.untranslatedPanelBounds = new Bounds2(
      -PANEL_SIZE.width / 2,
      0,
      PANEL_SIZE.width / 2,
      PANEL_SIZE.height
    );

    this.untranslatedAbsorptionShape = new Shape()
      .moveTo( 0, 0 )
      .lineToRelative( -PANEL_SIZE.width / 2, 0 )
      .lineToRelative( PANEL_SIZE.width, PANEL_SIZE.height )
      .close();

    this.positionProperty.link( position => {
      this.absorptionShape = this.untranslatedAbsorptionShape.transformed( Matrix3.translation( position.x, position.y ) );
    } );
  }

  /**
   * @param dt - time step, in seconds
   * @param incomingEnergy - type, amount, direction of energy
   */
  public step( dt: number, incomingEnergy: Energy ): Energy {
    if ( this.activeProperty.value ) {

      // handle any incoming energy chunks
      if ( this.incomingEnergyChunks.length > 0 ) {

        this.incomingEnergyChunks.forEach( incomingChunk => {

          if ( incomingChunk.energyTypeProperty.get() === 'LIGHT' ) {

            if ( this.numberOfConvertedChunks < 4 ) {

              // convert this chunk to electrical energy and add it to the list of energy chunks being managed
              incomingChunk.energyTypeProperty.set( 'ELECTRICAL' );
              this.energyChunkList.push( incomingChunk );

              // add a "mover" that will move this energy chunk to the bottom of the solar panel
              this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
                // @ts-expect-error
                incomingChunk,
                EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), [ CONVERGENCE_POINT_OFFSET ] ),
                this.chooseChunkSpeedOnPanel( incomingChunk ) )
              );

              this.numberOfConvertedChunks++;
            }
            else {

              // leave this chunk as light energy and add it to the list of energy chunks being managed
              this.energyChunkList.push( incomingChunk );

              // add a "mover" that will reflect this energy chunk up and away from the panel
              this.lightEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
                // @ts-expect-error
                incomingChunk,
                EnergyChunkPathMover.createStraightPath(
                  incomingChunk.positionProperty.get(),
                  -incomingChunk.velocity.angle
                ),
                EFACConstants.ENERGY_CHUNK_VELOCITY )
              );

              this.numberOfConvertedChunks = 0;
            }
          }

          // by design, this shouldn't happen, so raise an error if it does
          else {
            assert && assert(
              false,
              `Encountered energy chunk with unexpected type: ${incomingChunk.energyTypeProperty.get()}`
            );
          }
        } );

        this.incomingEnergyChunks.clear();
      }

      // move the energy chunks that are currently under management
      this.moveElectricalEnergyChunks( dt );
      this.moveReflectedEnergyChunks( dt );
    }

    // produce the appropriate amount of energy
    let energyProduced = 0;
    if ( this.activeProperty.value && incomingEnergy.type === 'LIGHT' ) {

      // 68% efficient. Empirically determined to match the rate of energy chunks that flow from the sun to the solar
      // panel (this way, the fan moves at the same speed when chunks are on or off).
      energyProduced = incomingEnergy.amount * 0.68;
    }
    this.energyOutputRateProperty.value = Utils.toFixedNumber( energyProduced / dt, 11 );

    this.simulationTime += dt;

    return new Energy( 'ELECTRICAL', energyProduced, 0 );
  }

  /**
   * update electrical energy chunk positions
   * @param dt - time step, in seconds
   */
  private moveElectricalEnergyChunks( dt: number ): void {

    // iterate over a copy to mutate original without problems
    const movers = this.electricalEnergyChunkMovers.slice();

    movers.forEach( ( mover: IntentionalAny ) => {

      mover.moveAlongPath( dt );

      if ( mover.pathFullyTraversed ) {

        this.electricalEnergyChunkMovers.remove( mover );
        const pathThroughConverterOffsets = [
          WIRE_CURVE_POINT_1_OFFSET,
          WIRE_CURVE_POINT_2_OFFSET,
          WIRE_CURVE_POINT_3_OFFSET,
          WIRE_CURVE_POINT_4_OFFSET,
          WIRE_CURVE_POINT_5_OFFSET,
          OUTGOING_CONNECTOR_OFFSET
        ];

        // energy chunk has reached the bottom of the panel and now needs to move through the converter
        if ( mover.energyChunk.positionProperty.value.equals( this.positionProperty.value.plus( CONVERGENCE_POINT_OFFSET ) ) ) {
          // @ts-expect-error
          this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement( mover.energyChunk,
            EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.value, pathThroughConverterOffsets ),
            EFACConstants.ENERGY_CHUNK_VELOCITY ) );
        }

          // the energy chunk has traveled across the panel and through the converter, so pass it off to the next
        // element in the system
        else {
          this.energyChunkList.remove( mover.energyChunk );
          this.outgoingEnergyChunks.push( mover.energyChunk );
        }
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  /**
   * update light energy chunk positions
   * @param dt - time step, in seconds
   */
  private moveReflectedEnergyChunks( dt: number ): void {

    // iterate over a copy to mutate original without problems
    const movers = this.lightEnergyChunkMovers.slice();

    movers.forEach( ( mover: IntentionalAny ) => {
      mover.moveAlongPath( dt );

      // remove this energy chunk entirely
      if ( mover.pathFullyTraversed ) {
        this.lightEnergyChunkMovers.remove( mover );
        this.energyChunkList.remove( mover.energyChunk );
        this.energyChunkGroup.disposeElement( mover.energyChunk );
        this.energyChunkPathMoverGroup.disposeElement( mover );
      }
    } );
  }

  public preloadEnergyChunks( incomingEnergy: Energy ): void {
    this.clearEnergyChunks();

    if ( incomingEnergy.amount === 0 || incomingEnergy.type !== 'LIGHT' ) {

      // no energy chunk pre-loading needed
      return;
    }

    const absorptionBounds = this.getAbsorptionShape().bounds;
    const lowerLeftOfPanel = new Vector2( absorptionBounds.minX, absorptionBounds.minY );
    const upperRightOfPanel = new Vector2( absorptionBounds.maxX, absorptionBounds.maxY );
    const crossLineAngle = upperRightOfPanel.minus( lowerLeftOfPanel ).angle;
    const crossLineLength = lowerLeftOfPanel.distance( upperRightOfPanel );
    const dt = 1 / EFACConstants.FRAMES_PER_SECOND;
    let energySinceLastChunk = EFACConstants.ENERGY_PER_CHUNK * 0.99;
    let preloadComplete = false;

    // simulate energy chunks moving through the system
    while ( !preloadComplete ) {

      // full energy rate generates too many chunks, so an adjustment factor is used
      energySinceLastChunk += incomingEnergy.amount * dt * 0.4;

      // determine if time to add a new chunk
      if ( energySinceLastChunk >= EFACConstants.ENERGY_PER_CHUNK ) {
        let initialPosition;
        if ( this.energyChunkList.length === 0 ) {

          // for predictability of the algorithm, add the first chunk to the center of the panel
          initialPosition = lowerLeftOfPanel.plus(
            new Vector2( crossLineLength * 0.5, 0 ).rotated( crossLineAngle )
          );
        }
        else {

          // choose a random position along the center portion of the cross line
          initialPosition = lowerLeftOfPanel.plus(
            new Vector2( crossLineLength * ( 0.5 * dotRandom.nextDouble() + 0.25 ), 0 ).rotated( crossLineAngle )
          );
        }

        const newEnergyChunk = this.energyChunkGroup.createNextElement(
          'ELECTRICAL',
          initialPosition,
          Vector2.ZERO,
          this.energyChunksVisibleProperty
        );

        this.energyChunkList.push( newEnergyChunk );

        // add a "mover" that will move this energy chunk to the bottom of the solar panel
        this.electricalEnergyChunkMovers.push( this.energyChunkPathMoverGroup.createNextElement(
          // @ts-expect-error
          newEnergyChunk,
          EnergyChunkPathMover.createPathFromOffsets( this.positionProperty.get(), [ CONVERGENCE_POINT_OFFSET ] ),
          this.chooseChunkSpeedOnPanel( newEnergyChunk ) )
        );

        // update energy since last chunk
        energySinceLastChunk -= EFACConstants.ENERGY_PER_CHUNK;
      }

      this.moveElectricalEnergyChunks( dt );

      if ( this.outgoingEnergyChunks.length > 0 ) {

        // an energy chunk has made it all the way through the system, which completes the pre-load
        preloadComplete = true;
      }
    }
  }

  /**
   * @returns type, amount, direction of emitted energy
   */
  public getEnergyOutputRate(): Energy {
    return new Energy( 'ELECTRICAL', this.energyOutputRateProperty.value, 0 );
  }

  /**
   * choose speed of chunk on panel such that it won't clump up with other chunks
   * @param incomingEnergyChunk
   * @returns speed
   */
  private chooseChunkSpeedOnPanel( incomingEnergyChunk: EnergyChunk ): number {

    // start with default speed
    const chunkSpeed = EFACConstants.ENERGY_CHUNK_VELOCITY;

    // count the number of chunks currently on the panel
    let numberOfChunksOnPanel = 0;

    this.electricalEnergyChunkMovers.forEach( mover => {

      // @ts-expect-error
      if ( mover.getFinalDestination().equals( this.positionProperty.value.plus( CONVERGENCE_POINT_OFFSET ) ) ) {
        numberOfChunksOnPanel++;
      }
    } );

    // compute the projected time of arrival at the convergence point
    const distanceToConvergencePoint =
      incomingEnergyChunk.positionProperty.get().distance( this.positionProperty.value.plus( CONVERGENCE_POINT_OFFSET ) );
    const travelTime = distanceToConvergencePoint / chunkSpeed;
    let projectedArrivalTime = this.simulationTime + travelTime;

    // calculate the minimum spacing based on the number of chunks on the panel
    const minArrivalTimeSpacing = numberOfChunksOnPanel <= 3 ?
                                  MIN_INTER_CHUNK_TIME :
                                  MIN_INTER_CHUNK_TIME / ( numberOfChunksOnPanel - 2 );

    // if the projected arrival time is too close to the current last chunk, slow down so that the minimum spacing is
    // maintained
    if ( this.latestChunkArrivalTime + minArrivalTimeSpacing > projectedArrivalTime ) {
      projectedArrivalTime = this.latestChunkArrivalTime + minArrivalTimeSpacing;
    }

    this.latestChunkArrivalTime = projectedArrivalTime;

    return distanceToConvergencePoint / ( projectedArrivalTime - this.simulationTime );
  }

  public override injectEnergyChunks( energyChunks: EnergyChunk[] ): void {

    // before adding all injected chunks into the solar panel's incoming energy chunks array, make sure that they are
    // all light energy. if not, pull out the bad ones and pass the rest through.
    // see https://github.com/phetsims/energy-forms-and-changes/issues/150
    energyChunks.forEach( chunk => {
      if ( chunk.energyTypeProperty.value !== 'LIGHT' ) {
        energyChunks = _.pull( energyChunks, chunk );
      }
    } );
    super.injectEnergyChunks( energyChunks );
  }

  public override clearEnergyChunks(): void {
    super.clearEnergyChunks();

    // @ts-expect-error
    this.electricalEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.electricalEnergyChunkMovers.clear();

    // @ts-expect-error
    this.lightEnergyChunkMovers.forEach( mover => this.energyChunkPathMoverGroup.disposeElement( mover ) );
    this.lightEnergyChunkMovers.clear();
    this.latestChunkArrivalTime = 0;
  }

  /**
   * get the shape of the area where light can be absorbed
   */
  public getAbsorptionShape(): Shape {
    return this.absorptionShape;
  }

  public override toStateObject(): IntentionalAny {
    return {
      numberOfConvertedChunks: this.numberOfConvertedChunks,
      latestChunkArrivalTime: this.latestChunkArrivalTime,
      simulationTime: this.simulationTime
    };
  }

  /**
   * (EnergySystemElementIO)
   * @param stateObject - see this.toStateObject()
   */
  // @ts-expect-error
  public override applyState( stateObject: IntentionalAny ): void {
    this.numberOfConvertedChunks = stateObject.numberOfConvertedChunks;
    this.latestChunkArrivalTime = stateObject.latestChunkArrivalTime;
    this.simulationTime = stateObject.simulationTime;
  }

  public static readonly PANEL_CONNECTOR_OFFSET = PANEL_CONNECTOR_OFFSET;

  public static readonly SolarPanelIO = new IOType<SolarPanel, {
    numberOfConvertedChunks: number;
    latestChunkArrivalTime: number;
    simulationTime: number;
  }>( 'SolarPanelIO', {
    valueType: SolarPanel,
    toStateObject: solarPanel => solarPanel.toStateObject(),
    applyState: ( solarPanel, stateObject ) => solarPanel.applyState( stateObject ),
    stateSchema: {
      numberOfConvertedChunks: NumberIO,
      latestChunkArrivalTime: NumberIO,
      simulationTime: NumberIO
    }
  } );
}

energyFormsAndChanges.register( 'SolarPanel', SolarPanel );
export default SolarPanel;