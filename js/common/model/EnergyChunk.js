// Copyright 2002-2015, University of Colorado

/**
 * Class that represents a chunk of energy in the view.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules
  var inherit = require( 'PHET_CORE/inherit' );
  var PropertySet = require( 'AXON/PropertySet' );
  //var Vector2 = require( 'DOT/Vector2' );

  /**
   *
   * @param {EnergyType} initialEnergyType
   * @param {Vector2} initialPosition
   * @param {Vector2} initialVelocity
   * @param {Property.<boolean>} visibilityControlProperty
   * @returns {Vector2}
   * @constructor
   */
  function EnergyChunk( initialEnergyType, initialPosition, initialVelocity, visibilityControlProperty ) {

    PropertySet.call( this, {
      position: initialPosition,
      zPosition: 0,  // Used for some simple 3D layering effects.
      energyType: initialEnergyType,
      visible: null // a boolean
    } );

    this.visibleProperty = visibilityControlProperty;
    this.velocity = initialVelocity;
  }

  return inherit( Object, EnergyChunk, {
    /**
     * Function that translate the energy chunk by a vector movement
     * @param {Vector2} movement
     */
    translate: function( movement ) {
      this.position = this.position.plus( movement );
    },

    /**
     * Function that translates the energy chunk based on its velocity
     * @param {number} time
     */
    translateBasedOnVelocity: function( time ) {
      this.translate( this.velocity.times( time ) );
    },

    /**
     * Function that returns the velocity of the energy chunk
     * @returns {Vector2}
     */
    getVelocity: function() {
      return this.velocity.copy();
    },

    //TODO make sure setVelocity has been renamed everywhere
    /**
     * Function that sets the X and Y velocity of the energy chunk
     * @param {number} x
     * @param {number} y
     */
    setVelocityXY: function( x, y ) {
      this.velocity.setXY( x, y );
    },

    /**
     * Function that sets the velocity of the energy chunk (using a vector)
     * @param {Vector2} newVelocity
     */
    setVelocity: function( newVelocity ) {
      this.velocity.set( newVelocity );
    }

  } );
} );


///**
// * Created by veillettem on 10/4/2014.
// */
//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.common.model;
//
//import javax.swing.*;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.model.property.ObservableProperty;
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//
///**
// * Class that represents a chunk of energy in the view.
// *
// * @author John Blanco
// */
//public class EnergyChunk {
//
//  //-------------------------------------------------------------------------
//  // Instance Data
//  //-------------------------------------------------------------------------
//
//  // Position in model space.
//  public final Property<Vector2D> position;
//  public final Property<Double> zPosition = new Property<Double>( 0.0 ); // Used for some simple 3D layering effects.
//
//  // Velocity.  At the time of this writing, this is only used in the
//  // algorithms that distribute energy chunks in a container.
//  private Vector2D velocity = new Vector2D( 0, 0 ); // In meters/sec.
//
//  // Property that controls visibility in view.
//  public final ObservableProperty<Boolean> visible;
//
//  // Energy type.  This can change during the life of the energy chunk.
//  public final Property<EnergyType> energyType = new Property<EnergyType>( null );
//
//  //-------------------------------------------------------------------------
//  // Constructor(s)
//  //-------------------------------------------------------------------------
//
//  public EnergyChunk( EnergyType initialEnergyType, double x, double y, ObservableProperty<Boolean> visibilityControl ) {
//    this( initialEnergyType, new Vector2D( x, y ), visibilityControl );
//  }
//
//  public EnergyChunk( EnergyType initialEnergyType, Vector2D initialPosition, ObservableProperty<Boolean> visibilityControl ) {
//    this( initialEnergyType, initialPosition, new Vector2D( 0, 0 ), visibilityControl );
//  }
//
//  public EnergyChunk( EnergyType initialEnergyType, Vector2D initialPosition, Vector2D initialVelocity, ObservableProperty<Boolean> visibilityControl ) {
//    this.position = new Property<Vector2D>( initialPosition );
//    this.energyType.set( initialEnergyType );
//    this.visible = visibilityControl;
//    this.velocity = initialVelocity;
//  }
//
//  //-------------------------------------------------------------------------
//  // Methods
//  //-------------------------------------------------------------------------
//
//  public void translate( Vector2D movement ) {
//    position.set( position.plus( movement ) );
//  }
//
//  public void translateBasedOnVelocity( double time ) {
//    translate( velocity.times( time ) );
//  }
//
//  public Vector2D getVelocity() {
//    return new Vector2D( velocity );
//  }
//
//  public void setVelocity( double x, double y ) {
//    velocity = new Vector2D( x, y );
//  }
//
//  public void setVelocity( Vector2D newVelocity ) {
//    setVelocity( newVelocity.x, newVelocity.y );
//  }
//}
