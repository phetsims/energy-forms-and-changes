// Copyright 2018-2022, University of Colorado Boulder

/**
 * Block types for EFAC intro
 *
 * @author Chris Klusendorf
 */

export const BlockTypeValues = [ 'IRON', 'BRICK' ] as const;

type BlockType = typeof BlockTypeValues[number];

export default BlockType;