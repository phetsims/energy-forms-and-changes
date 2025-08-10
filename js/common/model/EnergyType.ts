// Copyright 2014-2022, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const EnergyType = EnumerationDeprecated.byKeys( [ 'THERMAL', 'ELECTRICAL', 'MECHANICAL', 'LIGHT', 'CHEMICAL', 'HIDDEN' ] );

energyFormsAndChanges.register( 'EnergyType', EnergyType );
export default EnergyType;