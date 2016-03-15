// Copyright 2014-2015, University of Colorado Boulder

/**
 * @author John Blanco
 * @author Jesse Greenberg
 * @author  Andrew Adare
 */
define( function( require ) {
  'use strict';

  var inherit = require( 'PHET_CORE/inherit' );
  var Text = require( 'SCENERY/nodes/Text' );
  var PhetFont = require( 'SCENERY_PHET/PhetFont' );
  var Panel = require( 'SUN/Panel' );
  var VBox = require( 'SCENERY/nodes/VBox' );
  var HBox = require( 'SCENERY/nodes/HBox' );
  var EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  var EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );

  // strings
  var formsOfEnergyString = require( 'string!ENERGY_FORMS_AND_CHANGES/formsOfEnergy' );
  var chemicalString = require( 'string!ENERGY_FORMS_AND_CHANGES/chemical' );
  var electricalString = require( 'string!ENERGY_FORMS_AND_CHANGES/electrical' );
  var mechanicalString = require( 'string!ENERGY_FORMS_AND_CHANGES/mechanical' );
  var thermalString = require( 'string!ENERGY_FORMS_AND_CHANGES/thermal' );
  var lightString = require( 'string!ENERGY_FORMS_AND_CHANGES/light' );

  // constants
  var LEGEND_ENTRY_FONT = new PhetFont( 14 );

  /**
   *
   * @constructor
   */
  function EnergyChunkLegend( options ) {

    options = _.extend( {}, options );

    var titleText = new Text( formsOfEnergyString, {
      font: new PhetFont( {
        size: 14,
        weight: 'bold'
      } )
    } );

    var createEnergyChunkSymbol = function( labelString, energyType ) {
      var labelText = new Text( labelString, {
        font: LEGEND_ENTRY_FONT
      } );

      var iconNode = EnergyChunkNode.createEnergyChunkNode( energyType );

      return new HBox( {
        children: [ iconNode, labelText ],
        spacing: 10
      } );
    };

    var content = new VBox( {
      children: [
        titleText,
        createEnergyChunkSymbol( mechanicalString, EnergyType.MECHANICAL ),
        createEnergyChunkSymbol( electricalString, EnergyType.ELECTRICAL ),
        createEnergyChunkSymbol( thermalString, EnergyType.THERMAL ),
        createEnergyChunkSymbol( lightString, EnergyType.LIGHT ),
        createEnergyChunkSymbol( chemicalString, EnergyType.CHEMICAL )
      ],
      align: 'left',
      spacing: 6
    } );

    Panel.call( this, content, options );

  }

  return inherit( Panel, EnergyChunkLegend, {
    /**
     * @public
     * @param {Rectangle} returnRect
     */
    setReturnRect: function( returnRect ) {
      this.returnRect = returnRect;
    }
  } );
} );
