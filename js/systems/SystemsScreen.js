// Copyright 2016-2020, University of Colorado Boulder

/**
 * The 'Systems' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import Image from '../../../scenery/js/nodes/Image.js';
import systemsScreenIcon from '../../images/systems_screen_icon_png.js';
import EFACConstants from '../common/EFACConstants.js';
import energyFormsAndChangesStrings from '../energy-forms-and-changes-strings.js';
import energyFormsAndChanges from '../energyFormsAndChanges.js';
import SystemsModel from './model/SystemsModel.js';
import SystemsScreenView from './view/SystemsScreenView.js';

const systemsString = energyFormsAndChangesStrings.systems;


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

energyFormsAndChanges.register( 'SystemsScreen', SystemsScreen );
export default SystemsScreen;