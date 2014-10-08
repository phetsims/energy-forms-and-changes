// Copyright 2002-2014, University of Colorado Boulder


/**
 * A simple horizontal surface.  This is represented by a range of x values
 * and a single y value.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  // Imports
  var inherit = require( 'PHET_CORE/inherit' );

  /**
   * @param {Range} xRange
   * @param {Number} yPos
   * @param {ModelElement} owner
   * @constructor
   */
  function HorizontalSurface( xRange, yPos, owner ) {
    this.xRange = xRange;
    this.yPos = yPos;
    this.owner = owner;
    this.elementOnSurface = null;
  }

  inherit( Object, HorizontalSurface, {

    overlapsWith: function( surface ) {
      return ( this.xRange.intersectsExclusive( surface.xRange ) );
    },

    getCenterX: function() {
      return this.xRange.getCenter();
    },

    getOwner: function() {
      return this.owner;
    },

    getElementOnSurface: function() {
      return this.elementOnSurface;
    },

    addElementToSurface: function( modelElement ) {
      assert && assert( this.elementOnSurface === null, 'Only one thing on surface allowed at a time' );
      this.elementOnSurface = modelElement;
    },

    clearSurface: function() {
      this.elementOnSurface = null;
    }

  } );
} );

//
//// Copyright 2002-2012, University of Colorado
//package edu.colorado.phet.energyformsandchanges.intro.model;
//
//import edu.colorado.phet.common.phetcommon.util.DoubleRange;
//
///**
// * A simple horizontal surface.  This is represented by a range of x values
// * and a single y value.
// *
// * @author John Blanco
// */
//public class HorizontalSurface {
//  public final DoubleRange xRange;
//  public final double yPos;
//  private ModelElement elementOnSurface = null;
//
//  private final ModelElement owner;
//
//  public HorizontalSurface( DoubleRange xRange, double yPos, ModelElement owner ) {
//    this.xRange = xRange;
//    this.yPos = yPos;
//    this.owner = owner;
//  }
//
//  public boolean overlapsWith( HorizontalSurface surface ) {
//    return ( xRange.intersectsExclusive( surface.xRange ) );
//  }
//
//  public double getCenterX() {
//    return xRange.getCenter();
//  }
//
//  public ModelElement getOwner() {
//    return owner;
//  }
//
//  public ModelElement getElementOnSurface() {
//    return elementOnSurface;
//  }
//
//  public void addElementToSurface( ModelElement modelElement ) {
//    assert elementOnSurface == null; // Only one thing on surface allowed at a time.
//    elementOnSurface = modelElement;
//  }
//
//  public void clearSurface() {
//    elementOnSurface = null;
//  }
//
//  @Override
//  public boolean equals( final Object o ) {
//    if ( this == o ) { return true; }
//    if ( o == null || getClass() != o.getClass() ) { return false; }
//
//    final HorizontalSurface that = (HorizontalSurface) o;
//
//    return Double.compare( that.yPos, yPos ) == 0 && !( xRange != null ? !xRange.equals( that.xRange ) : that.xRange != null );
//
//  }
//
//  @Override
//  public int hashCode() {
//    int result;
//    long temp;
//    result = xRange != null ? xRange.hashCode() : 0;
//    temp = yPos != +0.0d ? Double.doubleToLongBits( yPos ) : 0L;
//    result = 31 * result + (int) ( temp ^ ( temp >>> 32 ) );
//    return result;
//  }
//}