// Copyright 2018-2025, University of Colorado Boulder

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

export const BlockTypeValues = [ 'IRON', 'BRICK' ] as const;

type BlockType = typeof BlockTypeValues[number];

export default BlockType;