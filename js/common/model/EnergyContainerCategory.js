// Copyright 2014-2022, University of Colorado Boulder

/**
 * enum that defines the types of thermal energy containers, primarily used for determining the rate at which heat is
 * transferred between different items
 *
 * @author John Blanco
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import EnumerationDeprecated from '../../../../phet-core/js/EnumerationDeprecated.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';

const EnergyContainerCategory = EnumerationDeprecated.byKeys( [ 'IRON', 'BRICK', 'WATER', 'OLIVE_OIL', 'AIR' ] );

energyFormsAndChanges.register( 'EnergyContainerCategory', EnergyContainerCategory );
export default EnergyContainerCategory;