// Copyright 2002-2015, University of Colorado

/**
 * Basic thermometer that senses temperature, has a position. The thermometer
 * has only a point and a temperature in the model.  Its visual representation
 * is left entirely to the view.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // modules
  //var Color = require( 'SCENERY/util/Color' );
  var inherit = require( 'PHET_CORE/inherit' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var PhetColorScheme = require( 'SCENERY_PHET/PhetColorScheme' );
  //var PropertySet = require( 'AXON/PropertySet' );
  var UserMovableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/UserMovableModelElement' );
  var Vector2 = require( 'DOT/Vector2' );
  /**
   *
   * @param {model} model
   * @param {Vector2} initialPosition
   * @param {Boolean} initiallyActive
   * @constructor
   */
  function Thermometer( model, initialPosition, initiallyActive ) {

    UserMovableModelElement.call( this, initialPosition );

    this.model = model;

    this.addProperty( 'sensedTemperature', EFACConstants.ROOM_TEMPERATURE );
    this.addProperty( 'sensedElementColor', PhetColorScheme.RED_COLORBLIND );

    // Property that is used primarily to control visibility in the view.
    this.addProperty( 'active', initiallyActive );
  }

  return inherit( UserMovableModelElement, Thermometer, {

    step: function( dt ) {
      //TODO comment back in
//      var temperatureAndColor = this.model.getTemperatureAndColorAtLocation( this.position );
//      this.sensedTemperature = temperatureAndColor.temperature;
//      this.sensedElementColor = temperatureAndColor.color;
    },

    reset: function() {
      this.activeProperty.reset();
    },

    getBottomSurfaceProperty: function() {
      return null;
    }
  } );

} );

//
//// Copyright 2002-2015, University of Colorado

//package edu.colorado.phet.energyformsandchanges.common.model;
//
//import java.awt.Color;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockAdapter;
//import edu.colorado.phet.common.phetcommon.model.clock.ClockEvent;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.model.property.Property;
//import edu.colorado.phet.common.phetcommon.simsharing.messages.IUserComponent;
//import edu.colorado.phet.common.phetcommon.view.PhetColorScheme;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesSimSharing;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//import edu.colorado.phet.energyformsandchanges.intro.model.HorizontalSurface;
//import edu.colorado.phet.energyformsandchanges.intro.model.TemperatureAndColor;
//import edu.colorado.phet.energyformsandchanges.intro.model.UserMovableModelElement;
//
///**
// * Basic thermometer that senses temperature, has a position. The thermometer
// * has only a point and a temperature in the model.  Its visual representation
// * is left entirely to the view.
// *
// * @author John Blanco
// */
//public class Thermometer extends UserMovableModelElement {
//
//  public final Property<Double> sensedTemperature = new Property<Double>( EFACConstants.ROOM_TEMPERATURE );
//  public final Property<Color> sensedElementColor = new Property<Color>( PhetColorScheme.RED_COLORBLIND );
//
//  // Property that is used primarily to control visibility in the view.
//  public final BooleanProperty active;
//
//  /**
//   * Constructor.
//   */
//  public Thermometer( ConstantDtClock clock, final ITemperatureModel model, Vector2D initialPosition, boolean initiallyActive ) {
//    super( initialPosition );
//    active = new BooleanProperty( initiallyActive );
//
//    // Update the sensed temperature at each clock tick.
//    clock.addClockListener( new ClockAdapter() {
//      @Override public void clockTicked( ClockEvent clockEvent ) {
//        TemperatureAndColor temperatureAndColor = model.getTemperatureAndColorAtLocation( position );
//        sensedTemperature.set( temperatureAndColor.temperature );
//        sensedElementColor.set( temperatureAndColor.color );
//      }
//    } );
//  }
//
//  @Override public void reset() {
//    active.reset();
//  }
//
//  @Override public IUserComponent getUserComponent() {
//    return EnergyFormsAndChangesSimSharing.UserComponents.thermometer;
//  }
//
//  @Override public Property<HorizontalSurface> getBottomSurfaceProperty() {
//    // Doesn't have a bottom surface, and can't be set on anything.
//    return null;
//  }
//}

