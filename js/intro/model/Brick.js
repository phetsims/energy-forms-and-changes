// Copyright 2014-2018, University of Colorado Boulder

/**
 * type that represents a brick in the model
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  // modules
  var Block = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/Block' );
  var Color = require( 'SCENERY/util/Color' );
  var EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  var EnergyContainerCategory = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EnergyContainerCategory' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );

  // constants
  var SPECIFIC_HEAT = 840; // In J/kg-K, source = design document.
  var DENSITY = 3300; // In kg/m^3, source = design document plus some tweaking to keep chunk numbers reasonable.

  // images
  var brickTextureFrontImage = require( 'image!ENERGY_FORMS_AND_CHANGES/brick_texture_front.png' );
  var brickTextureRightImage = require( 'image!ENERGY_FORMS_AND_CHANGES/brick_texture_right.png' );
  var brickTextureTopImage = require( 'image!ENERGY_FORMS_AND_CHANGES/brick_texture_top.png' );

  // strings
  var brickString = require( 'string!ENERGY_FORMS_AND_CHANGES/brick' );

  // counter used by constructor to create unique IDs
  var idCounter = 0;

  /**
   * @param {Vector2} initialPosition
   * @param {BooleanProperty} energyChunksVisibleProperty
   * @constructor
   */
  function Brick( initialPosition, energyChunksVisibleProperty ) {
    Block.call( this, initialPosition, DENSITY, SPECIFIC_HEAT, energyChunksVisibleProperty );
    this.id = 'brick-' + idCounter++;
  }

  energyFormsAndChanges.register( 'Brick', Brick );

  return inherit(
    Block,
    Brick,
    {

      /**
       * @returns {image}
       * @public
       */
      getFrontTextureImage: function() {
        return brickTextureFrontImage;
      },

      /**
       * @returns {image}
       * @public
       */
      getTopTextureImage: function() {
        return brickTextureTopImage;
      },

      /**
       * @returns {image}
       * @public
       */
      getSideTextureImage: function() {
        return brickTextureRightImage;
      },

      /**
       * @returns {Color}
       * @public
       */
      getColor: function() {
        return new Color( 223, 22, 12 );
      },

      /**
       * @public read-only
       * @returns {EnergyContainerCategory.BRICK|*|exports.BRICK}
       */
      getLabel: function() {
        return brickString;
      },

      /**
       *
       * @returns {exports.BRICK|*}
       */
      getEnergyContainerCategory: function() {
        return EnergyContainerCategory.BRICK;
      }
    },
    {

      // statics

      // some constants needed for energy chunk mapping, values in joules
      ENERGY_AT_ROOM_TEMPERATURE: Math.pow( EFACConstants.SURFACE_WIDTH, 3 ) * DENSITY * SPECIFIC_HEAT *
                                  EFACConstants.ROOM_TEMPERATURE,
      ENERGY_AT_WATER_FREEZING_TEMPERATURE: Math.pow( EFACConstants.SURFACE_WIDTH, 3 ) * DENSITY * SPECIFIC_HEAT *
                                            EFACConstants.FREEZING_POINT_TEMPERATURE
    } );
} );

