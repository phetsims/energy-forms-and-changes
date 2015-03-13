//  Copyright 2002-2015, University of Colorado Boulder

/**
 *  Model for the 'Intro' screen of the Energy Forms And Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( function( require ) {
  'use strict';

  // modules
  //var Air = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Air' );
  //   var Beaker = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Beaker' );
//  var BeakerContainer = require( 'ENERGY_FORMS_AND_CHANGES/common/intro/model/BeakerContainer' );
//  var BlockNode = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/BlockNode' );
//  var Brick = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Brick' );
//
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
//  var EFACIntroCanvas = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EFACIntroCanvas' );
  var ElementFollowingThermometer = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/ElementFollowingThermometer' );

  var EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  //var Burner = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Burner' );
  var BurnerStandNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/BurnerStandNode' );
  var inherit = require( 'PHET_CORE/inherit' );
//  var IronBlock = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/IronBlock' );
  var PropertySet = require( 'AXON/PropertySet' );

  //var Range = require( 'DOT/Range' );

  var Thermometer = require( 'ENERGY_FORMS_AND_CHANGES/common/model/Thermometer' );
  var Vector2 = require( 'DOT/Vector2' );


  // constants
//   Dimension2D STAGE_SIZE = CenteredStage.DEFAULT_STAGE_SIZE;
  var EDGE_INSET = 10;
  var BURNER_EDGE_TO_HEIGHT_RATIO = 0.2; // Multiplier empirically determined for best look.


  // Initial thermometer location, intended to be away from any model objects.
  var INITIAL_THERMOMETER_LOCATION = new Vector2( 100, 100 );

  var NUM_THERMOMETERS = 3;

  /**
   * Main constructor for EnergyFormsAndChangesIntroModel, which contains all of the model logic for the entire sim screen.
   * @constructor
   */
  function EnergyFormsAndChangesIntroModel() {

    var model = this;

    PropertySet.call( this, {
      energyChunksVisible: false
    } );


    this.thermometers = [];
    var i;
    for ( i = 0; i < NUM_THERMOMETERS; i++ ) {
      var thermometer = new ElementFollowingThermometer( this, INITIAL_THERMOMETER_LOCATION, false );
      model.thermometers.push( thermometer );
    }

    // Add handling for a special case where the user drops something
    // (generally a block) in the beaker behind this thermometer.
    // The action is to automatically move the thermometer to a
    // location where it continues to sense the beaker temperature.
    // This was requested after interviews.

//    thermometer.sensedElementColor.addObserver( new ChangeObserver );
//    {
//      var blockWidthIncludingPerspective = ironBlock.getProjectedShape().bounds.width;
//      update( newColor, oldColor );
//      {
//        var xRange = new Range( beaker.getRect().getCenterX() - blockWidthIncludingPerspective / 2,
//            beaker.getRect().getCenterX() + blockWidthIncludingPerspective / 2 );
//        if ( oldColor === EFACConstants.WATER_COLOR_IN_BEAKER && !thermometer.userControlled.get() && xRange.contains( thermometer.position.x ) ) {
//          thermometer.userControlled.set( true ); // Must toggle userControlled to enable element following.
//          thermometer.position.set( new Vector2( beaker.getRect().getMaxX() - 0.01, beaker.getRect().getMinY() + beaker.getRect().getHeight() * 0.33 ) );
//          thermometer.userControlled.set( false ); // Must toggle userControlled to enable element following.
//        }
//      }
//    }
  }


  return inherit( PropertySet, EnergyFormsAndChangesIntroModel, {

    // Called by the animation loop. Optional, so if your model has no animation, you can omit this.
    // step: function( dt ) {
    // Handle model animation here.
    //   this.positionY = this.positionY - 10 * dt;

    //}
  } );
} );
