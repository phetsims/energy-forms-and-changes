// Copyright 2016-2020, University of Colorado Boulder

/**
 * a type that is used to move an energy chunk along a pre-defined path
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import ArrayIO from '../../../../tandem/js/types/ArrayIO.js';
import ObjectIO from '../../../../tandem/js/types/ObjectIO.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

class EnergyChunkPathMover extends PhetioObject {

  /**
   * @param {EnergyChunk} energyChunk - energy chunk to be moved
   * @param {Vector2[]} path - points along energy chunk path
   * @param {number} speed - in meters per second
   * @param {Object} [options]
   */
  constructor( energyChunk, path, speed, options ) {

    options = merge( {

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: EnergyChunkPathMoverIO,
      phetioDynamicElement: true
    }, options );

    // validate args
    assert && assert( energyChunk instanceof EnergyChunk, `energyChunk is not of correct type: ${energyChunk}` );
    assert && assert( path.length > 0, 'Path must have at least one point' );
    assert && assert( speed >= 0, `speed must be a non-negative scalar. Received: ${speed}` );

    super( options );

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( energyChunk.isPhetioInstrumented() );

    // @public (read-only) {EnergyChunk}
    this.energyChunk = energyChunk;

    // @private
    this.path = path;
    this.speed = speed;
    this.pathFullyTraversed = false;
    this.nextPoint = path[ 0 ];
  }

  // @public (EnergyChunkPathMoverIO)
  toStateObject() {
    return {
      path: ArrayIO( Vector2IO ).toStateObject( this.path ),
      speed: this.speed,
      pathFullyTraversed: this.pathFullyTraversed,
      nextPoint: this.nextPoint,
      energyChunkPhetioID: this.energyChunk.tandem.phetioID,
      phetioID: this.tandem.phetioID
    };
  }

  // @public (EnergyChunkPathMoverIO)
  static stateToArgsForConstructor( stateObject ) {
    const energyChunk = ReferenceIO( EnergyChunk.EnergyChunkIO ).fromStateObject( stateObject.energyChunkPhetioID );
    const path = ArrayIO( Vector2IO ).fromStateObject( stateObject.path );
    return [ energyChunk, path, stateObject.speed ];
  }

  // @public (EnergyChunkPathMoverIO)
  applyState( stateObject ) {
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
   * @param  {number} dt - time step in seconds
   * @public
   */
  moveAlongPath( dt ) {

    let distanceToTravel = dt * this.speed;

    while ( distanceToTravel > 0 && !this.pathFullyTraversed ) {

      const chunkPosition = this.energyChunk.positionProperty.get();

      assert && assert( chunkPosition instanceof Vector2, `Expected a Vector2, got this: ${chunkPosition}` );

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
   * @returns {Vector2}
   * @public
   */
  getFinalDestination() {
    return this.path[ this.path.length - 1 ];
  }

  /**
   * Create an energy chunk path entirely from offsets
   * @param parentPosition {Vector2} the position of the parent element that is creating the path
   * @param offsets {Vector2[]} offsets from the element position
   * @returns {Vector[]}
   * @public
   */
  static createPathFromOffsets( parentPosition, offsets ) {
    const path = [];

    for ( let i = 0; i < offsets.length; i++ ) {
      path.push( parentPosition.plus( offsets[ i ] ) );
    }

    return path;
  }

  /**
   * Create an energy chunk path for radiated energy chunks
   * @param startingPosition {Vector2} the starting position of the energy chunk
   * @param startingAngle {number} the angle (away from vertical) of the first segment in the path
   * @returns {Vector[]}
   * @public
   */
  static createRadiatedPath( startingPosition, startingAngle ) {
    const path = [];
    const segmentLength = 0.06; // in meters. empirically determined to look nice and make it past the top of the beaker
    const verticalSegment = new Vector2( 0, segmentLength );

    // calculate the first segment based on the desired starting angle
    const startingSegment = new Vector2( 0, segmentLength ).rotated( startingAngle );
    let currentPosition = startingPosition.plus( startingSegment );
    path.push( currentPosition );

    // add segments at random angles until the path gets close to the max height
    while ( currentPosition.plus( verticalSegment ).y < EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT ) {
      currentPosition = currentPosition.plus( verticalSegment.rotated( ( phet.joist.random.nextDouble() - 0.5 ) * Math.PI / 4 ) );
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
   * @param position {Vector2}
   * @param validAngles {Range} the range of possible angles to be randomly chosen
   * @returns {Vector[]}
   * @public
   */
  static createRandomStraightPath( position, validAngles ) {
    const validRandomAngle = phet.joist.random.nextDouble() * ( validAngles.max - validAngles.min ) + validAngles.min;
    return this.createStraightPath( position, validRandomAngle );
  }

  /** Create a straight-line energy chunk path
   * @param position {Vector2} the position that the path is created from
   * @param angle {number} the angle of the path
   * @returns {Vector[]}
   * @public
   */
  static createStraightPath( position, angle ) {
    const path = [];

    // calculate the travel segment based on how high the chunk should go
    const yDistance = EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT - position.y;
    const xDistance = yDistance / Math.tan( angle ) + position.x;
    path.push( new Vector2( xDistance, yDistance ) );

    return path;
  }
}

class EnergyChunkPathMoverIO extends ObjectIO {

  // @public @override
  static toStateObject( energyChunkPathMover ) { return energyChunkPathMover.toStateObject(); }

  // @public @override
  static stateToArgsForConstructor( state ) { return EnergyChunkPathMover.stateToArgsForConstructor( state ); }

  // @public @override
  static applyState( energyChunkPathMover, stateObject ) { energyChunkPathMover.applyState( stateObject ); }
}
EnergyChunkPathMoverIO.documentation = 'My Documentation';
EnergyChunkPathMoverIO.typeName = 'EnergyChunkPathMoverIO';
EnergyChunkPathMoverIO.validator = { valueType: EnergyChunkPathMover };

// @public
EnergyChunkPathMover.EnergyChunkPathMoverIO = EnergyChunkPathMoverIO;

energyFormsAndChanges.register( 'EnergyChunkPathMover', EnergyChunkPathMover );
export default EnergyChunkPathMover;