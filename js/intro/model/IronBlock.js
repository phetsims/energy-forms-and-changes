// Copyright 2002-2014, University of Colorado

/**
 * Class that represents a block of iron in the view.
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


  //constants
  var SPECIFIC_HEAT = 450; // In J/kg-K
  var DENSITY = 7800; // In kg/m^3, source = design document.

  /**
   *
   * @param {Vector2} initialPosition
   * @param {property} energyChunksVisibleProperty
   * @constructor
   */
  function IronBlock( initialPosition, energyChunksVisibleProperty ) {
    Block.call( this, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisibleProperty );
  }

  return inherit( Block, IronBlock, {
    getColor: function() {
      return new Color( 150, 150, 150 );
    },

    getLabel: function() {
      return EnergyFormsAndChangesResources.Strings.IRON;
    },

    getEnergyContainerCategory: function() {
      return EnergyContainerCategory.IRON;
    }
  } );
} );

//TODO: delete commented lines
//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import java.awt.Color;
//
//import edu.colorado.phet.common.phetcommon.math.vector.Vector2D;
//import edu.colorado.phet.common.phetcommon.model.clock.ConstantDtClock;
//import edu.colorado.phet.common.phetcommon.model.property.BooleanProperty;
//import edu.colorado.phet.common.phetcommon.simsharing.messages.IUserComponent;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesResources;
//import edu.colorado.phet.energyformsandchanges.EnergyFormsAndChangesSimSharing;
//
///**
// * Class that represents a block of iron in the view.
// *
// * @author John Blanco
// */
//public class IronBlock extends Block {
//
//  private static final double SPECIFIC_HEAT = 450; // In J/kg-K
//  //    private static final double SPECIFIC_HEAT = 275; // In J/kg-K
//  private static final double DENSITY = 7800; // In kg/m^3, source = design document.
//
//  protected IronBlock( ConstantDtClock clock, Vector2D initialPosition, BooleanProperty energyChunksVisible ) {
//    super( clock, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisible );
//  }
//
//  @Override public Color getColor() {
//    return new Color( 150, 150, 150 );
//  }
//
//  @Override public String getLabel() {
//    return EnergyFormsAndChangesResources.Strings.IRON;
//  }
//
//  public EnergyContainerCategory getEnergyContainerCategory() {
//    return EnergyContainerCategory.IRON;
//  }
//
//  @Override public IUserComponent getUserComponent() {
//    return EnergyFormsAndChangesSimSharing.UserComponents.ironBlock;
//  }
//}
