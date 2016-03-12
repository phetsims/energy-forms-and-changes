// Copyright 2016, University of Colorado Boulder

/**
 * Module representing the sun (as an energy source) in the model.  This
 * includes the clouds that can block the sun's rays.
 *
 * @author  John Blanco (original Java)
 * @author  Andrew Adare (js port)
 */
define( function( require ) {
  'use strict';

  // Modules
  var inherit = require( 'PHET_CORE/inherit' );
  var EnergySource = require( 'ENERGY_FORMS_AND_CHANGES/energy-systems/model/EnergySource' );

  // TODO: rename to EFACResources
  var EnergyFormsAndChangesResources = require( 'ENERGY_FORMS_AND_CHANGES/EnergyFormsAndChangesResources' );
  var Vector2 = require( 'DOT/Vector2' );
  var Random = require( 'DOT/Random' );

  // Constants
  var RADIUS = 0.02; // In meters, apparent size, not (obviously) actual size.
  var OFFSET_TO_CENTER_OF_SUN = new Vector2( -0.05, 0.12 );
  var ENERGY_CHUNK_EMISSION_PERIOD = 0.11; // In seconds.
  var RAND = new Random();
  var MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN = 0.5; // In meters.

  // Constants that control the nature of the emission sectors.  These are
  // used to make emission look random yet still have a fairly steady rate
  // within each sector.  One sector is intended to point at the solar panel.
  var NUM_EMISSION_SECTORS = 10;
  var EMISSION_SECTOR_SPAN = 2 * Math.PI / NUM_EMISSION_SECTORS;
  var EMISSION_SECTOR_OFFSET = EMISSION_SECTOR_SPAN * 0.71; // Used to tweak sector positions to make sure solar panel gets consistent flow of E's.


  // TODO
  // Clouds that can potentially block the sun's rays.  The positions are
  // set so that they appear between the sun and the solar panel, and must
  // not overlap with one another.
  // public final List<Cloud> clouds = new ArrayList<Cloud>() {{
  //     add( new Cloud( new Vector2D( 0.02, 0.105 ), getObservablePosition() ) );
  //     add( new Cloud( new Vector2D( 0.017, 0.0875 ), getObservablePosition() ) );
  //     add( new Cloud( new Vector2D( -0.01, 0.08 ), getObservablePosition() ) );
  // }};


  /**
   * Sun object as an energy source
   *
   * @param {[type]} solarPanel          [description]
   * @param {[type]} energyChunksVisible [description]
   * @constructor
   */
  function SunEnergySource( solarPanel, energyChunksVisible ) {

    EnergySource.call( this, new Image( EnergyFormsAndChangesResources.SUN_ICON ) );

    this.solarPanel = solarPanel;
    this.energyChunksVisible = energyChunksVisible;

    // TODO: implement this when Clouds exist. Pasting Java snippet for now.
    // Add/remove clouds based on the value of the cloudiness property.
    // cloudiness.addObserver( new VoidFunction1 < Double > () {
    //   public void apply( Double cloudiness ) {
    //     for ( int i = 0; i < clouds.size(); i++ ) {
    //       // Stagger the existence strength of the clouds.
    //       clouds.get( i ).existenceStrength.set( MathUtil.clamp( 0, cloudiness * clouds.size() - i, 1 ) );
    //     }
    //   }
    // } );

  }

  return inherit( EnergySource, SunEnergySource, {

    // For linter
    temp: function() {
      console.log(
        RADIUS,
        OFFSET_TO_CENTER_OF_SUN,
        ENERGY_CHUNK_EMISSION_PERIOD,
        RAND,
        MAX_DISTANCE_OF_E_CHUNKS_FROM_SUN,
        NUM_EMISSION_SECTORS,
        EMISSION_SECTOR_SPAN,
        EMISSION_SECTOR_OFFSET );
    }
  } );
} );
