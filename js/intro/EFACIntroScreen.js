// Copyright 2014-2019, University of Colorado Boulder

/**
 * the 'Intro' screen in the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */
define( require => {
  'use strict';

  // modules
  const BlockType = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/BlockType' );
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EFACIntroModel = require( 'ENERGY_FORMS_AND_CHANGES/intro/model/EFACIntroModel' );
  const EFACIntroScreenView = require( 'ENERGY_FORMS_AND_CHANGES/intro/view/EFACIntroScreenView' );
  const EFACQueryParameters = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACQueryParameters' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const Image = require( 'SCENERY/nodes/Image' );
  const Property = require( 'AXON/Property' );
  const Screen = require( 'JOIST/Screen' );

  // strings
  const introString = require( 'string!ENERGY_FORMS_AND_CHANGES/intro' );

  // images
  const introScreenIcon = require( 'image!ENERGY_FORMS_AND_CHANGES/intro_screen_icon.png' );

  class EFACIntroScreen extends Screen {

    /**
     * @param {Tandem} tandem
     */
    constructor( tandem ) {

      const options = {
        name: introString,
        backgroundColorProperty: new Property( EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR ),
        homeScreenIcon: new Image( introScreenIcon ),
        maxDT: EFACConstants.maxDT,
        tandem: tandem
      };

      super(
        () => new EFACIntroModel(
          EFACQueryParameters.blocks.map( blockString => {
            if ( blockString === 'iron' ) {
              return BlockType.IRON;
            }
            else if ( blockString === 'brick' ) {
              return BlockType.BRICK;
            }
          } ),
          tandem.createTandem( 'model' )
        ),
        model => new EFACIntroScreenView( model, tandem.createTandem( 'view' ) ),
        options
      );
    }
  }

  return energyFormsAndChanges.register( 'EFACIntroScreen', EFACIntroScreen );
} );
