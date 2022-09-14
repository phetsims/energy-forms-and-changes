// Copyright 2014-2022, University of Colorado Boulder

/**
 * the 'Intro' screen in the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import { Image } from '../../../scenery/js/imports.js';
import introScreenIcon_png from '../../images/introScreenIcon_png.js';
import EFACConstants from '../common/EFACConstants.js';
import EFACQueryParameters from '../common/EFACQueryParameters.js';
import BeakerType from '../common/model/BeakerType.js';
import energyFormsAndChanges from '../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../EnergyFormsAndChangesStrings.js';
import BlockType from './model/BlockType.js';
import EFACIntroModel from './model/EFACIntroModel.js';
import EFACIntroScreenView from './view/EFACIntroScreenView.js';


class EFACIntroScreen extends Screen {

  /**
   * @param {Tandem} tandem
   */
  constructor( tandem ) {

    const options = {
      name: EnergyFormsAndChangesStrings.introStringProperty,
      backgroundColorProperty: new Property( EFACConstants.FIRST_SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new Image( introScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
      maxDT: EFACConstants.maxDT,
      tandem: tandem
    };

    const blocksToCreate = [];
    const beakersToCreate = [];

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

    super(
      () => new EFACIntroModel(
        blocksToCreate,
        beakersToCreate,
        EFACQueryParameters.burners,
        tandem.createTandem( 'model' )
      ),
      model => new EFACIntroScreenView( model, tandem.createTandem( 'view' ) ),
      options
    );
  }
}

energyFormsAndChanges.register( 'EFACIntroScreen', EFACIntroScreen );
export default EFACIntroScreen;