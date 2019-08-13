// Copyright 2016-2019, University of Colorado Boulder

/**
 * a Scenery Node that represent a legend that describes the different types of energy chunks
 *
 * @author John Blanco
 * @author Jesse Greenberg
 * @author Andrew Adare
 */
define( require => {
  'use strict';

  // modules
  const EFACConstants = require( 'ENERGY_FORMS_AND_CHANGES/common/EFACConstants' );
  const EnergyChunk = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyChunk' );
  const EnergyChunkNode = require( 'ENERGY_FORMS_AND_CHANGES/common/view/EnergyChunkNode' );
  const energyFormsAndChanges = require( 'ENERGY_FORMS_AND_CHANGES/energyFormsAndChanges' );
  const EnergyType = require( 'ENERGY_FORMS_AND_CHANGES/common/model/EnergyType' );
  const HBox = require( 'SCENERY/nodes/HBox' );
  const Panel = require( 'SUN/Panel' );
  const PhetFont = require( 'SCENERY_PHET/PhetFont' );
  const BooleanProperty = require( 'AXON/BooleanProperty' );
  const Text = require( 'SCENERY/nodes/Text' );
  const VBox = require( 'SCENERY/nodes/VBox' );
  const Vector2 = require( 'DOT/Vector2' );

  // strings
  const chemicalString = require( 'string!ENERGY_FORMS_AND_CHANGES/chemical' );
  const electricalString = require( 'string!ENERGY_FORMS_AND_CHANGES/electrical' );
  const formsOfEnergyString = require( 'string!ENERGY_FORMS_AND_CHANGES/formsOfEnergy' );
  const lightString = require( 'string!ENERGY_FORMS_AND_CHANGES/light' );
  const mechanicalString = require( 'string!ENERGY_FORMS_AND_CHANGES/mechanical' );
  const thermalString = require( 'string!ENERGY_FORMS_AND_CHANGES/thermal' );

  // constants
  const LEGEND_ENTRY_FONT = new PhetFont( 14 );

  class EnergyChunkLegend extends Panel {

    /**
     * @param {ModelViewTransform2} modelViewTransform
     * @param {Object} [options]
     */
    constructor( modelViewTransform, options ) {

      options = _.extend( {
        fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
        stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
        lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
        cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS
      }, options );

      // title that appears at the top of the legend
      const titleText = new Text( formsOfEnergyString, {
        font: new PhetFont( {
          size: 14,
          weight: 'bold'
        } ),
        maxWidth: 130
      } );

      // add an entry for each type of energy that can appear in the sim
      const content = new VBox( {
        children: [
          titleText,
          EnergyChunkLegend.createEnergyChunkSymbol( mechanicalString, EnergyType.MECHANICAL, modelViewTransform ),
          EnergyChunkLegend.createEnergyChunkSymbol( electricalString, EnergyType.ELECTRICAL, modelViewTransform ),
          EnergyChunkLegend.createEnergyChunkSymbol( thermalString, EnergyType.THERMAL, modelViewTransform ),
          EnergyChunkLegend.createEnergyChunkSymbol( lightString, EnergyType.LIGHT, modelViewTransform ),
          EnergyChunkLegend.createEnergyChunkSymbol( chemicalString, EnergyType.CHEMICAL, modelViewTransform )
        ],
        align: 'left',
        spacing: 6
      } );

      super( content, options );
    }

    /**
     * helper function to create energy chunk legend entries
     * @param labelString - the label for this legend entry
     * @param energyType - the type of energy for this legend entry
     * @param modelViewTransform - needs to be passed in to create an EnergyChunk
     * @public
     */
    static createEnergyChunkSymbol( labelString, energyType, modelViewTransform ) {
      const labelText = new Text( labelString, {
        font: LEGEND_ENTRY_FONT,
        maxWidth: 100
      } );

      // The EnergyChunks that are created here are not going to be used in the simulation, they are only needed for the
      // EnergyChunkNodes that are displayed in the legend.
      const iconNode = new EnergyChunkNode(
        new EnergyChunk( energyType, Vector2.ZERO, Vector2.ZERO, new BooleanProperty( true ) ),
        modelViewTransform
      );

      return new HBox( {
        children: [ iconNode, labelText ],
        spacing: 10
      } );
    }
  }

  return energyFormsAndChanges.register( 'EnergyChunkLegend', EnergyChunkLegend );
} );

