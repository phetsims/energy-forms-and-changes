// Copyright 2016, University of Colorado Boulder

/**
 * Base class for energy sources, converters, and users.
 *
 * @author  Andrew Adare
 * @author  Jesse Greenberg
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  // var PropertySet = require( 'AXON/PropertySet' );
  var ObservableArray = require( 'AXON/ObservableArray' );
  var PositionableFadableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/PositionableFadableModelElement' );
  var Vector2 = require( 'DOT/Vector2' );

  // TODO: untested
  /**
   * Energy system element
   *
   * @param {Image} iconImage
   * @constructor
   */
  function EnergySystemElement( iconImage ) {

    PositionableFadableModelElement.call( this, new Vector2( 0, 0 ), 1.0 );

    // @public
    this.iconImage = iconImage;
    this.energyChunkList = new ObservableArray();
    this.addProperty( 'active', false );

    var thisElement = this;
    this.positionProperty.link( function( newPosition, oldPosition ) {
      var deltaPosition = newPosition.minus( oldPosition );
      thisElement.energyChunkList.forEach( function( chunk ) {
        chunk.translate( deltaPosition );
      } );
    } );
  }

  return inherit( PositionableFadableModelElement, EnergySystemElement, {
    /**
     * Activate this element
     *
     */
    activate: function() {
      this.activeProperty.set( true );
    },

    /**
     * Deactivate this element. All energy chunks are removed.
     *
     */
    deactivate: function() {
      this.activeProperty.set( false );
      this.clearEnergyChunks();
    },

    /**
     * Clear daughter energy chunks
     *
     */
    clearEnergyChunks: function() {
      this.energyChunkList.clear();
    }
  } );
} );
