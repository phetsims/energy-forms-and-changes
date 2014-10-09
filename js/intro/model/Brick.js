//  Copyright 2002-2014, University of Colorado Boulder

/**
 * Class that represents a brick in the model.
 *
 * @author John Blanco
 */


define( function( require ) {
  'use strict';

  // modules

  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants

  var SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
  var DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.

  /**
   *
   * @param {Vector2} initialPosition
   * @param {Property} energyChunksVisibleProperty
   * @constructor
   */

  function Brick( initialPosition, energyChunksVisibleProperty ) {
    Block.call( this, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisibleProperty );

    //TODO: Need to check if these two next constants need to be placed here
    // Some constants needed for energy chunk mapping.
    this.ENERGY_AT_ROOM_TEMPERATURE = Math.pow( SURFACE_WIDTH, 3 ) * DENSITY * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE; // In joules.
    this.ENERGY_AT_WATER_FREEZING_TEMPERATURE = Math.pow( SURFACE_WIDTH, 3 ) * DENSITY * SPECIFIC_HEAT * EFACConstants.FREEZING_POINT_TEMPERATURE; // In joules.
  }

  return inherit( Block, Brick, {

    getFrontTextureImage: function() {
      return EnergyFormsAndChangesResources.Images.BRICK_TEXTURE_FRONT;
    },

    getTopTextureImage: function() {
      return EnergyFormsAndChangesResources.Images.BRICK_TEXTURE_TOP;
    },

    getSideTextureImage: function() {
      return EnergyFormsAndChangesResources.Images.BRICK_TEXTURE_RIGHT;
    },

    getColor: function() {
      return new Color( 200, 22, 11 );
    },

    getLabel: function() {
      return EnergyFormsAndChangesResources.Strings.BRICK;
    },

    getEnergyContainerCategory: function() {
      return EnergyContainerCategory.BRICK;
    }

  } );

} );


/*

 */


///**
// * Created by veillettem on 10/4/2014.
// */
//
//
//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.Color;
//import java.awt.Image;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.simsharing.messages.IUserComponent;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesResources;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesSimSharing;
//import edu.colorado.phet.energyformsandchanges.common.EFACConstants;
//
///**
// * @author John Blanco
// */
//public class Brick extends Block {
//
//  private static final double SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
//  private static final double DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.
//
//  // Some constants needed for energy chunk mapping.
//  public static final double ENERGY_AT_ROOM_TEMPERATURE = Math.pow( SURFACE_WIDTH, 3 ) * DENSITY * SPECIFIC_HEAT * EFACConstants.ROOM_TEMPERATURE; // In joules.
//  public static final double ENERGY_AT_WATER_FREEZING_TEMPERATURE = Math.pow( SURFACE_WIDTH, 3 ) * DENSITY * SPECIFIC_HEAT * EFACConstants.FREEZING_POINT_TEMPERATURE; // In joules.
//
//  protected Brick( ConstantDtClock clock, Vector2D initialPosition, BooleanProperty energyChunksVisible ) {
//    super( clock, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisible );
//  }
//
//  @Override public Image getFrontTextureImage() {
//    return EnergyFormsAndChangesResources.Images.BRICK_TEXTURE_FRONT;
//  }
//
//  @Override public Image getTopTextureImage() {
//    return EnergyFormsAndChangesResources.Images.BRICK_TEXTURE_TOP;
//  }
//
//  @Override public Image getSideTextureImage() {
//    return EnergyFormsAndChangesResources.Images.BRICK_TEXTURE_RIGHT;
//  }
//
//  @Override public Color getColor() {
//    return new Color( 200, 22, 11 );
//  }
//
//  @Override public String getLabel() {
//    return EnergyFormsAndChangesResources.Strings.BRICK;
//  }
//
//  public EnergyContainerCategory getEnergyContainerCategory() {
//    return EnergyContainerCategory.BRICK;
//  }
//
//  @Override public IUserComponent getUserComponent() {
//    return EnergyFormsAndChangesSimSharing.UserComponents.brick;
//  }
//}
//
