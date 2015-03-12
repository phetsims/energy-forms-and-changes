// Copyright 2002-2015, University of Colorado

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
  //var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var SPECIFIC_HEAT = 450; // In J/kg-K
  var DENSITY = 7800; // In kg/m^3, source = design document.

  /**
   *
   * @param {Vector2} initialPosition
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function IronBlock( initialPosition, energyChunksVisibleProperty ) {
    Block.call( this, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisibleProperty );
  }

  return inherit( Block, IronBlock, {

    /**
     * *
     * @returns {Color}
     */
    getColor: function() {
      return new Color( 150, 150, 150 );
    },

    /**
     * *
     * @returns {EnergyContainerCategory.IRON|*|exports.IRON}
     */
    getLabel: function() {
      return EnergyFormsAndChangesResources.Strings.IRON;
    },

    /**
     * *
     * @returns {exports.IRON|*}
     */
    getEnergyContainerCategory: function() {
      return EnergyContainerCategory.IRON;
    }
  } );
} );

