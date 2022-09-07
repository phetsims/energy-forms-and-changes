// Copyright 2016-2022, University of Colorado Boulder

/**
 * main view for the 'Systems' screen of the Energy Forms and Changes simulation
 *
 * @author John Blanco
 * @author Martin Veillette (Berea College)
 * @author Jesse Greenberg
 * @author Andrew Adare
 * @author Chris Klusendorf (PhET Interactive Simulations)
 */

import BooleanProperty from '../../../../axon/js/BooleanProperty.js';
import Multilink from '../../../../axon/js/Multilink.js';
import Bounds2 from '../../../../dot/js/Bounds2.js';
import Utils from '../../../../dot/js/Utils.js';
import Vector2 from '../../../../dot/js/Vector2.js';
import ScreenView from '../../../../joist/js/ScreenView.js';
import StringUtils from '../../../../phetcommon/js/util/StringUtils.js';
import ModelViewTransform2 from '../../../../phetcommon/js/view/ModelViewTransform2.js';
import ResetAllButton from '../../../../scenery-phet/js/buttons/ResetAllButton.js';
import PhetFont from '../../../../scenery-phet/js/PhetFont.js';
import TimeControlNode from '../../../../scenery-phet/js/TimeControlNode.js';
import { HBox, Node, Rectangle, Text } from '../../../../scenery/js/imports.js';
import Checkbox from '../../../../sun/js/Checkbox.js';
import Panel from '../../../../sun/js/Panel.js';
import Tandem from '../../../../tandem/js/Tandem.js';
import EFACConstants from '../../common/EFACConstants.js';
import EnergyChunk from '../../common/model/EnergyChunk.js';
import EnergyType from '../../common/model/EnergyType.js';
import EnergyChunkNode from '../../common/view/EnergyChunkNode.js';
import SkyNode from '../../common/view/SkyNode.js';
import energyFormsAndChanges from '../../energyFormsAndChanges.js';
import EnergyFormsAndChangesStrings from '../../EnergyFormsAndChangesStrings.js';
import BeakerHeaterNode from './BeakerHeaterNode.js';
import BeltNode from './BeltNode.js';
import BikerNode from './BikerNode.js';
import EnergyChunkLegend from './EnergyChunkLegend.js';
import EnergySystemElementSelector from './EnergySystemElementSelector.js';
import FanNode from './FanNode.js';
import FaucetAndWaterNode from './FaucetAndWaterNode.js';
import GeneratorNode from './GeneratorNode.js';
import LightBulbNode from './LightBulbNode.js';
import SolarPanelNode from './SolarPanelNode.js';
import SunNode from './SunNode.js';
import TeaKettleNode from './TeaKettleNode.js';

const energySymbolsString = EnergyFormsAndChangesStrings.energySymbols;

// constants
const EDGE_INSET = 10; // screen edge padding, in screen coordinates
const SELECTOR_SPACING = 82; // space between energy system selector panel, in screen coordinates
const BOTTOM_CONTROL_PANEL_HEIGHT = 49; // manually coordinated to match similar panel on 1st screen

class SystemsScreenView extends ScreenView {

