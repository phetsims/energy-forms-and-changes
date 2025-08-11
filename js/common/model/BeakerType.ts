// Copyright 2018-2022, University of Colorado Boulder

/**
 * Beaker types for EFAC
 *
 * @author Chris Klusendorf
 */

export const BeakerTypeValues = [ 'WATER', 'OLIVE_OIL' ] as const;

type BeakerType = ( typeof BeakerTypeValues )[number];

export default BeakerType;