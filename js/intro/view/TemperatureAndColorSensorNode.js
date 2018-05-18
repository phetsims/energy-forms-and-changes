// Copyright 2014-2018, University of Colorado Boulder

/**
 * A Scenery Node that portrays a thermometer and a triangular indicator of the precise location where the temperature
 * is being sensed. The triangular indicator can be filled with a color to make it more clear what exactly is being
 * measured.
 *
 * @author John Blanco
 */
define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/ThermometerNode' );

  /**
   * @param {Thermometer} thermometer - model of a thermometer
   * @constructor
   */
  function TemperatureAndColorSensorNode( thermometer ) {

    var self = this;
    ThermometerNode.call( this );

    // @public (read-only) {Thermometer}
    this.thermometer = thermometer;

    // monitor the attributes of the thermometer model and update the appearance as changes occur
    thermometer.sensedTemperatureProperty.link( function( sensedTemperature ) {
      self.setSensedTemperature( sensedTemperature );
    } );
    thermometer.sensedElementColorProperty.link( function( sensedColor ) {
      self.setSensedColor( sensedColor );
    } );
    thermometer.activeProperty.link( function( active ) {
      self.setVisible( active );
    } );
  }

  energyFormsAndChanges.register( 'TemperatureAndColorSensorNode', TemperatureAndColorSensorNode );

  return inherit( ThermometerNode, TemperatureAndColorSensorNode );
} );
