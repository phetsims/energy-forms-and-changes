// Copyright 2016-2024, University of Colorado Boulder

/**
 * a type that is used to move an energy chunk along a pre-defined path
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import dotRandom from '../../../../dot/js/dotRandom.js';
import Range from '../../../../dot/js/Range.js';
import Vector2, { Vector2StateObject } from '../../../../dot/js/Vector2.js';
import optionize, { EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import PhetioObject, { PhetioObjectOptions } from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import NumberIO from '../../../../tandem/js/types/NumberIO.js';
import ReferenceIO, { ReferenceIOState } from '../../../../tandem/js/types/ReferenceIO.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

type SelfOptions = EmptySelfOptions;
export type EnergyChunkPathMoverOptions = SelfOptions & PhetioObjectOptions;

type EnergyChunkPathMoverStateObject = {
  path: Vector2StateObject[];
  speed: number;
  pathFullyTraversed: boolean;
  nextPoint: Vector2StateObject;
  energyChunkReference: ReferenceIOState;
};

class EnergyChunkPathMover extends PhetioObject {

  public readonly energyChunk: EnergyChunk;
  private readonly path: Vector2[];
  private readonly speed: number;
  public pathFullyTraversed: boolean;
  private nextPoint: Vector2;

  /**
   * @param energyChunk - energy chunk to be moved
   * @param path - points along energy chunk path
   * @param speed - in meters per second
   * @param providedOptions
   */
  public constructor( energyChunk: EnergyChunk, path: Vector2[], speed: number, providedOptions?: EnergyChunkPathMoverOptions ) {

    const options = optionize<EnergyChunkPathMoverOptions, SelfOptions, PhetioObjectOptions>()( {

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: EnergyChunkPathMover.EnergyChunkPathMoverIO,
      phetioDynamicElement: true
    }, providedOptions );

    // validate args
    assert && assert( path.length > 0, 'Path must have at least one point' );
    assert && assert( speed >= 0, `speed must be a non-negative scalar. Received: ${speed}` );

    super( options );

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( energyChunk.isPhetioInstrumented() );

    this.energyChunk = energyChunk;
    this.path = path;
    this.speed = speed;
    this.pathFullyTraversed = false;
    this.nextPoint = path[ 0 ];
  }

  public toStateObject(): EnergyChunkPathMoverStateObject {
    return {
      path: ArrayIO( Vector2.Vector2IO ).toStateObject( this.path ),
      speed: this.speed,
      pathFullyTraversed: this.pathFullyTraversed,
      nextPoint: Vector2.Vector2IO.toStateObject( this.nextPoint ),
      energyChunkReference: ReferenceIO( EnergyChunk.EnergyChunkIO ).toStateObject( this.energyChunk )
    };
  }

  public static stateObjectToCreateElementArguments( stateObject: EnergyChunkPathMoverStateObject ): [ EnergyChunk, Vector2[], number ] {
    const energyChunk = ReferenceIO( EnergyChunk.EnergyChunkIO ).fromStateObject( stateObject.energyChunkReference ) as EnergyChunk;
    const path = ArrayIO( Vector2.Vector2IO ).fromStateObject( stateObject.path );
    return [ energyChunk, path, stateObject.speed ];
  }

  public applyState( stateObject: EnergyChunkPathMoverStateObject ): void {
    this.pathFullyTraversed = stateObject.pathFullyTraversed;

    // Find the actual reference to the current nextPoint, not just a new instance of Vector2 with the same value, see https://github.com/phetsims/energy-forms-and-changes/issues/357
    for ( let i = 0; i < this.path.length; i++ ) {
      const pathElement = this.path[ i ];
      if ( stateObject.nextPoint.x === pathElement.x && stateObject.nextPoint.y === pathElement.y ) {
        this.nextPoint = pathElement;
      }
    }
  }

  /**
   * advance chunk position along the path
   * @param dt - time step in seconds
   */
  public moveAlongPath( dt: number ): void {

    let distanceToTravel = dt * this.speed;

    while ( distanceToTravel > 0 && !this.pathFullyTraversed ) {

      const chunkPosition = this.energyChunk.positionProperty.get();

      const distanceToNextPoint = chunkPosition.distance( this.nextPoint );

      if ( distanceToTravel < distanceToNextPoint ) {

        // the energy chunk will not reach the next destination point during this step, so just move that direction
        const phi = this.nextPoint.minus( this.energyChunk.positionProperty.get() ).angle;
        const velocity = new Vector2( distanceToTravel, 0 ).rotated( phi );
        this.energyChunk.positionProperty.set( this.energyChunk.positionProperty.get().plus( velocity ) );
        distanceToTravel = 0; // no remaining distance
      }
      else {

        // arrived at next destination point
        distanceToTravel -= this.energyChunk.positionProperty.get().distance( this.nextPoint );
        this.energyChunk.positionProperty.set( this.nextPoint );

        if ( this.nextPoint === this.path[ this.path.length - 1 ] ) {

          // the end of the path has been reached
          this.pathFullyTraversed = true;
        }
        else {
          const indexOfCurrentNextPoint = this.path.indexOf( this.nextPoint );
          assert && assert( indexOfCurrentNextPoint !== -1,
            'This is likely a bug where nextPoint is a different Vector2 reference than on in this.path' );
          assert && assert( indexOfCurrentNextPoint < this.path.length - 1, 'should not be the last point yet' );

          // set the next destination point
          this.nextPoint = this.path[ indexOfCurrentNextPoint + 1 ];
        }
      }
    }
  }

  /**
   * get the last point in the path that the energy chunk will follow
   */
  public getFinalDestination(): Vector2 {
    return this.path[ this.path.length - 1 ];
  }

  /**
   * Create an energy chunk path entirely from offsets
   * @param parentPosition - the position of the parent element that is creating the path
   * @param offsets - offsets from the element position
   */
  public static createPathFromOffsets( parentPosition: Vector2, offsets: Vector2[] ): Vector2[] {
    const path = [];

    for ( let i = 0; i < offsets.length; i++ ) {
      path.push( parentPosition.plus( offsets[ i ] ) );
    }

    return path;
  }

  /**
   * Create an energy chunk path for radiated energy chunks
   * @param startingPosition - the starting position of the energy chunk
   * @param startingAngle - the angle (away from vertical) of the first segment in the path
   */
  public static createRadiatedPath( startingPosition: Vector2, startingAngle: number ): Vector2[] {
    const path = [];
    const segmentLength = 0.06; // in meters. empirically determined to look nice and make it past the top of the beaker
    const verticalSegment = new Vector2( 0, segmentLength );

    // calculate the first segment based on the desired starting angle
    const startingSegment = new Vector2( 0, segmentLength ).rotated( startingAngle );
    let currentPosition = startingPosition.plus( startingSegment );
    path.push( currentPosition );

    // add segments at random angles until the path gets close to the max height
    while ( currentPosition.plus( verticalSegment ).y < EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT ) {
      currentPosition = currentPosition.plus( verticalSegment.rotated( ( dotRandom.nextDouble() - 0.5 ) * Math.PI / 4 ) );
      path.push( currentPosition );
    }

    // go straight up to the max height cutoff point
    const finalSegment = new Vector2( 0, EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT - currentPosition.y );
    currentPosition = currentPosition.plus( finalSegment );
    path.push( currentPosition );

    return path;
  }

  /**
   * Create a straight-line energy chunk path at a valid random angle
   * @param position
   * @param validAngles - the range of possible angles to be randomly chosen
   */
  public static createRandomStraightPath( position: Vector2, validAngles: Range ): Vector2[] {
    const validRandomAngle = dotRandom.nextDouble() * ( validAngles.max - validAngles.min ) + validAngles.min;
    return this.createStraightPath( position, validRandomAngle );
  }

  /**
   * Create a straight-line energy chunk path
   * @param position - the position that the path is created from
   * @param angle - the angle of the path
   */
  public static createStraightPath( position: Vector2, angle: number ): Vector2[] {
    const path = [];

    // calculate the travel segment based on how high the chunk should go
    const yDistance = EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT - position.y;
    const xDistance = yDistance / Math.tan( angle ) + position.x;
    path.push( new Vector2( xDistance, yDistance ) );

    return path;
  }

  public static readonly EnergyChunkPathMoverIO = new IOType<EnergyChunkPathMover, EnergyChunkPathMoverStateObject>( 'EnergyChunkPathMoverIO', {
    valueType: EnergyChunkPathMover,
    toStateObject: energyChunkPathMover => energyChunkPathMover.toStateObject(),
    stateObjectToCreateElementArguments: stateObject => EnergyChunkPathMover.stateObjectToCreateElementArguments( stateObject ),
    applyState: ( energyChunkPathMover, stateObject ) => energyChunkPathMover.applyState( stateObject ),
    stateSchema: {
      path: ArrayIO( Vector2.Vector2IO ),
      speed: NumberIO,
      pathFullyTraversed: BooleanIO,
      nextPoint: Vector2.Vector2IO,
      energyChunkReference: ReferenceIO( EnergyChunk.EnergyChunkIO )
    }
  } );
}

energyFormsAndChanges.register( 'EnergyChunkPathMover', EnergyChunkPathMover );
export default EnergyChunkPathMover;