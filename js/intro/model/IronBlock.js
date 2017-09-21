// Copyright 2014-2017, University of Colorado Boulder

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
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var SPECIFIC_HEAT = 450; // In J/kg-K
  var DENSITY = 7800; // In kg/m^3, source = design document.

  // strings
  var ironString = require( 'string!ENERGY_FORMS_AND_CHANGES/iron' );

  // counter used by constructor to create unique IDs
  var idCounter = 0;

  /**
   *
   * @param {Vector2} initialPosition
   * @param {Property.<boolean>} energyChunksVisibleProperty
   * @constructor
   */
  function IronBlock( initialPosition, energyChunksVisibleProperty ) {
    Block.call( this, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisibleProperty );
    this.id = 'iron-block-' + idCounter++;
  }

  energyFormsAndChanges.register( 'IronBlock', IronBlock );

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
      return ironString;
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

