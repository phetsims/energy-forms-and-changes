// Copyright 2014-2025, University of Colorado Boulder

/**
 * String literal union that defines the types of thermal energy containers, primarily used for determining the rate at which heat is
 * transferred between different items
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

export const EnergyContainerCategoryValues = [ 'IRON', 'BRICK', 'WATER', 'OLIVE_OIL', 'AIR' ] as const;
type EnergyContainerCategory = typeof EnergyContainerCategoryValues[number];

export default EnergyContainerCategory;