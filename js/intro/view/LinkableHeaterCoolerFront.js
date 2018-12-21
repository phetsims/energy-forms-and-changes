// Copyright 2018, University of Colorado Boulder

/**
 * A HeaterCoolerFront Node that can be linked up with another HeaterCoolerNode.
 *
 * @author Chris Klusendorf
 */
define( require => {
  'use strict';

  // modules
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const HeaterCoolerFront = require( 'SCENERY_PHET/HeaterCoolerFront' );

  class LinkableHeaterCoolerFront extends HeaterCoolerFront {
    /**
     * @param {NumberProperty} [heatCoolAmountProperty]
     * @param {Object} [options]
     * @constructor
     */
    constructor( heatCoolAmountProperty, options ) {
      super( heatCoolAmountProperty, options );

      // @private
      this.options = options;
      this.heatCoolAmountProperty = heatCoolAmountProperty;

      this.heatCoolAmountObserver = heatCoolAmount => {
        this.heatCoolAmountProperty.value = heatCoolAmount;
      };
    }

    /**
     * set a property to follow and make this heater unpickable
     * @param {Property} property
     * @public
     */
    setFollowProperty( property ) {
      if ( !property.hasListener( this.heatCoolAmountObserver ) ) {
        property.link( this.heatCoolAmountObserver );
      }
      this.slider.pickable = false;
    }

    /**
     * clear the property being followed and make this heater pickable
     * @param {Property} property
     * @public
     */
    clearFollowProperty( property ) {
      if ( property.hasListener( this.heatCoolAmountObserver ) ) {
        property.unlink( this.heatCoolAmountObserver );
      }
      this.heatCoolAmountProperty.set( 0 ); // this should be generalized if non-snappy sliders are desired
      this.slider.pickable = true;
    }
  }

  return energyFormsAndChanges.register( 'LinkableHeaterCoolerFront', LinkableHeaterCoolerFront );
} );
