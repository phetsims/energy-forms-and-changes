// Copyright 2002-2012, University of Colorado


/**
 * Types of thermal energy containers, primarily used for determining the
 * rate at which heat is transferred between different items.
 *
 * @author John Blanco
 */


define( function() {
  'use strict';


  var EnergyContainerCategory = Object.freeze( {
    IRON: 'iron',
    BRICK: 'brick',
    WATER: 'water',
    AIR: 'air'
  } );

  return EnergyContainerCategory;
} );

//
//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.model;
//
///**
// * Types of thermal energy containers, primarily used for determining the
// * rate at which heat is transferred between different items.
// */
//public enum EnergyContainerCategory {
//  IRON, BRICK, WATER, AIR
//}
