// Copyright 2016-2025, University of Colorado Boulder

/**
 * a Scenery Node that represent a legend that describes the different types of energy chunks
 *
 * @author John Blanco (PhET Interactive Simulations)
 * @author Jesse Greenberg (PhET Interactive Simulations)
 * @author Andrew Adare (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import optionize, { type EmptySelfOptions } from '../../../../phet-core/js/optionize.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import HBox from '../../../../scenery/js/layout/nodes/HBox.js';
import VBox from '../../../../scenery/js/layout/nodes/VBox.js';
import Text from '../../../../scenery/js/nodes/Text.js';
import Panel, { PanelOptions } from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';

const chemicalString = EnergyFormsAndChangesStrings.chemical;
const electricalString = EnergyFormsAndChangesStrings.electrical;
const formsOfEnergyString = EnergyFormsAndChangesStrings.formsOfEnergy;
const lightString = EnergyFormsAndChangesStrings.light;
const mechanicalString = EnergyFormsAndChangesStrings.mechanical;
const thermalString = EnergyFormsAndChangesStrings.thermal;

// constants
const LEGEND_ENTRY_FONT = new PhetFont( 14 );

// Since this class doesn't introduce any new options beyond what Panel provides, we use EmptySelfOptions
type SelfOptions = EmptySelfOptions;

type EnergyChunkLegendOptions = SelfOptions & PanelOptions;

class EnergyChunkLegend extends Panel {

  public constructor( modelViewTransform: ModelViewTransform2, providedOptions?: EnergyChunkLegendOptions ) {

    const options = optionize<EnergyChunkLegendOptions, SelfOptions, PanelOptions>()( {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS
    }, providedOptions );

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
        EnergyChunkLegend.createEnergyChunkSymbol( mechanicalString, 'MECHANICAL', modelViewTransform ),
        EnergyChunkLegend.createEnergyChunkSymbol( electricalString, 'ELECTRICAL', modelViewTransform ),
        EnergyChunkLegend.createEnergyChunkSymbol( thermalString, 'THERMAL', modelViewTransform ),
        EnergyChunkLegend.createEnergyChunkSymbol( lightString, 'LIGHT', modelViewTransform ),
        EnergyChunkLegend.createEnergyChunkSymbol( chemicalString, 'CHEMICAL', modelViewTransform )
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
   */
  public static createEnergyChunkSymbol( labelString: string, energyType: EnergyType, modelViewTransform: ModelViewTransform2 ): HBox {
    const labelText = new Text( labelString, {
      font: LEGEND_ENTRY_FONT,
      maxWidth: 100
    } );

    // The EnergyChunks that are created here are not going to be used in the simulation, they are only needed for the
    // EnergyChunkNodes that are displayed in the legend.
    const iconNode = new EnergyChunkNode(
      new EnergyChunk( energyType, Vector2.ZERO, Vector2.ZERO, new BooleanProperty( true ), { tandem: Tandem.OPT_OUT } ),
      modelViewTransform
    );

    return new HBox( {
      children: [ iconNode, labelText ],
      spacing: 10
    } );
  }
}

energyFormsAndChanges.register( 'EnergyChunkLegend', EnergyChunkLegend );
export default EnergyChunkLegend;