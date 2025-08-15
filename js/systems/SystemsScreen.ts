// Copyright 2016-2025, University of Colorado Boulder

/**
 * The 'Systems' screen in the Energy Forms and Changes simulation.
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Martin Veillette (Berea College)
 * @author Andrew Adare (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Property from '../../../axon/js/Property.js';
import Screen from '../../../joist/js/Screen.js';
import ScreenIcon from '../../../joist/js/ScreenIcon.js';
import Image from '../../../scenery/js/nodes/Image.js';
import Tandem from '../../../tandem/js/Tandem.js';
import systemsScreenIcon_png from '../../images/systemsScreenIcon_png.js';
import EFACConstants from '../common/EFACConstants.js';
import energyFormsAndChanges from '../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../EnergyFormsAndChangesStrings.js';
import SystemsModel from './model/SystemsModel.js';
import SystemsScreenView from './view/SystemsScreenView.js';


class SystemsScreen extends Screen<SystemsModel, SystemsScreenView> {

  public constructor( tandem: Tandem ) {

    const options = {
      name: EnergyFormsAndChangesStrings.systemsStringProperty,
      backgroundColorProperty: new Property( EFACConstants.SECOND_SCREEN_BACKGROUND_COLOR ),
      homeScreenIcon: new ScreenIcon( new Image( systemsScreenIcon_png ), {
        maxIconWidthProportion: 1,
        maxIconHeightProportion: 1
      } ),
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