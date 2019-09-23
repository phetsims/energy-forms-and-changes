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
  const BeakerType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/BeakerType' );
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

      const blocksToCreate = [];
      let beakersToCreate = [];

      // map query parameter string to element type and split by blocks vs beakers
      EFACQueryParameters.elements.forEach( elementKey => {
        if ( elementKey === EFACConstants.IRON_KEY ) {
          blocksToCreate.push( BlockType.IRON );
        }
        else if ( elementKey === EFACConstants.BRICK_KEY ) {
          blocksToCreate.push( BlockType.BRICK );
        }
        else if ( elementKey === EFACConstants.WATER_KEY ) {
          beakersToCreate.push( BeakerType.WATER );
        }
        else if ( elementKey === EFACConstants.OLIVE_OIL_KEY ) {
          beakersToCreate.push( BeakerType.OLIVE_OIL );
        }
      } );

      if( beakersToCreate.length > EFACConstants.MAX_NUMBER_OF_INTRO_BEAKERS ) {
        assert && assert( false, `Only ${EFACConstants.MAX_NUMBER_OF_INTRO_BEAKERS} beakers may be added, but \
${beakersToCreate.length} were provided: ${beakersToCreate}` );
        beakersToCreate = beakersToCreate.slice( 0, EFACConstants.MAX_NUMBER_OF_INTRO_BEAKERS );
      }

      super(
        () => new EFACIntroModel(
          blocksToCreate,
          beakersToCreate,
          tandem.createTandem( 'model' )
        ),
        model => new EFACIntroScreenView( model, tandem.createTandem( 'view' ) ),
        options
      );
    }
  }

  return energyFormsAndChanges.register( 'EFACIntroScreen', EFACIntroScreen );
} );
