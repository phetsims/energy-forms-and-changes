// Copyright 2016-2019, University of Colorado Boulder

/**
 * base class for energy sources, converters, and users, that can be connected together to create what is referred to
 * as an "energy system" in this simulation
 *
 * @author John Blanco
 * @author Andrew Adare
 * @author Jesse Greenberg
 */
define( require => {
  'use strict';

  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const ObservableArray = require( 'AXON/ObservableArray' );
  const PositionableFadableModelElement = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/PositionableFadableModelElement' );
  const Vector2 = require( 'DOT/Vector2' );

  class EnergySystemElement extends PositionableFadableModelElement {

    /**
     * @param {Image} iconImage
     * @param {Tandem} tandem
     */
    constructor( iconImage, tandem ) {

      super( new Vector2( 0, 0 ), 1.0, tandem );

      // @public (read-only) {image}
      this.iconImage = iconImage;

      // @public (read-only) {ObservableArray.<EnergyChunk>}
      this.energyChunkList = new ObservableArray();

      // @public {BooleanProperty}
      this.activeProperty = new BooleanProperty( false, {
        tandem: tandem.createTandem( 'activeProperty' ),
        phetioReadOnly: true,
        phetioDocumentation: 'whether the system element is active. system elements are active when visible on the screen'
      } );

      // @public {string} - a11y name of this energy system element, used by assistive technology, set by sub-types
      this.a11yName = 'name not set';

      // at initialization, oldPosition is null, so skip that case with lazyLink
      this.positionProperty.lazyLink( ( newPosition, oldPosition ) => {
        const deltaPosition = newPosition.minus( oldPosition );
        this.energyChunkList.forEach( chunk => {
          chunk.translate( deltaPosition.x, deltaPosition.y );
        } );
      } );
    }

    /**
     * activate this element
     * @public
     */
    activate() {
      this.activeProperty.set( true );
    }

    /**
     * deactivate this element - this causes all energy chunks to be removed
     * @public
     */
    deactivate() {
      this.activeProperty.set( false );
      this.clearEnergyChunks();
    }

    /**
     * clear daughter energy chunks
     * @protected
     */
    clearEnergyChunks() {
      this.energyChunkList.clear();
    }
  }

  return energyFormsAndChanges.register( 'EnergySystemElement', EnergySystemElement );
} );