  /**
   * @param {SystemsModel} model
   * @param {Tandem} tandem
   */
  constructor( model, tandem ) {
    super( {
      tandem: tandem
    } );

    // tandems to nest energy systems in Studio
    const energySourcesTandem = tandem.createTandem( 'energySources' );
    const energyConvertersTandem = tandem.createTandem( 'energyConverters' );
    const energyUsersTandem = tandem.createTandem( 'energyUsers' );

    // @private {SystemsModel}
    this.model = model;

    // pdom - the screen summary to be read by assistive technology
    this.addChild( new Node( {
      tagName: 'div',
      innerContent: EnergyFormsAndChangesStrings.a11y.systemsScreenInteractionHint,
      descriptionContent: EnergyFormsAndChangesStrings.a11y.systemsScreenSummaryDescription
    } ) );

    // pdom - a description of the current configuration of the energy system to be read by assistive technology
    const energySystemConfigDescription = new Node( {
      tagName: 'h3',
      innerContent: EnergyFormsAndChangesStrings.a11y.energySystem,
      descriptionContent: EnergyFormsAndChangesStrings.a11y.energySystemHelpText
    } );
    this.addChild( energySystemConfigDescription );

    // update the a11y description as the selected element changes
    Multilink.multilink(
      [
        model.energySourcesCarousel.targetElementNameProperty,
        model.energyConvertersCarousel.targetElementNameProperty,
        model.energyUsersCarousel.targetElementNameProperty
      ],
      () => {
        const energySource = model.energySourcesCarousel.getSelectedElement();
        const energyConverter = model.energyConvertersCarousel.getSelectedElement();
        const energyUser = model.energyUsersCarousel.getSelectedElement();
        assert && assert( energySource.a11yName, 'the selected element has no accessibility name specified' );
        energySystemConfigDescription.descriptionContent = StringUtils.fillIn(
          EnergyFormsAndChangesStrings.a11y.energySystemHelpText,
          {
            producer: energySource.a11yName,
            converter: energyConverter.a11yName,
            user: energyUser.a11yName
          }
        );
      }
    );

    // convenience variable
    const layoutBounds = this.layoutBounds;

    // Create the model-view transform.  The primary units used in the model are meters, so significant zoom is used.
    // The multipliers for the 2nd parameter can be used to adjust where the point (0, 0) in the model, which is on the
    // middle of the screen above the counter as located in the view. Final arg is zoom factor from original Java sim -
    // smaller zooms out, larger zooms in.
    const mvtOriginX = Utils.roundSymmetric( layoutBounds.width * 0.5 );
    const mvtOriginY = Utils.roundSymmetric( layoutBounds.height * 0.475 );
    const modelViewTransform = ModelViewTransform2.createSinglePointScaleInvertedYMapping(
      Vector2.ZERO,
      new Vector2( mvtOriginX, mvtOriginY ),
      EFACConstants.SYSTEMS_MVT_SCALE_FACTOR
    );

    // create the energy user nodes

    // @private
    this.beakerHeaterNode = new BeakerHeaterNode(
      model.beakerHeater,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      energyUsersTandem.createTandem( 'beakerHeaterNode' )
    );

    const incandescentBulbNode = new LightBulbNode(
      model.incandescentBulb,
      model.energyChunksVisibleProperty,
      modelViewTransform, {
        bulbType: 'incandescent',
        tandem: energyUsersTandem.createTandem( 'incandescentBulbNode' )
      }
    );
    const fluorescentBulbNode = new LightBulbNode(
      model.fluorescentBulb,
      model.energyChunksVisibleProperty,
      modelViewTransform, {
        bulbType: 'fluorescent',
        tandem: energyUsersTandem.createTandem( 'fluorescentBulbNode' )
      }
    );
    const fanNode = new FanNode(
      model.fan,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      energyUsersTandem.createTandem( 'fanNode' )
    );
    this.addChild( this.beakerHeaterNode );
    this.addChild( incandescentBulbNode );
    this.addChild( fluorescentBulbNode );
    this.addChild( fanNode );

    // create the energy converter nodes
    const generatorNode = new GeneratorNode(
      model.generator,
      modelViewTransform, {
        addMechanicalEnergyChunkLayer: false,
        tandem: energyConvertersTandem.createTandem( 'generatorNode' )
      } );
    const beltNode = new BeltNode(
      model.belt,
      modelViewTransform, {
        tandem: energyConvertersTandem.createTandem( 'beltNode' ),
        phetioReadOnly: true
      }
    );

    const solarPanelNode = new SolarPanelNode(
      model.solarPanel,
      modelViewTransform,
      energyConvertersTandem.createTandem( 'solarPanelNode' )
    );
    this.addChild( generatorNode );
    this.addChild( beltNode );
    this.addChild( solarPanelNode );

    // @private
    this.faucetAndWaterNode = new FaucetAndWaterNode(
      model.faucetAndWater,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      energySourcesTandem.createTandem( 'faucetAndWaterNode' )
    );
    this.addChild( this.faucetAndWaterNode );

    // get the mechanical energy chunk layer from the generator and add it after the faucet has been created. this is
    // desirable because the water from the faucet appears on top of the generator wheel, but the energy chunks that
    // are traveling on top of the falling water now remain in front of the water once the generator owns them.
    this.addChild( generatorNode.getMechanicalEnergyChunkLayer() );

    // create the rest of the energy source nodes
    const sunNode = new SunNode(
      model.sun,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      energySourcesTandem.createTandem( 'sunNode' )
    );

    // @private
    this.teaKettleNode = new TeaKettleNode(
      model.teaKettle,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      energySourcesTandem.createTandem( 'teaKettleNode' )
    );
    const bikerNode = new BikerNode(
      model.biker,
      model.energyChunksVisibleProperty,
      modelViewTransform,
      energySourcesTandem.createTandem( 'bikerNode' )
    );
    this.addChild( sunNode );
    this.addChild( bikerNode );
    this.addChild( this.teaKettleNode );

    // use this Tandem for the checkbox, too, so it appears as a child of the panel
    const controlPanelTandem = tandem.createTandem( 'controlPanel' );

    // create the checkbox that controls the visibility of the energy chunks
    // The EnergyChunk that is created in here is not going to be used in the simulation, it is only needed in the
    // EnergyChunkNode that is displayed in the show/hide energy chunks toggle.
    const showEnergyChunksCheckbox = new Checkbox( model.energyChunksVisibleProperty, new HBox( {
      children: [
        new Text( energySymbolsString, {
          font: new PhetFont( 20 ),
          maxWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_TEXT_MAX_WIDTH
        } ),
        new EnergyChunkNode(
          new EnergyChunk( EnergyType.THERMAL, Vector2.ZERO, Vector2.ZERO, new BooleanProperty( true ), { tandem: Tandem.OPT_OUT } ),
          modelViewTransform
        )
      ],
      spacing: 5
    } ), {
      tandem: controlPanelTandem.createTandem( 'showEnergySymbolsCheckbox' ),
      phetioDocumentation: 'checkbox that shows the energy symbols'
    } );
    showEnergyChunksCheckbox.touchArea =
      showEnergyChunksCheckbox.localBounds.dilatedY( EFACConstants.ENERGY_SYMBOLS_PANEL_CHECKBOX_Y_DILATION );

    // add the checkbox that controls the visibility of the energy chunks to a panel
    const controlPanel = new Panel( showEnergyChunksCheckbox, {
      fill: EFACConstants.CONTROL_PANEL_BACKGROUND_COLOR,
      stroke: EFACConstants.CONTROL_PANEL_OUTLINE_STROKE,
      lineWidth: EFACConstants.CONTROL_PANEL_OUTLINE_LINE_WIDTH,
      cornerRadius: EFACConstants.ENERGY_SYMBOLS_PANEL_CORNER_RADIUS,
      right: layoutBounds.maxX - EDGE_INSET,
      top: EDGE_INSET,
      minWidth: EFACConstants.ENERGY_SYMBOLS_PANEL_MIN_WIDTH,
      tandem: controlPanelTandem,
      phetioDocumentation: 'panel in the upper right corner of the screen'
    } );
    this.addChild( controlPanel );

    // add the energy chunk legend
    const energyChunkLegend = new EnergyChunkLegend( modelViewTransform,
      {
        right: layoutBounds.maxX - EDGE_INSET,
        top: controlPanel.bottom + 10
      } );
    this.addChild( energyChunkLegend );

    // only show the energy chunk legend when energy chunks are visible
    model.energyChunksVisibleProperty.linkAttribute( energyChunkLegend, 'visible' );

    // create a background rectangle at the bottom of the screen where the play/pause controls will reside
    const bottomPanel = new Rectangle(
      0,
      0,
      layoutBounds.width * 2, // wide enough that users are unlikely to see the edge
      layoutBounds.height, // tall enough that users are unlikely to see the bottom
      {
        centerX: layoutBounds.centerX,
        top: layoutBounds.maxY - BOTTOM_CONTROL_PANEL_HEIGHT,
        fill: EFACConstants.CLOCK_CONTROL_BACKGROUND_COLOR
      }
    );
    this.addChild( bottomPanel );

    // add the reset all button
    const resetAllButton = new ResetAllButton( {
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.beakerHeaterNode.reset();
        this.teaKettleNode.reset();
      },
      radius: EFACConstants.RESET_ALL_BUTTON_RADIUS,
      right: layoutBounds.maxX - EDGE_INSET,
      centerY: ( bottomPanel.top + layoutBounds.maxY ) / 2,
      tandem: tandem.createTandem( 'resetAllButton' )
    } );
    this.addChild( resetAllButton );

