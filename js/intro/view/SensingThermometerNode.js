// Copyright 2014-2017, University of Colorado Boulder

/**
 * Thermometer node that updates its displayed temperature and color based on
 * what is being "sensed" by the supplied thermometer model element.
 *
 * @author John Blanco
 */

define( function( require ) {
  'use strict';

  var energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  var inherit = require( 'PHET_CORE/inherit' );
  var ThermometerNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/ThermometerNode' );

  /**
   *
   * @param {Thermometer} thermometer
   * @constructor
   */
  function SensingThermometerNode( thermometer ) {
    ThermometerNode.call( this );
    this.thermometer = thermometer;
    var self = this;

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

  energyFormsAndChanges.register( 'SensingThermometerNode', SensingThermometerNode );

  return inherit( ThermometerNode, SensingThermometerNode );
} );
