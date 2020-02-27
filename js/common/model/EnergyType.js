// Copyright 2014-2019, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import Enumeration from '../../../../phet-core/js/Enumeration.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

// @public
const EnergyType = Enumeration.byKeys( [ 'THERMAL', 'ELECTRICAL', 'MECHANICAL', 'LIGHT', 'CHEMICAL', 'HIDDEN' ] );

energyFormsAndChanges.register( 'EnergyType', EnergyType );
export default EnergyType;