    // add the play/pause and step buttons
    const timeControlNode = new TimeControlNode( model.isPlayingProperty, {
      playPauseStepButtonOptions: {
        stepForwardButtonOptions: {
          listener: () => model.manualStep()
        }
      },
      tandem: tandem.createTandem( 'timeControlNode' )
    } );
    this.addChild( timeControlNode );
    timeControlNode.center = new Vector2( layoutBounds.centerX, resetAllButton.centerY );

    // add the energy system element selectors, which are sets of radio buttons
    const energySourceSelector = new EnergySystemElementSelector( model.energySourcesCarousel, {
      left: EDGE_INSET,
      bottom: bottomPanel.top - EDGE_INSET,
      tandem: tandem.createTandem( 'energySourceSelectorPanel' )
    } );
    const energyConverterSelector = new EnergySystemElementSelector( model.energyConvertersCarousel, {
      left: energySourceSelector.right + SELECTOR_SPACING,
      bottom: bottomPanel.top - EDGE_INSET,
      tandem: tandem.createTandem( 'energyConverterSelectorPanel' )
    } );
    const energyUserSelector = new EnergySystemElementSelector( model.energyUsersCarousel, {
      left: energyConverterSelector.right + SELECTOR_SPACING,
      bottom: bottomPanel.top - EDGE_INSET,
      tandem: tandem.createTandem( 'energyUserSelectorPanel' )
    } );
    this.addChild( energySourceSelector );
    this.addChild( energyConverterSelector );
    this.addChild( energyUserSelector );

