// Copyright 2016-2019, University of Colorado Boulder

/**
 * The 'Systems' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );
  const SystemsModel = require( 'ENERGY_FORMS_AND_CHANGES/systems/model/SystemsModel' );
  const SystemsScreenView = require( 'ENERGY_FORMS_AND_CHANGES/systems/view/SystemsScreenView' );

  // strings
  const systemsString = require( 'string!ENERGY_FORMS_AND_CHANGES/systems' );

  // images
  const systemsScreenIcon = require( 'image!ENERGY_FORMS_AND_CHANGES/systems_screen_icon.png' );

  class SystemsScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      const options = {
        name: systemsString,
        backgroundColorProperty: new Property( EFACConstants.SECOND_SCREEN_BACKGROUND_COLOR ),
        homeScreenIcon: new Image( systemsScreenIcon ),
        maxDT: EFACConstants.maxDT,
        tandem: tandem
      };

      super(
        () => new SystemsModel( tandem.createTandem( 'model' ) ),
        model => new SystemsScreenView( model, tandem.createTandem( 'view' ) ),
        options
      );
    }
  }

  return energyFormsAndChanges.register( 'SystemsScreen', SystemsScreen );
} );

