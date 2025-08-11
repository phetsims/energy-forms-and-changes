// Copyright 2014-2022, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import IntentionalAny from '../../../../phet-core/js/types/IntentionalAny.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

const EnergyType = EnumerationDeprecated.byKeys( [ 'THERMAL', 'ELECTRICAL', 'MECHANICAL', 'LIGHT', 'CHEMICAL', 'HIDDEN' ] ) as IntentionalAny;

energyFormsAndChanges.register( 'EnergyType', EnergyType );
export default EnergyType;