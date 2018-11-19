// Copyright 2016-2018, University of Colorado Boulder

/**
 * base class for energy sources, converters, and users, that can be connected together to create what is referred to
 * as an "energy system" in this simulation
 *
 * @author  John Blanco
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var BooleanProperty = require( 'AXON/BooleanProperty' );
  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PositionableFadableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/PositionableFadableModelElement' );
  var Vector2 = require( 'DOT/Vector2' );

  /**
   * @param {Image} iconImage
   * @constructor
   */
  function EnergySystemElement( iconImage ) {

    PositionableFadableModelElement.call( this, new Vector2( 0, 0 ), 1.0 );

    // @public (read-only) {image}
    this.iconImage = iconImage;

    // @public (read-only) {ObservableArray.<EnergyChunk>}
    this.energyChunkList = new ObservableArray();

    // @public {BooleanProperty}
    this.activeProperty = new BooleanProperty( false );

    // @public {string} - a11y name of this energy system element, used by assistive technology, set by sub-types
    this.a11yName = 'name not set';

    var self = this;

    // at initialization, oldPosition is null, so skip that case with lazyLink
    this.positionProperty.lazyLink( function( newPosition, oldPosition ) {
      var deltaPosition = newPosition.minus( oldPosition );
      self.energyChunkList.forEach( function( chunk ) {
        chunk.translate( deltaPosition );
      } );
    } );
  }

  energyFormsAndChanges.register( 'EnergySystemElement', EnergySystemElement );

  return inherit( PositionableFadableModelElement, EnergySystemElement, {

    /**
     * activate this element
     * @public
     */
    activate: function() {
      this.activeProperty.set( true );
    },

    /**
     * deactivate this element - this causes all energy chunks to be removed
     * @public
     */
    deactivate: function() {
      this.activeProperty.set( false );
      this.clearEnergyChunks();
    },

    /**
     * clear daughter energy chunks
     * @protected
     */
    clearEnergyChunks: function() {
      this.energyChunkList.clear();
    }
  } );
} );

