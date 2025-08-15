// Copyright 2014-2022, University of Colorado Boulder

/**
 * enum that represents the various types of energy used in this simulation
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

export const EnergyTypeValues = [ 'THERMAL', 'ELECTRICAL', 'MECHANICAL', 'LIGHT', 'CHEMICAL', 'HIDDEN' ] as const;
type EnergyType = typeof EnergyTypeValues[number];

export default EnergyType;