// Copyright 2014-2024, University of Colorado Boulder

/**
 * Model element that represents a burner in the simulation.  The burner can heat and also cool other model elements.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import createObservableArray, { ObservableArray } from '../../../../axon/js/createObservableArray.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import TReadOnlyProperty from '../../../../axon/js/TReadOnlyProperty.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Range from '../../../../dot/js/Range.js';
import Rectangle from '../../../../dot/js/Rectangle.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import affirm from '../../../../perennial-alias/js/browser-and-node/affirm.js';
import optionize from '../../../../phet-core/js/optionize.js';
import PhetioGroup from '../../../../tandem/js/PhetioGroup.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import Air from '../../intro/model/Air.js';
import EFACConstants from '../EFACConstants.js';
import EnergyChunk from './EnergyChunk.js';
import EnergyChunkWanderController from './EnergyChunkWanderController.js';
import EnergyChunkWanderControllerGroup from './EnergyChunkWanderControllerGroup.js';
import EnergyType from './EnergyType.js';
import HorizontalSurface from './HorizontalSurface.js';
import ModelElement, { ModelElementOptions } from './ModelElement.js';
import RectangularThermalMovableModelElement from './RectangularThermalMovableModelElement.js';

// constants
const SIDE_LENGTH = 0.075; // in meters
const MAX_ENERGY_GENERATION_RATE = 5000; // joules/sec, empirically chosen
const CONTACT_DISTANCE = 0.001; // in meters
const ENERGY_CHUNK_CAPTURE_DISTANCE = 0.2; // in meters, empirically chosen

// Because of the way that energy chunks are exchanged between thermal modeling elements within this simulation,
// things can end up looking a bit odd if a burner is turned on with nothing on it.  To account for this, a separate
// energy generation rate is used when a burner is exchanging energy directly with the air.
// Units: joules/sec, multiplier empirically chosen.
const MAX_ENERGY_GENERATION_RATE_INTO_AIR = MAX_ENERGY_GENERATION_RATE * 0.3;

// counter used by constructor to create unique IDs for each burner
let idCounter = 0;

type SelfOptions = {

  // This is an option because only some Burners create wanderers for their EnergyChunks. If creating one, this must
  // be provided to support PhET-iO state
  energyChunkWanderControllerGroup?: EnergyChunkWanderControllerGroup | null;
};

type BurnerOptions = SelfOptions & ModelElementOptions;

class Burner extends ModelElement {

  // Unique ID, used for debug
  public readonly id: string;

  // Heat/cool level control property
  public readonly heatCoolLevelProperty: NumberProperty;

  // Observable array of energy chunks
  public readonly energyChunkList: ObservableArray<EnergyChunk>;

  // Position in model space
  private readonly position: Vector2;

  // Motion strategies that control the movement of the energy chunks owned by this burner
  private readonly energyChunkWanderControllers: ObservableArray<EnergyChunkWanderController>;

  private readonly energyChunkWanderControllerGroup: EnergyChunkWanderControllerGroup | null;

  // Used to keep incoming energy chunks from wandering very far to the left or right
  private readonly incomingEnergyChunkWanderBounds: Range;

  // Controls whether the energy chunks are visible
  private readonly energyChunksVisibleProperty: Property<boolean>;

  // Bounds of the burner in model space
  private readonly bounds: Bounds2;

  private readonly energyChunkGroup: PhetioGroup<EnergyChunk, [ EnergyType, Vector2, Vector2, TReadOnlyProperty<boolean> ]>;

  /**
   * @param position - the position in model space where this burner exists
   * @param energyChunksVisibleProperty - controls whether the energy chunks are visible
   * @param energyChunkGroup
   * @param providedOptions
   */
  public constructor( position: Vector2, energyChunksVisibleProperty: Property<boolean>,
                      energyChunkGroup: PhetioGroup<EnergyChunk, [ EnergyType, Vector2, Vector2, TReadOnlyProperty<boolean> ]>, providedOptions?: BurnerOptions ) {

    const options = optionize<BurnerOptions, SelfOptions, ModelElementOptions>()( {
      energyChunkWanderControllerGroup: null,
      tandem: Tandem.REQUIRED
    }, providedOptions );

    super( position, options );

    this.id = `burner-${idCounter++}`;

    this.heatCoolLevelProperty = new NumberProperty( 0, {
      range: new Range( -1, 1 ),
      tandem: options.tandem.createTandem( 'heatCoolLevelProperty' ),
      phetioDocumentation: 'the level of heating or cooling from the burner. -1 is maximum cooling, +1 is maximum heating'
    } );

    this.energyChunkList = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkList' ),

      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunk.EnergyChunkIO ) )
    } );

    this.position = position;

    this.energyChunkWanderControllers = createObservableArray( {
      tandem: options.tandem.createTandem( 'energyChunkWanderControllers' ),
      phetioType: createObservableArray.ObservableArrayIO( ReferenceIO( EnergyChunkWanderController.EnergyChunkWanderControllerIO ) )
    } );

    this.energyChunkWanderControllerGroup = options.energyChunkWanderControllerGroup;

    this.incomingEnergyChunkWanderBounds = new Range( position.x - SIDE_LENGTH / 3, position.x + SIDE_LENGTH / 3 );

    this.energyChunksVisibleProperty = energyChunksVisibleProperty;

    this.bounds = new Bounds2(
      position.x - SIDE_LENGTH / 2,
      position.y,
      position.x + SIDE_LENGTH / 2,
      position.y + SIDE_LENGTH
    );

    this.energyChunkGroup = energyChunkGroup;

    // add position test bounds (see definition in base class for more info)
    this.relativePositionTestingBoundsList.push( new Bounds2( -SIDE_LENGTH / 2, 0, SIDE_LENGTH / 2, SIDE_LENGTH ) );

    // Create and add the top surface.  Some compensation for perspective is necessary in order to avoid problems with
    // edge overlap when dropping objects on top of burner.
    const perspectiveCompensation = this.bounds.height * EFACConstants.BURNER_EDGE_TO_HEIGHT_RATIO *
                                    Math.cos( EFACConstants.BURNER_PERSPECTIVE_ANGLE ) / 2;

    this.topSurface = new HorizontalSurface(
      new Vector2( this.position.x, this.bounds.maxY ),
      this.bounds.maxX + perspectiveCompensation - ( this.bounds.minX - perspectiveCompensation ),
      this,
      options.tandem.createTandem( 'topSurface' )
    );
  }

  /**
   * Get a rectangle that defines the outline of the burner.  In the model the burner is essentially a 2D rectangle.
   * @returns rectangle that defines the outline in model space.
   */
  public getBounds(): Rectangle {
    return this.bounds;
  }

  /**
   * Interact with a thermal container, adding or removing energy based on the current heat/cool setting.
   * NOTE: this shouldn't be used for air - there is a specific method for that
   * @param thermalContainer - model object that will get or give energy
   * @param dt - amount of time (delta time)
   * @returns amount of energy transferred in joules, can be negative if energy was drawn from object
   */
  public addOrRemoveEnergyToFromObject( thermalContainer: RectangularThermalMovableModelElement, dt: number ): number {
    let deltaEnergy = 0;

    if ( this.inContactWith( thermalContainer ) ) {
      if ( thermalContainer.getTemperature() > EFACConstants.WATER_FREEZING_POINT_TEMPERATURE ) {
        deltaEnergy = MAX_ENERGY_GENERATION_RATE * this.heatCoolLevelProperty.value * dt;

        // make sure we don't cool the object below its minimum allowed energy level
        if ( this.heatCoolLevelProperty.value < 0 ) {
          if ( Math.abs( deltaEnergy ) > thermalContainer.getEnergyAboveMinimum() ) {
            deltaEnergy = -thermalContainer.getEnergyAboveMinimum();
          }
        }
      }
      thermalContainer.changeEnergy( deltaEnergy );
    }
    return deltaEnergy;
  }

  /**
   * Exchange energy with the air.  This has specific behavior that is different from addOrRemoveEnergyToFromObject,
   * defined elsewhere in this type.
   * @param air - air as a thermal energy container
   * @param dt - amount of time (delta time)
   * @returns energy, in joules, transferred to the air, negative if energy was absorbed
   */
  public addOrRemoveEnergyToFromAir( air: Air, dt: number ): number {
    const deltaEnergy = MAX_ENERGY_GENERATION_RATE_INTO_AIR * this.heatCoolLevelProperty.value * dt;
    air.changeEnergy( deltaEnergy );
    return deltaEnergy;
  }

  /**
   * determine if the burner is in contact with a thermal energy container
   */
  public inContactWith( thermalContainer: RectangularThermalMovableModelElement ): boolean {
    const burnerRect = this.getBounds();
    const area = thermalContainer.thermalContactArea;
    const xContact = ( area.centerX > burnerRect.minX && area.centerX < burnerRect.maxX );
    const yContact = ( Math.abs( area.minY - burnerRect.maxY ) < CONTACT_DISTANCE );
    return ( xContact && yContact );
  }

  public addEnergyChunk( energyChunk: EnergyChunk ): void {

    // make sure the chunk is at the front (which makes it fully opaque in the view)
    energyChunk.zPositionProperty.value = 0;
    energyChunk.zPosition = 0;

    // add the chunk and its motion strategy to this model
    this.energyChunkList.add( energyChunk );

    affirm( this.energyChunkWanderControllerGroup,
      'Must provided wander controller group if creating wander controllers' );

    this.energyChunkWanderControllers.push( this.energyChunkWanderControllerGroup.createNextElement(
      energyChunk,
      new Vector2Property( this.getCenterPoint(), { valueComparisonStrategy: 'equalsFunction' } ),

      // @ts-expect-error
      { horizontalWanderConstraint: this.incomingEnergyChunkWanderBounds, wanderAngleVariation: Math.PI * 0.15 }
    ) );
  }

  /**
   * request an energy chunk from the burner
   * @param point - point from which to search for closest chunk
   * @returns closest energy chunk, null if none are contained
   */
  public extractEnergyChunkClosestToPoint( point: Vector2 ): EnergyChunk | null {
    let closestEnergyChunk: EnergyChunk | null = null;
    if ( this.energyChunkList.length > 0 ) {
      this.energyChunkList.forEach( energyChunk => {
        if ( energyChunk.positionProperty.value.distance( this.position ) > ENERGY_CHUNK_CAPTURE_DISTANCE &&
             ( closestEnergyChunk === null ||
               energyChunk.positionProperty.value.distance( point ) <
               closestEnergyChunk.positionProperty.value.distance( point ) ) ) {

          // found a closer chunk
          closestEnergyChunk = energyChunk;
        }
      } );

      if ( closestEnergyChunk ) {
        this.energyChunkList.remove( closestEnergyChunk );
        this.energyChunkWanderControllers.forEach( energyChunkWanderController => {
          if ( energyChunkWanderController.energyChunk === closestEnergyChunk ) {
            this.energyChunkWanderControllers.remove( energyChunkWanderController );
            this.energyChunkWanderControllerGroup!.disposeElement( energyChunkWanderController );
          }
        } );
      }
    }

    if ( closestEnergyChunk === null && this.heatCoolLevelProperty.value > 0 ) {

      // create an energy chunk
      closestEnergyChunk = this.energyChunkGroup.createNextElement(
        'THERMAL',
        this.getCenterPoint(), // will originate from the center of this burner
        new Vector2( 0, 0 ),
        this.energyChunksVisibleProperty
      );
    }

    if ( closestEnergyChunk === null ) {

      // This probably shouldn't ever occur, but it doesn't really warrant an assert, so log a warning that will
      // encourage investigation if it DOES happen.
      console.warn( 'Burner was unable to supply energy chunks.' );
    }
    return closestEnergyChunk;
  }

  /**
   * request an energy chunk from the burner based on provided bounds
   * @param bounds - bounds to which the energy chunks will be heading
   * @returns closest energy chunk
   */
  public extractEnergyChunkClosestToBounds( bounds: Bounds2 ): EnergyChunk | null {

    // verify that the bounds where the energy chunk is going are above this burner
    const burnerBounds = this.getBounds();
    affirm(
      bounds.minY > burnerBounds.centerY && bounds.centerX > burnerBounds.minX && bounds.centerX < burnerBounds.maxX,
      'items should only be on top of burner when getting ECs'
    );
    return this.extractEnergyChunkClosestToPoint( new Vector2( bounds.centerX, bounds.minY ) );
  }

  public getCenterPoint(): Vector2 {
    return new Vector2( this.position.x, this.position.y + SIDE_LENGTH / 2 );
  }

  public getCenterTopPoint(): Vector2 {
    return new Vector2( this.position.x, this.position.y + SIDE_LENGTH );
  }

  public override reset(): void {
    super.reset();
    this.energyChunkList.forEach( chunk => this.energyChunkGroup.disposeElement( chunk ) );
    this.energyChunkList.clear();
    this.heatCoolLevelProperty.reset();

    this.energyChunkWanderControllers.forEach( wanderController => this.energyChunkWanderControllerGroup!.disposeElement( wanderController ) );
    this.energyChunkWanderControllers.clear();
  }

  public areAnyOnTop( thermalContainers: RectangularThermalMovableModelElement[] ): boolean {
    let onTop = false;
    thermalContainers.forEach( thermalContainer => {
      if ( this.inContactWith( thermalContainer ) ) {
        onTop = true;
      }
    } );
    return onTop;
  }

  /**
   * animate the energy chunks
   */
  public step( dt: number ): void {
    const controllers = this.energyChunkWanderControllers.slice();

    controllers.forEach( controller => {
      controller.updatePosition( dt );

      if ( controller.isDestinationReached() ) {
        this.energyChunkList.remove( controller.energyChunk );
        this.energyChunkWanderControllers.remove( controller );
        this.energyChunkGroup.disposeElement( controller.energyChunk );
        this.energyChunkWanderControllerGroup!.disposeElement( controller );
      }
    } );
  }

  /**
   * get a rectangle in model space the corresponds to where the flame and ice exist
   */
  public getFlameIceRect(): Rectangle {

    // word of warning: this needs to stay consistent with the view
    const outlineRect = this.getBounds();
    const width = outlineRect.width;
    const height = outlineRect.height;
    return new Rectangle( outlineRect.centerX - width / 4, outlineRect.centerY, width / 2, height / 2 );
  }

  /**
   * get burner temperature, clamped at minimum to the freezing point of water
   */
  public getTemperature(): number {
    const temperature = EFACConstants.ROOM_TEMPERATURE + this.heatCoolLevelProperty.value * 100;
    return Math.max( temperature, EFACConstants.WATER_FREEZING_POINT_TEMPERATURE );
  }
}

energyFormsAndChanges.register( 'Burner', Burner );
export default Burner;