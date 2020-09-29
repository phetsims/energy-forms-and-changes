// Copyright 2014-2020, University of Colorado Boulder

/**
 * type that represents a chunk of energy in the view
 *
 * @author John Blanco
 */

import EnumerationProperty from '../../../../axon/js/EnumerationProperty.js';
import NumberProperty from '../../../../axon/js/NumberProperty.js';
import Property from '../../../../axon/js/Property.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import Vector2IO from '../../../../dot/js/Vector2IO.js';
import Vector2Property from '../../../../dot/js/Vector2Property.js';
import merge from '../../../../phet-core/js/merge.js';
import PhetioObject from '../../../../tandem/js/PhetioObject.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import BooleanIO from '../../../../tandem/js/types/BooleanIO.js';
import IOType from '../../../../tandem/js/types/IOType.js';
import ReferenceIO from '../../../../tandem/js/types/ReferenceIO.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyType from './EnergyType.js';

// static data
let instanceCount = 0; // counter for creating unique IDs

class EnergyChunk extends PhetioObject {

  /**
   * @param {EnergyType} initialEnergyType
   * @param {Vector2} initialPosition
   * @param {Vector2} initialVelocity
   * @param {BooleanProperty} visibleProperty
   * @param {Object} [options]
   */
  constructor( initialEnergyType, initialPosition, initialVelocity, visibleProperty, options ) {

    options = merge( {
      id: null, // to support recreating the same energyChunk through PhET-iO state

      // phet-io
      tandem: Tandem.REQUIRED,
      phetioType: EnergyChunk.EnergyChunkIO,
      phetioDynamicElement: true
    }, options );

    super( options );

    // @public
    this.positionProperty = new Vector2Property( initialPosition, {
      useDeepEquality: true,
      tandem: options.tandem.createTandem( 'positionProperty' )
    } );

    // @public - for simple 3D layering effects
    this.zPositionProperty = new NumberProperty( 0, {
      tandem: options.tandem.createTandem( 'zPositionProperty' )
    } );

    // @public
    this.energyTypeProperty = new EnumerationProperty( EnergyType, initialEnergyType, {
      tandem: options.tandem.createTandem( 'energyTypeProperty' )
    } );

    // @public
    this.visibleProperty = visibleProperty;

    assert && Tandem.VALIDATION && this.isPhetioInstrumented() && assert( this.visibleProperty.isPhetioInstrumented(),
      'if this EnergyChunk is instrumented, then the visibleProperty should be too' );

    // @public (read-only) {number} - an ID that will be used to track this energy chunk
    this.id = options.id || instanceCount++;

    // @public (read-only) {Vector2} - for performance reasons, this is allocated once and should never be overwritten
    this.velocity = new Vector2( initialVelocity.x, initialVelocity.y );
  }

  // @public (EnergyChunkIO)
  toStateObject() {
    return {
      id: this.id,
      velocity: Vector2IO.toStateObject( this.velocity ),
      visiblePropertyPhetioID: this.visibleProperty.tandem.phetioID
    };
  }

  // @public (EnergyChunkIO)
  static stateToArgsForConstructor( stateObject ) {
    const visibleProperty = ReferenceIO( Property.PropertyIO( BooleanIO ) ).fromStateObject( stateObject.visiblePropertyPhetioID );
    return [ EnergyType.HIDDEN, Vector2.ZERO, Vector2IO.fromStateObject( stateObject.velocity ), visibleProperty, { id: stateObject.id } ];
  }

  /**
   * set the position
   * @param {number} x
   * @param {number} y
   * @public
   */
  setPositionXY( x, y ) {
    this.positionProperty.set( new Vector2( x, y ) );
  }

  /**
   * translate the energy chunk by amount specified
   * @param {number} x
   * @param {number} y
   * @public
   */
  translate( x, y ) {
    this.positionProperty.set( this.positionProperty.get().plusXY( x, y ) );
  }

  /**
   * translate the energy chunk based on its velocity
   * @param {number} dt - delta time
   * @public
   */
  translateBasedOnVelocity( dt ) {

    // When setting PhET-iO state, the EnergyChunk is already in its correct spot, so don't alter that based on Property
    // listeners, see https://github.com/phetsims/energy-forms-and-changes/issues/362
    if ( !phet.joist.sim.isSettingPhetioStateProperty.value ) {
      this.translate( this.velocity.x * dt, this.velocity.y * dt );
    }
  }

  /**
   * set the X and Y velocity of the energy chunk
   * @param {number} x
   * @param {number} y
   * @public
   */
  setVelocityXY( x, y ) {
    this.velocity.setXY( x, y );
  }

  /**
   * set the velocity of the energy chunk (using a vector)
   * @param {Vector2} newVelocity
   * @public
   */
  setVelocity( newVelocity ) {
    this.velocity.set( newVelocity );
  }

  /**
   * @public
   */
  reset() {
    this.positionProperty.reset();
    this.zPositionProperty.reset();
    this.energyTypeProperty.reset();
    this.visibleProperty.reset();
  }

  /**
   * @public
   * @override
   */
  dispose() {
    this.positionProperty.dispose();
    this.zPositionProperty.dispose();
    this.energyTypeProperty.dispose();
    super.dispose();
  }
}

EnergyChunk.EnergyChunkIO = new IOType( 'EnergyChunkIO', {
  valueType: EnergyChunk,
  toStateObject: energyChunk => energyChunk.toStateObject(),
  stateToArgsForConstructor: EnergyChunk.stateToArgsForConstructor
} );

energyFormsAndChanges.register( 'EnergyChunk', EnergyChunk );
export default EnergyChunk;