// Copyright 2018-2025, University of Colorado Boulder

/**
 * Beaker types for EFAC
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

export const BeakerTypeValues = [ 'WATER', 'OLIVE_OIL' ] as const;

type BeakerType = ( typeof BeakerTypeValues )[number];

export default BeakerType;