    // add a floating sky high above the sim
    const skyNode = new SkyNode(
      this.layoutBounds,
      modelViewTransform.modelToViewY( EFACConstants.SYSTEMS_SCREEN_ENERGY_CHUNK_MAX_TRAVEL_HEIGHT ) + EFACConstants.ENERGY_CHUNK_WIDTH
    );
    this.addChild( skyNode );

    // listen to the manualStepEmitter in the model
    model.manualStepEmitter.addListener( dt => {
      this.manualStep( dt );
    } );
  }

  /**
   * step this view element, called by the framework
   * @param dt - time step, in seconds
   * @public
   */
  step( dt ) {
    if ( this.model.isPlayingProperty.get() ) {
      this.stepView( dt );
    }
  }

  /**
   * step forward by one fixed nominal frame time
   * @param dt - time step, in seconds
   * @public
   */
  manualStep( dt ) {
    this.stepView( dt );
  }

  /**
   * update the state of the non-model associated view elements for a given time amount
   * @param dt - time step, in seconds
   * @public
   */
  stepView( dt ) {
    this.teaKettleNode.step( dt );
    this.beakerHeaterNode.step( dt );
    this.faucetAndWaterNode.step( dt );
  }

  /**
   * Custom layout function for this view so that it floats to the bottom of the window.
   *
   * @param {Bounds2} viewBounds
   * @override
   * @public
   */
  layout( viewBounds ) {
    this.resetTransform();

    const scale = this.getLayoutScale( viewBounds );
    const width = viewBounds.width;
    const height = viewBounds.height;

    this.setScaleMagnitude( scale );

    let dx = 0;
    let offsetY = 0;

    // Move to bottom vertically (custom for this sim)
    if ( scale === width / this.layoutBounds.width ) {
      offsetY = ( height / scale - this.layoutBounds.height );
    }

    // center horizontally (default behavior for ScreenView)
    else if ( scale === height / this.layoutBounds.height ) {
      dx = ( width - this.layoutBounds.width * scale ) / 2 / scale;
    }
    this.translate( dx + viewBounds.left / scale, offsetY + viewBounds.top / scale );

    // update the visible bounds of the screen view
    this.visibleBoundsProperty.set( new Bounds2( -dx, -offsetY, width / scale - dx, height / scale - offsetY ) );
  }
}

energyFormsAndChanges.register( 'SystemsScreenView', SystemsScreenView );
export default SystemsScreenView;